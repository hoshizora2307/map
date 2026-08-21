const JSONBIN_API = "https://api.jsonbin.io/v3";
const KV_KEY = "board-data";

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

async function readFromJsonbin(env) {
  if (!env.JSONBIN_KEY || !env.JSONBIN_BIN_ID) return null;
  try {
    const resp = await fetch(JSONBIN_API + "/b/" + env.JSONBIN_BIN_ID + "/latest", {
      headers: { "X-Master-Key": env.JSONBIN_KEY }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.record || null;
  } catch (e) {
    return null;
  }
}

async function handleApiData(request, env) {
  if (!env.BOARD_KV) {
    return json({ error: "kv_not_bound" }, 500);
  }

  if (request.method === "GET") {
    try {
      const stored = await env.BOARD_KV.get(KV_KEY);
      if (stored) {
        return new Response(stored, {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
      const legacy = await readFromJsonbin(env);
      if (legacy) {
        await env.BOARD_KV.put(KV_KEY, JSON.stringify(legacy));
        return json(legacy);
      }
      return json({});
    } catch (e) {
      return json({ error: "kv_get_failed" }, 502);
    }
  }

  if (request.method === "PUT") {
    let bodyText;
    try {
      bodyText = await request.text();
      JSON.parse(bodyText);
    } catch (e) {
      return json({ error: "invalid_json" }, 400);
    }
    try {
      await env.BOARD_KV.put(KV_KEY, bodyText);
      return json({ ok: true });
    } catch (e) {
      return json({ error: "kv_put_failed" }, 502);
    }
  }

  return json({ error: "method_not_allowed" }, 405);
}

async function handleBackup(request, env) {
  if (!env.BOARD_KV) return json({ error: "kv_not_bound" }, 500);
  const stored = await env.BOARD_KV.get(KV_KEY);
  const body = stored || "{}";
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="board-backup.json"',
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/data") {
      return handleApiData(request, env);
    }
    if (url.pathname === "/api/backup") {
      return handleBackup(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

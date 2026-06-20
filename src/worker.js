// Cloudflare

const JSONBIN_API = "https://api.jsonbin.io/v3";

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

async function handleApiData(request, env) {
  if (!env.JSONBIN_KEY || !env.JSONBIN_BIN_ID) {
    return json({ error: "server_not_configured" }, 500);
  }

  if (request.method === "GET") {
    try {
      const resp = await fetch(JSONBIN_API + "/b/" + env.JSONBIN_BIN_ID + "/latest", {
        headers: { "X-Master-Key": env.JSONBIN_KEY }
      });
      if (!resp.ok) return json({ error: "jsonbin_get_failed", status: resp.status }, 502);
      const data = await resp.json();
      return json(data.record || {});
    } catch (e) {
      return json({ error: "fetch_failed" }, 502);
    }
  }

  if (request.method === "PUT") {
    let bodyText;
    try {
      bodyText = await request.text();
      JSON.parse(bodyText); // 形式チェックのみ
    } catch (e) {
      return json({ error: "invalid_json" }, 400);
    }
    try {
      const resp = await fetch(JSONBIN_API + "/b/" + env.JSONBIN_BIN_ID, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": env.JSONBIN_KEY },
        body: bodyText
      });
      if (!resp.ok) return json({ error: "jsonbin_put_failed", status: resp.status }, 502);
      return json({ ok: true });
    } catch (e) {
      return json({ error: "fetch_failed" }, 502);
    }
  }

  return json({ error: "method_not_allowed" }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/data") {
      return handleApiData(request, env);
    }
    // 静的ファイル(index.html など public/ 配下)を返す
    return env.ASSETS.fetch(request);
  }
};

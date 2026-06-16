import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "visit-map-pins";

function formatCurrency(val) {
  if (!val && val !== 0) return "—";
  return "¥" + Number(val).toLocaleString("ja-JP");
}

function getPinColor(sales) {
  if (sales === null || sales === undefined) return "#9ca3af";
  if (sales >= 1000000) return "#22c55e";
  if (sales >= 500000) return "#3b82f6";
  if (sales >= 100000) return "#f59e0b";
  return "#ef4444";
}

// ---- PinForm ----
function PinForm({ pin, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(pin?.name || "");
  const [date, setDate] = useState(pin?.date || new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState(pin?.sales ?? "");
  const [contact, setContact] = useState(pin?.contact || "");
  const [phone, setPhone] = useState(pin?.phone || "");
  const [venueFee, setVenueFee] = useState(pin?.venueFee ?? "");
  const [memo, setMemo] = useState(pin?.memo || "");

  const handleSave = () => {
    if (!name.trim()) { alert("施設名を入力してください"); return; }
    onSave({
      name,
      date,
      sales: sales !== "" ? Number(sales) : null,
      contact,
      phone,
      venueFee: venueFee !== "" ? Number(venueFee) : null,
      memo,
    });
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f2040", marginBottom: "4px" }}>
          {pin?.id ? "📍 スポット編集" : "📍 新しいスポット"}
        </div>
        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>
          {pin?.id ? "" : "地図上のタップした場所に保存されます"}
        </div>

        <div style={scrollArea}>
          <label style={labelStyle}>施設名・場所名 *</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="例：新宿ショールーム" />

          <label style={labelStyle}>訪問日</label>
          <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>担当者名</label>
              <input style={inputStyle} value={contact} onChange={e => setContact(e.target.value)} placeholder="例：山田 太郎" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>電話番号</label>
              <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="例：03-0000-0000" />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>売上（円）</label>
              <input type="number" style={inputStyle} value={sales} onChange={e => setSales(e.target.value)} placeholder="例：250000" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>出店料金（円）</label>
              <input type="number" style={inputStyle} value={venueFee} onChange={e => setVenueFee(e.target.value)} placeholder="例：30000" />
            </div>
          </div>

          <label style={labelStyle}>メモ</label>
          <textarea
            style={{ ...inputStyle, height: "72px", resize: "vertical" }}
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="商談内容、次回アクションなど"
          />
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button style={btnPrimary} onClick={handleSave}>保存</button>
          <button style={btnSecondary} onClick={onCancel}>キャンセル</button>
          {pin?.id && (
            <button style={btnDanger} onClick={() => onDelete(pin.id)}>削除</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- PinDetail ----
function PinDetail({ pin, onEdit, onClose }) {
  const profit = (pin.sales ?? 0) - (pin.venueFee ?? 0);

  return (
    <div style={{ ...overlay, alignItems: "flex-end" }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "20px 20px 0 0",
        padding: "24px 20px 36px", width: "100%", maxWidth: "480px",
        boxShadow: "0 -4px 30px rgba(0,0,0,0.15)", maxHeight: "80vh", overflowY: "auto"
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f2040" }}>{pin.name}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>📅 {pin.date}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>

        {/* Sales cards */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <div style={{ flex: 1, background: "linear-gradient(135deg, #0f2040, #1a4080)", borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", color: "#93c5fd", marginBottom: "2px" }}>売上</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{formatCurrency(pin.sales)}</div>
          </div>
          <div style={{ flex: 1, background: "#fef3c7", borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", color: "#92400e", marginBottom: "2px" }}>出店料金</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#92400e" }}>{formatCurrency(pin.venueFee)}</div>
          </div>
        </div>
        <div style={{ background: profit >= 0 ? "#dcfce7" : "#fee2e2", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
          <div style={{ fontSize: "11px", color: profit >= 0 ? "#166534" : "#991b1b", marginBottom: "2px" }}>純利益（売上 − 出店料金）</div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: profit >= 0 ? "#16a34a" : "#dc2626" }}>{formatCurrency(profit)}</div>
        </div>

        {/* Contact info */}
        {(pin.contact || pin.phone) && (
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
            {pin.contact && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: pin.phone ? "6px" : 0 }}>
                <span style={{ fontSize: "14px" }}>👤</span>
                <span style={{ fontSize: "14px", color: "#374151" }}>{pin.contact}</span>
              </div>
            )}
            {pin.phone && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "14px" }}>📞</span>
                <a href={`tel:${pin.phone}`} style={{ fontSize: "14px", color: "#1a4080", textDecoration: "none", fontWeight: "600" }}>{pin.phone}</a>
              </div>
            )}
          </div>
        )}

        {/* Memo */}
        {pin.memo && (
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>メモ</div>
            <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>{pin.memo}</div>
          </div>
        )}

        <button style={{ ...btnPrimary, width: "100%" }} onClick={() => onEdit(pin)}>編集</button>
      </div>
    </div>
  );
}

// ---- Legend ----
function SalesLegend() {
  return (
    <div style={{
      position: "absolute", bottom: "80px", left: "12px", zIndex: 10,
      background: "rgba(255,255,255,0.92)", borderRadius: "10px",
      padding: "10px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", fontSize: "11px"
    }}>
      <div style={{ fontWeight: "700", marginBottom: "6px", color: "#0f2040" }}>売上目安</div>
      {[
        { color: "#22c55e", label: "100万円以上" },
        { color: "#3b82f6", label: "50〜100万円" },
        { color: "#f59e0b", label: "10〜50万円" },
        { color: "#ef4444", label: "10万円未満" },
        { color: "#9ca3af", label: "未入力" },
      ].map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ color: "#374151" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const [pins, setPins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editPin, setEditPin] = useState(null);
  const [detailPin, setDetailPin] = useState(null);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalSales = pins.reduce((acc, p) => acc + (p.sales || 0), 0);
  const totalFee = pins.reduce((acc, p) => acc + (p.venueFee || 0), 0);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPins(JSON.parse(saved));
    } catch { }
  }, []);

  const savePins = useCallback((newPins) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPins));
    } catch (e) {
      console.error("Save failed", e);
    }
  }, []);

  // Init Leaflet (already loaded via <script> in index.html)
  useEffect(() => {
    const check = setInterval(() => {
      if (window.L && mapRef.current && !leafletMap.current) {
        clearInterval(check);
        const L = window.L;
        const map = L.map(mapRef.current, { zoomControl: false }).setView([35.68, 139.69], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors"
        }).addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        map.on("click", (e) => {
          setPendingLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
          setEditPin(null);
          setShowForm(true);
        });
        leafletMap.current = map;
        setMapReady(true);
      }
    }, 100);
    return () => clearInterval(check);
  }, []);

  // Sync markers
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const L = window.L;
    const map = leafletMap.current;
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    pins.forEach(pin => {
      const color = getPinColor(pin.sales);
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);transform:rotate(-45deg);cursor:pointer;"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
      marker.on("click", () => setDetailPin(pin));
      markersRef.current[pin.id] = marker;
    });
  }, [pins, mapReady]);

  const handleSave = useCallback((formData) => {
    let updated;
    if (editPin?.id) {
      updated = pins.map(p => p.id === editPin.id ? { ...p, ...formData } : p);
    } else {
      const newPin = { id: Date.now().toString(), lat: pendingLatLng.lat, lng: pendingLatLng.lng, ...formData };
      updated = [...pins, newPin];
    }
    setPins(updated);
    savePins(updated);
    setShowForm(false);
    setEditPin(null);
    setPendingLatLng(null);
  }, [pins, editPin, pendingLatLng, savePins]);

  const handleDelete = useCallback((id) => {
    if (!window.confirm("このスポットを削除しますか？")) return;
    const updated = pins.filter(p => p.id !== id);
    setPins(updated);
    savePins(updated);
    setShowForm(false);
    setDetailPin(null);
    setEditPin(null);
  }, [pins, savePins]);

  const handleEdit = useCallback((pin) => {
    setDetailPin(null);
    setEditPin(pin);
    setShowForm(true);
  }, []);

  const filteredPins = pins.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.contact || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.memo || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flyTo = (pin) => {
    if (leafletMap.current) {
      leafletMap.current.flyTo([pin.lat, pin.lng], 14, { duration: 1 });
      setDetailPin(pin);
      setSearchQuery("");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f0f4f8" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f2040 0%, #1a4080 100%)", padding: "14px 16px 10px", flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "800", color: "#fff", letterSpacing: "0.02em" }}>📍 訪問マップ</div>
            <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "1px" }}>{pins.length}件のスポット</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#93c5fd" }}>累計売上 / 出店料</div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>{formatCurrency(totalSales)} / {formatCurrency(totalFee)}</div>
          </div>
        </div>
        <input
          style={{ width: "100%", borderRadius: "8px", border: "none", padding: "8px 12px", fontSize: "13px", background: "rgba(255,255,255,0.12)", color: "#fff", outline: "none" }}
          placeholder="🔍 施設名・担当者・メモで検索..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          {!mapReady && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#e8f0fe", fontSize: "14px", color: "#1a4080" }}>
              地図を読み込み中...
            </div>
          )}
          <SalesLegend />
          <div style={{ position: "absolute", bottom: "12px", right: "50px", zIndex: 10, background: "rgba(255,255,255,0.9)", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", color: "#6b7280" }}>
            地図をタップしてピンを追加
          </div>
        </div>

        {/* Search sidebar */}
        {searchQuery && (
          <div style={{ width: "240px", background: "#fff", overflowY: "auto", borderLeft: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ padding: "12px", borderBottom: "1px solid #f3f4f6", fontSize: "12px", color: "#6b7280" }}>
              {filteredPins.length}件ヒット
            </div>
            {filteredPins.map(pin => (
              <div key={pin.id} style={{ padding: "12px", borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onClick={() => flyTo(pin)}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: getPinColor(pin.sales), flexShrink: 0 }} />
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f2040" }}>{pin.name}</div>
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px", paddingLeft: "18px" }}>
                  {pin.contact && <span>👤 {pin.contact}　</span>}
                  {formatCurrency(pin.sales)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#0f2040", padding: "6px 16px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", color: "#475a7a", letterSpacing: "0.05em" }}>© hoshitokimi</span>
      </div>

      {/* Modals */}
      {showForm && (
        <PinForm
          pin={editPin}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditPin(null); setPendingLatLng(null); }}
          onDelete={handleDelete}
        />
      )}
      {detailPin && !showForm && (
        <PinDetail pin={detailPin} onEdit={handleEdit} onClose={() => setDetailPin(null)} />
      )}
    </div>
  );
}

// ---- Styles ----
const overlay = {
  position: "fixed", inset: 0, background: "rgba(10,20,40,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px"
};
const modal = {
  background: "#fff", borderRadius: "16px", padding: "24px 20px",
  width: "100%", maxWidth: "440px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  maxHeight: "90vh", display: "flex", flexDirection: "column"
};
const scrollArea = { overflowY: "auto", flex: 1 };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "4px", marginTop: "12px" };
const inputStyle = { width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "9px 12px", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#0f2040" };
const btnPrimary = { flex: 1, background: "linear-gradient(135deg, #0f2040, #1a4080)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" };
const btnSecondary = { flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };
const btnDanger = { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer" };

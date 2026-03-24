import { useState, useRef } from "react";

// ─── Section Definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "general", label: "General Info", icon: "🏠", color: "#C8956C",
    fields: [
      { key: "yearBuilt",        label: "Year Built",               type: "text" },
      { key: "archStyle",        label: "Architectural Style",       type: "text", placeholder: "e.g. Split Level, Cape Cod…" },
      { key: "purchasePrice",    label: "Purchase Price History",    type: "textarea" },
      { key: "propertyTaxes",    label: "Property Taxes",            type: "textarea" },
      { key: "realtorSeller",    label: "Realtor – Representing Seller", type: "textarea" },
      { key: "realtorBuyer",     label: "Realtor – Representing Buyer",  type: "textarea" },
      { key: "majorRenovations", label: "Major Renovations",         type: "textarea" },
    ],
  },
  {
    id: "trades", label: "Trades", icon: "🔧", color: "#6C8EC8",
    subSections: [
      "Plumber","Electrician","HVAC Technician","Carpenter","Drywall","Framer",
      "Gardener","Arborist","Pool Technician","Architect","Landscape Architect",
      "General Contractor","Mason","Chimney Sweep","Window Cleaner","Roofer",
      "Solar Installer","Gutters/Downspouts",
    ],
    subFields: [
      { key: "name",          label: "Name / Company",   type: "text" },
      { key: "phone",         label: "Phone",            type: "text" },
      { key: "email",         label: "Email",            type: "text" },
      { key: "workCompleted", label: "Work Completed",   type: "textarea" },
      { key: "cost",          label: "Cost",             type: "text" },
      { key: "notes",         label: "Notes / Pictures", type: "textarea" },
    ],
  },
  {
    id: "appliances", label: "Appliances", icon: "🧊", color: "#8EC896", aiScan: true,
    subSections: [
      "Refrigerator","Dishwasher","Washing Machine","Dryer","Stove","Oven",
      "Range","Toaster / Toaster Oven","Microwave","Hood","Hot Water Heater",
      "Wine Fridge","Coffee Maker","Computer",
    ],
    subFields: [
      { key: "brand",         label: "Brand / Model",         type: "text" },
      { key: "serial",        label: "Serial Number",         type: "text" },
      { key: "datePurchased", label: "Date Purchased",        type: "text" },
      { key: "warranty",      label: "Warranty Expiration",   type: "text" },
      { key: "manual",        label: "Manual / How-To Notes", type: "textarea" },
      { key: "repairs",       label: "Repairs History",       type: "textarea" },
    ],
    aiFields: ["brand", "serial", "datePurchased", "warranty"],
    aiPrompt: `You are analyzing a photo of a home appliance label or nameplate. Extract all visible information.
Return ONLY a valid JSON object with these keys (use null for anything not visible):
{
  "brand": "Brand name and full model number",
  "serial": "Serial number",
  "datePurchased": "Manufacture date or date code if visible (e.g. 2019-03 or 2019)",
  "warranty": "Warranty info if printed on label"
}
Return ONLY the raw JSON. No markdown, no explanation.`,
  },
  {
    id: "systems", label: "Systems", icon: "⚙️", color: "#C8C86C", aiScan: true,
    subSections: [
      "HVAC","Mini Split","Central Cooling Unit","Swamp Cooler","Heat Pump/Exchanger",
      "Furnace","Radiator","Irrigation","Plumbing","Garage Door","Garage Motor",
      "Water Treatment/Filter","Water Softener","Central Vacuum",
      "Solar/Photovoltaic – Inverter","Solar Hot Water Heating","Geothermal",
    ],
    subFields: [
      { key: "makeModel",   label: "Make & Model",                    type: "text" },
      { key: "serial",      label: "Serial Number",                   type: "text" },
      { key: "installer",   label: "Installer",                       type: "text" },
      { key: "cost",        label: "Cost",                            type: "text" },
      { key: "lastService", label: "Date of Last Inspection/Service", type: "text" },
      { key: "warranty",    label: "Warranty",                        type: "text" },
      { key: "notes",       label: "Notes",                           type: "textarea" },
    ],
    aiFields: ["makeModel", "serial", "warranty", "notes"],
    aiPrompt: `You are analyzing a photo of a home system nameplate (HVAC, furnace, water heater, etc.). Extract all visible technical info.
Return ONLY a valid JSON object with these keys (use null for anything not visible):
{
  "makeModel": "Manufacturer name and full model number",
  "serial": "Serial number",
  "warranty": "Warranty info if printed on label",
  "notes": "Any other useful specs visible such as BTU, tonnage, voltage, refrigerant type, etc."
}
Return ONLY the raw JSON. No markdown, no explanation.`,
  },
  {
    id: "fixtures", label: "Fixtures", icon: "🚿", color: "#C86C8E", aiScan: true,
    subSections: [
      "Toilet(s)","Shower Heads","Bathtub","Bathroom Sink / Faucet",
      "Kitchen Sink / Faucet","Ceiling Fan(s)","Exhaust Fan(s)",
    ],
    subFields: [
      { key: "brand",     label: "Brand / Model",    type: "text" },
      { key: "location",  label: "Location in Home", type: "text" },
      { key: "installed", label: "Date Installed",   type: "text" },
      { key: "notes",     label: "Notes / Repairs",  type: "textarea" },
    ],
    aiFields: ["brand", "notes"],
    aiPrompt: `You are analyzing a photo of a home fixture (toilet, faucet, shower head, fan, etc.). Find any brand or model markings.
Return ONLY a valid JSON object with these keys (use null for anything not visible):
{
  "brand": "Brand name and model number if visible on the fixture",
  "notes": "Any other useful info visible such as flow rate, finish, part numbers"
}
Return ONLY the raw JSON. No markdown, no explanation.`,
  },
  {
    id: "furniture", label: "Furniture", icon: "🛋️", color: "#9B6CC8",
    subSections: ["Mattress","Bed Frame","Dresser","Bookcase","Desk","Sofa"],
    subFields: [
      { key: "brand",         label: "Manufacturer / Retailer", type: "text" },
      { key: "cost",          label: "Cost",                    type: "text" },
      { key: "datePurchased", label: "Date Purchased",          type: "text" },
      { key: "warranty",      label: "Warranty",                type: "text" },
      { key: "notes",         label: "Notes",                   type: "textarea" },
    ],
  },
  {
    id: "household", label: "Household", icon: "🏗️", color: "#6CC8C2",
    subSections: [
      "Flooring","Single Pane Windows","Dual Pane Windows","Other Windows",
      "Sliding Doors","Driveway","Front Door & Lock Set","Exterior Door(s) & Lock Set",
      "Pool","Spa / Hot Tub",
    ],
    subFields: [
      { key: "material",  label: "Material / Type",           type: "text" },
      { key: "brand",     label: "Brand / Manufacturer",      type: "text" },
      { key: "installed", label: "Date Installed / Replaced", type: "text" },
      { key: "cost",      label: "Cost",                      type: "text" },
      { key: "warranty",  label: "Warranty",                  type: "text" },
      { key: "notes",     label: "Notes / Condition",         type: "textarea" },
    ],
  },
];

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "home-tracker-v2";
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ─── AI Scan ──────────────────────────────────────────────────────────────────

async function scanImageWithClaude(base64Image, mediaType, prompt) {
  // Ensure mediaType is a valid image type the API accepts
  const safeMediaType = ["image/jpeg","image/png","image/gif","image/webp"].includes(mediaType)
    ? mediaType : "image/jpeg";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: safeMediaType, data: base64Image } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  // Surface any API-level error (e.g. overloaded, invalid_request)
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

  const text = (data.content || []).map(b => b.text || "").join("");

  // Try to extract a JSON object even if the model wraps it in prose
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response. Model said: ${text.slice(0, 200)}`);

  return JSON.parse(jsonMatch[0]);
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ fieldDef, value, onChange, highlighted }) {
  const base = {
    width: "100%",
    background: highlighted ? "rgba(142,200,150,0.09)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${highlighted ? "rgba(142,200,150,0.5)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 8, padding: "10px 14px", color: "#F0EBE3",
    fontSize: 14, fontFamily: "'DM Mono', monospace", outline: "none",
    transition: "border-color 0.2s, background 0.4s", resize: "vertical", boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(240,235,227,0.45)", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
        {fieldDef.label}
        {highlighted && <span style={{ fontSize: 9, color: "#8EC896", letterSpacing: "0.05em", fontWeight: 600 }}>✦ AI</span>}
      </label>
      {fieldDef.type === "textarea"
        ? <textarea rows={3} style={base} value={value || ""} placeholder={fieldDef.placeholder || ""} onChange={e => onChange(e.target.value)} />
        : <input type="text" style={{ ...base, height: 40 }} value={value || ""} placeholder={fieldDef.placeholder || ""} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

// ─── Scan Button ──────────────────────────────────────────────────────────────

function ScanButton({ section, onFill, accentColor }) {
  const fileRef = useRef();
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setStatus("scanning"); setErrMsg("");
    try {
      const base64 = await fileToBase64(file);
      const result = await scanImageWithClaude(base64, file.type || "image/jpeg", section.aiPrompt);
      onFill(result);
      setStatus("done");
      setTimeout(() => { setStatus("idle"); setPreview(null); }, 4000);
    } catch (err) {
      console.error("Scan error:", err);
      // Show the actual error so we can debug
      setErrMsg(err.message || "Unknown error");
      setStatus("error");
    }
    e.target.value = "";
  };

  const reset = () => { setStatus("idle"); setErrMsg(""); setPreview(null); };

  const theme = {
    idle:     { bg: "rgba(255,255,255,0.05)", br: "rgba(255,255,255,0.13)", col: "rgba(240,235,227,0.5)", label: "📷  Scan Label" },
    scanning: { bg: `${accentColor}18`,       br: `${accentColor}55`,       col: accentColor,             label: "⏳  Scanning…"  },
    done:     { bg: "rgba(142,200,150,0.11)", br: "rgba(142,200,150,0.45)", col: "#8EC896",               label: "✓  Fields Filled" },
    error:    { bg: "rgba(200,108,108,0.1)",  br: "rgba(200,108,108,0.4)",  col: "#C88E8E",               label: "✗  Scan Failed"   },
  }[status];

  return (
    <div style={{ marginBottom: 20 }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />

      {/* Preview thumbnail */}
      {preview && (
        <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
          <img src={preview} alt="Label preview" style={{ height: 90, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", display: "block", objectFit: "cover" }} />
          {status === "scanning" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⏳</div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => status === "idle" ? fileRef.current.click() : status === "error" ? reset() : null}
          disabled={status === "scanning"}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8,
            background: theme.bg, border: `1px solid ${theme.br}`, color: theme.col,
            cursor: status === "scanning" ? "default" : "pointer",
            fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace", fontWeight: 500, transition: "all 0.3s",
          }}
        >{theme.label}</button>

        {status === "error" && (
          <button onClick={() => fileRef.current.click()} style={{ padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,235,227,0.5)", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
            Try new photo
          </button>
        )}
      </div>

      {status === "scanning" && <p style={{ margin: "7px 0 0", fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>Reading label with Claude…</p>}
      {status === "done"     && <p style={{ margin: "7px 0 0", fontSize: 11, color: "#8EC896", fontFamily: "'DM Mono', monospace" }}>Done! Review the highlighted fields below.</p>}
      {status === "error"    && (
        <div style={{ margin: "8px 0 0", padding: "10px 12px", background: "rgba(200,108,108,0.08)", border: "1px solid rgba(200,108,108,0.2)", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#C88E8E", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>Error details (helpful for debugging):</p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(200,142,142,0.8)", fontFamily: "'DM Mono', monospace", wordBreak: "break-all", lineHeight: 1.5 }}>{errMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-section Panel ────────────────────────────────────────────────────────

function SubPanel({ section, subName, data, onUpdate, accentColor }) {
  const [open, setOpen] = useState(false);
  const [aiFilledKeys, setAiFilledKeys] = useState([]);
  const key = `${section.id}__${subName}`;
  const hasData = section.subFields.some(f => data[key]?.[f.key]);

  const handleAiFill = (result) => {
    const filled = [];
    (section.aiFields || []).forEach(fk => {
      if (result[fk]) { onUpdate(key, fk, result[fk]); filled.push(fk); }
    });
    setAiFilledKeys(filled);
  };

  return (
    <div style={{ marginBottom: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: open ? "rgba(255,255,255,0.06)" : "transparent",
          border: "none", cursor: "pointer", color: "#F0EBE3",
          fontFamily: "'DM Serif Display', serif", fontSize: 15, letterSpacing: "0.01em", transition: "background 0.2s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasData && <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, flexShrink: 0, display: "inline-block" }} />}
          {subName}
        </span>
        <span style={{ opacity: 0.4, fontSize: 12, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: "18px 16px 10px", background: "rgba(0,0,0,0.16)" }}>
          {section.aiScan && (
            <ScanButton section={section} onFill={handleAiFill} accentColor={accentColor} />
          )}
          {section.subFields.map(f => (
            <Field
              key={f.key}
              fieldDef={f}
              value={data[key]?.[f.key]}
              highlighted={aiFilledKeys.includes(f.key)}
              onChange={val => {
                onUpdate(key, f.key, val);
                setAiFilledKeys(prev => prev.filter(k => k !== f.key));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────

function SectionPanel({ section, data, onUpdate, isActive, onActivate }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${isActive ? section.color + "55" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14, marginBottom: 12, overflow: "hidden", transition: "border-color 0.3s",
    }}>
      <button
        onClick={onActivate}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: "18px 22px", background: "transparent", border: "none",
          cursor: "pointer", color: "#F0EBE3", textAlign: "left",
        }}
      >
        <span style={{
          width: 42, height: 42, borderRadius: 10,
          background: section.color + "22", border: `1px solid ${section.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
        }}>{section.icon}</span>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, letterSpacing: "0.02em" }}>{section.label}</div>
          {section.aiScan && (
            <div style={{ fontSize: 10, color: section.color, opacity: 0.7, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
              ✦ AI label scanning
            </div>
          )}
        </div>
        <span style={{ marginLeft: "auto", opacity: 0.35, fontSize: 12, transform: isActive ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>▼</span>
      </button>

      {isActive && (
        <div style={{ padding: "0 22px 22px" }}>
          {section.fields
            ? section.fields.map(f => (
                <Field key={f.key} fieldDef={f} value={data[`${section.id}__${f.key}`]} onChange={val => onUpdate(`${section.id}__${f.key}`, null, val)} />
              ))
            : section.subSections.map(sub => (
                <SubPanel key={sub} section={section} subName={sub} data={data} onUpdate={onUpdate} accentColor={section.color} />
              ))
          }
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function HomeTracker() {
  const [data, setData] = useState(loadData);
  const [activeSection, setActiveSection] = useState(null);
  const [saved, setSaved] = useState(false);
  const [homeName, setHomeName] = useState(() => loadData().__homeName || "My Home");
  const [editingName, setEditingName] = useState(false);

  const handleUpdate = (key, subKey, value) => {
    setData(prev => subKey
      ? { ...prev, [key]: { ...(prev[key] || {}), [subKey]: value } }
      : { ...prev, [key]: value }
    );
  };

  const handleSave = () => {
    saveData({ ...data, __homeName: homeName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleExport = () => {
    const payload = { ...data, __homeName: homeName, __exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${homeName.replace(/\s+/g, "-").toLowerCase()}-home-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importRef = useRef();
  const [importStatus, setImportStatus] = useState("idle");
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const { __homeName, __exportedAt, ...rest } = parsed;
        if (__homeName) setHomeName(__homeName);
        setData(rest);
        saveData(parsed);
        setImportStatus("done");
        setTimeout(() => setImportStatus("idle"), 3000);
      } catch {
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const totalFilled = Object.keys(data).filter(k => !k.startsWith("__")).length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1A1612 0%, #1E1C18 50%, #161A1E 100%)", fontFamily: "'DM Mono', monospace", color: "#F0EBE3", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        textarea, input { color-scheme: dark; }
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "28px 32px 22px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(14px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            {editingName
              ? <input autoFocus value={homeName} onChange={e => setHomeName(e.target.value)} onBlur={() => setEditingName(false)} onKeyDown={e => e.key === "Enter" && setEditingName(false)} style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.3)", color: "#F0EBE3", fontSize: 28, fontFamily: "'DM Serif Display', serif", outline: "none", width: 300 }} />
              : <h1 onClick={() => setEditingName(true)} title="Click to rename" style={{ margin: 0, fontSize: 28, fontFamily: "'DM Serif Display', serif", fontWeight: 400, cursor: "text", letterSpacing: "0.01em" }}>{homeName}</h1>
            }
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(240,235,227,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Home Information Tracker &nbsp;·&nbsp; {totalFilled} fields recorded
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
            <button
              onClick={() => importRef.current.click()}
              title="Load a previously exported home data file"
              style={{ padding: "10px 16px", borderRadius: 8, background: importStatus === "done" ? "rgba(142,200,150,0.15)" : importStatus === "error" ? "rgba(200,108,108,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${importStatus === "done" ? "rgba(142,200,150,0.4)" : importStatus === "error" ? "rgba(200,108,108,0.35)" : "rgba(255,255,255,0.1)"}`, color: importStatus === "done" ? "#8EC896" : importStatus === "error" ? "#C88E8E" : "rgba(240,235,227,0.45)", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", transition: "all 0.3s", fontWeight: 500 }}>
              {importStatus === "done" ? "✓ Loaded" : importStatus === "error" ? "✗ Bad file" : "⬆ Import"}
            </button>
            <button
              onClick={handleExport}
              title="Download all your home data as a shareable file"
              style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(108,142,200,0.12)", border: "1px solid rgba(108,142,200,0.3)", color: "#6C8EC8", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
              ⬇ Export
            </button>
            <button onClick={handleSave} style={{ padding: "10px 18px", borderRadius: 8, background: saved ? "rgba(142,200,150,0.2)" : "rgba(200,149,108,0.15)", border: `1px solid ${saved ? "#8EC896" : "#C8956C"}55`, color: saved ? "#8EC896" : "#C8956C", cursor: "pointer", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", transition: "all 0.3s", fontWeight: 500 }}>
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* AI callout banner */}
        <div style={{ padding: "14px 18px", background: "rgba(142,200,150,0.05)", border: "1px solid rgba(142,200,150,0.16)", borderRadius: 10, display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 28 }}>
          <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>📷</span>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "#8EC896", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600 }}>AI Label Scanning Available</p>
            <p style={{ margin: "5px 0 0", fontSize: 12, color: "rgba(240,235,227,0.42)", lineHeight: 1.65 }}>
              Appliances, Systems, and Fixtures have a <strong style={{ color: "rgba(240,235,227,0.65)" }}>Scan Label</strong> button. Open any item, tap it, and point your camera at the data tag or nameplate — Claude will read brand, model, serial number, and more automatically.
            </p>
          </div>
        </div>

        {SECTIONS.map(section => (
          <SectionPanel
            key={section.id}
            section={section}
            data={data}
            onUpdate={handleUpdate}
            isActive={activeSection === section.id}
            onActivate={() => setActiveSection(activeSection === section.id ? null : section.id)}
          />
        ))}
      </div>
    </div>
  );
}

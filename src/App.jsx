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
    id: "appliances", label: "Appliances", icon: "🧊", color: "#8EC896", aiScan: true, valuated: true,
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
    id: "systems", label: "Systems", icon: "⚙️", color: "#C8C86C", aiScan: true, valuated: true,
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
    id: "fixtures", label: "Fixtures", icon: "🚿", color: "#C86C8E", aiScan: true, valuated: true,
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
    id: "furniture", label: "Furniture", icon: "🛋️", color: "#9B6CC8", valuated: true,
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
  {
    id: "paint", label: "Walls & Paint", icon: "🎨", color: "#C8A06C", colorScan: true,
    subSections: [
      "Living Room","Kitchen","Primary Bedroom","Bedroom 2","Bedroom 3",
      "Bathroom 1","Bathroom 2","Hallway","Dining Room","Office",
      "Basement","Garage","Exterior – Main","Exterior – Trim","Exterior – Accent",
      "Front Door","Ceiling",
    ],
    subFields: [
      { key: "hex",        label: "Hex Color Code",              type: "text", placeholder: "#FFFFFF" },
      { key: "paintBrand", label: "Paint Brand",                 type: "text", placeholder: "e.g. Benjamin Moore" },
      { key: "paintName",  label: "Paint Color Name",            type: "text", placeholder: "e.g. Chantilly Lace" },
      { key: "paintCode",  label: "Paint Color Code / SKU",      type: "text" },
      { key: "finish",     label: "Finish",                      type: "text", placeholder: "e.g. Eggshell, Matte, Satin" },
      { key: "altBM",      label: "Alt Match – Benjamin Moore",  type: "text" },
      { key: "altSW",      label: "Alt Match – Sherwin-Williams",type: "text" },
      { key: "altBehr",    label: "Alt Match – Behr",            type: "text" },
      { key: "notes",      label: "Notes",                       type: "textarea" },
    ],
    colorPrompt: `You are analyzing a photo of a painted wall or surface. Identify the dominant color.
Return ONLY a valid JSON object:
{
  "hex": "best hex code estimate e.g. #D4C5A9",
  "paintBrand": "most likely paint brand for this color",
  "paintName": "most likely color name from that brand",
  "paintCode": "color code/SKU if you can identify it",
  "finish": "estimated finish based on sheen visible (Matte, Eggshell, Satin, Semi-Gloss, or Gloss)",
  "altBM": "closest Benjamin Moore match name and code",
  "altSW": "closest Sherwin-Williams match name and code",
  "altBehr": "closest Behr match name and code",
  "confidence": "High/Medium/Low"
}
Return ONLY raw JSON. No markdown, no explanation.`,
  },
];

const VALUATED_SECTIONS = SECTIONS.filter(s => s.valuated);

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "home-tracker-v3";
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ─── Anthropic API helpers ────────────────────────────────────────────────────

async function callClaude(messages, max_tokens = 1000) {
  const response = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens, messages }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || "").join("");
}

async function scanImageWithClaude(base64Image, mediaType, prompt) {
  const safeType = ["image/jpeg","image/png","image/gif","image/webp"].includes(mediaType) ? mediaType : "image/jpeg";
  const text = await callClaude([{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: safeType, data: base64Image } },
      { type: "text", text: prompt },
    ],
  }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in response. Model said: ${text.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

async function valuateItem(itemName, sectionLabel, itemData) {
  const description = itemData.brand || itemData.makeModel || itemData.brand || "Unknown item";
  const datePurchased = itemData.datePurchased || itemData.lastService || null;
  const prompt = `You are a home insurance valuation expert. Estimate the current market value and replacement cost for a home asset.

Asset type: ${sectionLabel} — ${itemName}
Description: ${description}
Date info: ${datePurchased || "unknown"}
Additional info: ${JSON.stringify(itemData)}

Return ONLY a valid JSON object:
{
  "currentValue": <number in USD, no commas or symbols>,
  "replacementCost": <number in USD, new replacement cost>,
  "condition": "Excellent|Good|Fair|Poor",
  "lifespan": "<estimated remaining useful life, e.g. '5-8 years'>",
  "valuationNote": "<one sentence explaining the estimate>"
}
Return ONLY raw JSON. No markdown, no explanation.`;

  const text = await callClaude([{ role: "user", content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in valuation response");
  return JSON.parse(match[0]);
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

// ─── Insurance totals ─────────────────────────────────────────────────────────

function computeTotals(data) {
  let totalCurrentValue = 0, totalReplacementCost = 0, itemCount = 0;
  const bySection = {};
  VALUATED_SECTIONS.forEach(section => {
    let sectionCurrent = 0, sectionReplacement = 0, sectionCount = 0;
    section.subSections.forEach(sub => {
      const key = `${section.id}__${sub}`;
      const val = data[key];
      if (val?.__currentValue) {
        sectionCurrent += val.__currentValue;
        sectionReplacement += val.__replacementCost || 0;
        sectionCount++;
        itemCount++;
      }
    });
    bySection[section.id] = { current: sectionCurrent, replacement: sectionReplacement, count: sectionCount, label: section.label, icon: section.icon, color: section.color };
    totalCurrentValue += sectionCurrent;
    totalReplacementCost += sectionReplacement;
  });
  return { totalCurrentValue, totalReplacementCost, itemCount, bySection };
}

function fmt(n) { return "$" + Math.round(n).toLocaleString(); }

// ─── PDF Report ───────────────────────────────────────────────────────────────

function generatePDF(homeName, data, coverageLimit) {
  const totals = computeTotals(data);
  const gap = coverageLimit ? (coverageLimit - totals.totalReplacementCost) : null;
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let rows = "";
  VALUATED_SECTIONS.forEach(section => {
    section.subSections.forEach(sub => {
      const key = `${section.id}__${sub}`;
      const val = data[key];
      if (!val?.__currentValue) return;
      rows += `<tr>
        <td>${section.label}</td>
        <td>${sub}</td>
        <td>${val.brand || val.makeModel || "—"}</td>
        <td>${val.__condition || "—"}</td>
        <td style="text-align:right">${fmt(val.__currentValue)}</td>
        <td style="text-align:right">${fmt(val.__replacementCost || 0)}</td>
      </tr>`;
    });
  });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Home Inventory Report — ${homeName}</title>
<style>
  body { font-family: Georgia, serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 40px; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 32px; }
  .summary { display: flex; gap: 20px; margin-bottom: 32px; flex-wrap: wrap; }
  .card { flex: 1; min-width: 160px; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
  .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 6px; }
  .card-value { font-size: 24px; font-weight: bold; }
  .card-value.green { color: #2d7a3a; }
  .card-value.red { color: #c0392b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f5f5f5; text-align: left; padding: 10px 12px; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 9px 12px; border-bottom: 1px solid #eee; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
  .gap-warning { padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
  .gap-warning.under { background: #fef3f2; border: 1px solid #f5c6c2; color: #c0392b; }
  .gap-warning.over  { background: #f0faf2; border: 1px solid #a8ddb5; color: #2d7a3a; }
</style></head><body>
<h1>Home Inventory & Insurance Report</h1>
<div class="subtitle">${homeName} &nbsp;·&nbsp; Generated ${now}</div>
${gap !== null ? `<div class="gap-warning ${gap < 0 ? "under" : "over"}">
  ${gap < 0
    ? `⚠️ <strong>Potential coverage gap of ${fmt(Math.abs(gap))}</strong> — your current policy limit of ${fmt(coverageLimit)} may not fully cover your estimated replacement cost of ${fmt(totals.totalReplacementCost)}.`
    : `✓ <strong>Coverage appears sufficient</strong> — your policy limit of ${fmt(coverageLimit)} exceeds your estimated replacement cost of ${fmt(totals.totalReplacementCost)} by ${fmt(gap)}.`
  }
</div>` : ""}
<div class="summary">
  <div class="card"><div class="card-label">Total Items Valued</div><div class="card-value">${totals.itemCount}</div></div>
  <div class="card"><div class="card-label">Current Market Value</div><div class="card-value">${fmt(totals.totalCurrentValue)}</div></div>
  <div class="card"><div class="card-label">Replacement Cost</div><div class="card-value">${fmt(totals.totalReplacementCost)}</div></div>
  ${coverageLimit ? `<div class="card"><div class="card-label">Your Coverage Limit</div><div class="card-value ${gap >= 0 ? "green" : "red"}">${fmt(coverageLimit)}</div></div>` : ""}
</div>
<table>
  <thead><tr><th>Category</th><th>Item</th><th>Brand / Model</th><th>Condition</th><th style="text-align:right">Current Value</th><th style="text-align:right">Replacement Cost</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr style="font-weight:bold; background:#f9f9f9">
    <td colspan="4">TOTAL</td>
    <td style="text-align:right">${fmt(totals.totalCurrentValue)}</td>
    <td style="text-align:right">${fmt(totals.totalReplacementCost)}</td>
  </tr></tfoot>
</table>
<div class="footer">This report was generated by Under1Roof. Valuations are AI-estimated and intended for insurance planning purposes only. They are not a professional appraisal. Please verify with a licensed appraiser or your insurance agent before making coverage decisions.</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${homeName.replace(/\s+/g, "-").toLowerCase()}-insurance-report.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Insurance Dashboard ──────────────────────────────────────────────────────

function InsuranceDashboard({ data, homeName }) {
  const [coverageLimit, setCoverageLimit] = useState(() => {
    try { return JSON.parse(localStorage.getItem("__coverageLimit") || "0"); } catch { return 0; }
  });
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const totals = computeTotals(data);
  const hasData = totals.itemCount > 0;
  const gap = coverageLimit ? (coverageLimit - totals.totalReplacementCost) : null;

  const saveLimit = () => {
    const val = parseFloat(limitInput.replace(/[^0-9.]/g, "")) || 0;
    setCoverageLimit(val);
    localStorage.setItem("__coverageLimit", JSON.stringify(val));
    setEditingLimit(false);
  };

  return (
    <div style={{ marginBottom: 28, border: "1px solid rgba(200,149,108,0.25)", borderRadius: 14, overflow: "hidden", background: "rgba(200,149,108,0.04)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, letterSpacing: "0.02em" }}>Insurance Inventory</div>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{totals.itemCount} items valued</div>
          </div>
        </div>
        <button
          onClick={() => generatePDF(homeName, data, coverageLimit || null)}
          disabled={!hasData}
          style={{ padding: "8px 16px", borderRadius: 8, background: hasData ? "rgba(200,149,108,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${hasData ? "rgba(200,149,108,0.4)" : "rgba(255,255,255,0.08)"}`, color: hasData ? "#C8956C" : "rgba(240,235,227,0.2)", cursor: hasData ? "pointer" : "default", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
          📄 PDF Report
        </button>
      </div>

      {!hasData ? (
        <div style={{ padding: "24px 20px", textAlign: "center", color: "rgba(240,235,227,0.3)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          Scan appliances, systems, or fixtures to build your inventory
        </div>
      ) : (
        <div style={{ padding: "16px 20px" }}>
          {/* Totals row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Current Value", value: fmt(totals.totalCurrentValue), color: "#8EC896" },
              { label: "Replacement Cost", value: fmt(totals.totalReplacementCost), color: "#C8C86C" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 130, padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "rgba(240,235,227,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 20, fontFamily: "'DM Serif Display', serif", color }}>{value}</div>
              </div>
            ))}
            {/* Coverage limit */}
            <div style={{ flex: 1, minWidth: 130, padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${gap !== null ? (gap >= 0 ? "rgba(142,200,150,0.3)" : "rgba(200,108,108,0.3)") : "rgba(255,255,255,0.08)"}`, borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "rgba(240,235,227,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Your Coverage Limit</div>
              {editingLimit ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input autoFocus value={limitInput} onChange={e => setLimitInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveLimit()} placeholder="e.g. 250000" style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", color: "#F0EBE3", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", width: 0 }} />
                  <button onClick={saveLimit} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(142,200,150,0.2)", border: "1px solid rgba(142,200,150,0.4)", color: "#8EC896", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>✓</button>
                </div>
              ) : (
                <div onClick={() => { setLimitInput(coverageLimit ? String(coverageLimit) : ""); setEditingLimit(true); }} style={{ cursor: "pointer", fontSize: 20, fontFamily: "'DM Serif Display', serif", color: gap !== null ? (gap >= 0 ? "#8EC896" : "#C88E8E") : "rgba(240,235,227,0.3)" }}>
                  {coverageLimit ? fmt(coverageLimit) : <span style={{ fontSize: 13 }}>Tap to enter</span>}
                </div>
              )}
            </div>
          </div>

          {/* Coverage gap indicator */}
          {gap !== null && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: gap >= 0 ? "rgba(142,200,150,0.08)" : "rgba(200,108,108,0.08)", border: `1px solid ${gap >= 0 ? "rgba(142,200,150,0.25)" : "rgba(200,108,108,0.25)"}`, marginBottom: 14, fontSize: 12, color: gap >= 0 ? "#8EC896" : "#C88E8E", fontFamily: "'DM Mono', monospace" }}>
              {gap >= 0
                ? `✓ Coverage looks sufficient — ${fmt(gap)} above estimated replacement cost`
                : `⚠ Potential gap of ${fmt(Math.abs(gap))} — consider increasing your coverage`}
            </div>
          )}

          {/* By section breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {VALUATED_SECTIONS.map(s => {
              const sec = totals.bySection[s.id];
              if (!sec.count) return null;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{sec.icon}</span>
                  <span style={{ color: "rgba(240,235,227,0.5)", flex: 1 }}>{sec.label} <span style={{ opacity: 0.5 }}>({sec.count})</span></span>
                  <span style={{ color: "#8EC896" }}>{fmt(sec.current)}</span>
                  <span style={{ color: "rgba(240,235,227,0.2)", fontSize: 10 }}>/</span>
                  <span style={{ color: "#C8C86C" }}>{fmt(sec.replacement)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Valuation Panel ──────────────────────────────────────────────────────────

function ValuationPanel({ sectionLabel, itemName, itemData, onSave, accentColor }) {
  const [status, setStatus] = useState(
    itemData.__currentValue ? "done" : "idle"
  );
  const [result, setResult] = useState(itemData.__currentValue ? {
    currentValue: itemData.__currentValue,
    replacementCost: itemData.__replacementCost,
    condition: itemData.__condition,
    lifespan: itemData.__lifespan,
    valuationNote: itemData.__valuationNote,
  } : null);

  const run = async () => {
    setStatus("loading");
    try {
      const val = await valuateItem(itemName, sectionLabel, itemData);
      setResult(val);
      onSave(val);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus(itemData.__currentValue ? "done" : "idle"), 3000);
    }
  };

  const conditionColor = { Excellent: "#8EC896", Good: "#C8C86C", Fair: "#C8956C", Poor: "#C86C6C" };

  return (
    <div style={{ margin: "4px 0 16px", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: result ? 12 : 0 }}>
        <span style={{ fontSize: 11, color: "rgba(240,235,227,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>💰 Valuation</span>
        <button
          onClick={run}
          disabled={status === "loading"}
          style={{ padding: "6px 12px", borderRadius: 6, background: status === "loading" ? `${accentColor}18` : status === "done" ? "rgba(255,255,255,0.05)" : `${accentColor}18`, border: `1px solid ${status === "done" ? "rgba(255,255,255,0.1)" : accentColor + "55"}`, color: status === "loading" ? accentColor : status === "done" ? "rgba(240,235,227,0.4)" : accentColor, cursor: status === "loading" ? "default" : "pointer", fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
          {status === "loading" ? "Estimating…" : status === "done" ? "↻ Re-run" : "Estimate Value"}
        </button>
      </div>

      {result && status !== "error" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Current Value</div>
            <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', serif", color: "#8EC896" }}>{fmt(result.currentValue)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Replacement Cost</div>
            <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', serif", color: "#C8C86C" }}>{fmt(result.replacementCost)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Condition</div>
            <div style={{ fontSize: 14, fontFamily: "'DM Serif Display', serif", color: conditionColor[result.condition] || "#F0EBE3" }}>{result.condition}</div>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.3)", marginTop: 2 }}>{result.lifespan}</div>
          </div>
          <div style={{ width: "100%", fontSize: 11, color: "rgba(240,235,227,0.35)", fontStyle: "italic", fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>{result.valuationNote}</div>
        </div>
      )}
      {status === "error" && <p style={{ margin: "8px 0 0", fontSize: 11, color: "#C88E8E", fontFamily: "'DM Mono', monospace" }}>Valuation failed — please try again</p>}
    </div>
  );
}

// ─── Color Scan Button ────────────────────────────────────────────────────────

function ColorScanButton({ colorPrompt, onFill, accentColor }) {
  const fileRef = useRef();
  const [status, setStatus] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [colorResult, setColorResult] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStatus("scanning"); setErrMsg("");
    try {
      const base64 = await fileToBase64(file);
      const safeType = ["image/jpeg","image/png","image/gif","image/webp"].includes(file.type) ? file.type : "image/jpeg";
      const text = await callClaude([{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: safeType, data: base64 } },
          { type: "text", text: colorPrompt },
        ],
      }]);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON returned");
      const result = JSON.parse(match[0]);
      setColorResult(result);
      onFill(result);
      setStatus("done");
      setTimeout(() => { setStatus("idle"); setPreview(null); }, 6000);
    } catch (err) {
      console.error(err);
      setErrMsg(err.message || "Unknown error");
      setStatus("error");
    }
    e.target.value = "";
  };

  const theme = {
    idle:     { bg: "rgba(255,255,255,0.05)", br: "rgba(255,255,255,0.13)", col: "rgba(240,235,227,0.5)", label: "🎨  Scan Wall Color" },
    scanning: { bg: `${accentColor}18`,       br: `${accentColor}55`,       col: accentColor,             label: "⏳  Analyzing color…" },
    done:     { bg: "rgba(142,200,150,0.11)", br: "rgba(142,200,150,0.45)", col: "#8EC896",               label: "✓  Color Identified" },
    error:    { bg: "rgba(200,108,108,0.1)",  br: "rgba(200,108,108,0.4)",  col: "#C88E8E",               label: "✗  Try Again" },
  }[status];

  return (
    <div style={{ marginBottom: 20 }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />

      {/* Color swatch result */}
      {colorResult && status === "done" && (
        <div style={{ marginBottom: 14, padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, display: "flex", gap: 14, alignItems: "flex-start" }}>
          {/* Swatch */}
          <div style={{ width: 56, height: 56, borderRadius: 10, background: colorResult.hex || "#888", flexShrink: 0, border: "1px solid rgba(255,255,255,0.15)", boxShadow: `0 4px 16px ${colorResult.hex || "#888"}55` }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "#F0EBE3" }}>{colorResult.paintName || "Unknown"}</span>
              <span style={{ fontSize: 11, color: "rgba(240,235,227,0.35)", fontFamily: "'DM Mono', monospace" }}>{colorResult.hex}</span>
              {colorResult.confidence && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: colorResult.confidence === "High" ? "rgba(142,200,150,0.15)" : "rgba(200,180,108,0.15)", color: colorResult.confidence === "High" ? "#8EC896" : "#C8C86C", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{colorResult.confidence} confidence</span>}
            </div>
            <div style={{ fontSize: 12, color: "rgba(240,235,227,0.45)", fontFamily: "'DM Mono', monospace" }}>{colorResult.paintBrand} {colorResult.paintCode && `· ${colorResult.paintCode}`} {colorResult.finish && `· ${colorResult.finish}`}</div>
            {(colorResult.altBM || colorResult.altSW || colorResult.altBehr) && (
              <div style={{ marginTop: 8, fontSize: 11, color: "rgba(240,235,227,0.3)", fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>
                {colorResult.altBM   && <div>BM: {colorResult.altBM}</div>}
                {colorResult.altSW   && <div>SW: {colorResult.altSW}</div>}
                {colorResult.altBehr && <div>Behr: {colorResult.altBehr}</div>}
              </div>
            )}
          </div>
          {/* Preview thumbnail */}
          {preview && <img src={preview} alt="Wall" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />}
        </div>
      )}

      <button
        onClick={() => (status === "idle" || status === "error") && fileRef.current.click()}
        disabled={status === "scanning"}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: theme.bg, border: `1px solid ${theme.br}`, color: theme.col, cursor: status === "scanning" ? "default" : "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500, transition: "all 0.3s" }}>
        {theme.label}
      </button>

      {status === "scanning" && <p style={{ margin: "7px 0 0", fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>Claude is analyzing the color…</p>}
      {status === "error" && (
        <div style={{ margin: "8px 0 0", padding: "10px 12px", background: "rgba(200,108,108,0.08)", border: "1px solid rgba(200,108,108,0.2)", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#C88E8E", fontFamily: "'DM Mono', monospace" }}>{errMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ fieldDef, value, onChange, highlighted }) {
  const base = {
    width: "100%", background: highlighted ? "rgba(142,200,150,0.09)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${highlighted ? "rgba(142,200,150,0.5)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 8, padding: "10px 14px", color: "#F0EBE3", fontSize: 14,
    fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s, background 0.4s",
    resize: "vertical", boxSizing: "border-box",
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

function ScanButton({ section, onFill, onValuationReady, accentColor, itemName, currentItemData }) {
  const fileRef = useRef();
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus("scanning"); setErrMsg("");
    try {
      const base64 = await fileToBase64(file);
      const result = await scanImageWithClaude(base64, file.type || "image/jpeg", section.aiPrompt);
      onFill(result);

      // Auto-valuate after scan if section supports it
      if (section.valuated) {
        setStatus("valuating");
        const mergedData = { ...currentItemData, ...result };
        const valuation = await valuateItem(itemName, section.label, mergedData);
        onValuationReady(valuation);
      }
      setStatus("done");
      setTimeout(() => { setStatus("idle"); setPreview(null); }, 4000);
    } catch (err) {
      console.error("Scan/value error:", err);
      setErrMsg(err.message || "Unknown error");
      setStatus("error");
    }
    e.target.value = "";
  };

  const reset = () => { setStatus("idle"); setErrMsg(""); setPreview(null); };

  const theme = {
    idle:      { bg: "rgba(255,255,255,0.05)", br: "rgba(255,255,255,0.13)", col: "rgba(240,235,227,0.5)", label: "📷  Scan Label" },
    scanning:  { bg: `${accentColor}18`,       br: `${accentColor}55`,       col: accentColor,             label: "⏳  Reading label…" },
    valuating: { bg: `${accentColor}18`,       br: `${accentColor}55`,       col: accentColor,             label: "💰  Estimating value…" },
    done:      { bg: "rgba(142,200,150,0.11)", br: "rgba(142,200,150,0.45)", col: "#8EC896",               label: "✓  Scanned & Valued" },
    error:     { bg: "rgba(200,108,108,0.1)",  br: "rgba(200,108,108,0.4)",  col: "#C88E8E",               label: "✗  Scan Failed" },
  }[status];

  return (
    <div style={{ marginBottom: 20 }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      {preview && (
        <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
          <img src={preview} alt="Label preview" style={{ height: 90, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", display: "block", objectFit: "cover" }} />
          {(status === "scanning" || status === "valuating") && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {status === "valuating" ? "💰" : "⏳"}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => status === "idle" ? fileRef.current.click() : status === "error" ? reset() : null} disabled={status === "scanning" || status === "valuating"}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: theme.bg, border: `1px solid ${theme.br}`, color: theme.col, cursor: (status === "scanning" || status === "valuating") ? "default" : "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500, transition: "all 0.3s" }}>
          {theme.label}
        </button>
        {status === "error" && <button onClick={() => fileRef.current.click()} style={{ padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,235,227,0.5)", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Try new photo</button>}
      </div>
      {status === "scanning"  && <p style={{ margin: "7px 0 0", fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>Reading label with Claude…</p>}
      {status === "valuating" && <p style={{ margin: "7px 0 0", fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>Estimating value & replacement cost…</p>}
      {status === "done"      && <p style={{ margin: "7px 0 0", fontSize: 11, color: "#8EC896", fontFamily: "'DM Mono', monospace" }}>Fields filled and value estimated!</p>}
      {status === "error"     && (
        <div style={{ margin: "8px 0 0", padding: "10px 12px", background: "rgba(200,108,108,0.08)", border: "1px solid rgba(200,108,108,0.2)", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#C88E8E", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>Error:</p>
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
  const itemData = data[key] || {};
  const hasData = section.subFields.some(f => itemData[f.key]);
  const hasValuation = !!itemData.__currentValue;

  const handleAiFill = (result) => {
    const filled = [];
    (section.aiFields || []).forEach(fk => {
      if (result[fk]) { onUpdate(key, fk, result[fk]); filled.push(fk); }
    });
    setAiFilledKeys(filled);
  };

  const handleValuationSave = (val) => {
    onUpdate(key, "__currentValue", val.currentValue);
    onUpdate(key, "__replacementCost", val.replacementCost);
    onUpdate(key, "__condition", val.condition);
    onUpdate(key, "__lifespan", val.lifespan);
    onUpdate(key, "__valuationNote", val.valuationNote);
  };

  return (
    <div style={{ marginBottom: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? "rgba(255,255,255,0.06)" : "transparent", border: "none", cursor: "pointer", color: "#F0EBE3", fontFamily: "'DM Serif Display', serif", fontSize: 15, letterSpacing: "0.01em", transition: "background 0.2s" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasData && <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, flexShrink: 0, display: "inline-block" }} />}
          {subName}
          {hasValuation && <span style={{ fontSize: 10, color: "#C8C86C", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>💰 {fmt(itemData.__replacementCost)}</span>}
        </span>
        <span style={{ opacity: 0.4, fontSize: 12, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: "18px 16px 10px", background: "rgba(0,0,0,0.16)" }}>
          {section.aiScan && (
            <ScanButton
              section={section}
              itemName={subName}
              currentItemData={itemData}
              onFill={handleAiFill}
              onValuationReady={handleValuationSave}
              accentColor={accentColor}
            />
          )}
          {section.colorScan && (
            <ColorScanButton
              colorPrompt={section.colorPrompt}
              accentColor={accentColor}
              onFill={(result) => {
                const fieldMap = { hex: "hex", paintBrand: "paintBrand", paintName: "paintName", paintCode: "paintCode", finish: "finish", altBM: "altBM", altSW: "altSW", altBehr: "altBehr" };
                Object.entries(fieldMap).forEach(([rk, fk]) => { if (result[rk]) onUpdate(key, fk, result[rk]); });
              }}
            />
          )}
          {section.valuated && (
            <ValuationPanel
              sectionLabel={section.label}
              itemName={subName}
              itemData={itemData}
              onSave={handleValuationSave}
              accentColor={accentColor}
            />
          )}
          {section.subFields.map(f => (
            <Field key={f.key} fieldDef={f} value={itemData[f.key]} highlighted={aiFilledKeys.includes(f.key)}
              onChange={val => { onUpdate(key, f.key, val); setAiFilledKeys(prev => prev.filter(k => k !== f.key)); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────

function SectionPanel({ section, data, onUpdate, isActive, onActivate }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? section.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, marginBottom: 12, overflow: "hidden", transition: "border-color 0.3s" }}>
      <button onClick={onActivate} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", background: "transparent", border: "none", cursor: "pointer", color: "#F0EBE3", textAlign: "left" }}>
        <span style={{ width: 42, height: 42, borderRadius: 10, background: section.color + "22", border: `1px solid ${section.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{section.icon}</span>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, letterSpacing: "0.02em" }}>{section.label}</div>
          <div style={{ fontSize: 10, marginTop: 2, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {section.aiScan && <span style={{ color: section.color, opacity: 0.7, marginRight: 10 }}>✦ AI scanning</span>}
            {section.valuated && <span style={{ color: "#C8C86C", opacity: 0.7, marginRight: 10 }}>💰 Valued</span>}
            {section.colorScan && <span style={{ color: "#C8A06C", opacity: 0.7 }}>🎨 Color scanning</span>}
          </div>
        </div>
        <span style={{ marginLeft: "auto", opacity: 0.35, fontSize: 12, transform: isActive ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>▼</span>
      </button>
      {isActive && (
        <div style={{ padding: "0 22px 22px" }}>
          {section.fields
            ? section.fields.map(f => <Field key={f.key} fieldDef={f} value={data[`${section.id}__${f.key}`]} onChange={val => onUpdate(`${section.id}__${f.key}`, null, val)} />)
            : section.subSections.map(sub => <SubPanel key={sub} section={section} subName={sub} data={data} onUpdate={onUpdate} accentColor={section.color} />)
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
            <button onClick={() => importRef.current.click()} style={{ padding: "10px 16px", borderRadius: 8, background: importStatus === "done" ? "rgba(142,200,150,0.15)" : importStatus === "error" ? "rgba(200,108,108,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${importStatus === "done" ? "rgba(142,200,150,0.4)" : importStatus === "error" ? "rgba(200,108,108,0.35)" : "rgba(255,255,255,0.1)"}`, color: importStatus === "done" ? "#8EC896" : importStatus === "error" ? "#C88E8E" : "rgba(240,235,227,0.45)", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", transition: "all 0.3s", fontWeight: 500 }}>
              {importStatus === "done" ? "✓ Loaded" : importStatus === "error" ? "✗ Bad file" : "⬆ Import"}
            </button>
            <button onClick={handleExport} style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(108,142,200,0.12)", border: "1px solid rgba(108,142,200,0.3)", color: "#6C8EC8", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>⬇ Export</button>
            <button onClick={handleSave} style={{ padding: "10px 18px", borderRadius: 8, background: saved ? "rgba(142,200,150,0.2)" : "rgba(200,149,108,0.15)", border: `1px solid ${saved ? "#8EC896" : "#C8956C"}55`, color: saved ? "#8EC896" : "#C8956C", cursor: "pointer", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", transition: "all 0.3s", fontWeight: 500 }}>
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 0" }}>
        <InsuranceDashboard data={data} homeName={homeName} />

        {SECTIONS.map(section => (
          <SectionPanel key={section.id} section={section} data={data} onUpdate={handleUpdate}
            isActive={activeSection === section.id}
            onActivate={() => setActiveSection(activeSection === section.id ? null : section.id)} />
        ))}
      </div>
    </div>
  );
}
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
    id: "appliances", label: "Appliances", icon: "🧊", color: "#8EC896", aiScan: true, valuated: true,
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
    id: "systems", label: "Systems", icon: "⚙️", color: "#C8C86C", aiScan: true, valuated: true,
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
    id: "fixtures", label: "Fixtures", icon: "🚿", color: "#C86C8E", aiScan: true, valuated: true,
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
    id: "furniture", label: "Furniture", icon: "🛋️", color: "#9B6CC8", valuated: true,
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

const VALUATED_SECTIONS = SECTIONS.filter(s => s.valuated);

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "home-tracker-v3";
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ─── Anthropic API helpers ────────────────────────────────────────────────────

async function callClaude(messages, max_tokens = 1000) {
  const response = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens, messages }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}: ${await response.text()}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || "").join("");
}

async function scanImageWithClaude(base64Image, mediaType, prompt) {
  const safeType = ["image/jpeg","image/png","image/gif","image/webp"].includes(mediaType) ? mediaType : "image/jpeg";
  const text = await callClaude([{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: safeType, data: base64Image } },
      { type: "text", text: prompt },
    ],
  }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON in response. Model said: ${text.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

async function valuateItem(itemName, sectionLabel, itemData) {
  const description = itemData.brand || itemData.makeModel || itemData.brand || "Unknown item";
  const datePurchased = itemData.datePurchased || itemData.lastService || null;
  const prompt = `You are a home insurance valuation expert. Estimate the current market value and replacement cost for a home asset.

Asset type: ${sectionLabel} — ${itemName}
Description: ${description}
Date info: ${datePurchased || "unknown"}
Additional info: ${JSON.stringify(itemData)}

Return ONLY a valid JSON object:
{
  "currentValue": <number in USD, no commas or symbols>,
  "replacementCost": <number in USD, new replacement cost>,
  "condition": "Excellent|Good|Fair|Poor",
  "lifespan": "<estimated remaining useful life, e.g. '5-8 years'>",
  "valuationNote": "<one sentence explaining the estimate>"
}
Return ONLY raw JSON. No markdown, no explanation.`;

  const text = await callClaude([{ role: "user", content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in valuation response");
  return JSON.parse(match[0]);
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

// ─── Insurance totals ─────────────────────────────────────────────────────────

function computeTotals(data) {
  let totalCurrentValue = 0, totalReplacementCost = 0, itemCount = 0;
  const bySection = {};
  VALUATED_SECTIONS.forEach(section => {
    let sectionCurrent = 0, sectionReplacement = 0, sectionCount = 0;
    section.subSections.forEach(sub => {
      const key = `${section.id}__${sub}`;
      const val = data[key];
      if (val?.__currentValue) {
        sectionCurrent += val.__currentValue;
        sectionReplacement += val.__replacementCost || 0;
        sectionCount++;
        itemCount++;
      }
    });
    bySection[section.id] = { current: sectionCurrent, replacement: sectionReplacement, count: sectionCount, label: section.label, icon: section.icon, color: section.color };
    totalCurrentValue += sectionCurrent;
    totalReplacementCost += sectionReplacement;
  });
  return { totalCurrentValue, totalReplacementCost, itemCount, bySection };
}

function fmt(n) { return "$" + Math.round(n).toLocaleString(); }

// ─── PDF Report ───────────────────────────────────────────────────────────────

function generatePDF(homeName, data, coverageLimit) {
  const totals = computeTotals(data);
  const gap = coverageLimit ? (coverageLimit - totals.totalReplacementCost) : null;
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let rows = "";
  VALUATED_SECTIONS.forEach(section => {
    section.subSections.forEach(sub => {
      const key = `${section.id}__${sub}`;
      const val = data[key];
      if (!val?.__currentValue) return;
      rows += `<tr>
        <td>${section.label}</td>
        <td>${sub}</td>
        <td>${val.brand || val.makeModel || "—"}</td>
        <td>${val.__condition || "—"}</td>
        <td style="text-align:right">${fmt(val.__currentValue)}</td>
        <td style="text-align:right">${fmt(val.__replacementCost || 0)}</td>
      </tr>`;
    });
  });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Home Inventory Report — ${homeName}</title>
<style>
  body { font-family: Georgia, serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 40px; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 32px; }
  .summary { display: flex; gap: 20px; margin-bottom: 32px; flex-wrap: wrap; }
  .card { flex: 1; min-width: 160px; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
  .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 6px; }
  .card-value { font-size: 24px; font-weight: bold; }
  .card-value.green { color: #2d7a3a; }
  .card-value.red { color: #c0392b; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f5f5f5; text-align: left; padding: 10px 12px; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 9px 12px; border-bottom: 1px solid #eee; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
  .gap-warning { padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
  .gap-warning.under { background: #fef3f2; border: 1px solid #f5c6c2; color: #c0392b; }
  .gap-warning.over  { background: #f0faf2; border: 1px solid #a8ddb5; color: #2d7a3a; }
</style></head><body>
<h1>Home Inventory & Insurance Report</h1>
<div class="subtitle">${homeName} &nbsp;·&nbsp; Generated ${now}</div>
${gap !== null ? `<div class="gap-warning ${gap < 0 ? "under" : "over"}">
  ${gap < 0
    ? `⚠️ <strong>Potential coverage gap of ${fmt(Math.abs(gap))}</strong> — your current policy limit of ${fmt(coverageLimit)} may not fully cover your estimated replacement cost of ${fmt(totals.totalReplacementCost)}.`
    : `✓ <strong>Coverage appears sufficient</strong> — your policy limit of ${fmt(coverageLimit)} exceeds your estimated replacement cost of ${fmt(totals.totalReplacementCost)} by ${fmt(gap)}.`
  }
</div>` : ""}
<div class="summary">
  <div class="card"><div class="card-label">Total Items Valued</div><div class="card-value">${totals.itemCount}</div></div>
  <div class="card"><div class="card-label">Current Market Value</div><div class="card-value">${fmt(totals.totalCurrentValue)}</div></div>
  <div class="card"><div class="card-label">Replacement Cost</div><div class="card-value">${fmt(totals.totalReplacementCost)}</div></div>
  ${coverageLimit ? `<div class="card"><div class="card-label">Your Coverage Limit</div><div class="card-value ${gap >= 0 ? "green" : "red"}">${fmt(coverageLimit)}</div></div>` : ""}
</div>
<table>
  <thead><tr><th>Category</th><th>Item</th><th>Brand / Model</th><th>Condition</th><th style="text-align:right">Current Value</th><th style="text-align:right">Replacement Cost</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr style="font-weight:bold; background:#f9f9f9">
    <td colspan="4">TOTAL</td>
    <td style="text-align:right">${fmt(totals.totalCurrentValue)}</td>
    <td style="text-align:right">${fmt(totals.totalReplacementCost)}</td>
  </tr></tfoot>
</table>
<div class="footer">This report was generated by Under1Roof. Valuations are AI-estimated and intended for insurance planning purposes only. They are not a professional appraisal. Please verify with a licensed appraiser or your insurance agent before making coverage decisions.</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${homeName.replace(/\s+/g, "-").toLowerCase()}-insurance-report.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Insurance Dashboard ──────────────────────────────────────────────────────

function InsuranceDashboard({ data, homeName }) {
  const [coverageLimit, setCoverageLimit] = useState(() => {
    try { return JSON.parse(localStorage.getItem("__coverageLimit") || "0"); } catch { return 0; }
  });
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const totals = computeTotals(data);
  const hasData = totals.itemCount > 0;
  const gap = coverageLimit ? (coverageLimit - totals.totalReplacementCost) : null;

  const saveLimit = () => {
    const val = parseFloat(limitInput.replace(/[^0-9.]/g, "")) || 0;
    setCoverageLimit(val);
    localStorage.setItem("__coverageLimit", JSON.stringify(val));
    setEditingLimit(false);
  };

  return (
    <div style={{ marginBottom: 28, border: "1px solid rgba(200,149,108,0.25)", borderRadius: 14, overflow: "hidden", background: "rgba(200,149,108,0.04)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, letterSpacing: "0.02em" }}>Insurance Inventory</div>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{totals.itemCount} items valued</div>
          </div>
        </div>
        <button
          onClick={() => generatePDF(homeName, data, coverageLimit || null)}
          disabled={!hasData}
          style={{ padding: "8px 16px", borderRadius: 8, background: hasData ? "rgba(200,149,108,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${hasData ? "rgba(200,149,108,0.4)" : "rgba(255,255,255,0.08)"}`, color: hasData ? "#C8956C" : "rgba(240,235,227,0.2)", cursor: hasData ? "pointer" : "default", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
          📄 PDF Report
        </button>
      </div>

      {!hasData ? (
        <div style={{ padding: "24px 20px", textAlign: "center", color: "rgba(240,235,227,0.3)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          Scan appliances, systems, or fixtures to build your inventory
        </div>
      ) : (
        <div style={{ padding: "16px 20px" }}>
          {/* Totals row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Current Value", value: fmt(totals.totalCurrentValue), color: "#8EC896" },
              { label: "Replacement Cost", value: fmt(totals.totalReplacementCost), color: "#C8C86C" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 130, padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "rgba(240,235,227,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 20, fontFamily: "'DM Serif Display', serif", color }}>{value}</div>
              </div>
            ))}
            {/* Coverage limit */}
            <div style={{ flex: 1, minWidth: 130, padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${gap !== null ? (gap >= 0 ? "rgba(142,200,150,0.3)" : "rgba(200,108,108,0.3)") : "rgba(255,255,255,0.08)"}`, borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "rgba(240,235,227,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Your Coverage Limit</div>
              {editingLimit ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input autoFocus value={limitInput} onChange={e => setLimitInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveLimit()} placeholder="e.g. 250000" style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", color: "#F0EBE3", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", width: 0 }} />
                  <button onClick={saveLimit} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(142,200,150,0.2)", border: "1px solid rgba(142,200,150,0.4)", color: "#8EC896", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>✓</button>
                </div>
              ) : (
                <div onClick={() => { setLimitInput(coverageLimit ? String(coverageLimit) : ""); setEditingLimit(true); }} style={{ cursor: "pointer", fontSize: 20, fontFamily: "'DM Serif Display', serif", color: gap !== null ? (gap >= 0 ? "#8EC896" : "#C88E8E") : "rgba(240,235,227,0.3)" }}>
                  {coverageLimit ? fmt(coverageLimit) : <span style={{ fontSize: 13 }}>Tap to enter</span>}
                </div>
              )}
            </div>
          </div>

          {/* Coverage gap indicator */}
          {gap !== null && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: gap >= 0 ? "rgba(142,200,150,0.08)" : "rgba(200,108,108,0.08)", border: `1px solid ${gap >= 0 ? "rgba(142,200,150,0.25)" : "rgba(200,108,108,0.25)"}`, marginBottom: 14, fontSize: 12, color: gap >= 0 ? "#8EC896" : "#C88E8E", fontFamily: "'DM Mono', monospace" }}>
              {gap >= 0
                ? `✓ Coverage looks sufficient — ${fmt(gap)} above estimated replacement cost`
                : `⚠ Potential gap of ${fmt(Math.abs(gap))} — consider increasing your coverage`}
            </div>
          )}

          {/* By section breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {VALUATED_SECTIONS.map(s => {
              const sec = totals.bySection[s.id];
              if (!sec.count) return null;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{sec.icon}</span>
                  <span style={{ color: "rgba(240,235,227,0.5)", flex: 1 }}>{sec.label} <span style={{ opacity: 0.5 }}>({sec.count})</span></span>
                  <span style={{ color: "#8EC896" }}>{fmt(sec.current)}</span>
                  <span style={{ color: "rgba(240,235,227,0.2)", fontSize: 10 }}>/</span>
                  <span style={{ color: "#C8C86C" }}>{fmt(sec.replacement)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Valuation Panel ──────────────────────────────────────────────────────────

function ValuationPanel({ sectionLabel, itemName, itemData, onSave, accentColor }) {
  const [status, setStatus] = useState(
    itemData.__currentValue ? "done" : "idle"
  );
  const [result, setResult] = useState(itemData.__currentValue ? {
    currentValue: itemData.__currentValue,
    replacementCost: itemData.__replacementCost,
    condition: itemData.__condition,
    lifespan: itemData.__lifespan,
    valuationNote: itemData.__valuationNote,
  } : null);

  const run = async () => {
    setStatus("loading");
    try {
      const val = await valuateItem(itemName, sectionLabel, itemData);
      setResult(val);
      onSave(val);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus(itemData.__currentValue ? "done" : "idle"), 3000);
    }
  };

  const conditionColor = { Excellent: "#8EC896", Good: "#C8C86C", Fair: "#C8956C", Poor: "#C86C6C" };

  return (
    <div style={{ margin: "4px 0 16px", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: result ? 12 : 0 }}>
        <span style={{ fontSize: 11, color: "rgba(240,235,227,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>💰 Valuation</span>
        <button
          onClick={run}
          disabled={status === "loading"}
          style={{ padding: "6px 12px", borderRadius: 6, background: status === "loading" ? `${accentColor}18` : status === "done" ? "rgba(255,255,255,0.05)" : `${accentColor}18`, border: `1px solid ${status === "done" ? "rgba(255,255,255,0.1)" : accentColor + "55"}`, color: status === "loading" ? accentColor : status === "done" ? "rgba(240,235,227,0.4)" : accentColor, cursor: status === "loading" ? "default" : "pointer", fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
          {status === "loading" ? "Estimating…" : status === "done" ? "↻ Re-run" : "Estimate Value"}
        </button>
      </div>

      {result && status !== "error" && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Current Value</div>
            <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', serif", color: "#8EC896" }}>{fmt(result.currentValue)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Replacement Cost</div>
            <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', serif", color: "#C8C86C" }}>{fmt(result.replacementCost)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Condition</div>
            <div style={{ fontSize: 14, fontFamily: "'DM Serif Display', serif", color: conditionColor[result.condition] || "#F0EBE3" }}>{result.condition}</div>
            <div style={{ fontSize: 10, color: "rgba(240,235,227,0.3)", marginTop: 2 }}>{result.lifespan}</div>
          </div>
          <div style={{ width: "100%", fontSize: 11, color: "rgba(240,235,227,0.35)", fontStyle: "italic", fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>{result.valuationNote}</div>
        </div>
      )}
      {status === "error" && <p style={{ margin: "8px 0 0", fontSize: 11, color: "#C88E8E", fontFamily: "'DM Mono', monospace" }}>Valuation failed — please try again</p>}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ fieldDef, value, onChange, highlighted }) {
  const base = {
    width: "100%", background: highlighted ? "rgba(142,200,150,0.09)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${highlighted ? "rgba(142,200,150,0.5)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 8, padding: "10px 14px", color: "#F0EBE3", fontSize: 14,
    fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s, background 0.4s",
    resize: "vertical", boxSizing: "border-box",
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

function ScanButton({ section, onFill, onValuationReady, accentColor, itemName, currentItemData }) {
  const fileRef = useRef();
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus("scanning"); setErrMsg("");
    try {
      const base64 = await fileToBase64(file);
      const result = await scanImageWithClaude(base64, file.type || "image/jpeg", section.aiPrompt);
      onFill(result);

      // Auto-valuate after scan if section supports it
      if (section.valuated) {
        setStatus("valuating");
        const mergedData = { ...currentItemData, ...result };
        const valuation = await valuateItem(itemName, section.label, mergedData);
        onValuationReady(valuation);
      }
      setStatus("done");
      setTimeout(() => { setStatus("idle"); setPreview(null); }, 4000);
    } catch (err) {
      console.error("Scan/value error:", err);
      setErrMsg(err.message || "Unknown error");
      setStatus("error");
    }
    e.target.value = "";
  };

  const reset = () => { setStatus("idle"); setErrMsg(""); setPreview(null); };

  const theme = {
    idle:      { bg: "rgba(255,255,255,0.05)", br: "rgba(255,255,255,0.13)", col: "rgba(240,235,227,0.5)", label: "📷  Scan Label" },
    scanning:  { bg: `${accentColor}18`,       br: `${accentColor}55`,       col: accentColor,             label: "⏳  Reading label…" },
    valuating: { bg: `${accentColor}18`,       br: `${accentColor}55`,       col: accentColor,             label: "💰  Estimating value…" },
    done:      { bg: "rgba(142,200,150,0.11)", br: "rgba(142,200,150,0.45)", col: "#8EC896",               label: "✓  Scanned & Valued" },
    error:     { bg: "rgba(200,108,108,0.1)",  br: "rgba(200,108,108,0.4)",  col: "#C88E8E",               label: "✗  Scan Failed" },
  }[status];

  return (
    <div style={{ marginBottom: 20 }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      {preview && (
        <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
          <img src={preview} alt="Label preview" style={{ height: 90, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", display: "block", objectFit: "cover" }} />
          {(status === "scanning" || status === "valuating") && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {status === "valuating" ? "💰" : "⏳"}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => status === "idle" ? fileRef.current.click() : status === "error" ? reset() : null} disabled={status === "scanning" || status === "valuating"}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: theme.bg, border: `1px solid ${theme.br}`, color: theme.col, cursor: (status === "scanning" || status === "valuating") ? "default" : "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500, transition: "all 0.3s" }}>
          {theme.label}
        </button>
        {status === "error" && <button onClick={() => fileRef.current.click()} style={{ padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,235,227,0.5)", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Try new photo</button>}
      </div>
      {status === "scanning"  && <p style={{ margin: "7px 0 0", fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>Reading label with Claude…</p>}
      {status === "valuating" && <p style={{ margin: "7px 0 0", fontSize: 11, color: accentColor, fontFamily: "'DM Mono', monospace", opacity: 0.75 }}>Estimating value & replacement cost…</p>}
      {status === "done"      && <p style={{ margin: "7px 0 0", fontSize: 11, color: "#8EC896", fontFamily: "'DM Mono', monospace" }}>Fields filled and value estimated!</p>}
      {status === "error"     && (
        <div style={{ margin: "8px 0 0", padding: "10px 12px", background: "rgba(200,108,108,0.08)", border: "1px solid rgba(200,108,108,0.2)", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#C88E8E", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>Error:</p>
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
  const itemData = data[key] || {};
  const hasData = section.subFields.some(f => itemData[f.key]);
  const hasValuation = !!itemData.__currentValue;

  const handleAiFill = (result) => {
    const filled = [];
    (section.aiFields || []).forEach(fk => {
      if (result[fk]) { onUpdate(key, fk, result[fk]); filled.push(fk); }
    });
    setAiFilledKeys(filled);
  };

  const handleValuationSave = (val) => {
    onUpdate(key, "__currentValue", val.currentValue);
    onUpdate(key, "__replacementCost", val.replacementCost);
    onUpdate(key, "__condition", val.condition);
    onUpdate(key, "__lifespan", val.lifespan);
    onUpdate(key, "__valuationNote", val.valuationNote);
  };

  return (
    <div style={{ marginBottom: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? "rgba(255,255,255,0.06)" : "transparent", border: "none", cursor: "pointer", color: "#F0EBE3", fontFamily: "'DM Serif Display', serif", fontSize: 15, letterSpacing: "0.01em", transition: "background 0.2s" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasData && <span style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, flexShrink: 0, display: "inline-block" }} />}
          {subName}
          {hasValuation && <span style={{ fontSize: 10, color: "#C8C86C", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>💰 {fmt(itemData.__replacementCost)}</span>}
        </span>
        <span style={{ opacity: 0.4, fontSize: 12, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: "18px 16px 10px", background: "rgba(0,0,0,0.16)" }}>
          {section.aiScan && (
            <ScanButton
              section={section}
              itemName={subName}
              currentItemData={itemData}
              onFill={handleAiFill}
              onValuationReady={handleValuationSave}
              accentColor={accentColor}
            />
          )}
          {section.valuated && (
            <ValuationPanel
              sectionLabel={section.label}
              itemName={subName}
              itemData={itemData}
              onSave={handleValuationSave}
              accentColor={accentColor}
            />
          )}
          {section.subFields.map(f => (
            <Field key={f.key} fieldDef={f} value={itemData[f.key]} highlighted={aiFilledKeys.includes(f.key)}
              onChange={val => { onUpdate(key, f.key, val); setAiFilledKeys(prev => prev.filter(k => k !== f.key)); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────

function SectionPanel({ section, data, onUpdate, isActive, onActivate }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? section.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, marginBottom: 12, overflow: "hidden", transition: "border-color 0.3s" }}>
      <button onClick={onActivate} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", background: "transparent", border: "none", cursor: "pointer", color: "#F0EBE3", textAlign: "left" }}>
        <span style={{ width: 42, height: 42, borderRadius: 10, background: section.color + "22", border: `1px solid ${section.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{section.icon}</span>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, letterSpacing: "0.02em" }}>{section.label}</div>
          <div style={{ fontSize: 10, marginTop: 2, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {section.aiScan && <span style={{ color: section.color, opacity: 0.7, marginRight: 10 }}>✦ AI scanning</span>}
            {section.valuated && <span style={{ color: "#C8C86C", opacity: 0.7 }}>💰 Valued</span>}
          </div>
        </div>
        <span style={{ marginLeft: "auto", opacity: 0.35, fontSize: 12, transform: isActive ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>▼</span>
      </button>
      {isActive && (
        <div style={{ padding: "0 22px 22px" }}>
          {section.fields
            ? section.fields.map(f => <Field key={f.key} fieldDef={f} value={data[`${section.id}__${f.key}`]} onChange={val => onUpdate(`${section.id}__${f.key}`, null, val)} />)
            : section.subSections.map(sub => <SubPanel key={sub} section={section} subName={sub} data={data} onUpdate={onUpdate} accentColor={section.color} />)
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
            <button onClick={() => importRef.current.click()} style={{ padding: "10px 16px", borderRadius: 8, background: importStatus === "done" ? "rgba(142,200,150,0.15)" : importStatus === "error" ? "rgba(200,108,108,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${importStatus === "done" ? "rgba(142,200,150,0.4)" : importStatus === "error" ? "rgba(200,108,108,0.35)" : "rgba(255,255,255,0.1)"}`, color: importStatus === "done" ? "#8EC896" : importStatus === "error" ? "#C88E8E" : "rgba(240,235,227,0.45)", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", transition: "all 0.3s", fontWeight: 500 }}>
              {importStatus === "done" ? "✓ Loaded" : importStatus === "error" ? "✗ Bad file" : "⬆ Import"}
            </button>
            <button onClick={handleExport} style={{ padding: "10px 16px", borderRadius: 8, background: "rgba(108,142,200,0.12)", border: "1px solid rgba(108,142,200,0.3)", color: "#6C8EC8", cursor: "pointer", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>⬇ Export</button>
            <button onClick={handleSave} style={{ padding: "10px 18px", borderRadius: 8, background: saved ? "rgba(142,200,150,0.2)" : "rgba(200,149,108,0.15)", border: `1px solid ${saved ? "#8EC896" : "#C8956C"}55`, color: saved ? "#8EC896" : "#C8956C", cursor: "pointer", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", transition: "all 0.3s", fontWeight: 500 }}>
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 0" }}>
        <InsuranceDashboard data={data} homeName={homeName} />

        {SECTIONS.map(section => (
          <SectionPanel key={section.id} section={section} data={data} onUpdate={handleUpdate}
            isActive={activeSection === section.id}
            onActivate={() => setActiveSection(activeSection === section.id ? null : section.id)} />
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCases } from "../services/caseService";
import { createNote } from "../services/caseNoteService";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const toDS = (d) => new Date(d).toDateString();

const formatFull = (d) => d.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

// ── Note Modal ─────────────────────────────────────────────────────────────────
const NoteModal = ({ cases, selectedDate, onClose, onSaved }) => {
  const [caseId,  setCaseId]  = useState("");
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    if (!caseId)  return setError("Please select a case.");
    if (!title.trim())   return setError("Please enter a title.");
    if (!content.trim()) return setError("Please enter the note content.");
    setSaving(true);
    try {
      await createNote({ caseId, title, content });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save note.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.65)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:16,
    }} onClick={onClose}>
      <div style={{
        background:"#0f1f3d", border:"1px solid rgba(201,168,76,0.3)",
        borderRadius:16, padding:28, width:"100%", maxWidth:460,
        boxShadow:"0 24px 60px rgba(0,0,0,0.6)",
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <p style={{ margin:0, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"#c9a84c" }}>
              Quick Note
            </p>
            <h3 style={{ margin:"4px 0 0", fontSize:18, fontWeight:700, color:"#fff" }}>
              {selectedDate.toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}
            </h3>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8,
            color:"#8a95a3", width:32, height:32, cursor:"pointer", fontSize:18,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>×</button>
        </div>

        {/* Select Case */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#8a95a3", display:"block", marginBottom:6 }}>
            Select Case *
          </label>
          <select value={caseId} onChange={e => { setCaseId(e.target.value); setError(""); }}
            style={{
              width:"100%", padding:"10px 12px", borderRadius:10,
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(201,168,76,0.2)",
              color: caseId ? "#fff" : "#8a95a3", fontSize:14, outline:"none",
              cursor:"pointer", boxSizing:"border-box",
            }}>
            <option value="" style={{ background:"#0f1f3d" }}>-- Choose a case --</option>
            {cases.map(c => (
              <option key={c._id} value={c._id} style={{ background:"#0f1f3d" }}>
                {c.caseTitle} (#{c.caseNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#8a95a3", display:"block", marginBottom:6 }}>
            Note Title *
          </label>
          <input value={title} onChange={e => { setTitle(e.target.value); setError(""); }}
            placeholder="e.g. Hearing observation, Client discussion..."
            style={{
              width:"100%", padding:"10px 12px", borderRadius:10,
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(201,168,76,0.2)",
              color:"#fff", fontSize:14, outline:"none", boxSizing:"border-box",
              fontFamily:"inherit",
            }} />
        </div>

        {/* Content */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#8a95a3", display:"block", marginBottom:6 }}>
            Note Content *
          </label>
          <textarea value={content} onChange={e => { setContent(e.target.value); setError(""); }}
            placeholder="Write your notes here..."
            rows={4}
            style={{
              width:"100%", padding:"10px 12px", borderRadius:10,
              background:"rgba(255,255,255,0.07)", border:"1px solid rgba(201,168,76,0.2)",
              color:"#fff", fontSize:14, outline:"none", resize:"vertical",
              boxSizing:"border-box", fontFamily:"inherit",
            }} />
        </div>

        {/* Error */}
        {error && (
          <p style={{ margin:"0 0 12px", fontSize:13, color:"#f87171", background:"rgba(248,113,113,0.1)", padding:"8px 12px", borderRadius:8 }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{
            flex:1, padding:"11px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)",
            background:"transparent", color:"#8a95a3", fontSize:14, fontWeight:600, cursor:"pointer",
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex:2, padding:"11px", borderRadius:10, border:"none",
            background: saving ? "rgba(201,168,76,0.4)" : "#c9a84c",
            color:"#0f1f3d", fontSize:14, fontWeight:700, cursor: saving ? "not-allowed" : "pointer",
          }}>
            {saving ? "Saving…" : "💾 Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Calendar Grid ──────────────────────────────────────────────────────────────
const CalendarGrid = ({ viewYear, viewMonth, selectedDate, today, hearingDates, onSelectDate }) => {
  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays    = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, type:"other" });
  for (let d = 1; d <= daysInMonth; d++)   cells.push({ day: d, type:"current" });
  while (cells.length % 7 !== 0)            cells.push({ day: cells.length - firstDay - daysInMonth + 1, type:"other" });

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
      {cells.map(({ day, type }, idx) => {
        if (type === "other") return (
          <div key={idx} style={{ height:34, display:"flex", alignItems:"center", justifyContent:"center",
                                   fontSize:12, color:"rgba(255,255,255,0.15)", borderRadius:6 }}>
            {day}
          </div>
        );

        const cellDate   = new Date(viewYear, viewMonth, day);
        const isToday    = toDS(cellDate) === toDS(today);
        const isSelected = toDS(cellDate) === toDS(selectedDate);
        const hasHearing = hearingDates.has(toDS(cellDate));

        return (
          <div key={idx} onClick={() => onSelectDate(cellDate)} style={{
            height:34, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, borderRadius:6, cursor:"pointer", position:"relative",
            background: isSelected ? "#c9a84c" : "transparent",
            color: isSelected ? "#0f1f3d" : isToday ? "#c9a84c" : "rgba(255,255,255,0.7)",
            fontWeight: isSelected || isToday ? 700 : 400,
            border: isToday && !isSelected ? "1px solid rgba(201,168,76,0.5)" : "1px solid transparent",
            transition:"all 0.12s",
          }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(201,168,76,0.12)"; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
          >
            {day}
            {hasHearing && (
              <span style={{
                position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
                width:4, height:4, borderRadius:"50%",
                background: isSelected ? "#0f1f3d" : "#c9a84c",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const navigate = useNavigate();
  const [cases,        setCases]        = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewYear,     setViewYear]     = useState(new Date().getFullYear());
  const [viewMonth,    setViewMonth]    = useState(new Date().getMonth());
  const [showModal,    setShowModal]    = useState(false);
  const [noteSaved,    setNoteSaved]    = useState(false);
  const today = new Date();

  useEffect(() => {
    getCases().then(setCases).catch(console.log);
  }, []);

  const hearingDates = new Set(cases.map(c => toDS(new Date(c.nextHearing))));
  const selectedCases = cases.filter(c => toDS(new Date(c.nextHearing)) === toDS(selectedDate));
  const upcoming = [...cases].sort((a,b) => new Date(a.nextHearing) - new Date(b.nextHearing)).slice(0, 6);

  const navBtn = {
    background:"none", border:"1px solid rgba(201,168,76,0.2)", borderRadius:8,
    color:"#c9a84c", width:28, height:28, cursor:"pointer", fontSize:15,
    display:"flex", alignItems:"center", justifyContent:"center",
  };

  return (
    <div style={{
      fontFamily:"'DM Sans',sans-serif", background:"#0f1f3d",
      color:"#fff", minHeight:"100vh", padding:"24px 28px",
    }}>
      {showModal && (
        <NoteModal
          cases={cases}
          selectedDate={selectedDate}
          onClose={() => setShowModal(false)}
          onSaved={() => { setNoteSaved(true); setTimeout(() => setNoteSaved(false), 3000); }}
        />
      )}

      {/* Success toast */}
      {noteSaved && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:999,
          background:"#15803d", color:"#fff", padding:"12px 20px",
          borderRadius:10, fontSize:14, fontWeight:600,
          boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
        }}>
          ✅ Note saved successfully!
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24, paddingBottom:18, borderBottom:"1px solid rgba(201,168,76,0.15)" }}>
        <div>
          <p style={{ margin:0, fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"#c9a84c", marginBottom:4 }}>Case Management</p>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" }}>Hearing Calendar</h1>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"#8a95a3" }}>Court dates, schedules &amp; upcoming hearings</p>
        </div>
        <div style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:8, padding:"6px 14px", textAlign:"right" }}>
          <p style={{ margin:0, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#c9a84c" }}>Today</p>
          <p style={{ margin:"2px 0 0", fontSize:13, fontWeight:600 }}>
            {today.toLocaleDateString("en-IN",{ month:"short", day:"numeric", year:"numeric" })}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:18, marginBottom:24 }}>

        {/* Calendar */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:14, padding:18 }}>
          {/* Month nav */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <button style={navBtn} onClick={() => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }}>‹</button>
            <span style={{ fontSize:16, fontWeight:600, color:"#fff" }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button style={navBtn} onClick={() => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
            {DAYS.map(d => (
              <span key={d} style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#8a95a3", textAlign:"center", padding:"4px 0" }}>{d}</span>
            ))}
          </div>

          <CalendarGrid viewYear={viewYear} viewMonth={viewMonth} selectedDate={selectedDate}
            today={today} hearingDates={hearingDates} onSelectDate={setSelectedDate} />
        </div>

        {/* Side panel */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:14, padding:18, display:"flex", flexDirection:"column", gap:14 }}>
          {/* Selected date */}
          <div style={{ paddingBottom:14, borderBottom:"1px solid rgba(201,168,76,0.15)" }}>
            <p style={{ margin:0, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#c9a84c", marginBottom:3 }}>Selected Date</p>
            <p style={{ margin:0, fontSize:16, fontWeight:700, color:"#fff", lineHeight:1.3 }}>{formatFull(selectedDate)}</p>
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <button onClick={() => navigate("/dashboard/cases", { state: { selectedDate } })}
              style={{ padding:"10px 14px", borderRadius:10, border:"none", background:"#c9a84c", color:"#0f1f3d", fontWeight:700, fontSize:13.5, cursor:"pointer", textAlign:"left" }}>
              ➕ Create Case
            </button>
            <button onClick={() => setShowModal(true)}
              style={{ padding:"10px 14px", borderRadius:10, border:"none", background:"#2563eb", color:"#fff", fontWeight:700, fontSize:13.5, cursor:"pointer", textAlign:"left" }}>
              📝 Create Note
            </button>
          </div>

          <div style={{ height:1, background:"rgba(201,168,76,0.15)" }} />

          {/* Hearings on selected date */}
          {selectedCases.length === 0 ? (
            <div style={{ textAlign:"center", padding:"20px 0", color:"#8a95a3" }}>
              <div style={{ fontSize:28, opacity:0.3, marginBottom:6 }}>📅</div>
              <p style={{ margin:0, fontSize:13 }}>No hearings scheduled</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {selectedCases.map(c => (
                <div key={c._id} style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"#c9a84c", display:"inline-block" }} />
                    <span style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#c9a84c" }}>Hearing</span>
                  </div>
                  <p style={{ margin:"0 0 8px", fontSize:13.5, fontWeight:600, color:"#fff", lineHeight:1.3 }}>{c.caseTitle}</p>
                  <p style={{ margin:"0 0 3px", fontSize:12, color:"#8a95a3" }}>👤 {c.client?.name}</p>
                  <p style={{ margin:0, fontSize:12, color:"#8a95a3" }}>🏛 {c.courtName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming hearings */}
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:"#fff" }}>Upcoming Hearings</h2>
          <span style={{ fontSize:12, color:"#8a95a3" }}>{cases.length} total</span>
        </div>

        {upcoming.length === 0 ? (
          <div style={{ textAlign:"center", padding:32, color:"#8a95a3", fontSize:13, border:"1px dashed rgba(201,168,76,0.18)", borderRadius:12 }}>
            No upcoming hearings found
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {upcoming.map(c => (
              <div key={c._id} style={{
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(201,168,76,0.15)",
                borderRadius:12, padding:16, transition:"border-color 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor="rgba(201,168,76,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor="rgba(201,168,76,0.15)"}
              >
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <span style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#c9a84c", background:"rgba(201,168,76,0.1)", padding:"3px 8px", borderRadius:6 }}>Hearing</span>
                  <span style={{ fontSize:12, color:"#8a95a3" }}>{new Date(c.nextHearing).toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}</span>
                </div>
                <p style={{ margin:"0 0 8px", fontSize:14, fontWeight:600, color:"#fff", lineHeight:1.3 }}>{c.caseTitle}</p>
                <p style={{ margin:"0 0 3px", fontSize:12, color:"#8a95a3" }}>👤 {c.client?.name}</p>
                <p style={{ margin:0, fontSize:12, color:"#8a95a3" }}>🏛 {c.courtName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;

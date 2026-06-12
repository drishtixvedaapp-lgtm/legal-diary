import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  getNotesByCase,
  createNote,
  deleteNote,
} from "../services/caseNoteService";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "../services/caseDocumentService";

import {
  getTimeline,
} from "../services/timelineService";

import {
  getCaseById,
} from "../services/caseService";

import {
  createOutcome,
  getOutcomesByCase,
} from "../services/hearingOutcomeService";

/* ─── Inline styles injected once ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  :root {
    --ink:       #0f1623;
    --ink-soft:  #4a5568;
    --ink-muted: #94a3b8;
    --paper:     #f8f7f4;
    --white:     #ffffff;
    --accent:    #1a3a5c;
    --accent-lt: #2563a8;
    --gold:      #b8870b;
    --gold-lt:   #f0c060;
    --crimson:   #b91c1c;
    --emerald:   #166534;
    --violet:    #5b21b6;
    --border:    #e2e0db;
    --shadow-sm: 0 1px 3px rgba(15,22,35,.07), 0 1px 2px rgba(15,22,35,.05);
    --shadow-md: 0 4px 16px rgba(15,22,35,.09), 0 2px 6px rgba(15,22,35,.06);
    --shadow-lg: 0 12px 40px rgba(15,22,35,.12), 0 4px 12px rgba(15,22,35,.08);
    --radius:    14px;
    --radius-lg: 20px;
    --serif:     'DM Serif Display', Georgia, serif;
    --sans:      'DM Sans', system-ui, sans-serif;
  }

  .diary-root * { box-sizing: border-box; }
  .diary-root { font-family: var(--sans); background: var(--paper); min-height: 100vh; color: var(--ink); }

  /* ── Hero ── */
  .dh-hero {
    background: var(--accent);
    background-image:
      radial-gradient(ellipse 80% 60% at 70% 50%, rgba(37,99,168,.45) 0%, transparent 70%),
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    padding: 52px 48px 44px;
    border-radius: 0 0 32px 32px;
    position: relative;
    overflow: hidden;
  }
  .dh-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(184,135,11,.08) 0%, transparent 60%);
    pointer-events: none;
  }
  .dh-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.18);
    color: rgba(255,255,255,.85);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 100px;
    margin-bottom: 16px;
  }
  .dh-hero h1 {
    font-family: var(--serif);
    font-size: 42px;
    font-weight: 400;
    color: #fff;
    margin: 0 0 10px;
    line-height: 1.15;
    letter-spacing: -.01em;
  }
  .dh-hero p {
    color: rgba(255,255,255,.65);
    font-size: 15px;
    margin: 0;
    font-weight: 300;
  }

  /* ── Case Summary Card ── */
  .dh-summary {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    box-shadow: var(--shadow-sm);
    margin: 28px 0 0;
  }
  .dh-summary-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 6px;
  }
  .dh-summary-val {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
  }
  .dh-divider { width: 1px; background: var(--border); align-self: stretch; margin: 0 4px; }

  /* ── Stat Pills ── */
  .dh-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin: 28px 0 0; }
  @media(max-width:768px){ .dh-stats { grid-template-columns: repeat(2,1fr); } }
  .dh-stat {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    box-shadow: var(--shadow-sm);
    transition: transform .18s, box-shadow .18s;
    position: relative;
    overflow: hidden;
  }
  .dh-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .dh-stat::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 0 0 var(--radius) var(--radius);
  }
  .dh-stat.s-blue::after  { background: var(--accent-lt); }
  .dh-stat.s-gold::after  { background: var(--gold); }
  .dh-stat.s-violet::after{ background: var(--violet); }
  .dh-stat.s-green::after { background: var(--emerald); }
  .dh-stat-icon { font-size: 22px; margin-bottom: 8px; }
  .dh-stat-lbl { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-muted); }
  .dh-stat-num { font-family: var(--serif); font-size: 36px; color: var(--ink); line-height: 1; margin-top: 4px; }

  /* ── Section Headers ── */
  .dh-section-title {
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 400;
    color: var(--ink);
    margin: 0 0 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dh-section-title span { font-size: 20px; }

  /* ── Cards ── */
  .dh-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    box-shadow: var(--shadow-sm);
  }

  /* ── Layout Grid ── */
  .dh-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  @media(max-width:900px){ .dh-grid-2 { grid-template-columns: 1fr; } }

  /* ── Stage Progress ── */
  .dh-stages { display: flex; align-items: flex-start; gap: 0; margin-bottom: 28px; }
  .dh-stage-item { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .dh-stage-item:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: var(--border);
    z-index: 0;
  }
  .dh-stage-item.done:not(:last-child)::after { background: var(--emerald); }
  .dh-stage-dot {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    position: relative; z-index: 1;
    border: 2px solid var(--border);
    background: var(--paper);
    color: var(--ink-muted);
    transition: all .2s;
  }
  .dh-stage-item.done .dh-stage-dot {
    background: var(--emerald);
    border-color: var(--emerald);
    color: white;
  }
  .dh-stage-item.current .dh-stage-dot {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    box-shadow: 0 0 0 4px rgba(26,58,92,.15);
  }
  .dh-stage-lbl { font-size: 10px; font-weight: 600; color: var(--ink-muted); margin-top: 7px; text-align: center; letter-spacing: .04em; }
  .dh-stage-item.done .dh-stage-lbl, .dh-stage-item.current .dh-stage-lbl { color: var(--ink); }

  /* ── Timeline ── */
  .dh-timeline-item {
    position: relative;
    padding: 0 0 20px 36px;
    border-left: 2px solid var(--border);
    margin-left: 8px;
  }
  .dh-timeline-item:last-child { border-color: transparent; }
  .dh-timeline-dot {
    position: absolute;
    left: -9px; top: 2px;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--white);
    box-shadow: 0 0 0 2px var(--accent);
  }
  .dh-timeline-title { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
  .dh-timeline-desc  { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }
  .dh-timeline-date  { font-size: 11px; color: var(--ink-muted); margin-top: 5px; font-weight: 500; }

  /* ── Hearing Card ── */
  .dh-hearing-card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 14px;
    background: var(--paper);
    position: relative;
    overflow: hidden;
    transition: box-shadow .18s;
  }
  .dh-hearing-card:hover { box-shadow: var(--shadow-md); }
  .dh-hearing-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: var(--violet);
    border-radius: 4px 0 0 4px;
  }
  .dh-hearing-date { font-family: var(--serif); font-size: 16px; color: var(--ink); margin-bottom: 10px; }
  .dh-hearing-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .04em;
    background: rgba(91,33,182,.1);
    color: var(--violet);
    margin-bottom: 10px;
  }
  .dh-hearing-row { font-size: 13px; color: var(--ink-soft); margin-bottom: 5px; }
  .dh-hearing-row strong { color: var(--ink); font-weight: 600; }

  /* ── Form Elements ── */
  .dh-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ink-soft);
    margin-bottom: 6px;
  }
  .dh-input, .dh-textarea, .dh-select {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--sans);
    font-size: 14px;
    color: var(--ink);
    background: var(--white);
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    appearance: none;
    -webkit-appearance: none;
  }
  .dh-input:focus, .dh-textarea:focus, .dh-select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(26,58,92,.1);
  }
  .dh-textarea { resize: vertical; min-height: 100px; }
  .dh-form-row { margin-bottom: 16px; }
  .dh-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media(max-width:560px){ .dh-form-grid { grid-template-columns: 1fr; } }

  /* ── Buttons ── */
  .dh-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px;
    border-radius: 10px;
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .02em;
    cursor: pointer;
    border: none;
    transition: all .15s;
  }
  .dh-btn:active { transform: scale(.97); }
  .dh-btn-primary { background: var(--accent); color: #fff; }
  .dh-btn-primary:hover { background: var(--accent-lt); box-shadow: 0 4px 12px rgba(26,58,92,.25); }
  .dh-btn-success { background: var(--emerald); color: #fff; }
  .dh-btn-success:hover { background: #15803d; box-shadow: 0 4px 12px rgba(22,101,52,.25); }
  .dh-btn-blue { background: var(--accent-lt); color: #fff; }
  .dh-btn-blue:hover { background: var(--accent); box-shadow: 0 4px 12px rgba(37,99,168,.25); }
  .dh-btn-danger {
    background: transparent;
    border: 1.5px solid #fca5a5;
    color: var(--crimson);
    padding: 6px 12px;
    font-size: 12px;
  }
  .dh-btn-danger:hover { background: #fef2f2; }
  .dh-btn-open {
    background: transparent;
    border: 1.5px solid #86efac;
    color: var(--emerald);
    padding: 6px 12px;
    font-size: 12px;
  }
  .dh-btn-open:hover { background: #f0fdf4; }

  /* ── Note Card ── */
  .dh-note-card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    background: var(--white);
    position: relative;
    overflow: hidden;
    transition: box-shadow .18s;
    margin-bottom: 14px;
  }
  .dh-note-card:hover { box-shadow: var(--shadow-md); }
  .dh-note-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: var(--gold);
    border-radius: 4px 0 0 4px;
  }
  .dh-note-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
  .dh-note-date  { font-size: 11px; color: var(--ink-muted); font-weight: 500; }
  .dh-note-body  { font-size: 14px; color: var(--ink-soft); line-height: 1.65; margin-top: 12px; }

  /* ── Document Row ── */
  .dh-doc-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 0;
    border-bottom: 1px solid var(--border);
  }
  .dh-doc-row:last-child { border-bottom: none; }
  .dh-doc-icon { font-size: 18px; margin-right: 10px; }
  .dh-doc-name { font-size: 14px; font-weight: 500; color: var(--ink); }
  .dh-doc-actions { display: flex; gap: 8px; flex-shrink: 0; }

  /* ── File Input Wrapper ── */
  .dh-file-wrapper {
    display: flex; align-items: center; gap: 12px;
    border: 1.5px dashed var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    background: var(--paper);
    transition: border-color .15s;
    cursor: pointer;
  }
  .dh-file-wrapper:focus-within { border-color: var(--accent); }
  .dh-file-wrapper input[type=file] { font-size: 13px; color: var(--ink-soft); flex: 1; }
  .dh-file-label { font-size: 12px; color: var(--ink-muted); }

  /* ── Empty States ── */
  .dh-empty { text-align: center; padding: 36px 20px; color: var(--ink-muted); }
  .dh-empty-icon { font-size: 32px; margin-bottom: 10px; }
  .dh-empty-text { font-size: 13px; }

  /* ── Padding wrapper ── */
  .dh-body { padding: 32px 40px; }
  @media(max-width:768px){ .dh-body { padding: 20px 16px; } }

  /* ── Outer spacing ── */
  .dh-section { margin-top: 28px; }
`;

/* ─── Tiny helpers ─────────────────────────────────────────────────────────── */
const STAGES = ["Filing", "Investigation", "Arguments", "Trial", "Judgment", "Closed"];

function stageIndex(s) {
  return STAGES.indexOf(s);
}

function fmt(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTs(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ══════════════════════════════════════════════════════════════════════════════
   DiaryPage
══════════════════════════════════════════════════════════════════════════════ */
const DiaryPage = () => {
  const { id } = useParams();

  const [notes,       setNotes]       = useState([]);
  const [documents,   setDocuments]   = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData,    setFormData]    = useState({ title: "", content: "" });
  const [timeline,    setTimeline]    = useState([]);
  const [outcomes,    setOutcomes]    = useState([]);
  const [caseData,    setCaseData]    = useState(null);
  const [outcomeData, setOutcomeData] = useState({
    hearingDate: "", outcome: "", judgeRemarks: "", nextHearing: "",
  });

  /* ── Fetchers ── */
  const fetchNotes     = async () => { try { setNotes(await getNotesByCase(id));     } catch(e){ console.log(e); } };
  const fetchDocuments = async () => { try { setDocuments(await getDocuments(id));   } catch(e){ console.log(e); } };
  const fetchTimeline  = async () => { try { setTimeline(await getTimeline(id));     } catch(e){ console.log(e); } };
  const fetchCase      = async () => { try { setCaseData(await getCaseById(id));     } catch(e){ console.log(e); } };
  const fetchOutcomes  = async () => { try { setOutcomes(await getOutcomesByCase(id)); } catch(e){ console.log(e); } };

  useEffect(() => {
    fetchCase(); fetchNotes(); fetchDocuments(); fetchTimeline(); fetchOutcomes();
  }, [id]);

  /* ── Handlers ── */
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOutcomeChange = (e) => setOutcomeData({ ...outcomeData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNote({ caseId: id, title: formData.title, content: formData.content });
      setFormData({ title: "", content: "" });
      fetchNotes();
    } catch(err){ console.log(err); }
  };

  const handleDeleteNote = async (noteId) => {
    try { await deleteNote(noteId); fetchNotes(); } catch(e){ console.log(e); }
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) return;
      const fd = new FormData();
      fd.append("caseId", id);
      fd.append("file", selectedFile);
      await uploadDocument(fd);
      setSelectedFile(null);
      fetchDocuments();
    } catch(e){ console.log(e); }
  };

  const handleDeleteDocument = async (documentId) => {
    try { await deleteDocument(documentId); fetchDocuments(); } catch(e){ console.log(e); }
  };

  const handleOutcomeSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOutcome({ caseId: id, ...outcomeData });
      setOutcomeData({ hearingDate: "", outcome: "", judgeRemarks: "", nextHearing: "" });
      fetchOutcomes(); fetchTimeline();
    } catch(err){ console.log(err); }
  };

  const curStageIdx = caseData ? stageIndex(caseData.stage) : -1;

  /* ══════════════════════════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="diary-root">
      <style>{GLOBAL_CSS}</style>

      {/* ── HERO ── */}
      <div className="dh-hero">
        <div className="dh-badge" style={{
          display:"inline-flex", alignItems:"center", gap:"7px",
          background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.18)",
          color:"rgba(255,255,255,.85)", fontSize:"11px", fontWeight:600,
          letterSpacing:".08em", textTransform:"uppercase",
          padding:"5px 12px", borderRadius:"100px", marginBottom:"16px"
        }}>
          ⚖ Litigation Record
        </div>
        <h1 style={{
          fontFamily:"'DM Serif Display', Georgia, serif",
          fontSize:"clamp(28px,4vw,44px)", fontWeight:400,
          color:"#fff", margin:"0 0 10px", lineHeight:1.15
        }}>
          Case Diary
        </h1>
        <p style={{ color:"rgba(255,255,255,.65)", fontSize:"15px", margin:0, fontWeight:300 }}>
          Complete litigation history — hearings, notes and documents in one place.
        </p>

        {/* Case Summary inside hero */}
        {caseData && (
          <div className="dh-summary" style={{ marginTop:"28px" }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"28px" }}>
              {[
                ["Case No",  caseData.caseNumber],
                ["Court",    caseData.courtName],
                ["Status",   caseData.status],
                ["Stage",    caseData.stage],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div className="dh-summary-label">{lbl}</div>
                  <div className="dh-summary-val">{val || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dh-body">

        {/* ── STAT PILLS ── */}
        <div className="dh-stats">
          {[
            { icon:"📝", lbl:"Notes",     val: notes.length,     cls:"s-gold"  },
            { icon:"📄", lbl:"Documents", val: documents.length, cls:"s-blue"  },
            { icon:"🏛", lbl:"Hearings",  val: outcomes.length,  cls:"s-violet"},
            { icon:"📅", lbl:"Timeline",  val: timeline.length,  cls:"s-green" },
          ].map(({ icon, lbl, val, cls }) => (
            <div key={lbl} className={`dh-stat ${cls}`}>
              <div className="dh-stat-icon">{icon}</div>
              <div className="dh-stat-lbl">{lbl}</div>
              <div className="dh-stat-num">{val}</div>
            </div>
          ))}
        </div>

        {/* ── ROW 1: Progress + Timeline | Record Outcome ── */}
        <div className="dh-grid-2 dh-section">

          {/* Left: Progress + Timeline */}
          <div className="dh-card">

            {/* Stage Progress */}
            {caseData && (
              <>
                <div className="dh-section-title">
                  <span>⚖</span> Case Progress
                </div>
                <div className="dh-stages">
                  {STAGES.map((stage, i) => {
                    const done    = i < curStageIdx;
                    const current = i === curStageIdx;
                    return (
                      <div key={stage} className={`dh-stage-item ${done ? "done" : ""} ${current ? "current" : ""}`}>
                        <div className="dh-stage-dot">
                          {done ? "✓" : current ? "●" : i + 1}
                        </div>
                        <div className="dh-stage-lbl">{stage}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Timeline */}
            <div className="dh-section-title" style={{ marginTop: caseData ? "24px" : 0 }}>
              <span>📅</span> Case Timeline
            </div>

            {timeline.length === 0 ? (
              <div className="dh-empty">
                <div className="dh-empty-icon">📭</div>
                <div className="dh-empty-text">No timeline events yet.</div>
              </div>
            ) : (
              <div style={{ paddingTop:"4px" }}>
                {timeline.map((event) => (
                  <div key={event._id} className="dh-timeline-item">
                    <div className="dh-timeline-dot" />
                    <div className="dh-timeline-title">{event.title}</div>
                    <div className="dh-timeline-desc">{event.description}</div>
                    <div className="dh-timeline-date">{fmtTs(event.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Record Outcome */}
          <div className="dh-card">
            <div className="dh-section-title">
              <span>🏛</span> Record Hearing Outcome
            </div>

            <form onSubmit={handleOutcomeSubmit}>
              <div className="dh-form-grid">
                <div className="dh-form-row">
                  <label className="dh-label">Hearing Date</label>
                  <input type="date" name="hearingDate" value={outcomeData.hearingDate}
                    onChange={handleOutcomeChange} className="dh-input" required />
                </div>
                <div className="dh-form-row">
                  <label className="dh-label">Next Hearing</label>
                  <input type="date" name="nextHearing" value={outcomeData.nextHearing}
                    onChange={handleOutcomeChange} className="dh-input" />
                </div>
              </div>

              <div className="dh-form-row">
                <label className="dh-label">Outcome</label>
                <select name="outcome" value={outcomeData.outcome}
                  onChange={handleOutcomeChange} className="dh-select" required>
                  <option value="">Select Outcome</option>
                  <option>Adjourned</option>
                  <option>Arguments Completed</option>
                  <option>Judgment Reserved</option>
                  <option>Case Closed</option>
                </select>
              </div>

              <div className="dh-form-row">
                <label className="dh-label">Judge Remarks</label>
                <textarea name="judgeRemarks" value={outcomeData.judgeRemarks}
                  onChange={handleOutcomeChange} placeholder="Enter judge's remarks…"
                  className="dh-textarea" />
              </div>

              <button type="submit" className="dh-btn dh-btn-primary">
                💾 Save Outcome
              </button>
            </form>
          </div>
        </div>

        {/* ── ROW 2: Hearing History ── */}
        <div className="dh-section">
          <div className="dh-card">
            <div className="dh-section-title">
              <span>🏛</span> Hearing History
            </div>

            {outcomes.length === 0 ? (
              <div className="dh-empty">
                <div className="dh-empty-icon">📋</div>
                <div className="dh-empty-text">No hearings recorded yet.</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"14px" }}>
                {outcomes.map((item) => (
                  <div key={item._id} className="dh-hearing-card">
                    <div className="dh-hearing-date">{fmt(item.hearingDate)}</div>
                    <div className="dh-hearing-badge">{item.outcome}</div>
                    <div className="dh-hearing-row">
                      <strong>Judge Remarks:</strong> {item.judgeRemarks || "—"}
                    </div>
                    <div className="dh-hearing-row">
                      <strong>Next Hearing:</strong> {fmt(item.nextHearing)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 3: Add Note + Upload Doc ── */}
        <div className="dh-grid-2 dh-section">

          {/* Add Note */}
          <div className="dh-card">
            <div className="dh-section-title">
              <span>📝</span> Add Note
            </div>

            <form onSubmit={handleSubmit}>
              <div className="dh-form-row">
                <label className="dh-label">Title</label>
                <input type="text" name="title" placeholder="Note title…"
                  value={formData.title} onChange={handleChange}
                  className="dh-input" required />
              </div>
              <div className="dh-form-row">
                <label className="dh-label">Content</label>
                <textarea name="content" placeholder="Write your note…"
                  value={formData.content} onChange={handleChange}
                  className="dh-textarea" style={{ minHeight:"130px" }} required />
              </div>
              <button type="submit" className="dh-btn dh-btn-success">
                ＋ Add Note
              </button>
            </form>
          </div>

          {/* Upload Document */}
          <div className="dh-card">
            <div className="dh-section-title">
              <span>📄</span> Upload Document
            </div>

            <div className="dh-file-wrapper">
              <span style={{ fontSize:"22px" }}>📎</span>
              <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </div>
            {selectedFile && (
              <p style={{ fontSize:"12px", color:"var(--ink-soft)", margin:"8px 0 0" }}>
                Selected: <strong>{selectedFile.name}</strong>
              </p>
            )}
            <button onClick={handleUpload} className="dh-btn dh-btn-blue"
              style={{ marginTop:"16px" }}>
              ⬆ Upload
            </button>

            {/* Existing docs inline */}
            {documents.length > 0 && (
              <div style={{ marginTop:"24px" }}>
                <div style={{ fontSize:"11px", fontWeight:700, letterSpacing:".08em",
                  textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:"10px" }}>
                  Uploaded Files
                </div>
                {documents.map((doc) => (
                  <div key={doc._id} className="dh-doc-row">
                    <div style={{ display:"flex", alignItems:"center", minWidth:0 }}>
                      <span className="dh-doc-icon">📁</span>
                      <span className="dh-doc-name" style={{
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
                      }}>
                        {doc.fileName}
                      </span>
                    </div>
                    <div className="dh-doc-actions">
                      <a href={`${import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:5000"}${doc.fileUrl}`} target="_blank"
                        rel="noreferrer" className="dh-btn dh-btn-open">
                        Open
                      </a>
                      <button onClick={() => handleDeleteDocument(doc._id)}
                        className="dh-btn dh-btn-danger">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {documents.length === 0 && (
              <div className="dh-empty" style={{ paddingTop:"20px" }}>
                <div className="dh-empty-icon">📂</div>
                <div className="dh-empty-text">No documents uploaded yet.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 4: Notes Timeline ── */}
        <div className="dh-section" style={{ marginBottom:"48px" }}>
          <div className="dh-section-title" style={{ marginBottom:"16px" }}>
            <span>📝</span> Notes Timeline
          </div>

          {notes.length === 0 ? (
            <div className="dh-card">
              <div className="dh-empty">
                <div className="dh-empty-icon">📓</div>
                <div className="dh-empty-text">No notes added yet.</div>
              </div>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="dh-note-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px" }}>
                  <div>
                    <div className="dh-note-title">{note.title}</div>
                    <div className="dh-note-date">{fmtTs(note.createdAt)}</div>
                  </div>
                  <button onClick={() => handleDeleteNote(note._id)}
                    className="dh-btn dh-btn-danger" style={{ flexShrink:0 }}>
                    Delete
                  </button>
                </div>
                <div className="dh-note-body">{note.content}</div>
              </div>
            ))
          )}
        </div>

      </div>{/* /dh-body */}
    </div>
  );
};

export default DiaryPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCases } from "../services/caseService";

 
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const MONTHS_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
 
// ─── helpers ───────────────────────────────────────────────────────────────
 
function toDateStr(d) {
  return new Date(d).toDateString();
}
 
function formatFull(d) {
  const dayNames = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
  ];
  return `${dayNames[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
 
function formatShort(dateStr) {
  const d = new Date(dateStr);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
 
// ─── sub-components ────────────────────────────────────────────────────────
 
function HearingChip() {
  return (
    <span style={{
      fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#c9a84c", background: "rgba(201,168,76,0.1)",
      border: "0.5px solid rgba(201,168,76,0.25)", borderRadius: 6,
      padding: "3px 8px",
    }}>
      Hearing
    </span>
  );
}
 
function PanelHearingCard({ singleCase }) {
  return (
    <div style={{
      background: "rgba(201,168,76,0.07)",
      border: "0.5px solid rgba(201,168,76,0.3)",
      borderRadius: 10, padding: "12px 14px", marginBottom: 10,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#c9a84c", marginBottom: 6,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{
          display: "inline-block", width: 5, height: 5,
          borderRadius: "50%", background: "#c9a84c",
        }} />
        Hearing
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>
        {singleCase.caseTitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 12, color: "#8a95a3" }}>👤 {singleCase.client?.name}</span>
        <span style={{ fontSize: 12, color: "#8a95a3" }}>🏛 {singleCase.courtName}</span>
      </div>
    </div>
  );
}
 
function UpcomingCard({ singleCase }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: `0.5px solid ${hovered ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.18)"}`,
        borderRadius: 14, padding: 18, cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.18s",
        position: "relative", overflow: "hidden",
      }}
    >
      {hovered && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, #c9a84c 0%, transparent 100%)",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <HearingChip />
        <span style={{ fontSize: 12, color: "#8a95a3", fontWeight: 500 }}>
          {new Date(singleCase.nextHearing).toLocaleDateString()}
        </span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10, lineHeight: 1.35 }}>
        {singleCase.caseTitle}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 12, color: "#8a95a3" }}>👤 {singleCase.client?.name}</span>
        <span style={{ fontSize: 12, color: "#8a95a3" }}>🏛 {singleCase.courtName}</span>
      </div>
    </div>
  );
}
 
// ─── calendar grid ─────────────────────────────────────────────────────────
 
function CalendarGrid({ viewYear, viewMonth, selectedDate, today, hearingDates, onSelectDate }) {
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
 
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevDays - i, type: "other" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: "current" });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, type: "other" });
 
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
      {cells.map(({ day, type }, idx) => {
        if (type === "other") {
          return (
            <div key={idx} style={{
              aspectRatio: 1, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13,
              color: "rgba(255,255,255,0.18)", borderRadius: 8,
            }}>
              {day}
            </div>
          );
        }
 
        const cellDate = new Date(viewYear, viewMonth, day);
        const isToday = toDateStr(cellDate) === toDateStr(today);
        const isSelected = toDateStr(cellDate) === toDateStr(selectedDate);
        const hasHearing = hearingDates.has(toDateStr(cellDate));
 
        return (
          <div
            key={idx}
            onClick={() => onSelectDate(cellDate)}
            style={{
              aspectRatio: 1, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, borderRadius: 8,
              cursor: "pointer", position: "relative",
              background: isSelected ? "#c9a84c" : "transparent",
              color: isSelected ? "#0f1f3d" : isToday ? "#c9a84c" : "rgba(255,255,255,0.6)",
              fontWeight: isSelected || isToday ? 600 : 400,
              border: isToday && !isSelected
                ? "0.5px solid rgba(201,168,76,0.35)"
                : "0.5px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {day}
            {hasHearing && (
              <span style={{
                position: "absolute", bottom: 3, left: "50%",
                transform: "translateX(-50%)", width: 4, height: 4,
                borderRadius: "50%",
                background: isSelected ? "#0f1f3d" : "#c9a84c",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
 
// ─── main page ─────────────────────────────────────────────────────────────
 
const CalendarPage = () => {
  // ✅ All hooks are now correctly inside the component body
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const today = new Date();
 
  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await getCases();
        setCases(data);
      } catch (error) {
        console.log(error);
      }
    };
    loadCases();
  }, []);
 
  const hearingDates = new Set(cases.map((c) => toDateStr(new Date(c.nextHearing))));
 
  const selectedDateCases = cases.filter(
    (c) => toDateStr(new Date(c.nextHearing)) === toDateStr(selectedDate)
  );
 
  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };
 
  const navBtnStyle = {
    background: "none", border: "0.5px solid rgba(201,168,76,0.18)",
    borderRadius: 8, color: "#c9a84c", width: 32, height: 32,
    cursor: "pointer", fontSize: 18, display: "flex",
    alignItems: "center", justifyContent: "center",
  };
 
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#0f1f3d",
      color: "#fff",
      minHeight: "100vh",
      padding: "28px 24px",
    }}>
 
      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 28,
        paddingBottom: 20,
        borderBottom: "0.5px solid rgba(201,168,76,0.18)",
      }}>
        <div>
          <div style={{
            fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#c9a84c", fontWeight: 500, marginBottom: 6,
          }}>
            Case Management
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 30, color: "#fff", lineHeight: 1.1, fontWeight: 400,
          }}>
            Hearing Calendar
          </h1>
          <p style={{ fontSize: 13, color: "#8a95a3", marginTop: 5 }}>
            Court dates, schedules &amp; upcoming hearings
          </p>
        </div>
        <div style={{
          background: "rgba(201,168,76,0.12)",
          border: "0.5px solid #c9a84c",
          borderRadius: 8, padding: "8px 14px", textAlign: "right",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 2 }}>
            Today
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>
 
      {/* ── CALENDAR + PANEL ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 300px",
        gap: 20, marginBottom: 28,
      }}>
 
        {/* Calendar widget */}
        <div style={{
          background: "rgba(255,255,255,0.035)",
          border: "0.5px solid rgba(201,168,76,0.18)",
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button style={navBtnStyle} onClick={handlePrev}>‹</button>
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 18, color: "#fff",
            }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button style={navBtnStyle} onClick={handleNext}>›</button>
          </div>
 
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
            {DAYS_SHORT.map((d) => (
              <span key={d} style={{
                fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                color: "#8a95a3", textAlign: "center", padding: "4px 0",
              }}>{d}</span>
            ))}
          </div>
 
          <CalendarGrid
            viewYear={viewYear}
            viewMonth={viewMonth}
            selectedDate={selectedDate}
            today={today}
            hearingDates={hearingDates}
            onSelectDate={setSelectedDate}
          />
        </div>
 
        {/* Date panel */}
        <div
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "0.5px solid rgba(201,168,76,0.18)",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              borderBottom: "0.5px solid rgba(201,168,76,0.18)",
              paddingBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#c9a84c",
                marginBottom: 4,
              }}
            >
              Selected Date
            </div>
 
            <div
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {formatFull(selectedDate)}
            </div>
          </div>
 
          {/* ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button
              onClick={() =>
                navigate("/cases", {
                  state: {
                    selectedDate,
                  },
                })
              }
              style={{
                background: "#c9a84c",
                color: "#0f1f3d",
                border: "none",
                padding: "12px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ➕ Create Case
            </button>
 
            <button
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              📝 Create Note
            </button>
 
          </div>
 
          <hr
            style={{
              borderColor: "rgba(201,168,76,0.18)",
            }}
          />
 
          {selectedDateCases.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "20px 0",
                color: "#8a95a3",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  opacity: 0.3,
                }}
              >
                📅
              </span>
 
              <span
                style={{
                  fontSize: 13,
                }}
              >
                No hearings scheduled
              </span>
            </div>
          ) : (
            selectedDateCases.map(
              (singleCase) => (
                <PanelHearingCard
                  key={singleCase._id}
                  singleCase={singleCase}
                />
              )
            )
          )}
        </div>
      </div>
 
      {/* ── UPCOMING HEARINGS ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#fff", fontWeight: 400 }}>
            Upcoming Hearings
          </h2>
          <span style={{ fontSize: 11, color: "#8a95a3", letterSpacing: "0.06em" }}>
            {cases.length} hearing{cases.length !== 1 ? "s" : ""}
          </span>
        </div>
 
        {cases.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 40, color: "#8a95a3", fontSize: 13,
            border: "0.5px dashed rgba(201,168,76,0.18)", borderRadius: 14,
          }}>
            No upcoming hearings found
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {cases.map((singleCase) => (
              <UpcomingCard key={singleCase._id} singleCase={singleCase} />
            ))}
          </div>
        )}
      </div>
 
    </div>
  );
};
 
export default CalendarPage;
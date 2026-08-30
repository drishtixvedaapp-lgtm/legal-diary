import { useEffect, useRef, useState } from "react";
import { getCasesMissingPhone, attachPhoneToCase } from "../services/voicePhoneService";

// ── Speech helpers — browser-native, no API key needed ──────────────────────
const speak = (text) => new Promise((resolve) => {
  if (!window.speechSynthesis) return resolve();
  window.speechSynthesis.cancel(); // stop anything mid-utterance first
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.onend = resolve;
  utter.onerror = resolve; // don't hang the flow if TTS itself fails
  window.speechSynthesis.speak(utter);
});

const listenOnce = ({ timeoutMs = 8000 } = {}) => new Promise((resolve, reject) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return reject(new Error("Voice input isn't supported in this browser — try Chrome."));

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const timeout = setTimeout(() => { recognition.stop(); }, timeoutMs);

  recognition.onresult = (event) => {
    clearTimeout(timeout);
    resolve(event.results[0][0].transcript || "");
  };
  recognition.onerror = (e) => { clearTimeout(timeout); reject(new Error(e.error || "Speech recognition error")); };
  recognition.onend = () => { clearTimeout(timeout); };

  recognition.start();
});

const extractPhoneDigits = (transcript) => {
  const digits = transcript.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
};

const spacedDigits = (phone) => phone.split("").join(" ");

const isYes = (t) => /\b(yes|yeah|yep|correct|right|confirm)\b/i.test(t);
const isNo  = (t) => /\b(no|nope|wrong|incorrect|repeat)\b/i.test(t);

// ── Component ────────────────────────────────────────────────────────────────
const VoicePhoneAssistant = () => {
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | speaking | listening | confirming | saving | done | error
  const [log, setLog] = useState([]);
  const [manualPhone, setManualPhone] = useState("");
  const [pendingPhone, setPendingPhone] = useState(null);
  const sessionActive = useRef(false);

  const currentCase = queue[index];

  useEffect(() => {
    getCasesMissingPhone()
      .then(setQueue)
      .catch(() => addLog("❌ Could not load the case queue."))
      .finally(() => setLoadingQueue(false));
  }, []);

  const addLog = (line) => setLog(prev => [...prev, line]);

  const saveAndAdvance = async (phone) => {
    setPhase("saving");
    try {
      await attachPhoneToCase(currentCase._id, phone);
      addLog(`✅ Saved ${phone} for "${currentCase.caseTitle}"`);
      await speak("Saved. Moving to the next case.");
      const nextIndex = index + 1;
      if (nextIndex >= queue.length) {
        setPhase("done");
        await speak("That's all the cases. Great work.");
        return;
      }
      setIndex(nextIndex);
      setPendingPhone(null);
      runCaseStep(nextIndex);
    } catch (e) {
      addLog(`❌ Failed to save: ${e.response?.data?.message || e.message}`);
      setPhase("idle");
    }
  };

  // ── One full pass for a single case: prompt → listen → confirm → save ─────
  const runCaseStep = async (idx) => {
    if (!sessionActive.current) return;
    const c = queue[idx];
    if (!c) { setPhase("done"); return; }

    try {
      setPhase("speaking");
      await speak(`Case ${idx + 1} of ${queue.length}. ${c.caseTitle}. Case number ${c.caseNumber}. Please say the phone number.`);
      if (!sessionActive.current) return;

      setPhase("listening");
      const transcript = await listenOnce();
      addLog(`🎙️ Heard: "${transcript}"`);
      const phone = extractPhoneDigits(transcript);

      if (!phone) {
        await speak("I didn't catch a valid 10 digit number. Let's try again.");
        if (sessionActive.current) runCaseStep(idx);
        return;
      }

      setPendingPhone(phone);
      setPhase("confirming");
      await speak(`I heard ${spacedDigits(phone)}. Say yes to confirm, or no to try again.`);
      if (!sessionActive.current) return;

      const confirmation = await listenOnce();
      addLog(`🎙️ Confirmation: "${confirmation}"`);

      if (isYes(confirmation)) {
        await saveAndAdvance(phone);
      } else if (isNo(confirmation)) {
        await speak("Okay, let's try that number again.");
        if (sessionActive.current) runCaseStep(idx);
      } else {
        await speak("Sorry, I didn't understand. Let's try the number again.");
        if (sessionActive.current) runCaseStep(idx);
      }
    } catch (e) {
      addLog(`⚠️ ${e.message} — you can retry or type the number manually below.`);
      setPhase("idle");
    }
  };

  const startSession = () => {
    if (queue.length === 0) return;
    sessionActive.current = true;
    setLog([]);
    setIndex(0);
    runCaseStep(0);
  };

  const stopSession = () => {
    sessionActive.current = false;
    window.speechSynthesis?.cancel();
    setPhase("idle");
    addLog("⏸️ Session stopped.");
  };

  const submitManual = async () => {
    const phone = manualPhone.replace(/\D/g, "");
    if (phone.length !== 10) return addLog("⚠️ Enter a valid 10-digit number.");
    setManualPhone("");
    await saveAndAdvance(phone);
  };

  const skipCase = () => {
    addLog(`⏭️ Skipped "${currentCase?.caseTitle}"`);
    const nextIndex = index + 1;
    if (nextIndex >= queue.length) { setPhase("done"); return; }
    setIndex(nextIndex);
    if (sessionActive.current) runCaseStep(nextIndex);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>🎙️ Voice Phone Assistant</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
        Hands-free session to fill in missing client phone numbers — it reads each case aloud, listens for the number, confirms it back, and saves automatically before moving to the next.
      </p>

      {loadingQueue ? (
        <p style={{ color: "#94a3b8" }}>Loading queue…</p>
      ) : queue.length === 0 ? (
        <div style={{ background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 12, padding: 18, color: "#15803d", fontWeight: 600 }}>
          ✅ No cases are missing a phone number right now.
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
              {phase === "done" ? "Session complete" : `Case ${Math.min(index + 1, queue.length)} of ${queue.length}`}
            </div>

            {currentCase && phase !== "done" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{currentCase.caseTitle}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{currentCase.caseNumber} · {currentCase.courtName}</div>
                {pendingPhone && phase === "confirming" && (
                  <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: "#2563eb" }}>
                    Heard: {pendingPhone}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {phase === "idle" && (
                <button onClick={startSession} style={btnPrimary}>▶️ Start Voice Session</button>
              )}
              {(phase === "speaking" || phase === "listening" || phase === "confirming" || phase === "saving") && (
                <>
                  <span style={statusPill(phase)}>{phase === "speaking" ? "🔊 Speaking…" : phase === "listening" ? "🎙️ Listening…" : phase === "confirming" ? "🤔 Confirming…" : "💾 Saving…"}</span>
                  <button onClick={stopSession} style={btnDanger}>⏹️ Stop</button>
                  <button onClick={skipCase} style={btnSecondary}>⏭️ Skip This Case</button>
                </>
              )}
              {phase === "done" && (
                <button onClick={startSession} style={btnPrimary}>🔁 Run Again</button>
              )}
            </div>
          </div>

          {/* Manual fallback — always available, since voice can misfire */}
          {currentCase && phase !== "done" && (
            <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Or type the number manually
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={manualPhone} onChange={e => setManualPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 14 }}
                />
                <button onClick={submitManual} style={btnPrimary}>Save & Next</button>
              </div>
            </div>
          )}

          {/* Log */}
          {log.length > 0 && (
            <div style={{ background: "#0f172a", borderRadius: 12, padding: 14, maxHeight: 220, overflowY: "auto", fontFamily: "monospace", fontSize: 12, color: "#e2e8f0" }}>
              {log.map((line, i) => <div key={i} style={{ marginBottom: 4 }}>{line}</div>)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const btnPrimary = { padding: "10px 18px", borderRadius: 9, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
const btnSecondary = { padding: "10px 18px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
const btnDanger = { padding: "10px 18px", borderRadius: 9, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" };
const statusPill = (phase) => ({
  padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700,
  background: phase === "listening" ? "#dbeafe" : "#f1f5f9",
  color: phase === "listening" ? "#1d4ed8" : "#64748b",
});

export default VoicePhoneAssistant;

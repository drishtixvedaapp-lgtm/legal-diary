import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createOutcome } from "../services/hearingOutcomeService";
import { getCaseById } from "../services/caseService";
import { isAdmin } from "../utils/roleHelper";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F0F4FA",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 24px 80px",
  },
  container: {
    maxWidth: "780px",
    margin: "0 auto",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "8px",
    letterSpacing: "0.02em",
  },
  breadcrumbSep: {
    margin: "0 6px",
    color: "#D1D5DB",
  },
  pageTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "30px",
    fontWeight: "400",
    color: "#0F1F3D",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    letterSpacing: "-0.3px",
  },
  pageTitleIcon: {
    fontSize: "26px",
  },
  pageTitleSub: {
    fontSize: "14px",
    color: "#6B7280",
    marginTop: "6px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "400",
  },

  // Case info card
  caseCard: {
    background: "#FFFFFF",
    borderRadius: "14px",
    marginBottom: "28px",
    boxShadow: "0 1px 4px rgba(15,31,61,0.07), 0 4px 20px rgba(15,31,61,0.06)",
    display: "flex",
    overflow: "hidden",
  },
  caseCardRibbon: {
    width: "5px",
    background: "linear-gradient(180deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)",
    flexShrink: 0,
  },
  caseCardBody: {
    padding: "24px 28px",
    flex: 1,
  },
  caseCardLabel: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    color: "#C9A84C",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  caseTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "20px",
    fontWeight: "400",
    color: "#0F1F3D",
    margin: "0 0 16px 0",
    lineHeight: "1.3",
  },
  caseMeta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px 24px",
  },
  caseMetaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  caseMetaLabel: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.07em",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  caseMetaValue: {
    fontSize: "14px",
    color: "#1F2937",
    fontWeight: "500",
  },
  statusBadge: (status) => ({
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "600",
    padding: "2px 10px",
    borderRadius: "20px",
    letterSpacing: "0.03em",
    background:
      status === "Active" || status === "Open"
        ? "#D1FAE5"
        : status === "Closed" || status === "Disposed"
        ? "#FEE2E2"
        : "#EFF6FF",
    color:
      status === "Active" || status === "Open"
        ? "#065F46"
        : status === "Closed" || status === "Disposed"
        ? "#991B1B"
        : "#1D4ED8",
  }),

  // Form card
  formCard: {
    background: "#FFFFFF",
    borderRadius: "14px",
    boxShadow: "0 1px 4px rgba(15,31,61,0.07), 0 4px 20px rgba(15,31,61,0.06)",
    overflow: "hidden",
  },
  formCardHeader: {
    background: "#0F1F3D",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  formCardHeaderTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "18px",
    fontWeight: "400",
    color: "#FFFFFF",
    margin: 0,
    letterSpacing: "0.01em",
  },
  formCardHeaderDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#C9A84C",
    marginLeft: "auto",
    animation: "pulse 2s ease-in-out infinite",
  },
  formBody: {
    padding: "28px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "20px",
  },
  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "20px",
    gridColumn: "1 / -1",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  labelRequired: {
    color: "#C9A84C",
    marginLeft: "3px",
  },
  input: {
    padding: "11px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111827",
    background: "#F9FAFB",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "11px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111827",
    background: "#F9FAFB",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "36px",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "12px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111827",
    background: "#F9FAFB",
    outline: "none",
    resize: "vertical",
    minHeight: "110px",
    lineHeight: "1.6",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    boxSizing: "border-box",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #F3F4F6",
    margin: "4px 0 24px 0",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "#C9A84C",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  nextHearingBox: {
    background: "#F8F9FF",
    border: "1.5px solid #E0E7FF",
    borderRadius: "10px",
    padding: "18px 20px",
    marginBottom: "24px",
  },
  formFooter: {
    borderTop: "1px solid #F3F4F6",
    padding: "20px 28px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    background: "#FAFAFA",
  },
  submitBtn: {
    background: "#0F1F3D",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 32px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.02em",
    transition: "background 0.15s, transform 0.1s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};

const HearingOutcomePage = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [formData, setFormData] = useState({
    hearingDate: "",
    outcome: "",
    judgeRemarks: "",
    nextHearing: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCase = async () => {
      try {
        const data = await getCaseById(id);
        setCaseData(data);
      } catch (error) {
        console.log(error);
      }
    };
    loadCase();
  }, [id]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (
      name === "outcome" &&
      (value === "Case Disposed" || value === "Judgment Delivered")
    ) {
      setFormData((prev) => ({ ...prev, outcome: value, nextHearing: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOutcome({ caseId: id, ...formData });
      if (formData.outcome === "Case Disposed") {
        alert("Case Closed Successfully");
        setTimeout(() => { navigate(isAdmin() ? "/admin/cases" : "/dashboard/cases"); }, 2500);
      } else {
        alert("Outcome Saved Successfully");
      }
      setFormData({ hearingDate: "", outcome: "", judgeRemarks: "", nextHearing: "" });
    } catch (error) {
      console.log(error);
      alert("Failed to Save Outcome");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFinalOutcome =
    formData.outcome === "Case Disposed" ||
    formData.outcome === "Judgment Delivered";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap');
        input:focus, select:focus, textarea:focus {
          border-color: #C9A84C !important;
          box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important;
          background: #fff !important;
        }
        .submit-btn:hover:not(:disabled) {
          background: #1E3A5F !important;
        }
        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={styles.page}>
        <div style={styles.container}>

          {/* Page Header */}
          <div style={styles.pageHeader}>
            <div style={styles.breadcrumb}>
              Cases
              <span style={styles.breadcrumbSep}>›</span>
              {caseData ? caseData.caseNumber : "Loading…"}
              <span style={styles.breadcrumbSep}>›</span>
              Hearing Outcome
            </div>
            <h1 style={styles.pageTitle}>
              <span style={styles.pageTitleIcon}>⚖️</span>
              Hearing Outcome
            </h1>
            <p style={styles.pageTitleSub}>
              Record the result of today's court proceeding
            </p>
          </div>

          {/* Case Info Card */}
          {caseData && (
            <div style={styles.caseCard}>
              <div style={styles.caseCardRibbon} />
              <div style={styles.caseCardBody}>
                <div style={styles.caseCardLabel}>Case on Record</div>
                <h2 style={styles.caseTitle}>{caseData.caseTitle}</h2>
                <div style={styles.caseMeta}>
                  <div style={styles.caseMetaItem}>
                    <span style={styles.caseMetaLabel}>Case No.</span>
                    <span style={styles.caseMetaValue}>{caseData.caseNumber}</span>
                  </div>
                  <div style={styles.caseMetaItem}>
                    <span style={styles.caseMetaLabel}>Client</span>
                    <span style={styles.caseMetaValue}>{caseData.client?.name}</span>
                  </div>
                  <div style={styles.caseMetaItem}>
                    <span style={styles.caseMetaLabel}>Court</span>
                    <span style={styles.caseMetaValue}>{caseData.courtName}</span>
                  </div>
                  <div style={styles.caseMetaItem}>
                    <span style={styles.caseMetaLabel}>Stage</span>
                    <span style={styles.caseMetaValue}>{caseData.stage}</span>
                  </div>
                  <div style={styles.caseMetaItem}>
                    <span style={styles.caseMetaLabel}>Status</span>
                    <span style={styles.statusBadge(caseData.status)}>{caseData.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div style={styles.formCard}>
            <div style={styles.formCardHeader}>
              <h3 style={styles.formCardHeaderTitle}>Record Hearing Outcome</h3>
              <div style={styles.formCardHeaderDot} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formBody}>

                {/* Section: Hearing Details */}
                <div style={styles.sectionLabel}>Hearing Details</div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Hearing Date <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      type="date"
                      name="hearingDate"
                      value={formData.hearingDate}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Outcome <span style={styles.labelRequired}>*</span>
                    </label>
                    <select
                      name="outcome"
                      value={formData.outcome}
                      onChange={handleChange}
                      required
                      style={styles.select}
                    >
                      <option value="">Select Outcome</option>
                      <option value="Adjourned">Adjourned</option>
                      <option value="Evidence Recorded">Evidence Recorded</option>
                      <option value="Arguments Heard">Arguments Heard</option>
                      <option value="Judgment Delivered">Judgment Delivered</option>
                      <option value="Case Disposed">Case Disposed</option>
                    </select>
                  </div>
                </div>

                <hr style={styles.divider} />

                {/* Section: Judge Remarks */}
                <div style={styles.sectionLabel}>Judge's Remarks</div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Remarks / Orders</label>
                  <textarea
                    name="judgeRemarks"
                    rows="5"
                    placeholder="Enter judge's remarks, orders, or directions given during the hearing…"
                    value={formData.judgeRemarks}
                    onChange={handleChange}
                    style={styles.textarea}
                  />
                </div>

                {/* Conditional: Next Hearing */}
                {!isFinalOutcome && (
                  <>
                    <hr style={styles.divider} />
                    <div style={styles.sectionLabel}>Next Appearance</div>
                    <div style={styles.nextHearingBox}>
                      <div style={{ ...styles.formGroup, marginBottom: 0 }}>
                        <label style={styles.label}>Next Hearing Date</label>
                        <input
                          type="date"
                          name="nextHearing"
                          value={formData.nextHearing}
                          onChange={handleChange}
                          style={{ ...styles.input, maxWidth: "260px" }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Final outcome notice */}
                {isFinalOutcome && (
                  <div style={{
                    background: "#FFF8E1",
                    border: "1.5px solid #F9D976",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "13px",
                    color: "#92400E",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}>
                    <span style={{ fontSize: "16px" }}>ℹ️</span>
                    This outcome marks the case as <strong>&nbsp;{formData.outcome}&nbsp;</strong>. No further hearing date is required.
                  </div>
                )}

              </div>

              {/* Form Footer */}
              <div style={styles.formFooter}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                  style={styles.submitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #ffffff55", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <span>✓</span> Save Outcome
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default HearingOutcomePage;

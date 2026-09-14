const IdleTimeoutWarning = ({ onStay }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: "24px 28px",
          maxWidth: 380,
          width: "90%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>
          You'll be logged out soon
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#475569" }}>
          You'll be logged out in 1 minute due to inactivity, to keep this
          confidential case data secure.
        </p>
        <button
          onClick={onStay}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Stay logged in
        </button>
      </div>
    </div>
  );
};

export default IdleTimeoutWarning;

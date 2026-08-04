import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, toggleUserActive } from "../services/adminService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    getAllUsers()
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => {
        console.log(err);
        setError(err.response?.data?.message || "Couldn't load users. Check that the server is reachable.");
        setLoading(false);
      });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id) => {
    try {
      await toggleUserActive(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-5xl font-bold mb-10">User Management</h1>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 14, padding: 20 }}>
          <span className="spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#2563eb", borderRadius: "50%" }} />
          Loading users…
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: 24, color: "#fca5a5", fontSize: 14 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 600 }}>{error}</p>
          <button onClick={fetchUsers} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="p-5">Name</th>
                <th className="p-5">Email</th>
                <th className="p-5">Role</th>
                <th className="p-5">Status</th>
                <th className="p-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td className="p-5" colSpan={5} style={{ color: "rgba(255,255,255,0.5)" }}>No users found.</td></tr>
              )}
              {users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-5">{user.name}</td>
                  <td className="p-5">{user.email}</td>
                  <td className="p-5 capitalize">{user.role}</td>
                  <td className="p-5">
                    <button
                      onClick={() => handleToggle(user._id)}
                      disabled={user.role === "admin"}
                      title={user.role === "admin" ? "Admin accounts can't be deactivated" : ""}
                      style={{
                        padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: "none", cursor: user.role === "admin" ? "not-allowed" : "pointer",
                        opacity: user.role === "admin" ? 0.5 : 1,
                        background: user.isActive ? "#dcfce7" : "#fee2e2",
                        color: user.isActive ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </button>
                  </td>
                  <td className="p-5">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === "admin"}
                      title={user.role === "admin" ? "Admin accounts can't be deleted" : ""}
                      className="px-4 py-2 rounded-xl"
                      style={{
                        background: user.role === "admin" ? "rgba(220,38,38,0.3)" : "#dc2626",
                        cursor: user.role === "admin" ? "not-allowed" : "pointer",
                        color: "#fff", border: "none",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

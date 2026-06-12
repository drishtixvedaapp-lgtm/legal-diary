import {
  useEffect,
  useState,
} from "react";

import { getAllUsers, deleteUser, toggleUserActive } from "../services/adminService";

const UserManagement = () => {

  const [users,
    setUsers] =
      useState([]);

  const fetchUsers =
    async () => {

      try {

        const data =
          await getAllUsers();

        setUsers(data);

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    fetchUsers();

  }, []);

  
  const handleToggle = async (id) => {
    try {
      await toggleUserActive(id);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this user?"
        );

      if (!confirmDelete)
        return;

      try {

        await deleteUser(id);

        fetchUsers();

      } catch (error) {

        console.log(error);
      }
    };

  return (
    <div className="text-white">

      <h1 className="text-5xl font-bold mb-10">
        User Management
      </h1>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

        <table className="w-full">

          <thead>

            <tr className="border-b border-white/10 text-left">

              <th className="p-5">
                Name
              </th>

              <th className="p-5">
                Email
              </th>

              <th className="p-5">
                Role
              </th>

              <th className="p-5">
                Status
              </th>

              <th className="p-5">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {
              users.map((user) => (

                <tr
                  key={user._id}
                  className="border-b border-white/5 hover:bg-white/5"
                >

                  <td className="p-5">
                    {user.name}
                  </td>

                  <td className="p-5">
                    {user.email}
                  </td>

                  <td className="p-5 capitalize">
                    {user.role}
                  </td>

                  <td className="p-5">
                    <button
                      onClick={() => handleToggle(user._id)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: user.isActive ? "#dcfce7" : "#fee2e2",
                        color: user.isActive ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </button>
                  </td>

                  <td className="p-5">

                    <button
                      onClick={() =>
                        handleDelete(
                          user._id
                        )
                      }
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))
            }

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default UserManagement;
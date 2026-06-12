const AdminPage = () => {

  return (
    <div className="p-10">

      <h1 className="text-5xl font-bold text-slate-800 mb-10">
        Admin Control Panel
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold">
            User Management
          </h2>

          <p className="mt-3">
            Manage lawyers & clients
          </p>

        </div>

        <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold">
            Global Analytics
          </h2>

          <p className="mt-3">
            View all case statistics
          </p>

        </div>

        <div className="bg-purple-600 text-white p-8 rounded-3xl shadow-xl">

          <h2 className="text-2xl font-bold">
            System Settings
          </h2>

          <p className="mt-3">
            Configure platform settings
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminPage;
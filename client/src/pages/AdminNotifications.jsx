import {
  useEffect,
  useState,
} from "react";

import {
  getNotifications,
} from "../services/adminNotificationService";

const AdminNotifications = () => {

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  useEffect(() => {

    const loadData =
      async () => {

        const data =
          await getNotifications();

        setNotifications(data);

      };

    loadData();

  }, []);

  return (

    <div className="text-white">

      <h1 className="text-5xl font-bold mb-10">
        Notifications
      </h1>

      <div className="grid gap-5">

        {
          notifications.map(
            (item) => (

              <div
                key={item._id}
                className="bg-white/10 p-6 rounded-3xl"
              >

                <h3 className="text-xl font-bold">

                  {item.message}

                </h3>

                <p className="mt-2">

                  Type:
                  {" "}
                  {item.type}

                </p>

                <p>

                  Scheduled:
                  {" "}
                  {
                    new Date(
                      item.scheduledFor
                    ).toLocaleDateString()
                  }

                </p>

                <p>

                  Status:
                  {" "}

                  {
                    item.sent
                    ? "Sent"
                    : "Pending"
                  }

                </p>

              </div>

            )
          )
        }

      </div>

    </div>

  );

};

export default AdminNotifications;
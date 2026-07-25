const Notification =
require("../models/Notification");

const getNotifications =
async (req, res) => {

  try {

    let notifications;

    if (
      req.user.role === "admin"
    ) {

      notifications =
        await Notification.find()
          .populate({
            path: "case",
            populate: [
              {
                path: "assignedLawyer",
              },
              {
                path: "client",
              },
            ],
          });

    } else if (
      req.user.role === "lawyer"
    ) {

      notifications =
        await Notification.find()
          .populate({
            path: "case",
            match: {
              assignedLawyer:
                req.user._id,
            },
            populate: [
              {
                path: "assignedLawyer",
              },
              {
                path: "client",
              },
            ],
          });

    } else {

      notifications =
        await Notification.find()
          .populate({
            path: "case",
            populate: [
              {
                path: "assignedLawyer",
              },
              {
                path: "client",
              },
            ],
          });

    }

    notifications =
      notifications.filter(
        (n) => n.case !== null
      );

    notifications.sort(
      (a, b) =>
        new Date(
          b.scheduledFor
        ) -
        new Date(
          a.scheduledFor
        )
    );

    res.status(200).json(
      notifications
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};

const createReminder =
async (req, res) => {

  try {

    const notification =
      await Notification.create({

        case:
          req.body.caseId,

        type: "email",

        scheduledFor:
          req.body.scheduledFor,

        message:
          req.body.message,

        sent: false,

      });

    res.status(201).json(
      notification
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }

};

module.exports = {
  getNotifications,
  createReminder,
};
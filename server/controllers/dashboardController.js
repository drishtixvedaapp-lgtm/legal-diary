const Client = require("../models/Client");
const Case = require("../models/Case");
const CaseDocument = require("../models/CaseDocument");

const getDashboardStats =
async (req, res) => {

  try {

    const totalClients =
      await Client.countDocuments();

    const activeCases =
      await Case.countDocuments({
        status: "Active",
      });

    const closedCases =
      await Case.countDocuments({
        status: "Closed",
      });

    const totalDocuments =
      await CaseDocument.countDocuments();

    const today =
      new Date();

    today.setHours(
      0,0,0,0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    const todayHearings =
      await Case.countDocuments({

        nextHearing: {
          $gte: today,
          $lt: tomorrow,
        },

      });

    const upcomingHearings =
      await Case.countDocuments({

        nextHearing: {
          $gte: today,
        },

      });

    res.json({

      totalClients,
      activeCases,
      closedCases,
      totalDocuments,
      todayHearings,
      upcomingHearings,

    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

module.exports = {
  getDashboardStats,
};
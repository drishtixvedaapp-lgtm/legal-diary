const TimelineEvent =
require("../models/TimelineEvent");

const getTimeline =
async (req,res)=>{

  const timeline =
    await TimelineEvent.find({

      caseId:
        req.params.caseId

    }).sort({

      createdAt:-1

    });

  res.json(
    timeline
  );
};

module.exports = {
  getTimeline
};
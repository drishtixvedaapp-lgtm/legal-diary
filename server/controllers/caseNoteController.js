const CaseNote =
  require("../models/CaseNote");

const TimelineEvent =
  require("../models/TimelineEvent");

// CREATE NOTE

const createNote =
async (req, res) => {

  try {

    const note =
      await CaseNote.create({

        ...req.body,

        createdBy:
          req.user._id,

      });

    // CREATE TIMELINE EVENT

    await TimelineEvent.create({

      caseId:
        note.caseId,

      eventType:
        "NOTE",

      title:
        note.title,

      description:
        note.content,

    });

    res.status(201).json(
      note
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};

// GET NOTES BY CASE

const getNotesByCase =
async (req, res) => {

  try {

    const notes =
      await CaseNote.find({

        caseId:
          req.params.caseId,

      })

      .sort({
        createdAt: -1,
      });

    res.status(200).json(
      notes
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};

// DELETE NOTE

const deleteNote =
async (req, res) => {

  try {

    await CaseNote.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message:
        "Note deleted",
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};

module.exports = {

  createNote,

  getNotesByCase,

  deleteNote,

};
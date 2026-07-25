const CaseDocument =
require("../models/CaseDocument");
const TimelineEvent =
require("../models/TimelineEvent");

const uploadDocument =
async (req, res) => {

  console.log("BODY:");
  console.log(req.body);

  console.log("FILE:");
  console.log(req.file);

  try {

    const document =
      await CaseDocument.create({

        caseId:
          req.body.caseId,

        fileName:
          req.file.filename,

        fileUrl:
          `/uploads/${req.file.filename}`,

        uploadedBy:
          req.user._id,

      });

    // TIMELINE ENTRY

    await TimelineEvent.create({

      caseId:
        req.body.caseId,

      eventType:
        "DOCUMENT",

      title:
        req.file.originalname,

      description:
        "Document uploaded",

    });

    res.status(201).json(
      document
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};

const getDocuments =
async (req, res) => {

  try {

    const documents =
      await CaseDocument.find({

        caseId:
          req.params.caseId,

      }).sort({
        createdAt: -1,
      });

    res.status(200).json(
      documents
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};

const deleteDocument =
async (req, res) => {

  try {

    await CaseDocument
      .findByIdAndDelete(
        req.params.id
      );

    res.status(200).json({

      message:
        "Document deleted",

    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });
  }
};

module.exports = {

  uploadDocument,

  getDocuments,

  deleteDocument,

};
const express = require("express");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");
const { protect, lawyerOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(  "/",    protect, lawyerOnly, createClient);
router.get(   "/",    protect, getClients);
router.get(   "/:id", protect, getClientById);
router.put(   "/:id", protect, lawyerOnly, updateClient);
router.delete("/:id", protect, lawyerOnly, deleteClient);

module.exports = router;

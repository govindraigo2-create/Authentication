
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// In routes par valid login token zaroori hai
router.use(authMiddleware);

// Saare tasks dekhna aur naya task banana
router.route("/").get(getTasks).post(createTask);

// Task update aur delete karna
router.route("/:id").put(updateTask).delete(deleteTask);

module.exports = router;

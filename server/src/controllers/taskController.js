
const Task = require("../models/Task");

// Naya task create karna
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Check karo ki title empty na ho
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      user: req.user.userId, // Corrected: userId use hoga
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({
      message: "Failed to create task",
    });
  }
};

// Login user ke saare tasks lena
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.userId, // Corrected
    }).sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error.message);
    res.status(500).json({
      message: "Failed to get tasks",
    });
  }
};

// Task update karna
const updateTask = async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (completed !== undefined) updates.completed = completed;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId, // Corrected
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({
      message: "Failed to update task",
    });
  }
};

// Task delete karna
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId, // Corrected
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};

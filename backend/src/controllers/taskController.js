const prisma = require("../db/prisma-client.js");

const createTask = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;

  try {
    // Create a new task for the specified user
    const newTask = await prisma.task.create({
      data: {
        title: title,
        description: description,
        userId: userId, // Associate task with the user
        status: "PENDING",
      },
    });

    // Return the created task
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).send("Error creating task.");
  }
};

const updateTask = async (req, res) => {
  const { status, description } = req.body;
  const { taskId } = req.params;
  const userId = req.user.userId; // Logged-in user ID

  try {
    // Find the task by ID
    const taskToUpdate = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!taskToUpdate) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Check if the task belongs to the logged-in user
    if (taskToUpdate.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this task." });
    }

    // Prepare the update data
    const updatedData = {};
    if (status) updatedData.status = status;
    if (description) updatedData.description = description;

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: updatedData,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ message: "Error updating task." });
  }
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.userId; // Logged-in user ID

  try {
    // Find the task by ID
    const taskToDelete = await prisma.task.findUnique({
      where: { id: parseInt(taskId) }, // Ensure taskId is an integer
    });

    if (!taskToDelete) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Check if the task belongs to the logged-in user
    if (taskToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this task." });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskToDelete.id },
    });

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ message: "Error deleting task." });
  }
};

const getAllTasksForUser = async (req, res) => {
  const { userId } = req.user;

  try {
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Fetch all tasks associated with the user
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).send("Error fetching tasks.");
  }
};

module.exports = { getAllTasksForUser, createTask, updateTask, deleteTask };

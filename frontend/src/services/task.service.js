import { baseUrl, getAuthHeaders } from "./config";

// Get all tasks
export const getAllTasks = async () => {
  try {
    const response = await fetch(`${baseUrl}/task`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Create new task
export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${baseUrl}/task`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await fetch(`${baseUrl}/task/${taskId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${baseUrl}/task/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    return response.json();
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await fetch(`${baseUrl}/task/${taskId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update task status");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

// Get single task
export const getTaskById = async (taskId) => {
  try {
    const response = await fetch(`${baseUrl}/task/${taskId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

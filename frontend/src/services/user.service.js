import { baseUrl, getAuthHeaders } from "./config";

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${baseUrl}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${baseUrl}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const updateUser = async (data) => {
  const { id, employeeId, username, dateOfJoining, role, status, locationId } =
    data;
  const res = await fetch(`${baseUrl}/user/update/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      employeeId,
      username,
      dateOfJoining,
      role,
      status,
      locationId,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update user");
  }
  return res.json();
};

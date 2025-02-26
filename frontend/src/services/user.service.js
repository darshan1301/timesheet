const baseUrl = import.meta.env.VITE_BASE_URL;

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

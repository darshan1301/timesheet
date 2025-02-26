export const baseUrl = import.meta.env.VITE_BASE_URL;

export const getAuthHeaders = () => {
  const token = localStorage.getItem("jwtToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const checkPunchStatus = async () => {
  try {
    const response = await fetch(`${baseUrl}/attendance/status`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch punch status");
    }

    return response.json();
  } catch (error) {
    console.error("Error checking punch status:", error.message);
    throw error;
  }
};

export const punchInOut = async () => {
  try {
    const response = await fetch(`${baseUrl}/attendance/punchingmachine`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Punch operation failed");
    }

    return response.json();
  } catch (error) {
    console.error("Error during punch operation:", error.message);
    throw error;
  }
};

// Get attendance history for a date range
export const getAttendanceHistory = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${baseUrl}/attendance/history?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance history");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching attendance history:", error.message);
    throw error;
  }
};

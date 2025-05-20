import { baseUrl, getAuthHeaders } from "./config";

const headers = getAuthHeaders();

export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.role && { role: params.role }),
      ...(params.status && { status: params.status }),
      ...(params.search && { search: params.search }),
    }).toString();

    const response = await fetch(
      `${baseUrl}/dashboard/usersList?${queryParams}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserAttendance = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(
      `${baseUrl}/attendance/user/${userId}?date=${today}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching attendance:", error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    // Format date of joining to ISO string if it's not already
    if (
      employeeData.dateOfJoining &&
      !employeeData.dateOfJoining.includes("T")
    ) {
      employeeData.dateOfJoining = new Date(
        employeeData.dateOfJoining
      ).toISOString();
    }

    const response = await fetch(`${baseUrl}/dashboard`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(employeeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create employee");
    }

    return data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const getEmployeeTasks = async (employeeId) => {
  try {
    const response = await fetch(
      `${baseUrl}/dashboard/getTasks/${employeeId}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch employee tasks");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    throw error;
  }
};

export const getAttendanceSheet = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(
      `${baseUrl}/dashboard/attendance/sheet?${queryParams.toString()}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance records");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

export const exportAttendanceSheet = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    // Important: Use 'blob' response type
    const response = await fetch(
      `${baseUrl}/dashboard/attendance/export?${queryParams.toString()}`,
      {
        headers: headers,
        method: "GET",
        responseType: "blob", // This is important for binary data
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export attendance records");
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create object URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_export.xlsx";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    console.error("Error exporting attendance records:", error);
    throw error;
  }
};

export const assignTask = async (taskData) => {
  try {
    const response = await fetch(`${baseUrl}/dashboard/assignTask`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to assign task");
    }

    return data;
  } catch (error) {
    console.error("Error assigning task:", error);
    throw error;
  }
};

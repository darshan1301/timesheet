const baseUrl = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("jwtToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Create a new attendance request
 * @param {Object} requestData - Request data
 * @param {string} requestData.date - Date for the request
 * @param {string} requestData.punchIn - Punch-in time
 * @param {string} requestData.punchOut - Punch-out time (optional)
 * @param {string} requestData.reason - Reason for the request
 * @returns {Promise<Object>} - API response
 */
export const createAttendanceRequest = async (requestData) => {
  try {
    const response = await fetch(`${baseUrl}/attendance`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create attendance request");
    }

    return data;
  } catch (error) {
    console.error("Error creating attendance request:", error);
    throw error;
  }
};

/**
 * Get attendance requests with filtering
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response with requests and pagination
 */
export const getAttendanceRequests = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `${baseUrl}/attendance/requests${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch attendance requests");
    }

    return data;
  } catch (error) {
    console.error("Error fetching attendance requests:", error);
    throw error;
  }
};

/**
 * Update attendance request status
 * @param {string|number} requestId - Request ID
 * @param {string} status - New status (APPROVED/REJECTED)
 * @returns {Promise<Object>} - API response
 */
export const updateAttendanceRequestStatus = async (requestId, status) => {
  try {
    const response = await fetch(`${baseUrl}/dashboard/${requestId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update request status");
    }

    return data;
  } catch (error) {
    console.error("Error updating attendance request:", error);
    throw error;
  }
};

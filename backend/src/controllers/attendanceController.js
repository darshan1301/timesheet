const moment = require("moment");
const prisma = require("../db/prisma-client");
const calculateDistance = require("../utils/calculateDistance.js");

const punchInOut = async (req, res) => {
  const { userId } = req.user;
  const { latitude, longitude } = req.body;
  const currentTime = moment().toDate();
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  // console.log("req body", latitude, longitude);

  try {
    // Get user with their assigned location
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { location: true },
    });

    // Location validation - only if user has an assigned location
    if (user.location) {
      const distance = calculateDistance(
        latitude,
        longitude,
        user.location.latitude,
        user.location.longitude
      );

      // Validate latitude and longitude
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          message: "Location is required for attendance.",
        });
      }

      // Validate that latitude and longitude are valid numbers
      if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        return res.status(400).json({
          message: "Latitude and longitude must be valid numbers.",
        });
      }

      // 40 meters radius check
      if (distance > 100) {
        return res.status(403).json({
          message: "You must be within 100 meters of your assigned location.",
          distance: Math.round(distance),
          unit: "meters",
        });
      }
    }

    // Check if user already has an attendance record for today
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // If no attendance record exists for today
    if (!todayAttendance) {
      // Create new punch-in record
      const newAttendance = await prisma.attendance.create({
        data: {
          userId: userId,
          date: currentTime,
          punchIn: currentTime,
          locationId: user.location?.id || null, // Store location ID if exists
        },
      });

      return res.status(200).json({
        message: "Punched in successfully.",
        punchInTime: newAttendance.punchIn,
        location: user.location?.name || "No assigned location",
      });
    }

    // If attendance record exists but no punch-out
    if (todayAttendance && !todayAttendance.punchOut) {
      // Update with punch-out time
      const updatedAttendance = await prisma.attendance.update({
        where: { id: todayAttendance.id },
        data: { punchOut: currentTime },
      });

      return res.status(200).json({
        message: "Punched out successfully.",
        punchInTime: todayAttendance.punchIn,
        punchOutTime: updatedAttendance.punchOut,
      });
    }

    // If user has already completed punch-in and punch-out for today
    if (todayAttendance && todayAttendance.punchOut) {
      return res.status(400).json({
        message: "You have already completed your attendance for today.",
        punchInTime: todayAttendance.punchIn,
        punchOutTime: todayAttendance.punchOut,
      });
    }
  } catch (error) {
    console.error("Error in punch-in/out:", error.message);
    res.status(500).json({
      message: "Error in punch-in/out process.",
      error: error.message,
    });
  }
};

const createAttendanceRequest = async (req, res) => {
  const { date, punchIn, punchOut, reason } = req.body;
  const { userId } = req.user;

  // console.log("Request body:", req.body);

  try {
    // Basic validation
    if (!userId || !date || !punchIn || !punchOut || !reason) {
      return res.status(400).json({
        message:
          "All fields (userId, date, punchIn, punchOut, reason) are required.",
      });
    }

    // Convert to Indian timezone (UTC+5:30)
    const indianTimeOffset = "+05:30";

    // Ensure date strings are in ISO format with Indian timezone
    const requestDate = new Date(`${date}T00:00:00${indianTimeOffset}`);

    // For punch times, check if they're full ISO strings or just time values
    let punchInDate, punchOutDate;

    // If punchIn/punchOut are just time values like "09:30", combine with date
    if (punchIn.includes("T")) {
      // If it already has a 'T', ensure it has the right timezone
      punchInDate = new Date(
        punchIn.includes("+") || punchIn.includes("Z")
          ? punchIn
          : `${punchIn}${indianTimeOffset}`
      );
    } else {
      punchInDate = new Date(`${date}T${punchIn}${indianTimeOffset}`);
    }

    if (punchOut.includes("T")) {
      // If it already has a 'T', ensure it has the right timezone
      punchOutDate = new Date(
        punchOut.includes("+") || punchOut.includes("Z")
          ? punchOut
          : `${punchOut}${indianTimeOffset}`
      );
    } else {
      punchOutDate = new Date(`${date}T${punchOut}${indianTimeOffset}`);
    }

    // console.log("Debug dates in IST:", {
    //   requestDate: requestDate.toISOString(),
    //   punchInDate: punchInDate.toISOString(),
    //   punchOutDate: punchOutDate.toISOString(),
    // });

    // Validate that dates are valid
    if (
      isNaN(requestDate.getTime()) ||
      isNaN(punchInDate.getTime()) ||
      isNaN(punchOutDate.getTime())
    ) {
      return res.status(400).json({
        message: "One or more date/time values are invalid.",
      });
    }

    // Use Indian timezone for current date comparison
    const currentDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Calculate the difference in days
    const daysDifference = Math.floor(
      (currentDate - requestDate) / (1000 * 60 * 60 * 24)
    );

    // Validate 7-day window
    if (daysDifference > 7 || daysDifference < 0) {
      return res.status(400).json({
        message: "Attendance requests can only be created for the past 7 days",
      });
    }

    // Ensure punchIn is earlier than punchOut
    if (punchInDate >= punchOutDate) {
      return res.status(400).json({
        message: "Punch-in time must be earlier than punch-out time.",
      });
    }

    // Check if a request already exists for this date
    const existingRequest = await prisma.requestForAttendance.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(new Date(requestDate).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(requestDate).setHours(24, 0, 0, 0)),
        },
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "An attendance request already exists for this date",
      });
    }

    // Create a new attendance request
    const newRequest = await prisma.requestForAttendance.create({
      data: {
        userId,
        date: requestDate,
        punchIn: punchInDate,
        punchOut: punchOutDate,
        reason,
        status: "PENDING",
      },
    });
    // console.log("DB call", newRequest);

    res.status(201).json({
      message: "Attendance request created successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating attendance request:", error.message);
    res.status(500).json({
      message: "Error creating attendance request.",
      error: error.message,
    });
  }
};

const updateAttendanceRequest = async (req, res) => {
  const requestId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const { userId } = req.user;

  try {
    // 1. Validate status
    if (!["ACCEPT", "REJECT"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'ACCEPT' or 'REJECT'." });
    }

    // 2. Only ADMIN or HR
    const adminOrHR = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: { role: true },
    });
    if (!adminOrHR || !["ADMIN", "HR"].includes(adminOrHR.role)) {
      return res.status(403).json({
        message:
          "Access denied. Only ADMIN or HR can update attendance requests.",
      });
    }

    // 3. Load the attendance request
    const attendanceRequest = await prisma.requestForAttendance.findUnique({
      where: { id: requestId },
    });
    if (!attendanceRequest) {
      return res.status(404).json({ message: "Attendance request not found." });
    }

    // 4. Update its status
    const updatedRequest = await prisma.requestForAttendance.update({
      where: { id: requestId },
      data: { status },
    });
    console.log("Updated request:", updatedRequest);

    // 5. If approved, upsert into Attendance on the same IST date
    if (status === "ACCEPT") {
      // parse the request.date as UTC, then shift to IST
      const reqUtc = moment.utc(attendanceRequest.date);
      const reqIst = reqUtc.clone().utcOffset(330); // +5:30 in minutes

      // compute the UTC-window corresponding to that IST calendar-day
      const dayStartUtc = reqIst
        .clone()
        .startOf("day")
        .subtract(330, "minutes")
        .toDate();
      const dayEndUtc = reqIst
        .clone()
        .endOf("day")
        .subtract(330, "minutes")
        .toDate();

      // find any existing attendance in that IST day
      const existing = await prisma.attendance.findFirst({
        where: {
          userId: attendanceRequest.userId,
          date: {
            gte: dayStartUtc,
            lte: dayEndUtc,
          },
        },
      });

      console.log("Existing attendance:", existing);

      if (existing) {
        // update punch times
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            punchIn: attendanceRequest.punchIn,
            punchOut: attendanceRequest.punchOut,
          },
        });
      } else {
        // create a new record
        await prisma.attendance.create({
          data: {
            userId: attendanceRequest.userId,
            date: attendanceRequest.date,
            punchIn: attendanceRequest.punchIn,
            punchOut: attendanceRequest.punchOut,
          },
        });
      }
    }

    // 6. Respond
    return res.status(200).json({
      message: `Attendance request has been ${status.toLowerCase()}.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating attendance request:", error);
    return res
      .status(500)
      .json({ message: "Error updating attendance request." });
  }
};

const getCurrentPunchStatus = async (req, res) => {
  const { userId, username, role } = req.user;
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  try {
    // Find today's attendance record for the user
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        punchIn: true,
        punchOut: true,
        date: true,
      },
    });

    const user = {
      userId,
      username,
      role,
    };
    // If no attendance record exists for today
    if (!todayAttendance) {
      return res.status(200).json({
        isPunchedIn: false,
        lastPunchTime: null,
        message: "No punch record for today!",
        user,
        isCompleted: false,
      });
    }

    // If attendance record exists but no punch-out (user is currently punched in)
    if (todayAttendance && !todayAttendance.punchOut) {
      return res.status(200).json({
        isPunchedIn: true,
        lastPunchTime: todayAttendance.punchIn,
        message: "Currently punched in",
        punchInTime: todayAttendance.punchIn,
        user,
        isCompleted: false,
      });
    }

    // If user has completed their punch for today
    if (todayAttendance && todayAttendance.punchOut) {
      return res.status(200).json({
        isPunchedIn: false,
        lastPunchTime: todayAttendance.punchOut,
        message: "Already completed attendance for today",
        punchInTime: todayAttendance.punchIn,
        punchOutTime: todayAttendance.punchOut,
        user,
        isCompleted: true,
      });
    }
  } catch (error) {
    console.error("Error checking punch status:", error.message);
    return res.status(500).json({
      message: "Error checking punch status",
      error: error.message,
    });
  }
};

const getAttendanceRequests = async (req, res) => {
  const {
    status,
    startDate,
    userId,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  // console.log(req.user);

  // Ensure we have a valid user ID from the authenticated request
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }
  const requestingUserId = req.user.userId;

  try {
    // Fetch the requesting user's role from the database
    const requestingUser = await prisma.user.findUnique({
      where: {
        id: requestingUserId,
      },
      select: {
        role: true,
      },
    });

    if (!requestingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Build where clause for filters
    const where = {};

    // Role-based filtering
    if (requestingUser.role === "STAFF") {
      // STAFF can only see their own requests
      where.user = { id: requestingUserId };
    } else if (
      requestingUser.role === "HR" ||
      requestingUser.role === "ADMIN"
    ) {
      // HR and ADMIN can see all requests, but can filter by userId if provided
      if (userId) {
        where.user = { id: parseInt(userId) };
      }
    } else {
      // Any other role (shouldn't happen, but just in case)
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        where.date.gte = new Date(startDate);
      }

      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get requests with user details and pagination
    const [requests, totalCount] = await prisma.$transaction([
      prisma.requestForAttendance.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              employeeId: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.requestForAttendance.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      requests,
      pagination: {
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage,
        hasPreviousPage,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance requests:", error.message);
    res.status(500).json({
      message: "Error fetching attendance requests",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentPunchStatus,
  punchInOut,
  createAttendanceRequest,
  updateAttendanceRequest,
  getAttendanceRequests,
};

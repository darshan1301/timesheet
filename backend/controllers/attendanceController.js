const moment = require("moment");
const prisma = require("../db/prisma-client");

const punchInOut = async (req, res) => {
  const { userId } = req.user;
  const currentTime = moment().toDate();
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  try {
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
        },
      });

      return res.status(200).json({
        message: "Punched in successfully.",
        punchInTime: newAttendance.punchIn,
      });
    }

    // If attendance record exists but no punch-out
    if (todayAttendance && !todayAttendance.punchOut) {
      // Update with punch-out time
      const updatedAttendance = await prisma.attendance.update({
        where: {
          id: todayAttendance.id,
        },
        data: {
          punchOut: currentTime,
        },
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

  try {
    // Basic validation
    if (!userId || !date || !punchIn || !punchOut || !reason) {
      return res.status(400).json({
        message:
          "All fields (userId, date, punchIn, punchOut, reason) are required.",
      });
    }

    // Ensure date strings are in ISO format to avoid 'Invalid Date' issues
    const requestDate = new Date(date);

    // For punch times, check if they're full ISO strings or just time values
    let punchInDate, punchOutDate;

    // If punchIn/punchOut are just time values like "09:30", combine with date
    if (punchIn.includes("T")) {
      punchInDate = new Date(punchIn);
    } else {
      punchInDate = new Date(`${date}T${punchIn}`);
    }

    if (punchOut.includes("T")) {
      punchOutDate = new Date(punchOut);
    } else {
      punchOutDate = new Date(`${date}T${punchOut}`);
    }

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

    const currentDate = new Date();

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
          gte: new Date(requestDate.setHours(0, 0, 0, 0)),
          lt: new Date(requestDate.setHours(24, 0, 0, 0)),
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
  const requestId = req.params.id;
  const { status } = req.body;
  const { userId } = req.user;

  // console.log(status, typeof userId);
  try {
    // Check if status is valid
    if (!["ACCEPT", "REJECT"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'ACCEPT' or 'REJECT'." });
    }

    // Validate requestId
    if (!requestId || isNaN(parseInt(requestId))) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const parsedRequestId = parseInt(requestId);

    // Fetch the user making the update request
    const adminOrHR = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true },
    });

    // Ensure the user is either ADMIN or HR
    if (!adminOrHR || (adminOrHR.role !== "ADMIN" && adminOrHR.role !== "HR")) {
      return res.status(403).json({
        message:
          "Access denied. Only ADMIN or HR can update attendance requests.",
      });
    }

    // Find the attendance request
    const attendanceRequest = await prisma.requestForAttendance.findUnique({
      where: { id: parsedRequestId },
    });

    if (!attendanceRequest) {
      return res.status(404).json({ message: "Attendance request not found." });
    }

    // Update the attendance request status - using parsedRequestId here
    const updatedRequest = await prisma.requestForAttendance.update({
      where: { id: parsedRequestId }, // Using the parsed integer ID
      data: { status },
    });

    res.status(200).json({
      message: `Attendance request has been ${status.toLowerCase()}.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating attendance request:", error.message);
    res.status(500).json({ message: "Error updating attendance request." });
  }
};

const getCurrentPunchStatus = async (req, res) => {
  const { userId } = req.user;
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

    // If no attendance record exists for today
    if (!todayAttendance) {
      return res.status(200).json({
        isPunchedIn: false,
        lastPunchTime: null,
        message: "No punch record for today",
      });
    }

    // If attendance record exists but no punch-out (user is currently punched in)
    if (todayAttendance && !todayAttendance.punchOut) {
      return res.status(200).json({
        isPunchedIn: true,
        lastPunchTime: todayAttendance.punchIn,
        message: "Currently punched in",
        punchInTime: todayAttendance.punchIn,
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

  console.log(req.user);

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

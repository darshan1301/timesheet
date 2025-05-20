const prisma = require("../db/prisma-client.js");
const bcrypt = require("bcryptjs");
const { sendNotification } = require("../utils/notification.js");
const { NOTIFICATION_TYPE } = require("../constant.js");

// const path = require("path");
// const fs = require("fs");
// const os = require("os");

const getUserAttendance = async (req, res) => {
  const userId = req.params.id; // Get userId from route parameters

  try {
    // Validate userId
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: "Invalid user ID provided",
      });
    }

    // Get the current date (ignoring time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch specific user with their attendance
    const userWithAttendance = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        employeeId: true,
        username: true,
        role: true,
        status: true,
        attendances: {
          where: {
            date: {
              gte: today,
              lt: new Date(today.getTime() + 86400000), // 24 hours from today
            },
          },
          select: {
            id: true,
            punchIn: true,
            punchOut: true,
            date: true,
          },
        },
      },
    });

    if (!userWithAttendance) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: userWithAttendance,
    });
  } catch (error) {
    console.error("Error fetching user attendance:", error.message);
    res.status(500).json({
      message: "Error fetching user attendance records",
      error: error.message,
    });
  }
};

const getAllAttendanceRequests = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    userId,
  } = req.query;

  try {
    // Build where clause based on filters
    const where = {};

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

    // Add userId filter if provided
    if (userId) {
      where.userId = parseInt(userId);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get requests with pagination and include user details
    const [requests, totalCount] = await prisma.$transaction([
      prisma.requestForAttendance.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.requestForAttendance.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      data: requests,
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

const getUsersList = async (req, res) => {
  const { role, status, search, page = 1, limit = 10 } = req.query;
  const requestingUser = req.user;

  try {
    // Only ADMIN and HR can access user lists
    if (requestingUser.role !== "ADMIN" && requestingUser.role !== "HR") {
      return res.status(403).json({
        message: "Access denied. Only ADMIN or HR can view user lists",
      });
    }

    // Build where clause for filters
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          employeeId: true,
          role: true,
          locationId: true,
          status: true,
          dateOfJoining: true,
          attendances: {
            where: {
              date: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            select: {
              punchIn: true,
              punchOut: true,
            },
            take: 1,
          },
          _count: {
            select: {
              attendances: true,
              attendanceRequests: true,
              tasks: true,
            },
          },
        },
        orderBy: {
          dateOfJoining: "desc",
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      users,
      pagination: {
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage,
        hasPreviousPage,
        limit: parseInt(limit),
      },
      filters: {
        role,
        status,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching users list:", error.message);
    res.status(500).json({
      message: "Error fetching users list",
      error: error.message,
    });
  }
};

// For getting a single user's details
const getUserDetails = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  try {
    // Validate user ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "Invalid user ID provided",
      });
    }

    // Only ADMIN and HR can access user details
    if (requestingUser.role !== "ADMIN" && requestingUser.role !== "HR") {
      return res.status(403).json({
        message: "Access denied. Only ADMIN or HR can view user details",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        username: true,
        employeeId: true,
        email: true,
        role: true,
        status: true,
        dateOfJoining: true,
        attendances: {
          take: 5,
          orderBy: {
            date: "desc",
          },
          select: {
            id: true,
            date: true,
            punchIn: true,
            punchOut: true,
          },
        },
        requestForAttendances: {
          take: 5,
          orderBy: {
            date: "desc",
          },
          select: {
            id: true,
            date: true,
            status: true,
            reason: true,
          },
        },
        _count: {
          select: {
            attendances: true,
            requestForAttendances: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  const { username, password, employeeId, dateOfJoining, role, status } =
    req.body;
  const requestingUser = req.user;

  try {
    // Check if the requesting user has permission to create users
    if (requestingUser.role !== "ADMIN" && requestingUser.role !== "HR") {
      return res.status(403).json({
        message: "Access denied. Only ADMIN or HR can create new users",
      });
    }

    // Validate username format (must end with @pgm.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@pgm\.com$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be a valid email ending with @pgm.com",
      });
    }

    // Check if username or employee ID already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { employeeId }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.username === username
            ? "Username already exists"
            : "Employee ID already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        employeeId,
        dateOfJoining: new Date(dateOfJoining),
        role: role || "STAFF",
        status: status || "ACTIVE",
      },
      select: {
        id: true,
        username: true,
        employeeId: true,
        dateOfJoining: true,
        role: true,
        status: true,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

// In your task controller (backend)
const getUserTasks = async (req, res) => {
  const userId = req.params.employeeId;
  const requestingUser = req.user;

  try {
    // Security check - only allow ADMIN, HR, or the user themselves to view tasks
    if (
      requestingUser.role !== "ADMIN" &&
      requestingUser.role !== "HR" &&
      requestingUser.id !== parseInt(userId)
    ) {
      return res.status(403).json({
        message:
          "Access denied. You can only view your own tasks or require admin privileges",
      });
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, username: true, employeeId: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get tasks for this user
    const tasks = await prisma.task.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc", // Order by creation date
      },
      include: {
        user: { select: { username: true, employeeId: true } },
        assignedByUser: { select: { username: true } },
      },
    });

    res.status(200).json({
      employee: user,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching user tasks:", error.message);
    res.status(500).json({
      message: "Error fetching user tasks",
      error: error.message,
    });
  }
};

const getAttendanceSheet = async (req, res) => {
  const { startDate, endDate, employeeId, page = 1, limit = 31 } = req.query;
  const requestingUser = req.user;

  try {
    // Build where clause
    const where = {};

    // Filter by employeeId if provided or for STAFF users
    if (employeeId) {
      where.userId = parseInt(employeeId);
    } else if (requestingUser.role === "STAFF") {
      // Staff can only see their own attendance
      where.userId = requestingUser.id;
    }

    // Add date range filter
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

    // Get attendance records with user details
    const [records, totalCount] = await prisma.$transaction([
      prisma.attendance.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              employeeId: true,
            },
          },
        },
        orderBy: [{ date: "desc" }, { userId: "asc" }],
        skip,
        take: parseInt(limit),
      }),
      prisma.attendance.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      records,
      pagination: {
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error.message);
    res.status(500).json({
      message: "Error fetching attendance records",
      error: error.message,
    });
  }
};

// In your attendanceController.js
const exportAttendanceSheet = async (req, res) => {
  const { startDate, endDate, employeeId } = req.query;
  const requestingUser = req.user;

  try {
    // Only ADMIN and HR can export all attendance, staff can only export their own
    if (
      requestingUser.role !== "ADMIN" &&
      requestingUser.role !== "HR" &&
      (!employeeId || parseInt(employeeId) !== requestingUser.id)
    ) {
      return res.status(403).json({
        message:
          "Access denied. You can only export your own attendance records",
      });
    }

    // Build the where clause
    const where = {};

    // Filter by employeeId if provided, or limit to requesting user for staff
    if (employeeId) {
      where.userId = parseInt(employeeId);
    } else if (requestingUser.role === "STAFF") {
      where.userId = requestingUser.id;
    }

    // Add date range filter
    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        where.date.gte = new Date(startDate);
      }

      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get attendance records with user details
    const records = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            employeeId: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { userId: "asc" }],
    });

    // Create Excel workbook using exceljs
    const Excel = require("exceljs");
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Records");

    // Define columns with specific widths
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Employee ID", key: "employeeId", width: 15 },
      { header: "Employee Name", key: "username", width: 25 },
      { header: "Punch In", key: "punchIn", width: 15 },
      { header: "Punch Out", key: "punchOut", width: 15 },
      { header: "Hours Worked", key: "workHours", width: 15 },
    ];

    const calculateWorkHours = (punchIn, punchOut) => {
      if (!punchIn || !punchOut) return "-";

      const start = new Date(punchIn);
      const end = new Date(punchOut);
      const diffMs = end - start;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${diffHrs}h ${diffMins}m`;
    };

    // Add styling to headers
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Format and add data
    records.forEach((record) => {
      // Format data (keep the same)...

      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString(),
        employeeId: record.user.employeeId,
        username: record.user.username,
        punchIn: record.punchIn
          ? new Date(record.punchIn).toLocaleTimeString()
          : "-",
        punchOut: record.punchOut
          ? new Date(record.punchOut).toLocaleTimeString()
          : "-",
        workHours: calculateWorkHours(record.punchIn, record.punchOut),
      });
    });

    // Apply additional styling (keep the same)...

    // Key part - Write to buffer and send as file
    const fileName = `attendance_${startDate || "all"}_to_${
      endDate || "now"
    }.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Write to buffer and send
    const buffer = await workbook.xlsx.writeBuffer();

    // Ensure buffer is sent as binary
    res.end(Buffer.from(buffer));
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res
      .status(500)
      .json({ message: "Error exporting data", error: error.message });
  }
};

const assignTask = async (req, res) => {
  const { employeeId } = req.body;
  try {
    //first check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(employeeId) },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // Create the task
    const newTask = await prisma.task.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        status: req.body.status || "PENDING",
        userId: parseInt(employeeId),
        assignedBy: req.user.userId,
      },
    });
    // send notification to the user
    await sendNotification({
      type: NOTIFICATION_TYPE.Task,
      targetUserId: parseInt(employeeId),
      title: "New Task Assigned",
      message: `${req.user.username} : ${req.body.title}`,
    });

    res.status(201).json({
      message: "Task assigned successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error assigning task:", error.message);
    res.status(500).json({
      message: "Error assigning task",
      error: error.message,
    });
  }
};

module.exports = {
  // userUpdate,
  getUserTasks,
  getUserAttendance,
  getAllAttendanceRequests,
  getUsersList,
  createUser,
  getAttendanceSheet,
  exportAttendanceSheet,
  assignTask,
};

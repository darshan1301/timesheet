require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { setupWebSocketServer } = require("./utils/wsManager.js");
const { isAuthenticated, authRole } = require("./middleware/authentication.js");
const prisma = require("./db/prisma-client.js");
var cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const http = require("http").createServer(app);
setupWebSocketServer(http);

app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (req, res) => {
  try {
    // Run a simple query to check if Prisma is connected
    await prisma.$queryRaw`SELECT 1`;

    res.send("Hello, World! DB is connected!");
  } catch (error) {
    console.error("Prisma connection error:", error.message);
    res
      .status(500)
      .send("Prisma is not running or database connection failed.");
  }
});

app.use("/api/task", isAuthenticated, require("./routes/task.js"));
app.use("/api/user", require("./routes/user.js"));
app.use("/api/attendance", isAuthenticated, require("./routes/attendance.js"));
app.use(
  "/api/dashboard",
  isAuthenticated,
  authRole("ADMIN", "HR"),
  require("./routes/dashboard.js")
);
app.use(
  "/api/location",
  isAuthenticated,
  authRole("ADMIN", "HR"),
  require("./routes/location.js")
);
app.use(
  "/api/notifications",
  isAuthenticated,
  require("./routes/notification.js")
);

module.exports = { app, http };

http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

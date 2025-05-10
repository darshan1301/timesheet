require("dotenv").config();
const express = require("express");
const morgan = require("morgan"); // Require Morgan
const { isAuthenticated, authRole } = require("./middleware/authentication.js");
const prisma = require("./db/prisma-client.js");
const app = express();
const PORT = process.env.PORT || 5000;
var cors = require("cors");

app.use(cors());

app.use(morgan("dev")); // Use Morgan as middleware
app.use(express.json());
//limit the size of the request body to 500kb
app.use(express.json({ limit: "1mb" }));

app.get("/", async (req, res) => {
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

app.use("/task", isAuthenticated, require("./routes/task.js"));
app.use("/user", require("./routes/user.js"));
app.use("/attendance", isAuthenticated, require("./routes/attendance.js"));
app.use(
  "/dashboard",
  isAuthenticated,
  authRole("ADMIN", "HR"),
  require("./routes/dashboard.js")
);
app.use(
  "/location",
  isAuthenticated,
  authRole("ADMIN", "HR"),
  require("./routes/location.js")
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

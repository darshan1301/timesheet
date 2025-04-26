const prisma = require("../db/prisma-client.js");
const { createToken } = require("../middleware/authentication.js");
const bcrypt = require("bcryptjs");

const userLogin = async (req, res) => {
  const { username, password } = req.body; // Get username and password from request body
  try {
    // Find the user by username using Prisma
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res
        .status(404)
        .send("User not found. Please check your username and try again.");
    }

    // Compare the entered password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .send({ message: "Invalid password. Please try again." });
    }

    // Generate a JWT token upon successful login
    const token = createToken(user);

    // Return the token in the response
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error("Error during user login:", error.message);
    res.status(500).send("Error during user login");
  }
};

const userSignup = async (req, res) => {
  const { username, password, signupSecret, employeeId, dateOfJoining } =
    req.body;

  // Check if signupSecret matches the value in the .env file
  if (signupSecret !== process.env.ADMIN_SIGNUP_SECRET) {
    return res
      .status(403)
      .send(
        "Invalid signup secret. You cannot sign up without the correct secret."
      );
  }

  try {
    // Check if the username or employeeId already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return res.status(409).send("Username is already taken.");
    }

    const existingEmployee = await prisma.user.findUnique({
      where: {
        employeeId: employeeId,
      },
    });

    if (existingEmployee) {
      return res.status(409).send("Employee ID already exists.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If dateOfJoining is not provided, set it to the current date
    const joiningDate = dateOfJoining ? new Date(dateOfJoining) : new Date();

    // Create a new user with the provided details
    const newUser = await prisma.user.create({
      data: {
        username: username,
        role: "ADMIN",
        password: hashedPassword,
        employeeId: employeeId,
        dateOfJoining: joiningDate, // Use the provided dateOfJoining or set it to the current date
        status: "ACTIVE", // Set the status to active by default
      },
    });

    // Generate a JWT token for the new user
    const token = createToken(newUser);

    // Return the token in the response
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error during user signup:", error.message);
    res.status(500).send("Error during user signup");
  }
};

module.exports = { userLogin, userSignup };

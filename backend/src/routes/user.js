const express = require("express");
const {
  userLogin,
  userSignup,
  updateUser,
} = require("../controllers/userController.js");
const {
  isAuthenticated,
  authRole,
} = require("../middleware/authentication.js");

const router = express.Router();

router.post("/login", userLogin);
router.post("/signup", userSignup);
router.put("/update/:id", isAuthenticated, authRole("ADMIN", "HR"), updateUser);

module.exports = router;

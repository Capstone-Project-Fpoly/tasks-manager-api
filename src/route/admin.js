const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const authController = require("../controller/auth.controller");

router.post("/login", authController.login);
router.get("/users", adminController.getUsers);
router.get("/", adminController.index);

module.exports = router;

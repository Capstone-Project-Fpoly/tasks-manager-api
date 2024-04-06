const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.controller");
const authController = require("../controller/auth.controller");

router.post("/login", authController.login);
router.get("/account-detail", adminController.accountDetail);
router.get("/users", adminController.getUsers);
router.post("/user/ban", adminController.banUser);
router.post("/user", adminController.createUsers);
router.get("/", adminController.index);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authRequired = require("../middlewares/authRequired");

router.get("/", authRequired, userController.getAll);
router.get("/:id/posts", userController.getUserPosts);
router.get("/:id", userController.getOne);
router.get("/", userController.create);

module.exports = router;

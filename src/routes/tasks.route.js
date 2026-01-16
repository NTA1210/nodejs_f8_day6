const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const taskCreateValidator = require("../middlewares/taskCreateValidator");
const authRequired = require("../middlewares/authRequired");

router.get("/", taskController.getAll);
router.get("/:id", taskController.getOne);
router.post("/", authRequired, taskCreateValidator, taskController.create);
router.put("/:id", authRequired, taskController.update);
router.delete("/:id", authRequired, taskController.destroy);

module.exports = router;

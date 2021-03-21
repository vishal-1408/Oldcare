const express = require('express');
const router = express.Router();
const controller = require("../controllers/elder");
const checkAuth = require("../middlewares/checkAuth");
const checkAuthWithElder = require('../middlewares/checkAuthWithElder');


router.post("/add",checkAuth,controller.register);

router.post("/add/caretaker",checkAuthWithElder,controller.addCaretakers);

router.post("/add/reminder",checkAuthWithElder,controller.addReminder);

router.post("/startReminder/:id",checkAuthWithElder,controller.startReminder);

router.get("/reminders",checkAuthWithElder,controller.getReminders)

module.exports = router
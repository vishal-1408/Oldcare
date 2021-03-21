const express = require("express");
const pool = require("../../config/db");
const router = express.Router();
const controller = require('../controllers/report');
const checkAuthWithElder = require("../middlewares/checkAuthWithElder")




router.post("/add",checkAuthWithElder,controller.addReport)

// router.get("/:id",controller.getReport);










module.exports = router;
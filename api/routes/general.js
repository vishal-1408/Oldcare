const express = require("express");
const router = express.Router();
const controller = require("../controllers/general");
const checkAuth = require("../middlewares/checkAuth")
const checkAuthWithElder = require("../middlewares/checkAuthWithElder")

router.get("/timezones",controller.timezones);

router.get("/countryCodes",controller.countryCodes);




module.exports = router;
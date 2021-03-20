const express = require("express");
const router = express.Router();
const controller = require("../controllers/device");
const checkAuth = require("../middlewares/checkAuth")
const checkAuthWithElder = require("../middlewares/checkAuthWithElder")

router.post("/add",controller.addDevice);

router.post("/register",checkAuth,controller.registerDevice);


router.post("/data",controller.addData)

router.get("/bpm",checkAuthWithElder,controller.getHeartData);





module.exports = router;
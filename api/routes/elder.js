const express = require('express');
const router = express.Router();
const controller = require("../controllers/elder");
const checkAuth = require("../middlewares/checkAuth");


router.post("/add",checkAuth,controller.register);



module.exports = router
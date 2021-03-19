const express = require("express");
const router = express.Router();
const controllers = require("../controllers/auth")


router.post("/user/google",controllers.userGoogleAuth);

router.post("/user/register",controllers.userRegister);

router.post("/user/login",controllers.userLogin);

module.exports = router;
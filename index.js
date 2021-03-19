const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
// const expressRL = require("express-rate-limiter");
const dotenv = require("dotenv");
const helmet = require("helmet");
const authRoutes = require("./api/routes/auth");
const deviceRoutes = require("./api/routes/device");
const elderRoutes = require("./api/routes/elder");
const generalRoutes = require("./api/routes/general");

dotenv.config();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


if(!process.env.TESTING){
    app.use(morgan("tiny"));
}

//helmet
app.use(helmet());

//cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });



//ROUTES
app.use("/auth",authRoutes);
app.use("/device",deviceRoutes)
app.use("/elder",elderRoutes);
app.use("/general",generalRoutes);
app.use("/*",(req,res)=>{
    res.status(404).json({
      error:"page not found!!"
    });

})


//SERVER
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT,()=>{
  console.log("SERVER RUNNING AT PORT: "+PORT);
})
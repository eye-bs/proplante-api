const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const newManagerRoutes = require("./api/routes/newManagerRoutes");
const registerOwnersRoutes = require("./api/routes/registerOwnerRoutes");
const registerManagersRoutes = require("./api/routes/registerManagerRoutes");
const loginOwnersRoutes = require("./api/routes/loginOwnerRoutes");
const loginManagersRoutes = require("./api/routes/loginManagerRoutes");
const landsRoutes = require("./api/routes/landsRoutes");
const operationsRoute = require("./api/routes/operationRoutes");
const plantRoutes = require("./api/routes/plantsRoutes");

mongoose.connect(
    "mongodb+srv://admin:admin123@cluster0-odrr2.gcp.mongodb.net/Proplante?retryWrites=true&w=majority",
    function(err) {
          if(err) throw err;
          console.log('Connect to MongoDB Atlas successful!')
      }
  );
  
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// makes 'uploads' folder to public
app.use(express.static('uploads'))

app.use("/owner/register" , registerOwnersRoutes);
app.use("/owner/login", loginOwnersRoutes);

app.use("/manager/login", loginManagersRoutes);
app.use("/manager/register", registerManagersRoutes);
app.use("/manager/new" , newManagerRoutes);

app.use("/lands" , landsRoutes);

app.use("/operations",operationsRoute);

app.use("/plant",plantRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found!!");
    error.status = 404;
    next(error);
  });
  
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message
      }
    });
  });
  
  module.exports = app;
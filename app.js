require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authJwt = require("./helper/jwt");
const errorHandler = require("./helper/error-handler");

const api = process.env.API_URL;

// middleWare
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(authJwt());
app.use(errorHandler);

// Routes
const productRouter = require("./Routes/products");
const categoryRouter = require("./Routes/categories");
const userRouter = require("./Routes/user");
const orderRouter = require("./Routes/order");
//------------------------------------------------
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);

mongoose
  .connect(process.env.CONNECT_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshop-database",
  })
  .then(() => console.log("Database connection is Ready ......"))
  .catch((err) => console.log(err));

app.listen(3500, () => console.log("Server Start at http://localhost:3500  "));

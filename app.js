const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

mongoose
  .connect(
    "mongodb+srv://imakerdeveloper:hBjgSHkFpvc7xTdv@parichay.77abray.mongodb.net/parichay"
  )
  .then(() => {
    console.log("Connected");
  })
  .catch(() => {
    console.log("Not Connected");
  });
const router = require("./router");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Sample API",
      description: "Documentation for Sample API",
      version: "1.0.0",
    },
  },
  apis: ["./router.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger documentation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(router);

module.exports = app;

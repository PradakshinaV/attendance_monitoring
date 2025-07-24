const jwt = require("jsonwebtoken");
const token = jwt.sign({ id: "123" }, "your_jwt_secret");
console.log(token);
const express=require("express")
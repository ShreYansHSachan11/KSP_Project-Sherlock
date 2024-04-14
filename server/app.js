const express = require("express");
const app = express();
require('dotenv').config();
require("./db/conn");
const router = require('./routes/router');
const cors = require("cors");
const cookiparser = require("cookie-parser")
const PORT = process.env.PORT || 3001


app.use(express.json());
app.use(cors());
app.use(cookiparser());
app.use(router);


app.listen(PORT,()=>{
  console.log(`server start at port no :${PORT}`)
})


const jwt = require("jsonwebtoken");
const FilePairModel = require("../models/userSchema");

const keysecret = "mynameissaurabhrajputifyouhaveanytyuplkbhkhbkbkjbkknkjjkbjk";

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const decoded = jwt.verify(token, keysecret); // Replace "your_secret_key" with your actual secret key
    const user = await FilePairModel.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error("User not found");
    }

    req.token = token;
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

module.exports = authenticate;

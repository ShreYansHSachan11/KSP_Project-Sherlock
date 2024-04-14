const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keysecret = "mynameissaurabhrajputifyouhaveanytyuplkbhkhbkbkjbkknkjjkbjk";

// Define schema for the file pair
const filePairSchema = new mongoose.Schema({
  filePairId: { type: String, required: false, unique: true },
  entity: { type: String, required: false },
  inputFile: { type: String, required: false },
  resultdata: { type: String, required: false },
  status: { type: String, required: false },
  sharedFile: { 
    fileFromId: { type: String, required: false }, // ID of the shared file
    fileName: { type: String, required: false },
    fileUrl: { type: String, required: false } // Name of the shared file
  },
  sharedFileEmailsData: [{ type: String }]
});

// Define main schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, uppercase: true, required: true },
  lastName: { type: String, uppercase: true, required: true },
  email: {
    type: String,
    required: false,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: { type: String, required: true, minlength: 6 },
  confirmPassword: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['police', 'nopolice'] }, // Role-based authentication
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  filePairs: [filePairSchema] // Embed FilePair schema as a sub-document array
});

// Hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, 12);
  }
  next();
});

// Generate authentication token
userSchema.methods.generateAuthtoken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, keysecret, { expiresIn: "1d" });
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

const FilePairModel = mongoose.model("userdbauth12", userSchema);
module.exports = FilePairModel;

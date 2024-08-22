const express = require("express");
const router = express.Router();
const FilePairModel = require("../models/userSchema");
require("dotenv").config();
const authenticate = require("../middleware/authenticate");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");
const upload = require("../middleware/upload");
const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = Buffer.from(
  "c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
  "hex"
);
const iv = Buffer.from("a1b2c3d4e5f60789a1b2c3d4e5f60789", "hex");

// encription function
function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decryption function
function decrypt(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");

  // Ensure IV length and content match the expected IV
  if (iv.length !== 16) {
    throw new Error("Invalid initialization vector");
  }

  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

//cloudinary keys

cloudinary.config({
  cloud_name: "dscg8f8bg",
  api_key: "489153691184969",
  api_secret: "_QjYfhYCQpbDnuz3o25f4q-dzbM",
});

// authentication

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !role
  ) {
    return res.status(422).json({ error: "Fill all details" });
  }

  try {
    const preuser = await FilePairModel.findOne({ email });
    if (preuser) {
      return res.status(422).json({ error: "This email already exists" });
    }

    if (password !== confirmPassword) {
      return res
        .status(422)
        .json({ error: "Password and confirm password do not match" });
    }

    const finalUser = new FilePairModel({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role, // Set role
    });

    await finalUser.save();

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//user Login
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: "fill all the datails" });
  }
  try {
    const userValid = await FilePairModel.findOne({ email: email });
    console.log(userValid);
    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);
      if (!isMatch) {
        res.status(422).json({ error: "invalid details" });
      } else {
        // token generate
        const token = await userValid.generateAuthtoken();

        console.log("token", token);
        // cookiegenerate
        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });
        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (error) {
    res.status(422).json(error);
  }
});

// user validation
router.get("/validuser", authenticate, async (req, res) => {
  try {
    const validUserOne = await FilePairModel.findOne({ _id: req.userId });

    // Check if user was found
    if (!validUserOne) {
      return res.status(404).json({ error: "User not found" });
    }

    // Decrypt the URLs in filePairs
    if (validUserOne.filePairs) {
      validUserOne.filePairs = validUserOne.filePairs.map((filePair) => {
        return {
          ...filePair._doc,
          inputFile: filePair.inputFile ? decrypt(filePair.inputFile) : null,
          resultdata: filePair.resultdata ? decrypt(filePair.resultdata) : null,
          report: filePair.report ? decrypt(filePair.report) : null,
        };
      });
    }

    console.log("saurabh", validUserOne);

    res.status(200).json({ status: 200, validUserOne });
  } catch (error) {
    console.error("Error fetching valid user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//routes for storing filepair data
router.post(
  "/filedata",
  authenticate,
  upload.fields([{ name: "file" }, { name: "resultdata" }, { name: "report" }]),
  async (req, res) => {
    const { entity, status, filePairId, sharedFileEmailsData, date } = req.body;
    const files = req.files;
    const userId = req.userId;

    try {
      if (!files["file"] && !entity && !files["resultdata"]) {
        return res.status(422).json({ error: "Fill at least one field" });
      }

      let filePairData = {};

      if (files["file"]) {
        const cloudinaryFileResponse = await cloudinary.uploader.upload(
          files["file"][0].path,
          { resource_type: "raw" }
        );
        filePairData.inputFile = encrypt(cloudinaryFileResponse.secure_url); // Save file URL
      }

      if (files["resultdata"]) {
        const cloudinaryResultDataResponse = await cloudinary.uploader.upload(
          files["resultdata"][0].path,
          { resource_type: "raw" }
        );
        filePairData.resultdata = encrypt(
          cloudinaryResultDataResponse.secure_url
        ); // Save resultdata URL
      }

      if (files["report"]) {
        const cloudinaryReportDataResponse = await cloudinary.uploader.upload(
          files["resultdata"][0].path,
          { resource_type: "raw" }
        );
        filePairData.report = encrypt(cloudinaryReportDataResponse.secure_url); // Save resultdata URL
      }

      if (filePairId) {
        filePairData.filePairId = filePairId;
      } else {
        console.log("require");
      }
      if (entity) {
        filePairData.entity = entity;
      }
      if (sharedFileEmailsData) {
        filePairData.sharedFileEmailsData = sharedFileEmailsData;
      }
      if (status) {
        filePairData.status = status;
      }
      if (date) {
        filePairData.date = date;
      }

      const user = await FilePairModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const filePair = user.filePairs.create(filePairData);

      user.filePairs.push(filePairData);
      await user.save();

      res
        .status(200)
        .json({ message: "File pair saved successfully", filePair: filePair });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/update/filepair/:filePairId",
  upload.fields([
    { name: "inputFile" },
    { name: "resultdata" },
    { name: "report" },
  ]),
  async (req, res) => {
    const filePairId = req.params.filePairId;
    const { entity, status, sharedFileEmail, date } = req.body;
    const files = req.files;

    try {
      if (!filePairId) {
        return res.status(422).json({ error: "File Pair ID is required" });
      }

      const users = await FilePairModel.find({
        "filePairs.filePairId": filePairId,
      });
      if (!users.length) {
        return res.status(404).json({ error: "File pair not found" });
      }

      let updatedFilePairs = [];

      // Iterate through all users containing the matching file pair
      for (const user of users) {
        // Find the file pair within the user's filePairs array
        const filePair = user.filePairs.find(
          (pair) => pair.filePairId === filePairId
        );
        if (filePair) {
          // Update entity and status if provided
          if (entity) filePair.entity = entity;
          if (status) filePair.status = status;
          if (date) filePair.date = date;
          if (sharedFileEmail) {
            if (!Array.isArray(filePair.sharedFileEmailsData)) {
              filePair.sharedFileEmailsData = [];
            }
            filePair.sharedFileEmailsData.push(sharedFileEmail);
          }

          // Handle file uploads if provided
          if (files) {
            if (files["inputFile"]) {
              const cloudinaryResponse = await cloudinary.uploader.upload(
                files["inputFile"][0].path,
                { resource_type: "raw" }
              );
              filePair.inputFile = encrypt(cloudinaryResponse.secure_url);
            }

            if (files["report"]) {
              const cloudinaryResponse = await cloudinary.uploader.upload(
                files["report"][0].path,
                { resource_type: "raw" }
              );
              filePair.report = encrypt(cloudinaryResponse.secure_url);
            }

            if (files["resultdata"]) {
              const cloudinaryResponse = await cloudinary.uploader.upload(
                files["resultdata"][0].path,
                { resource_type: "raw" }
              );
              filePair.resultdata = encrypt(cloudinaryResponse.secure_url);
            }
          }

          // Save the updated user
          await user.save();

          updatedFilePairs.push(filePair);
        }
      }

      return res
        .status(200)
        .json({
          success: true,
          message: "File pairs updated successfully",
          updatedData: updatedFilePairs,
        });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/share-file-pair", async (req, res) => {
  try {
    // Extract the necessary data from the request body
    const { filePairId, sharedFromEmail, sharedToEmail } = req.body;
    console.log(filePairId);
    console.log(sharedFromEmail);
    console.log(sharedToEmail);

    // Find the sender in the database by email
    const sender = await FilePairModel.findOne({ email: sharedFromEmail });
    if (!sender) {
      return res.status(404).send("Sender not found.");
    }

    // Find the receiver in the database by email
    const receiver = await FilePairModel.findOne({ email: sharedToEmail });
    if (!receiver) {
      return res.status(404).send("Receiver not found.");
    }

    // Retrieve the shared file pair object from the sender's filePairs array
    const filePair = sender.filePairs.find(
      (pair) => pair.filePairId === filePairId
    );
    if (!filePair) {
      return res.status(404).send("File pair not found.");
    }

    // Create a new shared file pair instance
    const sharedFilePair = {
      filePairId,
      sharedFrom: sender._id,
      sharedTo: receiver._id,
      sharedFromEmail: sender.email,
      sharedToEmail: receiver.email,
    };

    // Add the shared file pair to the receiver's sharedFilePairs array
    receiver.sharedFilePairs.push(sharedFilePair);

    // Add the file pair to the receiver's filePairs array if it doesn't already exist
    if (!receiver.filePairs.some((pair) => pair.filePairId === filePairId)) {
      receiver.filePairs.push(filePair);
    }

    await receiver.save();

    res.status(201).send("File pair shared successfully.");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
});

// Route to find a user by ID
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await FilePairModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Decrypt the URLs in filePairs
    if (user.filePairs) {
      user.filePairs = user.filePairs.map((filePair) => {
        return {
          ...filePair._doc,
          inputFile: filePair.inputFile ? decrypt(filePair.inputFile) : null,
          resultdata: filePair.resultdata ? decrypt(filePair.resultdata) : null,
          report: filePair.report ? decrypt(filePair.report) : null,
        };
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

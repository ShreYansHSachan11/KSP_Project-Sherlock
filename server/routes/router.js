const express = require("express");
const router = express.Router();
const FilePairModel = require("../models/userSchema");
const authenticate = require("../middleware/authenticate");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dcnblai32",
  api_key: "322754248918634",
  api_secret: "hPd5b4MA8UToPXSpFgZ4BUAFYcc",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Endpoint for storing files
router.post(
  "/filedata",
  upload.fields([{ name: "file" }, { name: "resultdata" }]),
  async (req, res) => {
    const { entity, status ,filePairId,sharedFileEmailsData} = req.body;
    const files = req.files;
    const userId = req.body.userId;

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
        filePairData.inputFile = cloudinaryFileResponse.secure_url; // Save file URL
      } else {
        filePairData.inputFile = null;
      }

      if (files["resultdata"]) {
        const cloudinaryResultDataResponse = await cloudinary.uploader.upload(
          files["resultdata"][0].path,
          { resource_type: "raw" }
        );
        filePairData.resultdata = cloudinaryResultDataResponse.secure_url; // Save resultdata URL
      } else {
        filePairData.resultdata = null; // Store null if 'resultdata' field is not provided
      }

     
      if (filePairId) {
        filePairData.filePairId = filePairId;
      } else {
        console.log ("require");
      }
       if (entity) {
        filePairData.entity = entity;
      } else {
        filePairData.entity = null;
      }
      if (sharedFileEmailsData) {
        filePairData.sharedFileEmailsData = sharedFileEmailsData;
      } else {
        filePairData.sharedFileEmailsData = null;
      }
      if (status) {
        filePairData.status = status;
      } else {
        filePairData.status = null;
      }

      const user = await FilePairModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      
      const filePair = user.filePairs.create(filePairData);

      user.filePairs.push(filePairData);
      await user.save();
      
      

      res.status(200).json({ message: "File pair saved successfully" ,filePair: filePair });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//filepair data
router.post(
  "/update/filepair/:filePairId",
  upload.fields([{ name: "inputFile" }, { name: "resultdata" },{ name: "sharedFile" }]),
  async (req, res) => {
    const filePairId = req.params.filePairId; 
    const { entity, status,sharedFileEmail } = req.body;
    const files = req.files;
    
    try {
      if (!filePairId) {
        return res.status(422).json({ error: "File Pair ID is required" });
      }

      const user = await FilePairModel.findOne({ "filePairs.filePairId": filePairId });
      if (!user) {
        return res.status(404).json({ error: "File pair not found" });
      }

      // Find the file pair within the user's filePairs array
      const filePair = user.filePairs.find(pair => pair.filePairId === filePairId);
      if (!filePair) {
        return res.status(404).json({ error: "File pair not found" });
      }

      // Update entity and status if provided
      if (entity) {
        filePair.entity = entity;
      }
      if (status) {
        filePair.status = status;
      }

      if (sharedFileEmail) {
        filePair.sharedFileEmailsData.push(sharedFileEmail); 
      }
      
      // Handle file uploads if provided
      if (files["inputFile"]) {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          files["inputFile"][0].path,
          { resource_type: "raw" }
        );
        filePair.inputFile = cloudinaryResponse.secure_url;
      }

      if (files["sharedFile"]) {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          files["sharedFile"][0].path,
          { resource_type: "raw" }
        );
        filePair.sharedFile = cloudinaryResponse.secure_url;
      }
      if (files["resultdata"]) {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          files["resultdata"][0].path,
          { resource_type: "raw" }
        );
        filePair.resultdata = cloudinaryResponse.secure_url;
      }

      // Save the updated user document
      await user.save();

      return res.status(200).json({ success: true, updatedData: filePair });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);


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
    kmm;
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
    res.status(201).json({ status: 201, validUserOne });
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});



router.get("/finduser/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await FilePairModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});




// Endpoint for storing files shareFile
router.post(
  "/shareFile",
  upload.fields([{ name: "file" }, { name: "resultdata" }, { name: "sharedFile" }]), 
  async (req, res) => {
    const { entity, status, filePairId, email, fileFromId } = req.body; 
    const files = req.files; // Uploaded files

    try {
      
      if (!files["file"] && !entity && !files["resultdata"] && !files["sharedFile"]) {
        return res.status(422).json({ error: "Fill at least one field" });
      }

      let filePairData = {}; 

      if (files["file"]) {
        const cloudinaryFileResponse = await cloudinary.uploader.upload(
          files["file"][0].path,
          { resource_type: "raw" }
        );
        filePairData.inputFile = cloudinaryFileResponse.secure_url; 
      } else {
        filePairData.inputFile = null;
      }
      
      if (files["sharedFile"]) {
        const cloudinarySharedFileResponse = await cloudinary.uploader.upload(
          files["sharedFile"][0].path,
          { resource_type: "raw" }
        );
        filePairData.sharedFile = {
          fileFromId: fileFromId, // Corrected to access from files["sharedFile"]
          fileName: cloudinarySharedFileResponse.original_filename, // Store the original filename
          fileUrl: cloudinarySharedFileResponse.secure_url // Store the secure URL
        }; 
      } else {
        filePairData.sharedFile = null;
      }

      if (files["resultdata"]) {
        const cloudinaryResultDataResponse = await cloudinary.uploader.upload(
          files["resultdata"][0].path,
          { resource_type: "raw" }
        );
        filePairData.resultdata = cloudinaryResultDataResponse.secure_url; 
      } else {
        filePairData.resultdata = null; 
      }

      if (filePairId) {
        filePairData.filePairId = filePairId;
      } else {
        console.log("File Pair ID is required");
      }

      filePairData.entity = entity || null;
      filePairData.status = status || null;

      const user = await FilePairModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create a new file pair using filePairData
      const filePair = user.filePairs.create(filePairData);

      // Push the new file pair data to the user's filePairs array
      user.filePairs.push(filePairData);
      
      // Save the updated user document
      await user.save();

      res.status(200).json({ message: "File pair saved successfully", filePair: filePair });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);



module.exports = router;

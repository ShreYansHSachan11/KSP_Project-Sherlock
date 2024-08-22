const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const DB = "mongodb+srv://saurabhrajput30072002:hQ3D5bHX8YZ8TUFL@studentdata.kv8ukp1.mongodb.net/sherlock?retryWrites=true&w=majority"


mongoose.connect(DB,{useUnifiedTopology:true,
useNewUrlParser:true}).then(()=>console.log("database connected")).catch((error)=>{console.log(error);})

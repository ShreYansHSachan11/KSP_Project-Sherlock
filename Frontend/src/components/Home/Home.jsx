import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, useNavigate } from 'react-router-dom';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import Contact from '../../contact';
import About from '../../about';
import Price from '../../price';
import Services from '../ResultPage';
import Upload from '../fileuploader/upload';
// import Apitester from '../apitester';
import ResultPage from '../ResultPage';
import Analysis from '../../analysisPage'
import Dashboard from '../../dashboard'
import Register from '../../register'
import Login from '../../login'
import FileData from '../../fileData'
import Deanonymize from '../../deanonymze'

const Home = () => {
//   const navigate = useNavigate();
//   const [text, setText] = useState("");
//   const [image, setImage] = useState(null);
//   const [myid, setMyid] = useState("");

//   const handleTextChange = (e) => {
//     setText(e.target.value);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setImage(file);
//   };

//   function handlingText() {
    
//     const handleTextSubmit = async () => {
//       console.log("Handling text...");
//       try {
//         const response = await axios.post(
//           "https://sherlock-backend-4.onrender.com/filedata",
//           {
//             textdata: "text",
//             file: "",
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               accept: "application/json",
//             },
//           }
//         );

//         setMyid(response.data.data._id);
//       } catch (error) {
//         console.error("Error:", error);
//         alert("An error occurred. Please try again later.");
//       }
//     };

//     const postingtexttoML = async () => {
//       try {
//         const response = await axios.post(
//           "http://192.168.29.234:8000/text",
//           { text },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               accept: "application/json",
//             },
//           }
//         );
//       } catch (error) {
//         console.error("Error:", error);
//         alert("An error occurred. Please try again later.");
//       }
//     };

//     handleTextSubmit(); 
//   postingtexttoML();
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(
//           `https://sherlock-backend-4.onrender.com/filedata/${myid}`
//         );
//         console.log(response);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     if (myid !== "") {
//       fetchData();
//     }
//   }, [myid]);

// function handlingImage()
// {
//   const handleImageSubmit = async () => {
//     try {
//       let formData = new FormData();
//       formData.append("file", image, "photo_2024-03-17_04-58-40.jpg");
//       formData.append("textdata", "");
//       const response = await axios.post(
//         "https://sherlock-backend-4.onrender.com/filedata",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             accept: "application/json",
//           },
//         }
//       );
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error:", error);
//       alert("An error occurred. Please try again later.");
//     }
//   };

//   const postingimagetoML = async () => {
//     try {
//       let formData = new FormData();
//       formData.append("file", image, "photo_2024-03-17_04-58-40.jpg");
//       const response = await axios.post(
//         "http://192.168.29.234:8000/image",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             accept: "application/json",
//           },
//         }
//       );
//       console.log(response.data);
//       navigate("/analysis", {
//         state: { originalData: { text, image }, anonymizedData: response.data },
//       });
//     } catch (error) {
//       console.error("Error:", error);
//       alert("An error occurred. Please try again later.");
//     }
//   };

//   handleImageSubmit();
//   postingimagetoML();

// }

  return (
    <>
      <div className="homepage">
        <Navbar />
        <Routes>
          {/* <Route path="/" element={<Price />} /> */}
          <Route path="/analyze" element={<About />} />
          <Route path="/anonymize" element={<Price />} />
          <Route path="/help" element={<Services />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fileData" element={<FileData />} />
          <Route path="/deanonymize" element={<Deanonymize/>} />

          
        </Routes>
        {/* <div className="homepage-container">
    <div className="input-sections">
      <div className="input-section">
        <textarea
          className="text-area"
          value={text}
          onChange={handleTextChange}
          disabled={image !== null}
        />
        <button className="btn1" onClick={handlingText} disabled={!text || image}>
          Submit Text
        </button>
      </div>

      <div className="input-section">
        <input
          className="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={text.trim() !== ""}
        />
        <button className="btn1" onClick={handlingImage} disabled={!image || text}>
          Submit Image
        </button>
      </div>
    </div>
  </div> */}
      </div>
    </>
  );
};

export default Home;

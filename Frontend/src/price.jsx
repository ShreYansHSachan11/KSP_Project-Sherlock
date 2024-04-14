import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lottie from "lottie-web";
import uploadFile from "./assets/upload.json";
import loader from "./assets/analyzing.json";
import { FileUploader } from "react-drag-drop-files";
import "./price.css";

const fileTypes = ["JPG"];

function Homepage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [filepairid, setFilepairid] = useState("");
  const [proceedActive, setProceedActive] = useState(false);
  const [fileObject, setFileObject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');
  const dummyTexts = [
    'Fetching data',
    'Preparing content',
    'Analyzing information',
    'Loading assets',
    'Processing request'
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingText(prevText => {
        const currentIndex = dummyTexts.indexOf(prevText);
        if (currentIndex === dummyTexts.length - 1) {
          return dummyTexts[0];
        } else {
          return dummyTexts[currentIndex + 1];
        }
      });
    }, 1000); // Change text every 1000 milliseconds

    // Clean up by clearing the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    setProceedActive(e.target.value !== "" || image !== null);

    generateRandomId();

  };

  const convertTextToFile = () => {
    // console.log("Text content:", text);
    const file = new File([text], "textFile.txt", { type: "text/plain" });
    // console.log("File object:", file);
    setFileObject(file);
    
  };

  const generateRandomId = () => {
    const randomId = Math.floor(Math.random() * 9000000000) + 1000000000; // Generate a random 10-digit number
    localStorage.setItem('id', randomId.toString()); // Convert the number to a string and store it in localStorage
  };
  
  
  useEffect(() => {
    localStorage.setItem('inputFile', text);
    convertTextToFile();
  }, [text]);

  

  const handleChange = (file) => {
    setImage(file);
    setProceedActive(file !== "" || text !== "");
    generateRandomId();
  };

  React.useEffect(() => {
    const animationContainer = document.querySelector("#uploadFile");

    if (animationContainer && !animationContainer.querySelector("svg")) {
      lottie.loadAnimation({
        container: animationContainer,

        autoplay: true,
        animationData: { ...uploadFile },
      });
    }
  }, []);

  React.useEffect(() => {
    const animationContainer = document.querySelector("#loader");

    if (animationContainer && !animationContainer.querySelector("svg")) {
      lottie.loadAnimation({
        container: animationContainer,
        autoplay: true,
        animationData: { ...loader },
      });
    }
  }, [loading]);

  const handleProceed = () => {
    setLoading(true);
    if (text !== "") {
      handlingText();
    } else {
      handlingImage();
    }
  };



  function handlingText() {
    const handleTextSubmit = async () => {
      const id = sessionStorage.getItem("id");
      const filepairid = localStorage.getItem('id');
      try {
        const formData = new FormData();
        // formData.append("entity", "hello");
        formData.append("status", "Uploaded");
        formData.append('filePairId', filepairid); 
        formData.append("userId", id);
        formData.append("file", fileObject);
        // formData.append("file", fileObject);
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_API_KEY}/filedata`,
          formData,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
        setLoading(false);
        console.log("storing in local",response.data.filePairId);
        localStorage.setItem('filepairid', response.data.filePairId);
        setFilepairid(response.data.filePairId);
        console.log(response);
        navigate("/analysis", {
          state: {
            originalData: { text, image },
            anonymizedData: response.data,
            filepairid: response.data.filePairId,
          },
        });
  
      } catch (error) {
        setLoading(false);
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    };


   
    const postingtexttoML = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_ML_API_KEY}/text`,
          { text },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
          }
        );
        setTimeout(() => {
          setLoading(false);

          navigate("/analysis", {
            state: {
              originalData: { text, image },
              anonymizedData: response.data,
            },
          });
        }, 5000);
      } catch (error) {
        setLoading(false);
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    };

    handleTextSubmit();
    postingtexttoML();
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_REACT_APP_BACKEND_API_KEY}/filedata/${myid}`
  //       );
  //       console.log(response);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   if (myid !== "") {
  //     fetchData();
  //   }
  // }, [myid]);

  function handlingImage() {
    const handleImageSubmit = async () => {
      const id = sessionStorage.getItem("id");
      const filepairid = localStorage.getItem('id');
      try {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("userId", id);
        formData.append('filePairId', filepairid); 
        formData.append("status", "Uploaded");
        // formData.append("textdata", "");
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_API_KEY}/filedata`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              accept: "application/json",
            },
          }
        );
        localStorage.setItem('filepairid', response.data.filePairId);
          
        navigate("/analysis", {
          state: {
            originalData: { text, image },
            anonymizedData: response.data,
            filepairid: response.data.filePairId,
          },
        });
      } catch (error) {
        console.error("Error:", error);
        // alert("An error occurred. Please try again later.");
      }
    };

    const postingtexttoML = async (text) => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_ML_API_KEY}/text`,
          { text },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
          }
        );
        setTimeout(() => {
          setLoading(false);

          navigate("/analysis", {
            state: { originalData: { text }, anonymizedData: response.data },
          });
        }, 1000);
      } catch (error) {
        setLoading(false);
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    };

    const postingimagetoML = async () => {
      try {
        const formData = new FormData();
        formData.append("file", image);
        console.log(image);
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_ML_API_KEY}/i2t`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              accept: "application/json",
            },
          }
        );

        const imageText = response.data;
        localStorage.setItem('inputFile', imageText);
        postingtexttoML(imageText);
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    };
    handleImageSubmit();
    postingimagetoML();
  }

  return (
    <div className="homepage-container">
      <div className="homepage-container-content">
        <h3>ANONYMIZER</h3>
        <div className="input-sections">
          <div className="input-section">
            <textarea
              className="text-area"
              value={text}
              onChange={handleTextChange}
              disabled={image !== null}
              placeholder="Enter Text Here"
            />
          </div>
          <h6>OR</h6>
          <div className="input-section">
            <div id="uploadFile" style={{ width: 280, height: 280 }} />
            <FileUploader
              handleChange={handleChange}
              name="file"
              className="drop_area drop_zone"
              types={fileTypes}
              label="Upload or Drag & drop files"
            />
          </div>
        </div>
        {loading ? (
          <><div className="loaderContainer">
          <div id="loader" style={{ width: 140, height: 100 }} />
          <p style={{color:"black"}}>{loadingText}</p></div></>
          
        ) : (
          <button
            className="btn1"
            onClick={handleProceed}
            disabled={!proceedActive}
          >
            PROCEED
          </button>
        )}
      </div>
    </div>
  );
}

export default Homepage;

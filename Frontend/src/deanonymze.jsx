import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lottie from "lottie-web";
import uploadFile from "./assets/upload.json";
import loader from "./assets/analyzing.json";
import "./deanonymze.css";

const fileTypes = ["JPG"];

function Homepage() {
  const navigate = useNavigate();
  const inputFileContent = localStorage.getItem('inputFile');
  const outputFileContent = localStorage.getItem('outputFile');

  useEffect(() => {
    console.log(inputFileContent);
  }, [inputFileContent]);

  useEffect(() => {
    console.log(outputFileContent);
  }, [outputFileContent]);

  const [loading, setLoading] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0); // Index to track dummy text
  const dummyTexts = [
    'Fetching data',
    'Preparing content',
    'Analyzing information',
    'Loading assets',
    'Processing request'
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        // Update loading text every second
        setLoadingTextIndex(prevIndex => (prevIndex + 1) % dummyTexts.length);
      }, 1000);

      // Simulate loading completion after 5 seconds
      setTimeout(() => {
        setLoading(false);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    // Load animation when loading state changes
    if (loading) {
      const animation = lottie.loadAnimation({
        container: document.getElementById("loader"),
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: loader,
      });

      return () => animation.destroy();
    }
  }, [loading]);

  return (
    <div className="de-container">
      <div className="de-container-content">
        <h3>DE-ANONYMIZER</h3>
        <div className="input-sections">
         

        <div className="input-section">
            <h4>Original </h4>
            {outputFileContent}
         </div>
          {loading ? (
            <div className="loaderContainer">
              {/* Loader animation */}
              <div id="loader" style={{ width: 140, height: 100 }} />
              {/* Display loading text */}
              <p style={{ color: "black" }}>{dummyTexts[loadingTextIndex]}</p>
            </div>
          ) : (<>
            <div className="input-section">
              <h4>Deanonymized</h4>
              {inputFileContent}
            </div>
            <div className="buttonSection">
          <button className="btn1" >
            Back To Files
          </button>
          <button className="btn1" >
            Share
          </button>
          <button className="btn1" >
            Print
          </button>
          <button className="btn1" >
            Delete
          </button>
          </div>
            
            </>
            
          )}
         
        </div>
      </div>
    </div>
  );
}

export default Homepage;

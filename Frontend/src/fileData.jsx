import React, { useState, useEffect } from 'react';
import './fileData.css';

const FileData = () => {
  // Retrieve data from sessionStorage
  const inputFileContent = localStorage.getItem('inputFile');
  const outputFileContent = localStorage.getItem('outputFile');

  useEffect(() => {
    console.log(inputFileContent);
  }, [inputFileContent]);

  useEffect(() => {
    console.log(outputFileContent);
  }, [outputFileContent]);

  return (
    <div className="fileDataPage">
      <div className='fileDataContainer'>
        <div className="input-sections">
            
          <div className="input-section">
          <h4>Original </h4>
            {inputFileContent}
          </div>
          <div className="input-section">
          <h4>Anonymized </h4>
            {outputFileContent}
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
        </div>
      </div>
    </div>
  );
};

export default FileData;

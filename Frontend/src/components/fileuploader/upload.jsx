import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';
import './upload.css'

const Fileuploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");

  const worker = createWorker();

  const convertImageToText = useCallback(async () => {
    if(!selectedImage) return;
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(selectedImage);
    setTextResult(data.text);
  }, [worker, selectedImage]);


  const tomlmodel = useCallback(async () => {
    try {
      const response = await axios.post('https://ab54-35-229-225-98.ngrok-free.app/', {
        textResult: textResult,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }, [textResult]);

  useEffect(() => {
    convertImageToText();
    
  }, [selectedImage, convertImageToText])

  useEffect(() => {
    tomlmodel();
    
  }, [selectedImage])

  const uploadingtodatabase = async (e) => {
  if (!e.target.files[0]) {
    setSelectedImage(null);
    setTextResult("");
    return;
  }

  setSelectedImage(e.target.files[0]);

  const formData = new FormData();
  formData.append("name", "saurabh rajput");
  formData.append("file", e.target.files[0]);
  formData.append("textdata", "hello good value ");

  try {
    const response = await axios.post("https://sherlock-backend-4.onrender.com/filedata", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}


  return (
    <div className="Dropbox">
      
     
      <div className="input-wrapper">
        <label htmlFor="upload">Upload Image</label>
        <input type="file" id="upload" accept='image/*' onChange={uploadingtodatabase} />
      </div>

      <div className="result">
        {selectedImage && (
          <div className="box-image">
            <img src={URL.createObjectURL(selectedImage)} alt="thumb" />
          </div>
        )}
        {textResult && (
          <div className="box-p">
            <p>{textResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Fileuploader;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './analysisPage.css';


const AdvancedAnalytics = ({ analyticsData }) => {
  return (
    <div className="advanced-analytics">
      <h2>Advanced Analytics</h2>
      <div className="analytics-data">
        {analyticsData.map((entity, index) => (
          <div key={index} className="entity">
            <p><strong>Entity Type:</strong> {entity.entity_type}</p>
            <p><strong>Recognizer Name:</strong> {entity.recognition_metadata?.recognizer_name}</p>
            <p><strong>Score:</strong> {entity.score}</p>
            <p><strong>Start:</strong> {entity.start}</p>
            <p><strong>End:</strong> {entity.end}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


function highlightEntities(text, entities, visibleEntities) {
  if (!Array.isArray(entities)) {
    console.error("Entities is not an array.");
    return text;
  }

  let highlightedText = text;

  entities.forEach(entity => {
    const { start, end, entity_type } = entity;
    const isActive = visibleEntities.includes(entity_type);

    if (isActive) {
      const entityText = text.substring(start, end);
      const regex = new RegExp(escapeRegExp(entityText), 'g');
      highlightedText = highlightedText.replace(regex, `<span class="highlighted">${entityText}</span>`);
    }
  });

  return highlightedText;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function AnalysisPage() {
  const location = useLocation();
  const { state } = location;
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [fileObject, setFileObject] = useState(null);

  const [visibleEntities, setVisibleEntities] = useState([]);
  const [anonymizedContent, setAnonymizedContent] = useState(<p>No anonymized data received</p>);
  const [selectedOption, setSelectedOption] = useState('');
  const [responseText, setResponseText] = useState('');
  const [entityMapping, setEntityMapping] = useState('');
  const [filepair, setFilepair] = useState('');
  

  

  const convertTextToFile = () => {
   
    const file = new File([responseText], `anonymizedFile.txt`, { type: "text/plain" });
    console.log("File object:", file);
    setFileObject(file);
    
  };


  useEffect(() => {
    localStorage.setItem('outputFile', responseText);
    convertTextToFile();
  }, [responseText]);



  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    // console.log(selectedOption);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert('Please choose an anonymization type.');
      return; 
    }
    
    try {
      const data = {
        text: state.originalData.text,
        entities: visibleEntities,
        type: selectedOption
      };
      const response = await axios.post('https://amanetize-sherlock.hf.space/anonymize', data);  
      setResponseText(response.data.anonymized_text.text);
      setAnalyticsData(response.data);
      console.log(response.data.entity_mapping);
      const stringifiedEntityMapping = JSON.stringify(response.data.entity_mapping);
      setEntityMapping(stringifiedEntityMapping); 
      
    } catch (error) {
      console.error('Error:', error);
     
    }
  };

  const updateFilePair = async () => {
    if(!entityMapping || !fileObject ) return;
     
    try {
      const formData = new FormData();
      formData.append("entity", entityMapping);
      formData.append("status", "anonymized");
      formData.append('resultdata', fileObject);
      const id = localStorage.getItem('id');
      
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_API_KEY}/update/filepair/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
              
          },
          timeout: 10000
        }
      );
  
      // Handle response if needed
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  };
  
  // useEffect(() => {
  //   updateFilePair();
  // }, [entityMapping]);


  useEffect(() => {
    if (state && state.anonymizedData) {
      const { text } = state.originalData;
      const anonymizedText = highlightEntities(text, state.anonymizedData, visibleEntities);
      setAnonymizedContent(<div className="anonymizedDataField" dangerouslySetInnerHTML={{ __html: anonymizedText }}></div>);
    }
  }, [state, visibleEntities]);

  const handleToggleEntity = (entity) => {
    console.log("Toggling entity:", entity);
    setVisibleEntities(prevVisibleEntities =>
      prevVisibleEntities.includes(entity)
        ? prevVisibleEntities.filter(item => item !== entity)
        : [...prevVisibleEntities, entity]
    );
  };

  let originalContent;
  if (state && state.originalData) {
    const text = state.originalData;
    originalContent = (
      <div>
        {text && <p>{text}</p>}
      </div>
    );
  } else {
    originalContent = <p>No original data received</p>;
  }

  let uniqueEntities = [];
  if (state && state.anonymizedData && Array.isArray(state.anonymizedData)) {
    uniqueEntities = Array.from(new Set(state.anonymizedData.map(entity => entity.entity_type)));
  }

  useEffect(() => {
    if (uniqueEntities.length > 0) {
      setVisibleEntities(uniqueEntities);
    }
  }, []);
  console.log("Visible entities:", visibleEntities);

  return (
    <div className="analysisPage">
    
      {responseText ? (
        
        <div className='finalResult'>
          <div className="finaltext">
          {responseText}
          </div>
          
          <div className="finalResult-buttons">
          <button className="btn1" >
          Save
        </button>

        <button className="btn1" >
          Print
        </button>
          </div>

          
        </div> 
        
      ) : (
        <>
          <h3>ANONYMIZER</h3>
          <div className="analysisPageSections">
            <div className="analysisPage-leftSection">
              <div className="dataBoxes">
                {/* <div className="originalData box">
                  <h3>Original Data</h3>
                  <div className="originalDataField">{originalContent}</div>
                </div> */}
                {/* <h3>Anonymized Data</h3> */}
                <div className="anonymizedData box">
                  {anonymizedContent}
                </div>
              </div>
            </div>
            <div className="analysisPage-rightSection">
              <div className="entitiesList">
                <div className="entitiesHeader">
                  <h6>Choose Entities to Anonymize</h6>
                </div>
                <div className="entitiesScrollBar">
                  <div className="entityButtonsContainer">
                    
                    {uniqueEntities.map(entity => (
                      <button
                        key={entity}
                        onClick={() => handleToggleEntity(entity)}
                        className={`entityButton ${visibleEntities.includes(entity) ? 'active' : ''}`}
                      >
                        {entity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="anonymizedButtons">
                <select
                  name="anonymizationType"
                  id="anonymizationType"
                  value={selectedOption}
                  onChange={handleOptionChange}
                  required
                  // defaultValue="replace"
                >
                  <option value="" disabled>Choose Anonymization Type</option>
                  <option value="replace">Replace</option>
                  <option value="redact">Redact</option>
                  <option value="hash">Hash</option>
                  <option value="faker">Faker</option>
                </select>
              </div>
            </div>
          </div>
          <button className="btn1" onClick={handleSubmit}>
            SUBMIT
          </button>
          <button className="btn-analytics" onClick={AdvancedAnalytics}>Advanced analytics</button>
          </>
      )}
    {analyticsData.length > 0 && <AdvancedAnalytics analyticsData={analyticsData} />}
    </div>
  );
}
export default AnalysisPage;

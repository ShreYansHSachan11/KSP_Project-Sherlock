import React from 'react';
import { useLocation } from 'react-router-dom';

const ResultPage = () => {
  const location = useLocation();
  const inputText = location.state?.inputText || '';

  return (
    <div>
      <h1>Result Page</h1>
      <p>Input Text: {inputText}</p>
    </div>
  );
}

export default ResultPage;

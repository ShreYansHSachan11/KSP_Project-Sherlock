import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './dashboard.css'
import Card from './components/card/card';
import Card1 from './components/card/card1';
const dashboard = () => {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');
    useEffect(() => {
        const handleBackButton = () => {
          // Navigate to the home page when clicking the browser's back button
          navigate('/');
        };
    
        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handleBackButton);
    
        // Clean up the event listener
        return () => {
          window.removeEventListener('popstate', handleBackButton);
        };
      }, [navigate]);

    const fileData = [
        {
          filename: 'Start.txt',
          status: 'Uploaded',
          shared: 'none',
          lastModified: '2024-04-14'
        },
      ];

      const recievedfileData = [
        {
          filename: 'Response.txt',
          status: 'Anonymized',
          shared: 'forensic',
          lastModified: '2024-04-13'
        },
      ];


  return (
    <div className='dashboardPage'>
        <div className="dashboardContent">

        
        <div className="dashboardHeader">
            <h3>Hi,&nbsp;&nbsp;&nbsp;{username} </h3>
            <button className='dashButton'>
                +Add New
            </button>
        </div>

        <div className="dashboardPage-fileContainer">
            <h5>
                Your Files
            </h5>
            <div className="dashboardPage-fileContainer-box">
                <div className="boxHeader">
                   <p>Name</p>
                <p>Shared</p>
                <p>Status</p>
                <p>Last Modified</p> 
                </div>
                <div className="boxData">
                <Card fileData={fileData} />
                </div>
            </div>

        </div>

        <div className="dashboardPage-fileContainer">
            <h5>
                Recieved Files
            </h5>
            <div className="dashboardPage-fileContainer-box">
                <div className="boxHeader">
                <p>Name</p>
                <p>Recieved From</p>
                <p>Status</p>
                <p>Last Modified</p> 
                </div>
                <div className="boxData">
                <Card1 fileData={recievedfileData} />
                </div>
            </div>

        </div>

        </div>
    </div>
  )
}

export default dashboard
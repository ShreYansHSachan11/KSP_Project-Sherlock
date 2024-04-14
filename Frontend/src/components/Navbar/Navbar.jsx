import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router,NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/folder.png'
import upload from '../../assets/upload.png'
import user from '../../assets/user.png'
import search from '../../assets/search.png'

const Navbar = () => {
  const navigate= useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
    
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username'); 
    if (token) {
   
      setIsLoggedIn(true);
      setUserName(username); 
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  }, []);
  
  const handleSignIn = () => {
    if (isLoggedIn) {
  
      alert('You are already logged in!');
    } else {
   
      navigate('/register');
    }
  };

  return (
  <>                     
                <div className='navbar'>
                    <div className="navbar-left">
                       
                        <h2 style={{color:"grey"}}>HIDE</h2>
                    </div>
                    <div className="navbar-center">

                    <div style={{ margin: "10px" }}>
                        <NavLink
                             to="/"
                            style={({ isActive }) => ({
                                color: isActive
                                    ? "grey"
                                    : "black",
                            })}
                        >
                            Home
                        </NavLink>
                    </div>

                   
                    <div style={{ margin: "10px" }}>
                        <NavLink
                            to="/anonymize"
                            style={({ isActive }) => ({
                                color: isActive
                                    ? "grey"
                                    : "black",
                            })}
                        >
                            Anonymize
                        </NavLink>
                    </div>
                    <div style={{ margin: "10px" }}>
                        <NavLink
                            to="/deanonymize"
                            style={({ isActive }) => ({
                                color: isActive
                                    ? "grey"
                                    : "black",
                            })}
                        >
                            De-Anonymize
                        </NavLink>
                    </div>

                    <div style={{ margin: "10px" }}>
                        <NavLink
                             to="/dashboard"
                            style={({ isActive }) => ({
                                color: isActive
                                    ? "grey"
                                    : "black",
                            })}
                        >
                            Dashboard
                        </NavLink>
                    </div>

                    <div style={{ margin: "10px" }}>
                        <NavLink
                            to="/guidelines"
                            style={({ isActive }) => ({
                                color: isActive
                                    ? "grey"
                                    : "black",
                            })}
                        >
                            Guidelines
                        </NavLink>
                    </div>

                   
                    </div>
                    <div className="navbar-right">
          {/* <img src={search} alt="" srcSet="" /> */}
          <input className="input-field" type="text" placeholder='Search For Anything' />
          {isLoggedIn ? (
            <button className="signin" disabled>
              {/* <img src={user} alt="" srcSet="" /> */}
              {userName}
            </button>
          ) : (
            <button className="signin" onClick={handleSignIn}>
              {/* <img src={user} alt="" srcSet="" /> */}
              Sign In
            </button>
          )}
        </div>
                </div>
                
           
  </>
  );
};

export default Navbar;

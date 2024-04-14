import React from "react";
import "./card.css";
import fileicon from "../../assets/dashboardFile.png";
import {
  BrowserRouter as Router,
  NavLink,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

const Card = ({ fileData }) => {
  return (
    <div className="card-container">
      {fileData.map((file, index) => (
        <div key={index} className="card">
          <p>
            {" "}
            <img src={fileicon} alt="" />
            <NavLink
              to="/fileData"
              style={({ isActive }) => ({
                color: isActive ? "grey" : "black",
              })}
            >
              {file.filename}
            </NavLink>
          </p>
          <p>{file.shared}</p>
          <p>{file.status}</p>
          <p>{file.lastModified}</p>
        </div>
      ))}
    </div>
  );
};

export default Card;

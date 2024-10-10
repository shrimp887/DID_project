import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CheckVehiclePage from "./components/Check_Vehicle_Page";
import RegisterVehiclePage from "./components/Register_Vehicle_Page";
import RequestAuthenticationPage from "./components/Request_Authentication_Page";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app">
        <h1>자율 주행 차량 인증 DApp</h1>
        <nav>
          <ul>
            <li>
              <Link to="/register">차량 등록</Link>
            </li>
            <li>
              <Link to="/check">차량 등록 확인</Link>
            </li>
            <li>
              <Link to="/request-authentication">인증 요청</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/register" element={<RegisterVehiclePage />} />
          <Route path="/check" element={<CheckVehiclePage />} />
          <Route
            path="/request-authentication"
            element={<RequestAuthenticationPage />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

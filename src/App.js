import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from "web3";
import CheckVehiclePage from "./components/Check_Vehicle_Page";
import RegisterVehiclePage from "./components/Register_Vehicle_Page";
import RequestAuthenticationPage from "./components/Request_Authentication_Page";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(""); // 사용자의 계정 상태
  const [web3, setWeb3] = useState(null); // Web3 인스턴스 상태
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          // MetaMask 연결 요청
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]); // 첫 번째 계정을 상태에 저장
          setWeb3(web3Instance); // Web3 인스턴스를 상태에 저장
          console.log("MetaMask 연결 성공");
        } catch (error) {
          setErrorMessage("MetaMask 연결을 거부하였습니다. 다시 시도하세요.");
          console.error("MetaMask 연결 실패:", error);
        }
      } else {
        // MetaMask가 설치되지 않았을 때의 처리
        setErrorMessage(
          "MetaMask가 설치되지 않았습니다. MetaMask를 설치하세요."
        );
        console.error("MetaMask가 설치되지 않았습니다.");
      }
    };

    loadWeb3(); // 컴포넌트가 마운트될 때 Web3 로드
  }, []);

  return (
    <Router>
      <div className="app">
        <h1>자율 주행 차량 인증 DApp</h1>
        {/* MetaMask 연결 상태 표시 */}
        {account ? (
          <p>MetaMask 연결된 계정: {account}</p>
        ) : (
          <p style={{ color: "red" }}>
            {errorMessage || "MetaMask 연결을 시도 중입니다..."}
          </p>
        )}

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

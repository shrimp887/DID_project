import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from "web3";
import contractABI from "./abis/AutonomousVehicleDID.json";
import CheckVehiclePage from "./components/Check_Vehicle_Page";
import RegisterVehiclePage from "./components/Register_Vehicle_Page";
import RequestAuthenticationPage from "./components/Request_Authentication_Page";
import Modal from "./components/Receive_Modal";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(""); // 사용자의 계정 상태
  const [web3, setWeb3] = useState(null); // Web3 인스턴스 상태
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태
  const [showModal, setShowModal] = useState(false); // 모달 표시 상태
  const [requestDetails, setRequestDetails] = useState(null); // 요청 세부정보
  const [requestResult, setRequestResult] = useState(""); // 요청 결과 상태
  const [connectedVehicle, setConnectedVehicle] =
    useState("연결된 차량이 없습니다."); // 연결된 차량 상태

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
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
        setErrorMessage(
          "MetaMask가 설치되지 않았습니다. MetaMask를 설치하세요."
        );
        console.error("MetaMask가 설치되지 않았습니다.");
      }
    };

    loadWeb3(); // 컴포넌트가 마운트될 때 Web3 로드
  }, []);

  useEffect(() => {
    if (web3 && account) {
      const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // 인증 요청 리스너 추가
      contract.events.AuthenticationRequested(
        { filter: { receiver: account }, fromBlock: "latest" }, // receiver를 통해 요청 수신자 필터링
        (error, event) => {
          if (error) {
            console.error("이벤트 리스닝 오류:", error);
            return;
          }
          const { vehicleNumber } = event.returnValues;
          setRequestDetails({ vehicleNumber });
          setShowModal(true); // 모달 표시
        }
      );
    }
  }, [web3, account]);

  const handleAccept = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    await contract.methods
      .acceptAuthentication(requestDetails.vehicleNumber)
      .send({ from: account });

    setRequestResult("인증 요청이 수락되었습니다."); // 수락 메시지 설정
    setConnectedVehicle(`${requestDetails.vehicleNumber} 연결 중...`); // 연결된 차량 업데이트
    setShowModal(false);
  };

  const handleReject = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    await contract.methods
      .rejectAuthentication(requestDetails.vehicleNumber)
      .send({ from: account });

    setRequestResult("인증 요청이 거절되었습니다."); // 거절 메시지 설정
    setShowModal(false);
  };

  const handleDisconnect = () => {
    setConnectedVehicle("연결된 차량이 없습니다."); // 연결 해제
  };

  return (
    <Router>
      <div className="app">
        <h1>자율 주행 차량 인증 DApp</h1>
        {account ? (
          <div>
            <p>MetaMask 연결된 계정: {account}</p>
            <p>{connectedVehicle}</p>
            {connectedVehicle !== "연결된 차량이 없습니다." && (
              <button onClick={handleDisconnect}>연결 끊기</button> // 연결된 차량이 있는 경우에만 버튼 표시
            )}
          </div>
        ) : (
          <p style={{ color: "red" }}>
            {errorMessage || "MetaMask 연결을 시도 중입니다..."}
          </p>
        )}

        <nav>
          <ul>
            <li>
              <Link to="/DID_project/register">차량 등록</Link>
            </li>
            <li>
              <Link to="/DID_project/check">차량 등록 확인</Link>
            </li>
            <li>
              <Link to="/DID_project/request-authentication">인증 요청</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route
            path="/DID_project/register"
            element={<RegisterVehiclePage />}
          />
          <Route path="/DID_project/check" element={<CheckVehiclePage />} />
          <Route
            path="/DID_project/request-authentication"
            element={<RequestAuthenticationPage />}
          />
        </Routes>

        {/* 모달 표시 */}
        {showModal && (
          <Modal
            vehicleNumber={requestDetails?.vehicleNumber}
            onAccept={handleAccept}
            onReject={handleReject}
            requestResult={requestResult} // 요청 결과 전달
          />
        )}
      </div>
    </Router>
  );
};

export default App;

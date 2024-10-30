import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from "web3";
import contractABI from "./abis/AutonomousVehicleDID.json";
import CheckVehiclePage from "./components/Check_Vehicle_Page";
import RegisterVehiclePage from "./components/Register_Vehicle_Page";
import RequestAuthenticationPage from "./components/Request_Authentication_Page";
import LogAuthenticationPage from "./components/Log_Authentication_Page";
import Modal from "./components/Receive_Modal";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [requestResult, setRequestResult] = useState("");
  const [connectedVehicle, setConnectedVehicle] =
    useState("연결된 차량이 없습니다.");

  // Web3 및 MetaMask 계정 연결
  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          setWeb3(web3Instance);
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

    loadWeb3();
  }, []);

  // 인증 요청 이벤트 리스너 설정
  useEffect(() => {
    if (web3 && account) {
      const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      console.log("이벤트 리스너 설정 중...");

      // 인증 요청 리스너 추가
      contract.events.AuthenticationRequested(
        {
          filter: { receiver: account },
          fromBlock: "latest",
        },
        async (error, event) => {
          if (error) {
            console.error("이벤트 리스닝 오류:", error);
            return;
          }

          console.log("인증 요청 이벤트 수신:", event);

          const { requester } = event.returnValues;

          // 요청자의 차량 번호 가져오기
          const vehicleNumber = await getVehicleNumberByRequester(requester);

          // 요청 세부 정보와 차량 번호 설정
          setRequestDetails({ vehicleNumber, requester });
          setShowModal(true);
        }
      );
    }
  }, [web3, account]);

  // 요청자의 차량 번호를 조회하는 함수
  const getVehicleNumberByRequester = async (requesterAddress) => {
    const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const vehicle = await contract.methods.vehicles(requesterAddress).call();
    return vehicle.vehicleNumber;
  };

  // 인증 요청 수락 함수
  const handleAccept = async () => {
    const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    await contract.methods
      .acceptAuthentication(requestDetails.vehicleNumber)
      .send({ from: account });

    setRequestResult("인증 요청이 수락되었습니다.");
    setConnectedVehicle(`${requestDetails.vehicleNumber} 연결 중...`);
    setShowModal(false);
  };

  // 인증 요청 거부 함수
  const handleReject = async () => {
    const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    await contract.methods
      .rejectAuthentication(requestDetails.vehicleNumber)
      .send({ from: account });

    setRequestResult("인증 요청이 거절되었습니다.");
    setShowModal(false);
  };

  // 연결 끊기 함수
  const handleDisconnect = () => {
    setConnectedVehicle("연결된 차량이 없습니다.");
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
              <button onClick={handleDisconnect}>연결 끊기</button>
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
            <li>
              <Link to="/DID_project/logs">인증 요청 로그</Link>
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
          <Route path="/DID_project/logs" element={<LogAuthenticationPage />} />
        </Routes>

        {/* 모달 표시 */}
        {showModal && (
          <Modal
            message={`차량 ${requestDetails.vehicleNumber}가 인증 요청을 보냈습니다.`}
            onAccept={handleAccept}
            onReject={handleReject}
            requestResult={requestResult}
          />
        )}
      </div>
    </Router>
  );
};

export default App;

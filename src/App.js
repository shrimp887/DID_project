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
  const [contract, setContract] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const contractAddress = "0x914db93fbdb6e145c089029e015bbbd8a5bd5664";

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          setWeb3(web3Instance);
          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );
          setContract(contractInstance);
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

  // 폴링 방식으로 인증 요청 이벤트 확인
  useEffect(() => {
    const fetchEvents = async () => {
      if (contract && account) {
        try {
          const events = await contract.getPastEvents(
            "AuthenticationRequested",
            {
              fromBlock: "latest",
            }
          );

          for (const event of events) {
            const {
              vehicleNumber: requesterVehicle,
              requester,
              receiver,
            } = event.returnValues;

            if (receiver.toLowerCase() === account.toLowerCase()) {
              const requesterVehicleInfo = await contract.methods
                .getVehicleByNumber(requesterVehicle)
                .call();

              setRequestDetails({
                vehicleNumber: requesterVehicleInfo[2],
                requester,
              });
              setShowModal(true);
            }
          }
        } catch (error) {
          console.error("이벤트 가져오기 오류:", error);
        }
      }
    };

    const intervalId = setInterval(fetchEvents, 1000);
    return () => clearInterval(intervalId);
  }, [contract, account]);

  // 인증 결과 폴링 방식 확인
  useEffect(() => {
    const pollForAuthenticationResult = async () => {
      if (contract && account) {
        try {
          const events = await contract.getPastEvents(
            "AuthenticationVerified",
            {
              filter: { requester: account },
              fromBlock: "latest",
            }
          );

          for (const event of events) {
            const { vehicleNumber, success, receiver } = event.returnValues;
            const receiverVehicleInfo = await contract.methods
              .getVehicleByNumber(vehicleNumber)
              .call();

            setResultModalMessage(
              success
                ? `${receiverVehicleInfo[2]} 차량과 인증되었습니다.`
                : `${receiverVehicleInfo[2]} 차량이 인증을 거절했습니다.`
            );
          }
        } catch (error) {
          console.error("이벤트 가져오기 오류:", error);
        }
      }
    };

    const intervalId = setInterval(pollForAuthenticationResult, 1000);
    return () => clearInterval(intervalId);
  }, [contract, account]);

  const handleAccept = async () => {
    await contract.methods
      .acceptAuthentication(requestDetails.vehicleNumber)
      .send({ from: account });

    setShowModal(false);
  };

  const handleReject = async () => {
    await contract.methods
      .rejectAuthentication(requestDetails.vehicleNumber)
      .send({ from: account });

    setShowModal(false);
  };

  return (
    <Router>
      <div className="app">
        <h1>자율 주행 차량 인증 DApp</h1>
        {account ? (
          <div>
            <p>MetaMask에 연결됨</p>
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
          <Route path="/DID_project" exact element={<HomePage />} />
        </Routes>

        {/* 인증 요청 수신 모달 */}
        {showModal && (
          <Modal
            title="인증 요청"
            message={`${requestDetails?.vehicleNumber} 차량으로부터 인증 요청이 도착했습니다.`}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {/* 인증 결과 모달 */}
        {resultModalMessage && (
          <Modal
            title="인증 결과"
            message={resultModalMessage}
            onClose={() => setResultModalMessage("")}
          />
        )}
      </div>
    </Router>
  );
};

const HomePage = () => <div>NSbit</div>;

export default App;

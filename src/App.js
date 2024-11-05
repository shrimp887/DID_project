import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from "web3";
import contractABI from "./abis/AutonomousVehicleDID.json";
import CheckVehiclePage from "./components/Check_Vehicle_Page";
import RegisterVehiclePage from "./components/Register_Vehicle_Page";
import RequestAuthenticationPage from "./components/Request_Authentication_Page";
import LogAuthenticationPage from "./components/Log_Authentication_Page";
import Modal from "./components/Receive_Modal";
import logo from "./assets/nsbit_icon.png";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const contractAddress = "0x8a134b04273b4368c4aa2b8e6524eeeeea70fe52";
  const requester_number = useRef("0");

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

  const getVehicleNumberByRequester = async (requesterAddress) => {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const vehicle = await contract.methods.vehicles(requesterAddress).call();
    return vehicle.vehicleNumber;
  };

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
              did,
              vcHash,
            } = event.returnValues;

            requester_number.current = await getVehicleNumberByRequester(
              requester
            );

            if (receiver.toLowerCase() === account.toLowerCase()) {
              setRequestDetails({
                vehicleNumber: requesterVehicle,
                requester,
                did,
                vcHash,
              });
              setShowModal(true);
              break;
            }
          }
        } catch (error) {
          console.error("이벤트 가져오기 오류:", error);
        }
      }
    };

    const intervalId = setInterval(fetchEvents, 3000);
    return () => clearInterval(intervalId);
  }, [contract, account]);

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
            const ownerAddress = await contract.methods
              .vehicleOwners(vehicleNumber)
              .call();
            const receiverVehicleInfo = await contract.methods
              .vehicles(ownerAddress)
              .call();

            setResultModalMessage(
              success
                ? `${receiverVehicleInfo.vehicleNumber} 차량과 인증되었습니다.`
                : `${receiverVehicleInfo.vehicleNumber} 차량이 인증을 거절했습니다.`
            );
          }
        } catch (error) {
          console.error("이벤트 가져오기 오류:", error);
        }
      }
    };

    const intervalId = setInterval(pollForAuthenticationResult, 3000);
    return () => clearInterval(intervalId);
  }, [contract, account]);

  const handleAccept = async () => {
    try {
      const { vcHash } = requestDetails;

      if (!vcHash || vcHash === "0x") {
        setErrorMessage("VC 해시가 올바르지 않습니다.");
        return;
      }

      await contract.methods
        .acceptAuthentication(requestDetails.vehicleNumber, vcHash)
        .send({ from: account });

      setShowModal(false);
      setResultModalMessage("인증이 성공적으로 완료되었습니다.");
    } catch (error) {
      console.error("인증 수락 오류:", error);
      setErrorMessage("인증 수락 중 오류가 발생했습니다.");
    }
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
        <img src={logo} alt="NSbit Logo" className="logo" />
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
              <Link to="/DID_project/register">차량등록</Link>
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

        {showModal && (
          <Modal
            title="인증 요청"
            message={`${requester_number.current} 차량으로부터 인증 요청이 도착했습니다.`}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

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

import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";
import Modal from "./Request_Modal"; // 모달 컴포넌트 가져오기

const RequestAuthenticationPage = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [requestResult, setRequestResult] = useState(""); // 요청 결과 상태

  const validateVehicleNumber = (number) => {
    const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/;
    return vehicleNumberRegex.test(number);
  };

  const requestAuthentication = async () => {
    if (!validateVehicleNumber(vehicleNumber)) {
      setMessage("차량 번호 형식이 올바르지 않습니다. (예: 12가3456)");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);
    setRequestStatus("");
    setShowModal(false); // 초기 모달 숨김

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const vehicleInfo = await contract.methods
        .getVehicleByNumber(vehicleNumber)
        .call();

      if (!vehicleInfo[3]) {
        setMessage("해당 차량이 존재하지 않습니다.");
        setIsError(true);
        setLoading(false);
        return;
      }

      await contract.methods
        .requestAuthentication(vehicleNumber)
        .send({ from: account });

      setMessage("인증 요청이 전송되었습니다.");
      setIsError(false);
      setRequestStatus("검증 기다리는 중...");
      setShowModal(true); // 요청 성공 시 모달 표시

      // 1분 후 자동으로 요청 만료 처리
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setMessage("인증 요청이 만료되었습니다.");
        setIsError(true);
        setRequestStatus("");
        setShowModal(false); // 모달 숨기기
      }, 60000);
    } catch (error) {
      setMessage("인증 요청에 실패했습니다.");
      setIsError(true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-auth-page">
      <h2>차량 인증 요청</h2>
      <input
        type="text"
        placeholder="상대방 차량 번호 입력 (예: 12가3456)"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />
      <button onClick={requestAuthentication} disabled={loading}>
        {loading ? "인증 요청 중..." : "인증 요청"}
      </button>
      {message && <p style={{ color: isError ? "red" : "green" }}>{message}</p>}

      {showModal && (
        <Modal
          title="인증 요청 대기 중"
          message={requestStatus}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default RequestAuthenticationPage;

import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RequestAuthenticationPage = () => {
  const [vehicleNumber, setVehicleNumber] = useState(""); // 차량 번호 상태 변수
  const [message, setMessage] = useState(""); // 메시지 상태 변수
  const [isError, setIsError] = useState(false); // 에러 여부 상태 변수

  // 차량 번호 형식 검증 함수
  const validateVehicleNumber = (number) => {
    const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/; // 2~3자리 숫자 + 1글자 한글 + 4자리 숫자 형식
    return vehicleNumberRegex.test(number); // 정규식 검사 결과 반환
  };

  // 인증 요청 함수
  const requestAuthentication = async () => {
    // 차량 번호 형식이 올바른지 확인
    if (!validateVehicleNumber(vehicleNumber)) {
      setMessage("차량 번호 형식이 올바르지 않습니다. (예: 12가3456)");
      setIsError(true); // 에러 메시지 설정
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const contractAddress = "0x690c4159fe824c5fdc26907dc85a7cc2862bc21b";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      await contract.methods
        .requestAuthentication(vehicleNumber)
        .send({ from: account });
      setMessage("인증 요청이 전송되었습니다.");
      setIsError(false); // 성공 시 에러 상태 해제
    } catch (error) {
      setMessage("인증 요청에 실패했습니다.");
      setIsError(true); // 에러 메시지 설정
      console.error(error);
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
      <button onClick={requestAuthentication}>인증 요청</button>
      {message && <p style={{ color: isError ? "red" : "green" }}>{message}</p>}
    </div>
  );
};

export default RequestAuthenticationPage;

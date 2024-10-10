import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const CheckVehiclePage = () => {
  const [vehicleNumber, setVehicleNumber] = useState(""); // 차량 번호 상태 변수
  const [isRegistered, setIsRegistered] = useState(null); // 등록 여부 상태 변수
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 변수

  // 차량 번호 형식 검증 함수
  const validateVehicleNumber = (number) => {
    const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/; // 2~3자리 숫자 + 1글자 한글 + 4자리 숫자 형식
    return vehicleNumberRegex.test(number); // 정규식 검사 결과 반환
  };

  // 차량 등록 확인 함수
  const checkVehicle = async () => {
    // 차량 번호 형식이 올바른지 확인
    if (!validateVehicleNumber(vehicleNumber)) {
      setErrorMessage("차량 번호 형식이 올바르지 않습니다. (예: 12가3456)");
      setIsRegistered(null); // 등록 여부 초기화
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const contractAddress = "0x690c4159fe824c5fdc26907dc85a7cc2862bc21b";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const result = await contract.methods
        .getVehicleByNumber(vehicleNumber)
        .call();
      setIsRegistered(result[3]); // 등록 여부 확인
      setErrorMessage(""); // 성공 시 에러 메시지 제거
    } catch (error) {
      setErrorMessage("차량이 등록되지 않았습니다.");
      console.error(error);
    }
  };

  return (
    <div className="check-vehicle-page">
      <h2>내 차량 등록 확인</h2>
      <input
        type="text"
        placeholder="차량 번호 입력 (예: 12가3456)"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />
      <button onClick={checkVehicle}>확인</button>
      {isRegistered !== null && (
        <p>
          {isRegistered
            ? "차량이 등록되었습니다."
            : "차량이 등록되지 않았습니다."}
        </p>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default CheckVehiclePage;

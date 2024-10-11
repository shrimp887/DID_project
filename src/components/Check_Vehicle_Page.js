import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const CheckVehiclePage = () => {
  const [vehicleNumber, setVehicleNumber] = useState(""); // 차량 번호 상태 변수
  const [vehicleInfo, setVehicleInfo] = useState(null); // 차량 정보 상태 변수
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 변수

  // 차량 번호 형식 검증 함수
  const validateVehicleNumber = (number) => {
    const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/; // 2~3자리 숫자 + 1글자 한글 + 4자리 숫자 형식
    return vehicleNumberRegex.test(number); // 정규식 검사 결과 반환
  };

  // 차량 정보 조회 함수
  const checkVehicle = async () => {
    // 차량 번호 형식이 올바른지 확인
    if (!validateVehicleNumber(vehicleNumber)) {
      setErrorMessage("차량 번호 형식이 올바르지 않습니다. (예: 12가3456)");
      setVehicleInfo(null); // 차량 정보 초기화
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

      // 차량 정보를 설정
      setVehicleInfo({
        did: result[0],
        model: result[1],
        number: result[2],
        isRegistered: result[3],
      });
      setErrorMessage(""); // 성공 시 에러 메시지 제거
    } catch (error) {
      setErrorMessage("차량 정보를 조회할 수 없습니다.");
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

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {vehicleInfo && (
        <div>
          <h3>차량 정보</h3>
          <p>DID: {vehicleInfo.did}</p>
          <p>모델: {vehicleInfo.model}</p>
          <p>차량 번호: {vehicleInfo.number}</p>
          <p>
            등록 상태: {vehicleInfo.isRegistered ? "등록됨" : "등록되지 않음"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckVehiclePage;

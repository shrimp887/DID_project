import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RegisterVehiclePage = () => {
  const [vehicleModel, setVehicleModel] = useState(""); // 차량 모델 상태 변수
  const [vehicleNumber, setVehicleNumber] = useState(""); // 차량 번호 상태 변수
  const [successMessage, setSuccessMessage] = useState(""); // 성공 메시지 상태
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태
  const [did, setDid] = useState(""); // DID 상태 관리
  const contractAddress = "0x914db93fbdb6e145c089029e015bbbd8a5bd5664";

  // MetaMask에서 계정 정보를 불러오고 DID 설정
  useEffect(() => {
    const loadAccount = async () => {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          const generatedDid = `did:ether:${account}`;
          setDid(generatedDid); // DID 설정
        }
      } catch (error) {
        console.error("MetaMask 계정을 불러오는 데 실패했습니다.", error);
      }
    };
    loadAccount();
  }, []);

  // 차량 번호 형식 검증 함수
  const validateVehicleNumber = (number) => {
    const vehicleNumberRegex = /^[0-9]{2,3}[가-힣][0-9]{4}$/; // 2~3자리 숫자 + 1글자 한글 + 4자리 숫자 형식
    return vehicleNumberRegex.test(number); // 정규식 검사 결과 반환
  };

  // 차량 등록 함수
  const registerVehicle = async () => {
    if (!validateVehicleNumber(vehicleNumber)) {
      setErrorMessage("차량 번호 형식이 올바르지 않습니다. (예: 12가3456)");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // 입력된 DID로 등록된 차량 정보 확인
      const vehicle = await contract.methods.vehicles(account).call(); // 현재 계정의 차량 정보 가져오기
      if (vehicle.isRegistered) {
        setErrorMessage("이미 등록된 차량이 있습니다."); // 차량이 이미 등록된 경우 메시지 출력
        return;
      }

      await contract.methods
        .registerVehicle(did, vehicleModel, vehicleNumber, "공개키")
        .send({ from: account });
      setSuccessMessage("차량이 성공적으로 등록되었습니다.");
      setErrorMessage(""); // 성공 시 에러 메시지 제거
    } catch (error) {
      setErrorMessage("차량 등록에 실패했습니다.");
      setSuccessMessage(""); // 실패 시 성공 메시지 제거
      console.error(error);
    }
  };

  return (
    <div className="register-vehicle-page">
      <h2>차량 등록</h2>
      <p>YOUR DID</p>
      <p>{did || "MetaMask 계정이 없습니다"}</p> {/* DID 표시 */}
      <input
        type="text"
        placeholder="차량 모델"
        value={vehicleModel}
        onChange={(e) => setVehicleModel(e.target.value)}
      />
      <input
        type="text"
        placeholder="차량 번호 (예: 12가3456)"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />
      <button onClick={registerVehicle}>등록</button>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default RegisterVehiclePage;

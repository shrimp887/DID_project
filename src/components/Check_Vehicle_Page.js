import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const CheckVehiclePage = () => {
  const [vehicleInfo, setVehicleInfo] = useState(null); // 차량 정보 상태 변수
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 변수
  const [account, setAccount] = useState(""); // 사용자의 계정 상태 변수
  const contractAddress = "0x11752b7e7164cbabcc15cf539808cc53bef659d5";

  // 컴포넌트가 마운트될 때 사용자 계정 정보 가져오기
  useEffect(() => {
    const loadAccount = async () => {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]); // 첫 번째 계정으로 설정
        await checkVehicle(accounts[0]); // 차량 정보 조회
      } else {
        setErrorMessage("MetaMask 계정이 연결되지 않았습니다.");
      }
    };

    loadAccount(); // 계정 정보 로드
  }, []);

  // 차량 정보 조회 함수
  const checkVehicle = async (account) => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const result = await contract.methods.vehicles(account).call(); // 현재 계정의 차량 정보 가져오기

      // 차량 정보를 설정
      setVehicleInfo({
        did: result.did,
        model: result.vehicleModel,
        number: result.vehicleNumber,
        isRegistered: result.isRegistered,
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
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {vehicleInfo && vehicleInfo.isRegistered ? (
        <div>
          <h3>차량 정보</h3>
          <p>DID: {vehicleInfo.did}</p>
          <p>모델: {vehicleInfo.model}</p>
          <p>차량 번호: {vehicleInfo.number}</p>
          <p>등록 상태: 등록됨</p>
        </div>
      ) : (
        <p>등록된 차량이 없습니다.</p>
      )}
    </div>
  );
};

export default CheckVehiclePage;

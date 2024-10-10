import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const CheckVehiclePage = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isRegistered, setIsRegistered] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const checkVehicle = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const contractAddress = "0x690c4159fe824c5fdc26907dc85a7cc2862bc21b";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const result = await contract.methods
        .getVehicleByNumber(vehicleNumber)
        .call();
      setIsRegistered(result[3]); // 등록 여부 확인
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
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default CheckVehiclePage;

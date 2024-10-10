import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RequestAuthenticationPage = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [message, setMessage] = useState("");

  const requestAuthentication = async () => {
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
    } catch (error) {
      setMessage("인증 요청에 실패했습니다.");
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
      {message && <p>{message}</p>}
    </div>
  );
};

export default RequestAuthenticationPage;

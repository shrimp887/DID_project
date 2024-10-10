import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RegisterVehiclePage = () => {
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [did, setDid] = useState(""); // DID 상태 관리

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

  const registerVehicle = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const contractAddress = "0x690c4159fe824c5fdc26907dc85a7cc2862bc21b";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      await contract.methods
        .registerVehicle(did, vehicleModel, vehicleNumber, "공개키")
        .send({ from: account });
      setSuccessMessage("차량이 성공적으로 등록되었습니다.");
    } catch (error) {
      setErrorMessage("차량 등록에 실패했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="register-vehicle-page">
      <h2>차량 등록</h2>
      <p>YOUR DID</p>
      <p> {did || "MetaMask 계정이 없습니다"}</p> {/* DID 표시 */}
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
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default RegisterVehiclePage;

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RequestAuthenticationPage = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const contractAddress = "0x11752b7e7164cbabcc15cf539808cc53bef659d5";

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
      }
    };
    loadWeb3();
  }, []);

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

    try {
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
    </div>
  );
};

export default RequestAuthenticationPage;

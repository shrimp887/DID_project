import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RequestAuthenticationPage = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState("");
  const contractAddress = "0x8a134b04273b4368c4aa2b8e6524eeeeea70fe52";

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };
    loadAccount();
  }, []);

  const requestAuthentication = async () => {
    if (!vehicleNumber) {
      setMessage("차량 번호를 입력하세요.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // 스마트 컨트랙트에서 DID 및 VC 해시 가져오기
      const vehicleData = await contract.methods.vehicles(account).call();
      const { did } = vehicleData;

      const credentialData = await contract.methods.credentials(account).call();
      const {
        proof: { vcHash },
      } = credentialData;

      // 스마트 컨트랙트에 인증 요청 전송
      await contract.methods
        .requestAuthentication(vehicleNumber, did, vcHash)
        .send({ from: account });

      setMessage("인증 요청이 성공적으로 전송되었습니다.");
      setIsError(false);
    } catch (error) {
      setMessage("인증 요청에 실패했습니다.");
      setIsError(true);
      console.error("인증 요청 오류:", error);
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

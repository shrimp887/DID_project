import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const RegisterVehiclePage = () => {
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [did, setDid] = useState("");
  const [account, setAccount] = useState("");
  const contractAddress = "0x8a134b04273b4368c4aa2b8e6524eeeeea70fe52";

  useEffect(() => {
    const loadAccount = async () => {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setDid(`did:ether:${accounts[0]}`);
      }
    };
    loadAccount();
  }, []);

  const validateVehicleNumber = (number) =>
    /^[0-9]{2,3}[가-힣][0-9]{4}$/.test(number);

  // 개인 서명 요청 함수
  const getSignature = async (
    did,
    model,
    number,
    vcHash,
    account,
    expirationDate
  ) => {
    // 한국 시간으로 변환
    const expirationDateUTC = new Date(expirationDate * 1000);
    const expirationDateKST = new Date(
      expirationDateUTC.getTime() + 9 * 60 * 60 * 1000
    );

    const kstString =
      expirationDateKST.toISOString().replace("T", " ").slice(0, -5) + " KST";

    const message = `
    DID: ${did}
    Model: ${model}
    Vehicle Number: ${number}
    VC Hash: ${vcHash}
    Expiration Date: ${kstString}
  `;

    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, account],
    });

    return signature;
  };

  const registerVehicle = async () => {
    if (!validateVehicleNumber(vehicleNumber)) {
      setErrorMessage("차량 번호 형식이 올바르지 않습니다. (예: 12가3456)");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // VC 해시 생성
      const vcHash = web3.utils.keccak256(
        web3.eth.abi.encodeParameters(
          ["address", "string", "string"],
          [account, did, vehicleNumber]
        )
      );

      const expirationDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1년 후

      // VC 해시로 서명 생성
      const signature = await getSignature(
        did,
        vehicleModel,
        vehicleNumber,
        vcHash,
        account,
        expirationDate
      );

      await contract.methods
        .registerVehicle(
          did,
          vehicleModel,
          vehicleNumber,
          vcHash,
          signature,
          expirationDate
        )
        .send({ from: account });

      setSuccessMessage("차량이 성공적으로 등록되었습니다.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("차량 등록에 실패했습니다.");
      console.error("등록 오류:", error);
    }
  };

  return (
    <div className="register-vehicle-page">
      <h2>차량 등록</h2>
      <p>YOUR DID: {did || "MetaMask 계정이 없습니다"}</p>
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

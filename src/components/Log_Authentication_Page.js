import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const LogAuthenticationPage = () => {
  const [logs, setLogs] = useState([]);
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (web3 && account) {
      fetchAuthenticationLogs();
    }
  }, [web3, account]);

  // 요청한 사용자의 차량 번호를 가져오는 함수
  const getVehicleNumberByRequester = async (requesterAddress) => {
    const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // 요청자 계정에 등록된 차량 정보 가져오기
    const vehicle = await contract.methods.vehicles(requesterAddress).call();
    return vehicle.vehicleNumber;
  };

  // 인증 요청 로그를 가져오는 함수
  const fetchAuthenticationLogs = async () => {
    try {
      setLoading(true);
      const contractAddress = "0xf08034d4395a2695871b05812310a692ad3185c2";
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // "AuthenticationRequested" 이벤트를 가져와 최근 10개만 사용
      const events = await contract.getPastEvents("AuthenticationRequested", {
        filter: { receiver: account },
        fromBlock: 0,
        toBlock: "latest",
      });

      // 요청자 계정으로 차량 번호를 가져와 로그 생성
      const logsWithVehicleNumbers = await Promise.all(
        events
          .reverse()
          .slice(0, 10)
          .map(async (event) => {
            const vehicleNumber = await getVehicleNumberByRequester(
              event.returnValues.requester
            );
            return {
              vehicleNumber,
              requester: event.returnValues.requester,
              timestamp: new Date(
                event.returnValues.timestamp * 1000
              ).toLocaleString(),
            };
          })
      );

      setLogs(logsWithVehicleNumbers);
      setLoading(false);
    } catch (error) {
      console.error("로그 가져오기 실패:", error);
      setLoading(false);
    }
  };

  return (
    <div className="log-authentication-page">
      <h2>인증 요청 로그</h2>
      {loading ? (
        <p>로딩 중...</p>
      ) : logs.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>차량 번호</th>
              <th>요청자</th>
              <th>요청 시간</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.vehicleNumber}</td>
                <td>{log.requester}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>최근 인증 요청 로그가 없습니다.</p>
      )}
    </div>
  );
};

export default LogAuthenticationPage;

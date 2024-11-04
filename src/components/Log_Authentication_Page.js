import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const LogAuthenticationPage = () => {
  const [logs, setLogs] = useState([]);
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
  const contractAddress = "0x8a134b04273b4368c4aa2b8e6524eeeeea70fe52";

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

  const getVehicleNumberByRequester = async (requesterAddress) => {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const vehicle = await contract.methods.vehicles(requesterAddress).call();
    return vehicle.vehicleNumber;
  };

  const fetchAuthenticationLogs = async () => {
    try {
      setLoading(true);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const requestEvents = await contract.getPastEvents(
        "AuthenticationRequested",
        {
          filter: { receiver: account },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      const verificationEvents = await contract.getPastEvents(
        "AuthenticationVerified",
        {
          filter: { receiver: account },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      const logsWithDetails = await Promise.all(
        requestEvents
          .reverse()
          .slice(0, 10)
          .map(async (event) => {
            const vehicleNumber = await getVehicleNumberByRequester(
              event.returnValues.requester
            );
            const timestamp = parseInt(event.returnValues.timestamp, 10) * 1000;

            const formattedTimestamp = new Date(timestamp).toLocaleString(
              "ko-KR",
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }
            );

            const verification = verificationEvents.find(
              (vEvent) =>
                vEvent.returnValues.vehicleNumber ===
                  event.returnValues.vehicleNumber &&
                vEvent.returnValues.requester === event.returnValues.requester
            );

            const status = verification
              ? verification.returnValues.success
                ? "수락됨"
                : "거절됨"
              : "요청 만료";

            return {
              vehicleNumber,
              timestamp: formattedTimestamp,
              status,
            };
          })
      );

      setLogs(logsWithDetails);
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
              <th>요청 시간</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.vehicleNumber}</td>
                <td>{log.timestamp}</td>
                <td>{log.status}</td>
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

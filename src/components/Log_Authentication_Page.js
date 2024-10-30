import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "../abis/AutonomousVehicleDID.json";

const LogAuthenticationPage = () => {
  const [logs, setLogs] = useState([]);
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (web3 && account) {
      fetchAuthenticationLogs();
    }
  }, [web3, account]);

  // 요청한 사용자의 차량 번호를 가져오는 함수
  const getVehicleNumberByRequester = async (requesterAddress) => {
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const vehicle = await contract.methods.vehicles(requesterAddress).call();
    return vehicle.vehicleNumber;
  };

  // 인증 요청 로그를 가져오는 함수
  const fetchAuthenticationLogs = async () => {
    try {
      setLoading(true);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      // 요청 이벤트 조회
      const requestEvents = await contract.getPastEvents(
        "AuthenticationRequested",
        {
          filter: { receiver: account },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      // 수락/거절 이벤트 조회
      const verificationEvents = await contract.getPastEvents(
        "AuthenticationVerified",
        {
          filter: { requester: account },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      // 수락/거절 여부를 확인하여 상태를 업데이트
      const logsWithDetails = await Promise.all(
        requestEvents
          .reverse()
          .slice(0, 10)
          .map(async (event) => {
            const vehicleNumber = await getVehicleNumberByRequester(
              event.returnValues.requester
            );
            const timestamp = parseInt(event.returnValues.timestamp) * 1000;
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

            // 해당 요청에 대한 인증 상태를 확인
            let status = "만료됨"; // 기본적으로 만료로 설정
            const verification = verificationEvents.find(
              (vEvent) =>
                vEvent.returnValues.vehicleNumber ===
                event.returnValues.vehicleNumber
            );

            if (verification) {
              status = verification.returnValues.success ? "수락됨" : "거절됨";
            } else if (Date.now() - timestamp < 60000) {
              status = "대기 중"; // 1분 이내라면 대기 중으로 표시
            }

            return {
              vehicleNumber,
              requester: event.returnValues.requester,
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
              <th>요청자</th>
              <th>요청 시간</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.vehicleNumber}</td>
                <td>{log.requester}</td>
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

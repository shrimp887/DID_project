import React from "react";
import "./Modal.css"; // 스타일 파일

const Modal = ({ vehicleNumber, onAccept, onReject, requestStatus }) => {
  return (
    <div className="modal">
      <h2>인증 요청</h2>
      <p>차량 번호: {vehicleNumber}</p>
      <p>{requestStatus}</p> {/* 요청 상태 표시 */}
      <button onClick={onAccept}>수락</button>
      <button onClick={onReject}>거부</button>
    </div>
  );
};

export default Modal;

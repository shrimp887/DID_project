import React from "react";
import "./Modal.css"; // 스타일 파일

const Modal = ({ vehicleNumber, onAccept, onReject }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>인증 요청</h2>
        <p>차량 번호: {vehicleNumber}에 대한 인증 요청이 도착했습니다.</p>
        <button onClick={onAccept}>수락</button>
        <button onClick={onReject}>거부</button>
      </div>
    </div>
  );
};

export default Modal;

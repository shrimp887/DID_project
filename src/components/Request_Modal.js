import React from "react";
import "./Modal.css"; // 스타일 파일

const Modal = ({ title, message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default Modal;

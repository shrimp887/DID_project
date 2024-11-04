import React from "react";
import "./Modal.css";

const Modal = ({ title, message, onAccept, onReject, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          {onAccept && <button onClick={onAccept}>수락</button>}
          {onReject && <button onClick={onReject}>거부</button>}
          {onClose && <button onClick={onClose}>닫기</button>}
        </div>
      </div>
    </div>
  );
};

export default Modal;

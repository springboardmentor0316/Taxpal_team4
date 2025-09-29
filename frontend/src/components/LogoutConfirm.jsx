import React from "react";
import "./LogoutConfirm.css";

export default function LogoutConfirm({ show, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="logout-overlay">
      <div className="logout-modal">
        <h3>Are you sure you want to exit?</h3>
        <p>This action will log you out of your account.</p>
        <div className="logout-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-logout" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

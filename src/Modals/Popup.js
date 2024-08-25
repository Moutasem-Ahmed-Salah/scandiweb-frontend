import React from "react";

const Popup = ({ icon: Icon, message, showPopup, onClose }) => {
  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        {Icon && <Icon className="text-green-500 text-3xl mx-auto mb-4" />}
        <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:scale-110 transition-transform duration-300"
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default Popup;

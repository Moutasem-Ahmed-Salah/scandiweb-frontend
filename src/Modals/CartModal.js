import React from "react";

const CartModal = ({ showModal, setShowModal }) => {
  return (
    <div
      className={`absolute right-7 top-12 w-80 bg-white shadow-lg rounded-lg p-4 transition-transform duration-300 ${
        showModal ? "scale-100" : "scale-0"
      } origin-top-right z-50`} // Added z-50 to make sure it's on top
    >
      <h2 className="text-xl font-semibold mb-4 text-black">Shopping Cart</h2>
      <p className="text-black">Your cart is empty</p>
      <button
        onClick={() => setShowModal(false)}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg w-full"
      >
        Close
      </button>
    </div>
  );
};

export default CartModal;

import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaTrashAlt } from "react-icons/fa";
import Queries from "../Services/Queries.json";
import Mutations from "../Services/Mutations.json";

const UPDATE_CART_ITEM_MUTATION = gql`
${Mutations.UPDATE_CART_ITEM_MUTATION.mutation}
`;


const DELETE_CART_ITEM_MUTATION = gql`
${Mutations.DELETE_CART_ITEM_MUTATION.mutation}
`;

const VIEW_CART_QUERY = gql`
${Queries.VIEW_CART_QUERY.query}
`;

const CartModal = ({ showModal, setShowModal, setCartNumber }) => {
  const { data, loading, error } = useQuery(VIEW_CART_QUERY, {
    pollInterval: 500, // Poll every 500ms to update the cart in real-time when changes are made
  });

  
  const [total, setTotal] = useState(0);
  const [deleteCartItem] = useMutation(DELETE_CART_ITEM_MUTATION);
  const [updateCartItem] = useMutation(UPDATE_CART_ITEM_MUTATION);

  
function hadnleUpdate(orderId, quantity, color, size, capacity, usbPort, touchId) {
    updateCartItem({ variables: { orderId, quantity, color, size, capacity, usbPort, touchId } });
    console.log("Updated item in cart");
  }


  function handleDelete(orderId) {
    deleteCartItem({ variables: { orderId } });
    console.log("Deleted item from cart");
  }

  useEffect(() => {
    if (data && data.cart) {
      setCartNumber(data.cart.length);
      const calculatedTotal = data.cart.reduce(
        (acc, item) => acc + item.price_per_unit * item.quantity,
        0
      );
      setTotal(calculatedTotal); // Assuming the total is same as subTotal for now
    } else {
      setCartNumber(0);
      setTotal(0);
    }
  }, [data, setCartNumber]);

  return (
    <div
      className={`absolute right-7 top-12 w-80 bg-white shadow-lg rounded-lg p-4 transition-transform duration-300 ${
        showModal ? "scale-100" : "scale-0"
      } origin-top-right z-50`} // Added z-50 to make sure it's on top
    >
      <h2 className="text-xl font-semibold mb-4 text-black">Shopping Cart</h2>
      {loading && (
        <div className="flex justify-center items-center h-32">
          <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
        </div>
      )}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && data.cart && data.cart.length > 0 ? (
        <div>
          {data.cart.map((item) => (
            <div key={item.orderID} className="mb-4">
              <img
                src={item.first_image}
                alt={item.name}
                className="w-16 h-16 object-cover"
              />
              <p className="text-black">{item.name}</p>
              {item.touch_id && item.usb_port && (
                <p className="text-gray-600">
                  Touch ID: {item.touch_id}
                  <br />
                  USB Port: {item.usb_port}
                </p>
              )}
              {item.size && (
                <p className="text-gray-600">Size: {item.size}</p> 
              )}
              {item.color && (
                <p className="text-gray-600">Color: {item.color}</p>
              )}
              {item.capacity && (
                <p className="text-gray-600">Capacity: {item.capacity}</p>
              )}
              <p className="text-gray-600">
                {item.quantity} x {item.price_per_unit}
                {item.currency_symbol}
              </p>
              <div>
                <FaTrashAlt
                  className="ml-64 text-3xl text-green-500 hover:scale-110 hover:text-red-400  transition-transform duration-300"
                  onClick={() => handleDelete(item.orderID)}
                />
              </div>
              <hr className="my-4 border-t border-gray-300" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-black">Your cart is empty</p>
      )}
      <p className="text-black font-bold font-serif">Total: {total}$</p>
      <button
        onClick={() => setShowModal(false)}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:scale-105 hover:bg-green-400 transform transition-colors duration-300"
      >
        Close
      </button>
    </div>
  );
};

export default CartModal;

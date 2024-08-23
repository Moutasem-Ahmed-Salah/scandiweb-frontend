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

const ATTRIBUTE_QUERY = gql`
  query Attributes {
    getAllAttributes {
      product_id
      attributes {
        name
        values
      }
    }
  }
`;

const colorClassMap = {
  black: "bg-black",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  green: "bg-green-600",
  white: "bg-white",
};

const CartModal = ({ showModal, setShowModal, setCartNumber }) => {
  const { data, loading, error } = useQuery(VIEW_CART_QUERY, {
    pollInterval: 500,
  });
  const {
    data: attributeData,
    Attloading,
    Atterror,
  } = useQuery(ATTRIBUTE_QUERY);

  const [total, setTotal] = useState(0);
  const [deleteCartItem] = useMutation(DELETE_CART_ITEM_MUTATION);
  const [updateCartItem] = useMutation(UPDATE_CART_ITEM_MUTATION);

  useEffect(() => {
    if (data && data.cart) {
      setCartNumber(data.cart.length);
      const calculatedTotal = data.cart.reduce(
        (acc, item) => acc + item.price_per_unit * item.quantity,
        0,
      );
      setTotal(calculatedTotal);
    } else {
      setCartNumber(0);
      setTotal(0);
    }
  }, [data, setCartNumber]);

  const processAttributes = (attributesList) => {
    const attributesMap = {};
    attributesList.forEach((product) => {
      if (product.product_id && product.attributes.length > 0) {
        attributesMap[product.product_id] = product.attributes.reduce(
          (acc, attr) => {
            if (attr.name && attr.values.length > 0) {
              acc[attr.name.toLowerCase()] = attr.values;
            }
            return acc;
          },
          {},
        );
      }
    });
    return attributesMap;
  };

  const attributesMap = attributeData?.getAllAttributes
    ? processAttributes(attributeData.getAllAttributes)
    : {};

  const handleUpdate = (orderId, quantity) => {
    updateCartItem({
      variables: { orderId, quantity },
    });
    console.log("Updated item in cart");
  };

  const handleDelete = (orderId) => {
    deleteCartItem({ variables: { orderId } });
    console.log("Deleted item from cart");
  };

  return (
    <div
      className={`absolute right-7 top-12 w-auto bg-white shadow-lg rounded-lg p-4 transition-transform duration-300 ${
        showModal ? "scale-100" : "scale-0"
      } origin-top-right z-50`}
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
          {data.cart.map((item) => {
            const itemAttributes = attributesMap[item.productID] || {};
            return (
              <div key={item.orderID} className="mb-4">
                <img
                  src={item.first_image}
                  alt={item.name}
                  className="w-16 h-16 object-cover"
                />
                <p className="text-black">{item.name}</p>

                {item.touch_id && item.usb_port && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Touch ID in keyboard:
                    </h2>
                    <p>{item.touch_id}</p>

                    <h2 className="text-lg font-semibold mb-2">USB 3 ports:</h2>
                    <p>{item.usb_port}</p>
                  </div>
                )}

                {item.color && (
                  <>
                    <h2 className="text-lg font-semibold mb-2">COLOR:</h2>
                    <div className="flex space-x-2">
                      {itemAttributes.color?.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full ${
                            colorClassMap[color.toLowerCase()]
                          } ${
                            item.color === color
                              ? "border-green-400 border-2 scale-125"
                              : "border-black"
                          } border-2 `}
                        />
                      ))}
                    </div>
                  </>
                )}

                {item.size && (
                  <>
                    <h2 className="text-lg font-semibold mb-2">SIZE:</h2>
                    <div className="flex space-x-2">
                      {itemAttributes.size?.map((size) => (
                        <button
                          key={size}
                          className={`border px-4 py-2  ${
                            item.size === size
                              ? "border-black bg-black text-white scale-110 transition-transform duration-300"
                              : "border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {itemAttributes.capacity && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">CAPACITY:</h2>
                    <div className="flex space-x-2">
                      {itemAttributes.capacity.map((capacity) => (
                        <button
                          key={capacity}
                          className={`border px-4 py-2 ${
                            item.capacity === capacity
                              ? "border-black bg-black text-white scale-110 transition-transform duration-300"
                              : "border-gray-300"
                          }`}
                        >
                          {capacity}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-gray-600 p-2">
                  Price: {item.price_per_unit}
                  {item.currency_symbol}
                </p>
                <div className="flex items-center space-x-4">
                  <p className="pr-3 text-lg font-semibold ">Quantity</p>
                  <button
                    onClick={() =>
                      handleUpdate(item.orderID, item.quantity - 1)
                    }
                    className={`bg-gray-200 px-4 py-2 ${
                      item.quantity === 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-red-400"
                    }`}
                    disabled={item.quantity === 1}
                  >
                    -
                  </button>
                  <p className="text-xl">{item.quantity}</p>
                  <button
                    onClick={() =>
                      handleUpdate(item.orderID, item.quantity + 1)
                    }
                    className="bg-gray-200 px-4 py-2  text-white hover:bg-green-400"
                  >
                    +
                  </button>
                </div>
                <div>
                  <FaTrashAlt
                    className="ml-64 text-3xl text-green-500 hover:scale-110 hover:text-red-400  transition-transform duration-300"
                    onClick={() => handleDelete(item.orderID)}
                  />
                </div>
                <hr className="my-4 border-t border-gray-300" />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-black">Your cart is empty</p>
      )}
      <p className="text-black font-bold font-serif">Total: {total.toFixed(2)}$</p>
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

import React, { Component } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle, FaTrashAlt, FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import Popup from "./Popup";
import Queries from "../Services/Queries.json";
import Mutations from "../Services/Mutations.json";
import { CartContext } from "../Contexts/CartContext";

const ATTRIBUTE_QUERY = gql`
  ${Queries.ATTRIBUTES_QUERY.query}
`;

const PLACE_ORDER_MUTATION = gql`
  ${Mutations.PLACE_ORDER_MUTATION.mutation}
`;

const colorClassMap = {
  black: "bg-black",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  green: "bg-green-600",
  white: "bg-white",
};

class CartModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      showValidation: false,
      validationMessage: "Order placed successfully",
    };
    this.handlePlaceOrder = this.handlePlaceOrder.bind(this);
  }

  processAttributes(attributesList) {
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
  }

  handlePlaceOrder(total, clearCart, cartItems) {
    const orderDetails = cartItems.map((item) => JSON.stringify(item));

    this.props.placeOrder({
      variables: { total, orderDetails },
    });
    this.setState({ showValidation: true });
    clearCart();
  }

  getAttributeValue = (item, attributeName) => {
    const attribute = item.selectedAttributes.find(
      (attr) => attr.name === attributeName,
    );
    return attribute ? attribute.value : "Not specified";
  };

  render() {
    const { showModal, loading, error, attributeData } = this.props;
    const { showValidation, validationMessage } = this.state;

    const attributesMap = attributeData?.getAllAttributes
      ? this.processAttributes(attributeData.getAllAttributes)
      : {};

    return (
      <CartContext.Consumer>
        {({
          cartItems,
          cartTotal,
          updateCartItemQuantity,
          clearItemFromCart,
          ClearCart,
        }) => (
          <>
            <div
              className={`absolute right-7 top-12 mt-4 w-[750px] bg-white shadow-lg rounded-lg transition-transform duration-300 ${
                showModal ? "scale-100" : "scale-0"
              } origin-top-right z-20 max-h-[calc(100vh-180px)] flex flex-col`}
            >
              {/* Fixed Header */}
              <div className="p-4 border-b flex space-x-2 items-center border-gray-200">
                <h2 className="text-xl font-bold text-black">My Bag,</h2>
                <p className="text-lg">
                  {cartItems.reduce((total, item) => total + item.quantity, 0) >
                    0 && (
                    <>
                      {cartItems.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      )}{" "}
                      {cartItems.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      ) === 1
                        ? "item"
                        : "items"}
                    </>
                  )}
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading && (
                  <div className="flex justify-center items-center h-32">
                    <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
                  </div>
                )}
                {error && (
                  <p className="text-red-500">Error: {error.message}</p>
                )}
                {cartItems?.length > 0 ? (
                  <div>
                    {cartItems?.map((item, idx) => {
                      const itemAttributes = attributesMap[item.id] || {};
                      const hasTouchId = this.getAttributeValue(
                        item,
                        "touch id in keyboard",
                      );
                      const hasUsb3Ports = this.getAttributeValue(
                        item,
                        "with usb 3 ports",
                      );

                      return (
                        <div key={idx} className="mb-4">
                          <div className="flex items-start justify-between space-x-4">
                            {/* Left side: Product details */}
                            <div className="flex-1">
                              <p className="text-black text-2xl pb-2 font-bold">
                                {item.name}
                              </p>
                              <p className="text-lg pb-2 mt-2">${item.price}</p>

                              {itemAttributes["touch id in keyboard"] &&
                                itemAttributes["with usb 3 ports"] && (
                                  <div className="mt-2">
                                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                                      Touch ID in keyboard:{" "}
                                      {hasTouchId === "Yes" ? (
                                        <FaCheck className="text-green-500 ml-2" />
                                      ) : (
                                        <ImCross className="text-red-500 ml-2" />
                                      )}
                                    </h2>

                                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                                      USB 3 ports:{" "}
                                      {hasUsb3Ports === "Yes" ? (
                                        <FaCheck className="text-green-500 ml-2" />
                                      ) : (
                                        <ImCross className="text-red-500 ml-2" />
                                      )}
                                    </h2>
                                  </div>
                                )}

                              {itemAttributes.color && (
                                <div className="mt-2">
                                  <h2 className="text-sm font-medium mb-2">
                                    COLOR:
                                  </h2>
                                  <div
                                    className="flex space-x-2"
                                    data-testid={`cart-item-attribute-color`}
                                  >
                                    {itemAttributes.color?.map((color) => {
                                      const selectedColor =
                                        this.getAttributeValue(item, "color");
                                      return (
                                        <button
                                          key={color}
                                          className={`w-8 h-8  ${
                                            colorClassMap[color.toLowerCase()]
                                          } ${
                                            selectedColor === color
                                              ? "border-green-400 border-2 scale-125"
                                              : "border-black"
                                          } border-2`}
                                          data-testid={`cart-item-attribute-color-${color.toLowerCase()}${
                                            item.color === color
                                              ? "-selected"
                                              : ""
                                          }`}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {itemAttributes.size && (
                                <div className="mt-4">
                                  <h2 className="text-sm font-medium mb-2">
                                    SIZE:
                                  </h2>
                                  <div
                                    className="flex space-x-2"
                                    data-testid={`cart-item-attribute-size`}
                                  >
                                    {itemAttributes.size?.map((size) => {
                                      const selectedSize =
                                        this.getAttributeValue(item, "size");
                                      return (
                                        <button
                                          key={size}
                                          className={`border px-4 py-2 ${
                                            selectedSize === size
                                              ? "border-black bg-black text-white"
                                              : "border-gray-300"
                                          }`}
                                          data-testid={`cart-item-attribute-size-${size.toLowerCase()}${
                                            selectedSize === size
                                              ? "-selected"
                                              : ""
                                          }`}
                                        >
                                          {size}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {itemAttributes.capacity && (
                                <div className="mt-4">
                                  <h2 className="text-sm font-medium mb-2">
                                    CAPACITY:
                                  </h2>
                                  <div
                                    className="flex space-x-2"
                                    data-testid={`cart-item-attribute-capacity`}
                                  >
                                    {itemAttributes.capacity?.map(
                                      (capacity) => {
                                        const selectedCapacity =
                                          this.getAttributeValue(
                                            item,
                                            "capacity",
                                          );
                                        return (
                                          <button
                                            key={capacity}
                                            className={`border px-4 py-2 ${
                                              selectedCapacity === capacity
                                                ? "border-black bg-black text-white"
                                                : "border-gray-300"
                                            }`}
                                            data-testid={`cart-item-attribute-capacity-${capacity.toLowerCase()}${
                                              selectedCapacity === capacity
                                                ? "-selected"
                                                : ""
                                            }`}
                                          >
                                            {capacity}
                                          </button>
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right side: Quantity controls and image */}
                            <div className="flex items-start space-x-8">
                              {/* Quantity controls */}
                              <div className="flex flex-col items-center justify-between h-60">
                                <button
                                  onClick={() => updateCartItemQuantity(idx, 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-200 text-black hover:bg-gray-300 text-lg font-medium"
                                  data-testid="cart-item-amount-increase"
                                >
                                  +
                                </button>
                                <span
                                  className="text-lg font-medium"
                                  data-testid="cart-item-amount"
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateCartItemQuantity(idx, -1)
                                  }
                                  className={`w-8 h-8 flex items-center justify-center text-lg font-medium ${
                                    item.quantity === 1
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-gray-200 text-black hover:bg-gray-300"
                                  }`}
                                  disabled={item.quantity === 1}
                                  data-testid="cart-item-amount-decrease"
                                >
                                  -
                                </button>
                              </div>

                              {/* Product image */}
                              <div className="relative">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-60 h-60 object-cover"
                                />
                                <button
                                  onClick={() => clearItemFromCart(idx)}
                                  className="absolute -top-2 -right-2 text-gray-500 hover:text-red-500"
                                >
                                  <FaTrashAlt className="text-lg" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <hr className="my-4 border-t border-gray-200" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500">Your cart is empty.</p>
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-gray-200">
                {cartItems?.length > 0 ? (
                  <>
                    <p
                      className="font-bold text-lg mb-4"
                      data-testid="cart-total"
                    >
                      Total: ${cartTotal.toFixed(2)}
                    </p>
                    <button
                      onClick={() =>
                        this.handlePlaceOrder(cartTotal, ClearCart, cartItems)
                      }
                      className="bg-green-500 text-white px-6 py-2 w-full rounded-lg hover:bg-green-600"
                    >
                      PLACE ORDER
                    </button>
                  </>
                ) : (
                  <button
                    disabled={true}
                    className="bg-gray-500 text-white px-6 py-2 w-full rounded-lg"
                  >
                    PLACE ORDER
                  </button>
                )}
              </div>
            </div>

            {showValidation && (
              <Popup
                icon={FaCheckCircle}
                message={validationMessage}
                showPopup={showValidation}
                onClose={() => this.setState({ showValidation: false })}
              />
            )}
          </>
        )}
      </CartContext.Consumer>
    );
  }
}

const CartModalWithQueries = (props) => {
  const { data: attributeData } = useQuery(ATTRIBUTE_QUERY);
  const [placeOrder] = useMutation(PLACE_ORDER_MUTATION);

  return (
    <CartModal
      {...props}
      attributeData={attributeData}
      placeOrder={placeOrder}
    />
  );
};

export default CartModalWithQueries;

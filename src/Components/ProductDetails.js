import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import Queries from "../Services/Queries.json";
// import Mutations from "../Services/Mutations.json";
import DOMPurify from "dompurify";
import Popup from "../Modals/Popup";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosWarning } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { CartContext } from "../Contexts/CartContext";

const colorClassMap = {
  black: "bg-black",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  green: "bg-green-600",
  white: "bg-white",
};

const PRODUCTDETAILS_QUERY = gql`
  ${Queries.PRODUCTDETAILS_QUERY.query}
`;

const processAttributes = (attributes) => {
  const result = {};
  attributes.forEach((attr) => {
    result[attr.name.toLowerCase()] = attr.values;
  });
  return result;
};

class ProductDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showValidation: false,
      validationMessage: "",
      currentIcon: null,
      currentImageIndex: 0,
      selectedColor: null,
      selectedSize: null,
      selectedCapacity: null,
      hasTouchId: false,
      hasUsb3Ports: false,
      quantity: 1,
      fadeClass: "opacity-100",
    };
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.handlePrevImage = this.handlePrevImage.bind(this);
    this.handleNextImage = this.handleNextImage.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentImageIndex !== this.state.currentImageIndex) {
      this.setState({ fadeClass: "opacity-0" });
      setTimeout(() => {
        this.setState({ fadeClass: "opacity-100" });
      }, 500);
    }
  }

  handleAddToCart(productName, productPrice, productImage, addItemToCart) {
    const {
      selectedColor,
      selectedSize,
      selectedCapacity,
      quantity,
      hasTouchId,
      hasUsb3Ports,
    } = this.state;
    const { productId } = this.props.params;
    const attributes = this.props.data?.productDetails?.attributes
      ? processAttributes(this.props.data.productDetails.attributes)
      : {};

    if (attributes.color && !selectedColor) {
      if (attributes.capacity && !selectedSize) {
        this.setState({
          showValidation: true,
          validationMessage: "Please select a color and capacity.",
          currentIcon: "IoIosWarning",
        });
        return;
      }
      this.setState({
        showValidation: true,
        validationMessage: "Please select a color.",
        currentIcon: "IoIosWarning",
      });
      return;
    }
    if (attributes.size && !selectedSize) {
      this.setState({
        showValidation: true,
        validationMessage: "Please select a size.",
        currentIcon: "IoIosWarning",
      });
      return;
    }
    if (attributes.capacity && !selectedCapacity) {
      if (attributes.color && !selectedColor) {
        this.setState({
          showValidation: true,
          validationMessage: "Please select a color and capacity.",
          currentIcon: "IoIosWarning",
        });
        return;
      }
      this.setState({
        showValidation: true,
        validationMessage: "Please select a capacity.",
        currentIcon: "IoIosWarning",
      });
      return;
    }

    let hastouchId = hasTouchId;
    let hasUsb3Port = hasUsb3Ports;
    let TouchId = null;
    let Usb3Ports = null;
    if (productId !== "apple-imac-2021") {
      hastouchId = null;
    } else {
      hasTouchId ? (TouchId = "Yes") : (TouchId = "No");
    }
    if (productId !== "apple-imac-2021") {
      hasUsb3Port = null;
    } else {
      hasUsb3Port ? (Usb3Ports = "Yes") : (Usb3Ports = "No");
    }

    const selectedAttributes = [
      { name: "color", value: selectedColor },
      { name: "size", value: selectedSize },
      { name: "capacity", value: selectedCapacity },
      { name: "touch id in keyboard", value: TouchId },
      { name: "with usb 3 ports", value: Usb3Ports },
    ].filter((attribute) => attribute.value !== null); // Filter out attributes with null values

    const productToAdd = {
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity,
      selectedAttributes,
    };

    addItemToCart(productToAdd, quantity);
    console.log("From Add to Product:", productToAdd);
    this.setState({
      showValidation: true,
      validationMessage: `Added to cart ${quantity} items successfully`,
      currentIcon: "FaCheckCircle",
    });
  }

  handlePrevImage() {
    this.setState((prevState) => ({
      currentImageIndex:
        prevState.currentImageIndex === 0
          ? this.props.data.productDetails.images.length - 1
          : prevState.currentImageIndex - 1,
    }));
  }

  handleNextImage() {
    this.setState((prevState) => ({
      currentImageIndex:
        (prevState.currentImageIndex + 1) %
        this.props.data.productDetails.images.length,
    }));
  }

  handleCheckboxChange(attribute, value) {
    if (attribute === "touch id in keyboard") {
      this.setState({ hasTouchId: value });
    } else if (attribute === "with usb 3 ports") {
      this.setState({ hasUsb3Ports: value });
    }
  }

  render() {
    const { data, loading } = this.props;
    const {
      showValidation,
      validationMessage,
      currentIcon,
      currentImageIndex,
      selectedColor,
      selectedSize,
      selectedCapacity,
      hasTouchId,
      hasUsb3Ports,
      quantity,
      fadeClass,
    } = this.state;

    const attributes = data?.productDetails?.attributes
      ? processAttributes(data.productDetails.attributes)
      : {};

    const sanitizedDescription = DOMPurify.sanitize(
      data?.productDetails.description,
    );

    return (
      <CartContext.Consumer>
        {({ addItemToCart }) => (
          <div>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mt-10 mx-auto max-w-6xl">
                <div className="flex" data-testid="product-gallery">
                  <div className="w-1/5 mr-4">
                    {data.productDetails.images.map((image, index) => (
                      <div
                        key={index}
                        className="p-2 cursor-pointer"
                        onClick={() =>
                          this.setState({ currentImageIndex: index })
                        }
                      >
                        <img
                          src={image}
                          alt={`Product ${index}`}
                          className={`w-full h-auto object-cover ${index === currentImageIndex ? "border-2 border-green-500 animate-pulse duration-300" : ""}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="w-4/5 relative">
                    <img
                      src={data.productDetails.images[currentImageIndex]}
                      alt="Main Product"
                      className={`w-full h-auto object-cover transition-opacity duration-500 ease-in-out border-2 border-grey-300 ${fadeClass}`}
                    />

                    <button
                      onClick={this.handlePrevImage}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                      &#10094;
                    </button>
                    <button
                      onClick={this.handleNextImage}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    >
                      &#10095;
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold">
                    {data.productDetails.name}
                  </h1>
                  <p className="text-2xl font-semibold">
                    Price: {data.productDetails.price}
                    {data.productDetails.currency_symbol}{" "}
                    {data.productDetails.currency_label}
                  </p>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        this.setState((prevState) => ({
                          quantity: Math.max(1, prevState.quantity - 1),
                        }))
                      }
                      className="bg-gray-200 px-4 py-2"
                    >
                      -
                    </button>
                    <p className="text-xl">{quantity}</p>
                    <button
                      onClick={() =>
                        this.setState((prevState) => ({
                          quantity: prevState.quantity + 1,
                        }))
                      }
                      className="bg-gray-200 px-4 py-2"
                    >
                      +
                    </button>
                  </div>
                  {attributes.size && (
                    <>
                      <h2
                        className="text-lg font-semibold mb-2"
                        data-testid="product-attribute-size"
                      >
                        SIZE:
                      </h2>
                      <div className="flex space-x-2">
                        {attributes.size.map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              this.setState({ selectedSize: size })
                            }
                            className={`border px-4 py-2 hover:bg-gray-400 ${
                              selectedSize === size
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
                  {attributes.color && (
                    <>
                      <h2
                        className="text-lg font-semibold mb-2"
                        data-testid="product-attribute-color"
                      >
                        COLOR:
                      </h2>
                      <div className="flex space-x-2">
                        {attributes.color.map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              this.setState({ selectedColor: color })
                            }
                            className={`w-8 h-8 rounded-full ${colorClassMap[color.toLowerCase()]} ${
                              selectedColor === color
                                ? "border-green-400 scale-125"
                                : "border-black"
                            } border-2 hover:scale-110 transform transition-transform duration-300`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {attributes.capacity && (
                    <div>
                      <h2
                        className="text-lg font-semibold mb-2"
                        data-testid="product-attribute-capacity"
                      >
                        CAPACITY:
                      </h2>
                      <div className="flex space-x-2">
                        {attributes.capacity.map((capacity) => (
                          <button
                            key={capacity}
                            onClick={() =>
                              this.setState({ selectedCapacity: capacity })
                            }
                            className={`border px-4 py-2 hover:bg-gray-400 ${
                              selectedCapacity === capacity
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

                  {attributes["touch id in keyboard"] && (
                    <div>
                      <h2
                        className="text-lg font-semibold mb-2"
                        data-testid="product-attribute-touch-id-in-keyboard"
                      >
                        Touch ID in keyboard:
                      </h2>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hasTouchId}
                          onChange={(e) =>
                            this.handleCheckboxChange(
                              "touch id in keyboard",
                              e.target.checked,
                            )
                          }
                          className="form-checkbox"
                        />
                        <span>{hasTouchId ? "Yes" : "No"}</span>
                      </label>
                    </div>
                  )}
                  {attributes["with usb 3 ports"] && (
                    <div>
                      <h2
                        className="text-lg font-semibold mb-2"
                        data-testid="product-attribute-with-usb-3-ports"
                      >
                        With USB 3 ports:
                      </h2>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hasUsb3Ports}
                          onChange={(e) =>
                            this.handleCheckboxChange(
                              "with usb 3 ports",
                              e.target.checked,
                            )
                          }
                          className="form-checkbox"
                        />
                        <span>{hasUsb3Ports ? "Yes" : "No"}</span>
                      </label>
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-semibold mb-2">DESCRIPTION:</h2>
                    <div
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                      data-testid="product-description"
                    />
                  </div>
                  {data.productDetails.in_stock ? (
                    <button
                      onClick={() =>
                        this.handleAddToCart(
                          data.productDetails.name,
                          data.productDetails.price,
                          data.productDetails.images[0],
                          addItemToCart,
                        )
                      }
                      className="bg-green-500 text-white px-6 py-2 w-3/4 rounded-lg hover:bg-green-600 hover:scale-105  transition-colors duration-300"
                      data-testid="add-to-cart"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button className="bg-gray-300 text-gray-600 px-6 py-2 w-3/4 rounded-lg cursor-not-allowed">
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            )}
            {showValidation && (
              <Popup
                icon={
                  currentIcon === "IoIosWarning" ? IoIosWarning : FaCheckCircle
                }
                message={validationMessage}
                showPopup={showValidation}
                onClose={() => this.setState({ showValidation: false })}
              />
            )}
            {/* <button onClick={testingContext}>Testing</button> */}
          </div>
        )}
      </CartContext.Consumer>
    );
  }
}

class ProductDetailsWithQueries extends Component {
  render() {
    const { data, loading, error } = this.props;

    return (
      <ProductDetails
        {...this.props}
        data={data}
        loading={loading}
        error={error}
      />
    );
  }
}

const withProductDetails = (WrappedComponent) => (props) => {
  const { productId } = useParams();
  const { data, loading, error } = useQuery(PRODUCTDETAILS_QUERY, {
    variables: { productDetailsId: productId },
  });
  /* const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
      onError: (error) => {
        console.error("Detailed error:", error);
      },
    }); */

  return (
    <WrappedComponent
      {...props}
      params={{ productId }}
      data={data}
      loading={loading}
      error={error}
      /* addToCart={addToCart} */
    />
  );
};

export default withProductDetails(ProductDetailsWithQueries);

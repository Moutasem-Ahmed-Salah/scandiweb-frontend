import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, gql, useMutation } from "@apollo/client";
import Queries from "../Services/Queries.json";
import Mutations from "../Services/Mutations.json";
import DOMPurify from "dompurify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const colorClassMap = {
  black: "bg-black",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  green: "bg-green-600",
  white: "bg-white",
};

const PRODUCTDETAILS_QUERY = gql`
  ${Queries.PRODUCTDETAILS_QUERY.query}
`; //added the query from the JSON file to make the code cleaner and more readable

const ADD_TO_CART_MUTATION = gql`
  ${Mutations.ADD_TO_CART_MUTATION.mutation}
`;

const processAttributes = (attributes) => {
  const result = {};
  attributes.forEach((attr) => {
    result[attr.name.toLowerCase()] = attr.values;
  });
  return result;
};

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(PRODUCTDETAILS_QUERY, {
    variables: { productDetailsId: productId },
  });

  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, {
    onError: (error) => {
      console.error("Detailed error:", error); //for debugging purposes
    },
  });

  function handleAddToCart() {
    // Validate required attributes
    if (attributes.color && !selectedColor) {
      alert("Please select a color.");
      return;
    }
    if (attributes.size && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (attributes.capacity && !selectedCapacity) {
      alert("Please select a capacity.");
      return;
    }

    const variables = {
      productId: productId,
      quantity: quantity,
      color: selectedColor || null, // Allow null if not required
      size: selectedSize || null,
      capacity: selectedCapacity || null,
    };

    if (attributes["touch id in keyboard"]) {
      variables.touchId = hasTouchId ? "Yes" : "No";
    }

    if (attributes["with usb 3 ports"]) {
      variables.usbPort = hasUsb3Ports ? "Yes" : "No";
    }

    addToCart({ variables })
      .then((result) => {
        alert(`Added ${quantity} items to the cart!`);
      })
      .catch((error) => {
        console.error("Caught error:", error);
        alert("Failed to add to cart. Please try again.");
      });
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedCapacity, setSelectedCapacity] = useState(null);
  const [hasTouchId, setHasTouchId] = useState(false);
  const [hasUsb3Ports, setHasUsb3Ports] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    setFadeClass("opacity-0"); // Start by fading out
    const timer = setTimeout(() => {
      setFadeClass("opacity-100"); // Fade in after a delay
    }, 500); // Delay should match the duration of the fade-out transition

    return () => clearTimeout(timer); // Cleanup the timer
  }, [currentImageIndex]);

  useEffect(() => {
    if (data && data.productDetails.in_stock === false) {
      alert("Product is out of stock"); //this can act like a guard if user tries to access the product manually by changing the URL
      navigate("/");
    }
  }, [data]);

  const attributes = data?.productDetails?.attributes
    ? processAttributes(data.productDetails.attributes)
    : {};

  if (error || !data || !data.productDetails)
    return <h1>No product details found.</h1>;

  const sanitizedDescription = DOMPurify.sanitize(
    data.productDetails.description,
  );

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? data.productDetails.images.length - 1 : prevIndex - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % data.productDetails.images.length,
    );
  };

  const handleCheckboxChange = (attribute, value) => {
    if (attribute === "touch id in keyboard") {
      setHasTouchId(value);
    } else if (attribute === "with usb 3 ports") {
      setHasUsb3Ports(value);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mt-10 mx-auto max-w-6xl">
          <div className="flex">
            <div className="w-1/5 mr-4">
              {data.productDetails.images.map((image, index) => (
                <div
                  key={index}
                  className="p-2 cursor-pointer"
                  onClick={() => setCurrentImageIndex(index)}
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
                onClick={handlePrevImage}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                &#10094;
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                &#10095;
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{data.productDetails.name}</h1>
            <p className="text-2xl font-semibold">
              Price: {data.productDetails.price}
              {data.productDetails.currency_symbol}{" "}
              {data.productDetails.currency_label}
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="bg-gray-200 px-4 py-2"
              >
                -
              </button>
              <p className="text-xl">{quantity}</p>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="bg-gray-200 px-4 py-2"
              >
                +
              </button>
            </div>
            {attributes.size && (
              <>
                <h2 className="text-lg font-semibold mb-2">SIZE:</h2>
                <div className="flex space-x-2">
                  {attributes.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
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
                <h2 className="text-lg font-semibold mb-2">COLOR:</h2>
                <div className="flex space-x-2">
                  {attributes.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
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
                <h2 className="text-lg font-semibold mb-2">CAPACITY:</h2>
                <div className="flex space-x-2">
                  {attributes.capacity.map((capacity) => (
                    <button
                      key={capacity}
                      onClick={() => setSelectedCapacity(capacity)}
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
                <h2 className="text-lg font-semibold mb-2">
                  Touch ID in keyboard:
                </h2>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasTouchId}
                    onChange={(e) =>
                      handleCheckboxChange(
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
                <h2 className="text-lg font-semibold mb-2">
                  With USB 3 ports:
                </h2>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasUsb3Ports}
                    onChange={(e) =>
                      handleCheckboxChange("with usb 3 ports", e.target.checked)
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
              />
            </div>

            <button
              onClick={() => handleAddToCart(quantity, productId)}
              className="bg-green-500 text-white px-6 py-2 w-3/4 rounded-lg hover:bg-green-300 hover:scale-105  transition-colors duration-300"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;

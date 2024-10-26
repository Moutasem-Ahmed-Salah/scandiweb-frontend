import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloProvider,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "@apollo/client";
import { FaShopify } from "react-icons/fa";
import { MdAddShoppingCart } from "react-icons/md";
import { useRoutes, useNavigate } from "react-router-dom";
import HomePage from "./Components/HomePage";
import ProductDetails from "./Components/ProductDetails";
import CartModal from "./Modals/CartModal";
import { CartContext } from "./Contexts/CartContext";
import { useContext } from "react";

import "./App.css";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const httpLink = new HttpLink({
  uri: "https://moutasemahmed.ninja/graphql.php", // Production
  // uri: "http://localhost/graphql.php", // Development
  headers: {
    "Content-Type": "application/json",
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

function App() {
  const [category, setCategory] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useContext(CartContext);

  const handleCategoryChange = (categoryName) => {
    if (category !== categoryName) {
      setIsChanging(true);
      setTimeout(() => {
        setCategory(categoryName);
        setIsChanging(false);
        navigate("/");
      }, 300);
    } else navigate("/");
  };

  const routes = useRoutes([
    {
      path: "/",
      element: (
        <HomePage
          category={category}
          isChanging={isChanging}
          setIsChanging={setIsChanging}
        />
      ),
    },
    { path: "/product/:productId", element: <ProductDetails /> },
  ]);

  return (
    <ApolloProvider client={client}>
      <div className="relative min-h-screen">
        {/* Sticky nav container */}
        <div className="sticky top-0 bg-white z-50 shadow-sm">
          <ul className="flex list-none p-0 ml-16 mt-6 h-[88px] items-center">
            {["", "tech", "clothes"].map((cat) => (
              <li key={cat} className="mr-6">
                <button
                  onClick={() => handleCategoryChange(cat)}
                  className={`relative text-gray-800 hover:text-green-600 ${
                    category === cat ? "font-bold text-green-600" : ""
                  }`}
                >
                  <span>
                    {cat === ""
                      ? "All"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </span>
                  <span
                    className={`absolute w-full h-[2px] bg-green-600 left-0 -bottom-0.5 transition-transform duration-300 ${
                      category === cat ? "scale-x-100" : "scale-x-0"
                    }`}
                    data-testid={
                      category === cat
                        ? "active-category-link"
                        : "category-link"
                    }
                  ></span>
                </button>
              </li>
            ))}
            <li
              className="absolute text-green-600 text-4xl"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                top: "20px",
              }}
            >
              <button>
                <FaShopify
                  className="hover:scale-110 transition-transform duration-300"
                  onClick={() => {
                    navigate("/");
                    setCategory("");
                  }}
                />
              </button>
            </li>
            <li className="absolute top-5 right-16 text-2xl hover:scale-125 transition-transform duration-300 hover:text-green-600">
              <MdAddShoppingCart
                data-testid="cart-btn"
                onClick={() => setShowModal(!showModal)}
              />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            </li>
          </ul>
        </div>

        <div className="relative flex-1">
          {routes}
          {showModal && (
            <div
              className="fixed inset-x-0 top-[88px] bottom-0 bg-black bg-opacity-50 z-10"
              onClick={() => setShowModal(false)}
            ></div>
          )}
        </div>
        <div className="z-50">
          <CartModal showModal={showModal} setShowModal={setShowModal} />
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;

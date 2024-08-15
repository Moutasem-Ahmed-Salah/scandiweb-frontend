import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { FaShopify } from "react-icons/fa";
import { MdAddShoppingCart } from "react-icons/md";
import { useState } from "react";
import { useRoutes, useNavigate } from "react-router-dom";
import HomePage from "./Components/HomePage";
import ProductDetails from "./Components/ProductDetails";
import CartModal from "./Modals/CartModal";
import "./App.css";

const client = new ApolloClient({
  uri: "http://localhost/graphql.php",
  cache: new InMemoryCache(),
});

function App() {
  const [category, setCategory] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCategoryChange = (categoryName) => {
    if (category !== categoryName) {
      setIsChanging(true);
      setTimeout(() => {
        setCategory(categoryName);
        setIsChanging(false);
        navigate("/"); // Navigate to home page
      }, 300); // This delay should match the transition duration
    }
  };

  const routes = useRoutes([
    {
      path: "/",
      element: (
        <HomePage
          category={category}
          setCategory={setCategory}
          isChanging={isChanging}
          setIsChanging={setIsChanging}
        />
      ),
    },
    { path: "/product/:productId", element: <ProductDetails /> },
  ]);

  return (
    <div className="relative">
      <ul className="flex list-none p-0 ml-16 mt-6">
        {["", "tech", "clothes"].map((cat) => (
          <li key={cat} className="mr-6">
            <button
              onClick={() => handleCategoryChange(cat)}
              className={`relative text-gray-800 hover:text-green-600 ${
                category === cat ? "font-bold text-green-600" : ""
              }`}
            >
              <span>
                {cat === "" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
              <span
                className={`absolute w-full h-[2px] bg-green-600 left-0 -bottom-0.5 transition-transform duration-300 ${
                  category === cat ? "scale-x-100" : "scale-x-0"
                }`}
              ></span>
            </button>
          </li>
        ))}
        <li
          className="absolute text-green-600 text-4xl"
          style={{ left: "50%", transform: "translateX(-50%)", top: "0" }}
        >
          <FaShopify />
        </li>
        <li className="absolute top-0 right-16 text-2xl hover:scale-125 transition-transform duration-300 hover:text-green-600">
          <MdAddShoppingCart onClick={() => setShowModal(true)} />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            0
          </span>
        </li>
      </ul>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setShowModal(false)}
        ></div>
      )}
      <CartModal showModal={showModal} setShowModal={setShowModal} />
      <ApolloProvider client={client}>{routes}</ApolloProvider>
    </div>
  );
}

export default App;

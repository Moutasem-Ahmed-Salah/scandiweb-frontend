import React, { useEffect, useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCartArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Queries from "../Services/Queries.json";
import Mutations from "../Services/Mutations.json";

const PRODUCTS_QUERY = gql`
  ${Queries.PRODUCTS_QUERY.query}
`;

const QUICK_SHOP_MUTATION = gql`
  ${Mutations.QUICK_SHOP_MUTATION.mutation}
`;

function HomePage({ category, isChanging, setIsChanging }) {
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryName: category === "" ? "" : category },
  });

  const [quickAddToCart] = useMutation(QUICK_SHOP_MUTATION);

  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 300);
    return () => clearTimeout(timer);
  }, [data]);

  const handleImageClick = (productId, inStock) => {
    if (inStock) {
      navigate(`/product/${productId}`);
    }
  };

  const handleQuickShop = (e, productId) => {
    e.stopPropagation();
    quickAddToCart({ variables: { productId } });
  };

  useEffect(() => {
    if (isChanging) navigate("/");
  }, [isChanging]);

  if (error) return <pre>{error.message}</pre>;

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-3 gap-6">
          {data.products.map((product) => (
            <div
              key={product.product_id}
              className={`relative flex flex-col items-center transition-opacity duration-300 hover:border hover:border-green-500 rounded-lg  ${
                isChanging ? "opacity-0" : "opacity-100"
              } ${!product.in_stock ? "pointer-events-none" : ""}`}
              onClick={() =>
                handleImageClick(product.product_id, product.in_stock)
              }
              onMouseEnter={() => setHoveredProductId(product.product_id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              <div
                className={`w-64 h-64 overflow-hidden rounded-lg ${
                  !product.in_stock ? "relative" : ""
                }`}
              >
                {product.first_image && (
                  <img
                    src={product.first_image}
                    alt={product.name}
                    className={`w-full h-full object-cover rounded-lg transition-transform duration-300 mt-2 ${
                      !product.in_stock ? "opacity-50" : "hover:scale-110"
                    }`}
                  />
                )}
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-red-400 text-2xl font-bold">
                    Out of Stock
                  </div>
                )}
                {hoveredProductId === product.product_id &&
                  product.in_stock && (
                    <button
                      className="absolute right-1 mr-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl hover:scale-125 transition-transform  duration-300 "
                      onClick={(e) => handleQuickShop(e, product.product_id)}
                    >
                      <FaCartArrowDown />
                    </button>
                  )}
              </div>
              <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
              <p className="mt-1">
                Price: {product.currency_symbol}
                {product.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;

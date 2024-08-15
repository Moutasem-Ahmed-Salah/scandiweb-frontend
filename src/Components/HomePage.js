import React, { useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const PRODUCTS_QUERY = gql`
  query Products($categoryName: String) {
    products(categoryName: $categoryName) {
      name
      images
      product_id
      price
      currency_label
      currency_symbol
      first_image
    }
  }
`;

function HomePage ({category,setCategory,isChanging,setIsChanging}) {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryName: category === "" ? "" : category },
  });
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 300);
    return () => clearTimeout(timer);
  }, [data]);

  const handleImageClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    if (isChanging)
    navigate("/");
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
              className={`flex flex-col items-center transition-opacity duration-300 ${
                isChanging ? "opacity-0" : "opacity-100"
              }`}
              onClick={() => handleImageClick(product.product_id)}
            >
              <div className="w-64 h-64 overflow-hidden cursor-pointer">
                {product.first_image && (
                  <img
                    src={product.first_image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg hover:scale-110 transition-transform duration-300"
                  />
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
};

export default HomePage;

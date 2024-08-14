import React, { useState } from "react";
import { useQuery, gql } from "@apollo/client";

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

const HomePage = () => {
  const [category, setCategory] = useState("");
  
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryName: category === "" ? "" : category },
  });

  const handleCategoryChange = (categoryName) => {
    setCategory(categoryName);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <pre>{error.message}</pre>;

  return (
    <div>
      <ul className="flex list-none p-0 ml-16 mt-6">
        {["", "tech", "clothes"].map((cat) => (
          <li key={cat} className="mr-6">
            <button
              onClick={() => handleCategoryChange(cat)}
              className={`relative text-gray-800 hover:text-green-600 ${
                category === cat ? "font-bold text-green-600" : ""
              }`}
            >
              <span>{cat === "" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              <span className={`absolute w-full h-[2px] bg-green-600 left-0 -bottom-0.5 transition-transform duration-300 ${
                category === cat ? "scale-x-100" : "scale-x-0"
              }`}></span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid grid-cols-3 gap-6">
        {data.products.map((product) => (
          <div key={product.product_id} className="flex flex-col items-center">
            <div className="w-64 h-64 overflow-hidden">
              {product.first_image && (
                <img 
                  src={product.first_image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
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
    </div>
  );
};

export default HomePage;
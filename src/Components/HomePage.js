import React, { Component } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCartArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Queries from "../Services/Queries.json";
import Mutations from "../Services/Mutations.json";
import { CartContext } from "../Contexts/CartContext";

const PRODUCTS_QUERY = gql`
  ${Queries.PRODUCTS_QUERY.query}
`;

const QUICK_SHOP_MUTATION = gql`
  ${Mutations.QUICK_ADD_TO_CART_MUTATION.mutation}
`;

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredProductId: null,
      isChanging: props.isChanging,
    };
    this.handleImageClick = this.handleImageClick.bind(this);
    this.handleQuickShop = this.handleQuickShop.bind(this);
  }

  componentDidMount() {
    this.props.setIsChanging(true);
    this.timer = setTimeout(() => this.props.setIsChanging(false), 300);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.category !== this.props.category
    ) {
      this.props.setIsChanging(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.props.setIsChanging(false), 300);
    }

    if (prevProps.isChanging && !this.props.isChanging) {
      this.props.navigate("/");
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleImageClick(productId) {
    this.props.navigate(`/product/${productId}`);
  }

  handleQuickShop(e, productId) {
    e.stopPropagation();
    this.props.quickAddToCart({ variables: { productId } });
  }

  render() {
    const { data, loading, error } = this.props;
    const { hoveredProductId } = this.state;

    if (error) return <pre>{error.message}</pre>;

    return (
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <AiOutlineLoading3Quarters className="animate-spin text-green-600 text-4xl" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-3 gap-6">
            {data.products.map((product) => {
              const productNameKebabCase = product.name
                .toLowerCase()
                .replace(/\s+/g, "-");
              return (
                <div
                  key={product.product_id}
                  className={`relative flex flex-col items-center transition-opacity duration-300 hover:border hover:border-green-500 rounded-lg  ${
                    this.props.isChanging ? "opacity-0" : "opacity-100"
                  } `}
                  onClick={() => this.handleImageClick(product.product_id)}
                  onMouseEnter={() =>
                    this.setState({ hoveredProductId: product.product_id })
                  }
                  onMouseLeave={() => this.setState({ hoveredProductId: null })}
                  data-testid={`product-${productNameKebabCase}`}
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
                        className={`w-full h-full object-cover rounded-lg hover:scale-110 transition-transform duration-300 mt-2 ${
                          !product.in_stock ? "opacity-50" : "hover:scale-110"
                        }`}
                      />
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-red-400 text-2xl font-bold hover:scale-110 transition-transform duration-300">
                        Out of Stock
                      </div>
                    )}
                    {hoveredProductId === product.product_id &&
                      product.in_stock && (
                        <button
                          className="absolute right-1 mr-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl hover:scale-125 transition-transform  duration-300 "
                          onClick={(e) =>
                            this.handleQuickShop(e, product.product_id)
                          }
                        >
                          <FaCartArrowDown />
                        </button>
                      )}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
                  <p className="mt-1">
                    Price: {product.currency_symbol}
                    {product.price.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

const HomePageWithRouter = (props) => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryName: props.category === "" ? "" : props.category },
  });

  const [quickAddToCart] = useMutation(QUICK_SHOP_MUTATION);

  return (
    <HomePage
      {...props}
      data={data}
      loading={loading}
      error={error}
      quickAddToCart={quickAddToCart}
      navigate={navigate}
    />
  );
};

export default HomePageWithRouter;

import React, { Component } from "react";
import { gql, ApolloConsumer, useQuery } from "@apollo/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCartArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Queries from "../Services/Queries.json";
import { CartContext } from "../Contexts/CartContext";

const PRODUCTS_QUERY = gql`
  ${Queries.PRODUCTS_QUERY.query}
`;

const PRODUCT_DETAILS_QUERY = gql`
  query ProductDetails($productDetailsId: String!) {
    productDetails(id: $productDetailsId) {
      attributes {
        name
        values
      }
      images
      name
      price
    }
  }
`;

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredProductId: null,
      isChanging: props.isChanging,
      quickShopData: null,
      quickShopLoading: false,
      quickShopError: null,
      loadingProductId: null, // Add this to track which product is loading
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

  async handleQuickShop(e, productId, client, addItemToCart, cartItems) {
    e.stopPropagation();

    this.setState({
      quickShopLoading: true,
      quickShopError: null,
      loadingProductId: productId,
    });

    try {
      const { data } = await client.query({
        query: PRODUCT_DETAILS_QUERY,
        variables: { productDetailsId: productId },
      });

      const productToAdd = {
        id: productId,
        name: data.productDetails.name,
        price: data.productDetails.price,
        image: data.productDetails.images[0],
        selectedAttributes: data.productDetails.attributes.map((attr) => ({
          name: attr.name.toLowerCase(),
          value: attr.values[0],
        })),
      };

      addItemToCart(productToAdd, 1);
    } catch (error) {
      this.setState({ quickShopError: error });
    } finally {
      this.setState({
        quickShopLoading: false,
        loadingProductId: null,
      });
    }
  }

  render() {
    const { data, loading, error } = this.props;
    const { hoveredProductId, loadingProductId } = this.state;

    if (error) return <pre>{error.message}</pre>;

    return (
      <ApolloConsumer>
        {(client) => (
          <CartContext.Consumer>
            {({ cartItems, addItemToCart }) => (
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
                          className={`relative flex flex-col items-center transition-transform duration-300 hover:shadow-2xl hover:border  rounded-lg  ${
                            this.props.isChanging ? "opacity-0" : "opacity-100"
                          } `}
                          onClick={() =>
                            this.handleImageClick(product.product_id)
                          }
                          onMouseEnter={() =>
                            this.setState({
                              hoveredProductId: product.product_id,
                            })
                          }
                          onMouseLeave={() =>
                            this.setState({ hoveredProductId: null })
                          }
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
                                className={`w-full h-full object-contain mt-2  ${
                                  !product.in_stock ? "opacity-50" : ""
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
                                  className="absolute right-1 mr-4 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl hover:scale-125 transition-transform duration-300"
                                  onClick={(e) =>
                                    this.handleQuickShop(
                                      e,
                                      product.product_id,
                                      client,
                                      addItemToCart,
                                      cartItems,
                                    )
                                  }
                                  disabled={
                                    loadingProductId === product.product_id
                                  }
                                >
                                  {loadingProductId === product.product_id ? (
                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                  ) : (
                                    <FaCartArrowDown />
                                  )}
                                </button>
                              )}
                          </div>
                          <h2 className="mt-2 text-lg font-semibold">
                            {product.name}
                          </h2>
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
            )}
          </CartContext.Consumer>
        )}
      </ApolloConsumer>
    );
  }
}

const HomePageWithRouter = (props) => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryName: props.category === "" ? "" : props.category },
  });

  return (
    <HomePage
      {...props}
      data={data}
      loading={loading}
      error={error}
      navigate={navigate}
    />
  );
};

export default HomePageWithRouter;

import { BrowserRouter as Router } from "react-router-dom";
import { CartProvider } from "../Contexts/CartContext";
import App from "../App";

export default function AppWrapper() {
  return (
    <Router>
      <CartProvider>
        <App />
      </CartProvider>
    </Router>
  );
}

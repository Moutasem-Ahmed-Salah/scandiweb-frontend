import { BrowserRouter as Router } from "react-router-dom";
import App from "../App";

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
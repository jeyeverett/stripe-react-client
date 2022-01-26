import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Checkout, CheckoutSuccess, CheckoutFail } from "./Checkout";
import Payments from "./Payments";
import Customers from "./Customers";
import Subscriptions from "./Subscriptions";

import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <nav className="w-full mb-6 flex justify-end px-6 py-4 bg-gray-200">
          <ul className="flex space-x-4 uppercase text-gray-700 font-semibold">
            <li className="hover:text-gray-500 transition-all">
              <Link to="/">Home</Link>
            </li>
            <li className="hover:text-gray-500 transition-all">
              <Link to="/checkout">Checkout</Link>
            </li>
            <li className="hover:text-gray-500 transition-all">
              <Link to="/payments">Payments</Link>
            </li>
            <li className="hover:text-gray-500 transition-all">
              <Link to="/customers">Customers</Link>
            </li>
            <li className="hover:text-gray-500 transition-all">
              <Link to="/subscriptions">Subscriptions</Link>
            </li>
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/success" element={<CheckoutSuccess />} />
            <Route path="/failed" element={<CheckoutFail />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <>
      <h2>Stripe React + Node.js</h2>
    </>
  );
}

export default App;

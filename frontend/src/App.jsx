import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Categories from "./components/Categories";

import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import { CartProvider } from "./context/CartContext";


function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Categories />
      <Shop />
    </>
  );
}


function App() {
  return (
    <BrowserRouter>

      <CartProvider>

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* PRODUCT DETAILS */}

          <Route
            path="/product/:id"
            element={
              <>
                <Navbar />
                <ProductDetails />
              </>
            }
          />


          {/* CART */}

          <Route
            path="/cart"
            element={
              <>
                <Navbar />
                <Cart />
              </>
            }
          />


          {/* CHECKOUT */}

          <Route
            path="/checkout"
            element={
              <>
                <Navbar />
                <Checkout />
              </>
            }
          />

        </Routes>

      </CartProvider>

    </BrowserRouter>
  );
}

export default App;
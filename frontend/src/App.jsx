import "./App.css";
import { Link } from "react-router-dom";
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
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
          <Route
            path="/"
            element={<Home />}
          />
          <Route
  path="/men"
  element={
    <>
      <Navbar />
      <Shop category="men" />
    </>
  }
/>
<Route
  path="/login"
  element={
    <>
      <Navbar />
      <Login />
    </>
  }
/>
<Route
  path="/women"
  element={
    <>
      <Navbar />
      <Shop category="women" />
    </>
  }
/>
<Route
  path="/register"
  element={
    <>
      <Navbar />
      <Register />
    </>
  }
/>
<Route
  path="/kids"
  element={
    <>
      <Navbar />
      <Shop category="kids" />
    </>
  }
/>
          <Route
            path="/product/:id"
            element={
              <>
                <Navbar />
                <ProductDetails />
              </>
            }
          />
          <Route
            path="/cart"
            element={
              <>
                <Navbar />
                <Cart />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <Navbar />
                <Checkout />
              </>
            }
          />
<Route
  path="/shop"
  element={
    <>
      <Navbar />
      <Shop category="all" />
    </>
  }
/>

<Route
  path="/men"
  element={
    <>
      <Navbar />
      <Shop category="men" />
    </>
  }
/>

<Route
  path="/women"
  element={
    <>
      <Navbar />
      <Shop category="women" />
    </>
  }
/>

<Route
  path="/kids"
  element={
    <>
      <Navbar />
      <Shop category="kids" />
    </>
  }
/>
            <Route
                   path="/order-confirmation"
                     element={<OrderConfirmation />}
                        />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
export default App;
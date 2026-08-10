import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Categories from "./components/Categories";

import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailConfirmed from "./pages/EmailConfirmed";
import NotFound from "./pages/NotFound";

import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Categories />
      <Shop category="all" />
      <Footer />
    </>
  );
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/shop"
            element={
              <Layout>
                <Shop category="all" />
              </Layout>
            }
          />
          <Route
            path="/men"
            element={
              <Layout>
                <Shop category="men" />
              </Layout>
            }
          />
          <Route
            path="/women"
            element={
              <Layout>
                <Shop category="women" />
              </Layout>
            }
          />
          <Route
            path="/kids"
            element={
              <Layout>
                <Shop category="kids" />
              </Layout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <Layout>
                <ProductDetails />
              </Layout>
            }
          />
          <Route
            path="/cart"
            element={
              <Layout>
                <Cart />
              </Layout>
            }
          />
          <Route
            path="/checkout"
            element={
              <Layout>
                <Checkout />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route
            path="/email-confirmed"
            element={
              <Layout>
                <EmailConfirmed />
              </Layout>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <Layout>
                <OrderConfirmation />
              </Layout>
            }
          />
          <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
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

      <Routes>

        <Route
          path="/"
          element={<Home />}
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

      </Routes>

    </BrowserRouter>
  );
}

export default App;
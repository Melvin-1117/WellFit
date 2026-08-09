import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Categories from "./components/Categories";
import Shop from "./pages/Shop";
function App() {
  return (
    <div>
      <Navbar />  
      <Hero />
      <Services />
      <Categories />
      <Shop />
    </div>
  );
}

export default App;
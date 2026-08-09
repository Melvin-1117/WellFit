import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Categories from "./components/Categories";
function App() {
  return (
    <div>
      <Navbar />  
      <Hero />
      <Services />
      <Categories />
    </div>
  );
}

export default App;
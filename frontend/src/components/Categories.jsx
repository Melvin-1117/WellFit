import { useState, useRef } from "react";
import { Link } from "react-router-dom";

function Categories() {
  const categories = [
    {
      name: "MEN'S",
      image: "/categories/men.jpg",
      link: "/men",
    },
    {
      name: "WOMEN'S",
      image: "/categories/women.jpg",
      link: "/women",
    },
    {
      name: "KIDS",
      image: "/categories/kids.jpg",
      link: "/kids",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const children = Array.from(container.children);
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollToSlide = (index) => {
    if (!scrollRef.current) return;
    const targetChild = scrollRef.current.children[index];
    if (targetChild) {
      targetChild.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(index);
    }
  };

  return (
    <section className="categories">
      <div className="categories-header">
        <p>EXPLORE OUR COLLECTIONS</p>
        <h2>Shop By Category</h2>
        <span>Find your style, your way.</span>
      </div>

      <div
        className="category-grid category-carousel"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {categories.map((category) => (
          <Link
            to={category.link}
            className="category-card"
            key={category.name}
          >
            <img
              src={category.image}
              alt={`${category.name} collection`}
              loading="lazy"
            />

            <div className="category-overlay">
              <h3>{category.name}</h3>

              <span className="category-button">
                SHOP NOW →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="category-carousel-dots">
        {categories.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === activeIndex ? "active" : ""}
            onClick={() => scrollToSlide(index)}
            aria-label={`Go to category ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;
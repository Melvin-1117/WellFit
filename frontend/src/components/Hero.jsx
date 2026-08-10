import { useEffect, useState } from "react";

function Hero() {
  const slides = [
    { image: "/hero/slide1.webp", alt: "WellFit collection" },
    { image: "/hero/slide2.webp", alt: "Women's collection" },
    { image: "/hero/slide3.webp", alt: "New arrivals" },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="hero">
      <div className="hero-slide active">
        <img
          src={slides[currentSlide].image}
          className="hero-image"
          alt={slides[currentSlide].alt}
          width="1920"
          height="1080"
          fetchpriority={currentSlide === 0 ? "high" : "auto"}
        />
      </div>

      <button
        type="button"
        className="hero-prev"
        aria-label="Previous slide"
        onClick={() =>
          setCurrentSlide((currentSlide - 1 + slides.length) % slides.length)
        }
      >
        ‹
      </button>

      <button
        type="button"
        className="hero-next"
        aria-label="Next slide"
        onClick={() =>
          setCurrentSlide((currentSlide + 1) % slides.length)
        }
      >
        ›
      </button>

      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === currentSlide ? "hero-dot active" : "hero-dot"}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;
import { useEffect, useState } from "react";

function Hero() {
  const slides = [
  {
    image: "/hero/slide1.jpg",
    className: "hero-slide-1",

    left: {
      label: "DEFINE YOUR STYLE",
      title: "Fashion that moves with you.",
      description:
        "Discover fashion designed for confidence and comfort.",
      button: "SHOP COLLECTION",
    },

    right: {
      label: "STREET REDEFINED",
      title: "Own Your Edge.",
      description:
        "Statement pieces for those who stand apart.",
      button: "EXPLORE NOW",
    },
  },

  {
    image: "/hero/slide2.jpg",
    className: "hero-slide-2",

    content: {
      label: "WOMEN'S COLLECTION",
      title: "Effortless Summer Style",
      description:
        "Discover timeless pieces made for every occasion.",
      button: "SHOP WOMEN'S COLLECTION",
    },
  },

  {
    image: "/hero/slide3.jpg",
    className: "hero-slide-3",

    content: {
      label: "NEW ARRIVALS",
      title: "Your New Everyday Look",
      description:
        "Fresh styles made for every moment.",
      button: "SHOP NOW",
    },
  },
];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((previousSlide) => {
        return (previousSlide + 1) % slides.length;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlide];

 return (
  <section className="hero">

    <div className={`hero-slide ${slide.className} active`}>

      <img
        src={slide.image}
        className="hero-image"
        alt={slide.content?.title || "WellFit collection"}
      />

      {/* Slide 1 - Two sides */}
      {currentSlide === 0 && (
        <div className="hero-content">

          <div className="hero-tagline-left">

            <p className="hero-label">
              {slide.left.label}
            </p>

            <h1>
              {slide.left.title}
            </h1>

            <p className="hero-description">
              {slide.left.description}
            </p>

            <button className="shop-button">
              {slide.left.button}
            </button>

          </div>


          <div className="hero-tagline-right">

            <p className="hero-label">
              {slide.right.label}
            </p>

            <h1>
              {slide.right.title}
            </h1>

            <p className="hero-description">
              {slide.right.description}
            </p>

            <button className="shop-button">
              {slide.right.button}
            </button>

          </div>

        </div>
      )}


      {/* Slides 2, 3 and 4 - Single content */}
      {currentSlide !== 0 && (
        <div className="hero-content">

          <p className="hero-label">
            {slide.content.label}
          </p>

          <h1>
            {slide.content.title}
          </h1>

          <p className="hero-description">
            {slide.content.description}
          </p>

          <button className="shop-button">
            {slide.content.button}
          </button>

        </div>
      )}

    </div>


    {/* Navigation */}
    <button
      className="hero-prev"
      onClick={() =>
        setCurrentSlide(
          (currentSlide - 1 + slides.length) % slides.length
        )
      }
    >
      ‹
    </button>


    <button
      className="hero-next"
      onClick={() =>
        setCurrentSlide(
          (currentSlide + 1) % slides.length
        )
      }
    >
      ›
    </button>


    {/* Dots */}
    <div className="hero-dots">

      {slides.map((_, index) => (
        <button
          key={index}
          className={
            index === currentSlide
              ? "hero-dot active"
              : "hero-dot"
          }
          onClick={() => setCurrentSlide(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}

    </div>

  </section>
);
}

export default Hero;
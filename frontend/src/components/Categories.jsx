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

  return (
    <section className="categories">

      <div className="categories-header">
        <p>EXPLORE OUR COLLECTIONS</p>
        <h2>Shop By Category</h2>
        <span>Find your style, your way.</span>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <a
            href={category.link}
            className="category-card"
            key={category.name}
          >
            <img
              src={category.image}
              alt={`${category.name} collection`}
            />

            <div className="category-overlay">
              <h3>{category.name}</h3>

              <span className="category-button">
                SHOP NOW →
              </span>
            </div>
          </a>
        ))}

      </div>

    </section>
  );
}
export default Categories;
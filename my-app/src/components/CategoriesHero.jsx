const categories = [
  {
    id: 1,
    name: "Abaya",
    href: "/category/abaya",
    description: "Elegant, timeless abayas for everyday and special occasions.",
    imageSrc: "/images/categories/Cover Abaya_2.jpg",
    imageAlt: "Woman wearing a modern abaya in a minimalist setting.",
  },
  {
    id: 2,
    name: "Hijab",
    href: "/category/hijab",
    description: "Soft, breathable hijabs in versatile colors.",
    imageSrc: "/images/categories/Cover Hijab_2.jpg",
    imageAlt: "Folded hijabs in neutral tones.",
  },
  {
    id: 3,
    name: "Inner",
    href: "/category/inner",
    description: "Comfortable innerwear designed for all-day wear.",
    imageSrc: "/images/categories/Cover Inner_2.jpg",
    imageAlt: "Minimal fashion innerwear neatly arranged.",
  },
];

export default function CategoriesHero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-gray-600">
            Discover our collections curated for comfort and elegance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl shadow-sm"
            >
              <img
                src={category.imageSrc}
                alt={category.imageAlt}
                className="h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute bottom-0 p-6">
                <h3 className="text-xl font-semibold text-white">
                  {category.name}
                </h3>
                <p className="mt-1 max-w-xs text-sm text-gray-200">
                  {category.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4">
                  Shop now
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

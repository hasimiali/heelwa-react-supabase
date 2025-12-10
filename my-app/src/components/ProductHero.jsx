const products = [
  {
    id: 1,
    name: 'Earthen Bottle',
    href: '#',
    price: '$48',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-01.jpg',
    imageAlt: 'Tall slender porcelain bottle with natural clay textured body and cork stopper.',
  },
  {
    id: 2,
    name: 'Nomad Tumbler',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-02.jpg',
    imageAlt: 'Olive drab green insulated bottle with flared screw lid and flat top.',
  },
  {
    id: 3,
    name: 'Focus Paper Refill',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-03.jpg',
    imageAlt: 'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 4,
    name: 'Machined Mechanical Pencil',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-04.jpg',
    imageAlt: 'Hand holding black machined steel mechanical pencil with brass tip and top.',
  },
  {
    id: 5,
    name: 'Focus Card Tray',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-05.jpg',
    imageAlt: 'Paper card sitting upright in walnut card holder on desk.',
  },
  {
    id: 6,
    name: 'Focus Multi-Pack',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-06.jpg',
    imageAlt: 'Stack of 3 small drab green cardboard paper card refill boxes with white text.',
  },
  {
    id: 7,
    name: 'Brass Scissors',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-07.jpg',
    imageAlt: 'Brass scissors with geometric design, black steel finger holes, and included upright brass stand.',
  },
  {
    id: 8,
    name: 'Focus Carry Pouch',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-08.jpg',
    imageAlt: 'Textured gray felt pouch for paper cards with snap button flap and elastic pen holder loop.',
  },
]

export default function Example() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-8xl px-8 py-24 sm:px-12 sm:py-32 lg:max-w-[1600px] lg:px-16">
        {/* Our Story */}
        <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
        <p className="text-lg text-gray-700 max-w-5xl mx-auto">
            Mahdaly was founded in xxxx as a beacon of innovation in the world of design, inspired by xxxx passion for crafting unique pieces of haute couture. It redefines the abaya with a contemporary spirit that fuses beauty and refinement.
        </p>
        </div>
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <a key={product.id} href={product.href} className="group relative">
              {/* Image */}
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="aspect-square w-full rounded-lg bg-gray-200 object-cover"
              />
              {/* Overlay with Product Name */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <h3 className="text-white text-lg font-semibold text-center px-2">
                  {product.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

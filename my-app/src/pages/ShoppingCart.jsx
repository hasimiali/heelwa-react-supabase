import { useNavigate } from "react-router-dom";

'use client'

export default function ShoppingCart() {

  const navigate = useNavigate();   // ← WAJIB ADA

  const products = [
    {
      id: 1,
      name: 'Basic Tee', 
      color: 'Sienna',
      size: 'Large',
      price: 32,
      inStock: true,
      imageSrc:
        'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-01.jpg',
    },
    {
      id: 2,
      name: 'Basic Tee',
      color: 'Black',
      size: 'Large',
      price: 32,
      inStock: false,
      leadTime: 'Ships in 3–4 weeks',
      imageSrc:
        'https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg',
    },
    {
      id: 3,
      name: 'Nomad Tumbler',
      color: 'White',
      price: 35,
      size: null,
      inStock: true,
      imageSrc:
        'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-04-image-card-02.jpg',
    },
  ]

  const subtotal = products.reduce((sum, p) => sum + p.price, 0)
  const shipping = 5
  const tax = 8.32
  const total = subtotal + shipping + tax

  return (
    <div className="bg-white">
      <div className="pt-28 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ---------------- LEFT COLUMN: PRODUCTS ---------------- */}
          <div className="lg:col-span-8">
            <ul role="list" className="divide-y divide-gray-200 border-t border-gray-200">
              {products.map((product) => (
                <li key={product.id} className="flex py-8">
                  <img
                    src={product.imageSrc}
                    alt={product.name}
                    className="h-24 w-24 rounded-md border border-gray-200 object-cover"
                  />

                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{product.name}</h3>
                        <p>${product.price.toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.color} {product.size ? `· ${product.size}` : ''}
                      </p>

                      {product.inStock ? (
                        <p className="mt-2 text-sm text-green-600">● In stock</p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">⏳ {product.leadTime}</p>
                      )}
                    </div>

                    <button className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- RIGHT COLUMN: ORDER SUMMARY ---------------- */}
          <div className="lg:col-span-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

              <dl className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-gray-600">Shipping estimate</dt>
                  <dd className="font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-gray-600">Tax estimate</dt>
                  <dd className="font-medium text-gray-900">${tax.toFixed(2)}</dd>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Order total</dt>
                  <dd className="text-base font-semibold text-gray-900">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </dl>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-md bg-indigo-600 py-3 text-center text-white font-medium hover:bg-indigo-700"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

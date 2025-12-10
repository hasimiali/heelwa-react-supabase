import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverview() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories ( name ),
          brands ( name ),
          product_images ( id, image_url, is_primary ),
          product_variants ( id, color, size, stock_quantity )
        `
        )
        .eq("slug", slug)
        .single();

      setProduct(data);
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (!product) return <p className="p-10 text-center">Product not found.</p>;

  // Sort images like Tailwind UI (first = primary)
  const images = [...product.product_images].sort(
    (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
  );

  // Convert variants into unique colors & sizes
  const colors = [...new Set(product.product_variants.map((v) => v.color))];
  const sizes = product.product_variants.map((v) => ({
    name: v.size,
    inStock: v.stock_quantity > 0,
  }));

  const price = `Rp ${Number(product.base_price).toLocaleString("id-ID")}`;

  return (
    <div className="bg-white">
      <div className="pt-28">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <li>
              <a className="text-sm font-medium text-gray-900">
                {product.categories?.name}
              </a>
            </li>
            <li>
              <svg
                width={16}
                height={20}
                fill="currentColor"
                className="text-gray-300"
              >
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </li>
            <li>
              <a className="text-sm font-medium text-gray-900">
                {product.brands?.name}
              </a>
            </li>
            <li>
              <svg
                width={16}
                height={20}
                fill="currentColor"
                className="text-gray-300"
              >
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </li>
            <li className="text-sm">
              <span className="text-gray-500">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Image gallery */}
        <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-8 lg:px-8">
          {images[0] && (
            <img
              src={images[0].image_url}
              className="row-span-2 size-full rounded-lg object-cover max-lg:hidden aspect-3/4"
            />
          )}

          {images[1] && (
            <img
              src={images[1].image_url}
              className="col-start-2 size-full rounded-lg object-cover max-lg:hidden aspect-3/2"
            />
          )}

          {images[2] && (
            <img
              src={images[2].image_url}
              className="col-start-2 row-start-2 size-full rounded-lg object-cover max-lg:hidden aspect-3/2"
            />
          )}

          {images[3] && (
            <img
              src={images[3].image_url}
              className="row-span-2 size-full object-cover sm:rounded-lg lg:aspect-3/4 aspect-4/5"
            />
          )}
        </div>

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:px-8 lg:pt-16 lg:pb-24">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
          </div>

          {/* Price + Colors + Sizes */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <p className="text-3xl tracking-tight text-gray-900">{price}</p>

            {/* Reviews dummy */}
            <div className="mt-6 flex items-center">
              {[0, 1, 2, 3, 4].map((idx) => (
                <StarIcon
                  key={idx}
                  className={classNames(
                    idx < 4 ? "text-gray-900" : "text-gray-200",
                    "size-5"
                  )}
                />
              ))}
              <span className="ml-3 text-sm text-indigo-600">117 reviews</span>
            </div>

            {/* Colors */}
            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Color</h3>
              <div className="flex gap-x-3 mt-4">
                {colors.map((color) => (
                  <div
                    key={color}
                    className="size-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-10">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {sizes.map((s) => (
                  <label
                    key={s.name}
                    className={classNames(
                      "border rounded-md p-3 text-center text-sm",
                      s.inStock
                        ? "bg-white border-gray-300"
                        : "bg-gray-200 text-gray-400 opacity-50"
                    )}
                  >
                    {s.name}
                  </label>
                ))}
              </div>
            </div>

            <button className="mt-10 w-full bg-indigo-600 text-white py-3 rounded-md">
              Add to cart
            </button>
          </div>

          {/* Description */}
          <div className="py-10 lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8 lg:pt-6">
            <p className="text-base text-gray-900">{product.description}</p>

            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
              <ul className="list-disc pl-4 mt-4 space-y-2 text-sm text-gray-600">
                {product.highlights?.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Details</h3>
              <p className="mt-4 text-sm text-gray-600">{product.details}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

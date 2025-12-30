import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { formatRupiah } from "../utils/formatRupiah";

const PAGE_SIZE = 12;

export default function ProductsGrid() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("products")
      .select(
        `
  id,
  name,
  slug,
  base_price,
  categories (
    name
  ),
  product_images (
    image_url,
    is_primary
  )
`
      )

      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setProducts((prev) => [...prev, ...data]);
    setPage((prev) => prev + 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white py-14">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Our Products
        </h2>
        <p className="mt-3 text-gray-600">
          Gracefully designed essentials for modern Muslimah
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const primaryImage = p.product_images?.find(
              (img) => img.is_primary
            )?.image_url;

            return (
              <Link key={p.id} to={`/products/${p.slug}`} className="group">
                <img
                  src={primaryImage || "/placeholder.png"}
                  alt={p.name}
                  className="aspect-[3/4] w-full rounded-lg object-cover bg-gray-100 group-hover:opacity-75"
                />

                <h3 className="mt-4 text-sm font-medium text-gray-800">
                  {p.name}
                </h3>

                {p.categories?.name && (
                  <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                    {p.categories.name}
                  </p>
                )}

                <p className="mt-1 text-lg font-medium text-gray-900">
                  {formatRupiah(p.base_price)}
                </p>
              </Link>
            );
          })}
        </div>

        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

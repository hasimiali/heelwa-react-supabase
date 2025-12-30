import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { formatRupiah } from "../utils/formatRupiah";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchSearch = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          base_price,
          categories(name),
          product_images(image_url, is_primary)
        `
        )
        .eq("is_active", true)
        .ilike("name", `%${query}%`);

      if (!error) setProducts(data || []);
      setLoading(false);
    };

    fetchSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-2xl font-semibold mb-8">
        Search results for "{query}"
      </h1>

      {loading && <p>Searching...</p>}

      {!loading && products.length === 0 && (
        <p className="text-gray-500">No products found</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => {
          const image =
            p.product_images?.find((i) => i.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url;

          return (
            <Link key={p.id} to={`/products/${p.slug}`}>
              <img
                src={image || "/placeholder.png"}
                className="aspect-[3/4] w-full object-cover rounded"
              />
              <h3 className="mt-2 text-sm">{p.name}</h3>
              <p className="text-xs text-gray-500">{p.categories?.name}</p>
              <p className="font-medium">{formatRupiah(p.base_price)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

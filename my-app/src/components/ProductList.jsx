import { Link } from "react-router-dom";

export default function ProductList({ products }) {
  if (!products || products.length === 0) return <p>No products available</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((p) => {
        const primaryImage =
          p.product_images?.find((img) => img.is_primary)?.image_url ||
          p.product_images?.[0]?.image_url;

        return (
          <Link key={p.id} to={`/products/${p.slug}`}>
            <div className="border rounded-lg shadow hover:shadow-md p-3 cursor-pointer">
              <img
                src={primaryImage}
                alt={p.name}
                className="w-full aspect-[3/4] object-cover rounded mb-3"
              />
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.categories?.name}</p>
              <p className="font-bold mt-2">
                Rp {Number(p.base_price).toLocaleString("id-ID")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

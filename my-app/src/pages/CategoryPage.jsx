import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import AddToWishlist from "../utils/AddToWishlist";



export default function CategoryPage() {
  const { slug } = useParams(); // "pria", "wanita", etc.
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    fetchProducts();
  }, [slug, sortOption]); // re-run when sort changes

  async function fetchProducts() {
    let query = supabase
      .from("products")
      .select("*")
      .eq("category_slug", slug);

    // Apply Sorting
    switch (sortOption) {
      case "price_low":
        query = query.order("price", { ascending: true });
        break;
      case "price_high":
        query = query.order("price", { ascending: false });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "name_desc":
        query = query.order("name", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (!error) setProducts(data);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold capitalize">Kategori: {slug}</h2>

        {/* Sorting Dropdown */}
        <select
          className="border px-3 py-2 rounded-md"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Default sorting</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (


          <div key={item.id} className="shadow-md rounded-lg overflow-hidden p-2 hover:shadow-lg transition">
            <img src={item.image_url} className="w-full h-64 object-cover" alt={item.name} />

            <div className="text-center py-3">
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="text-purple-700 font-bold mt-1">Rp{item.price.toLocaleString("id-ID")}</p>

              {/* WISHLIST BUTTON */}
              <AddToWishlist productId={item.id} />
            </div>
          </div>

        ))}
      </div>
    </div>
  );
}


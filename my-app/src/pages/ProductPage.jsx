"use client";

import ProductList from "../components/ProductList";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProductPage() {
  const { id } = useParams(); // category id
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("All Products");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest"); // newest | price_low | price_high

  // =====================================
  // FETCH PRODUCTS
  // =====================================
  const fetchProducts = async () => {
    setLoading(true);

    let query = supabase
      .from("products")
      .select(
        `
      *,
      product_images ( id, image_url, is_primary ),
      categories ( name ),
      brands ( name )
    `
      )
      .eq("is_active", true);

    // ✅ NEW IN PAGE
    if (location.pathname === "/products/new-in") {
      setTitle("New Arrivals");
      query = query.order("created_at", { ascending: false });
    }

    // ✅ CATEGORY PAGE
    else if (id) {
      const { data: children } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", id);

      const categoryIds = [id, ...(children?.map((c) => c.id) || [])];

      query = query.in("category_id", categoryIds);

      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      setTitle(cat?.name || "Category");
    }

    // ✅ SORTING
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "price_low") {
      query = query.order("base_price", { ascending: true });
    } else if (sort === "price_high") {
      query = query.order("base_price", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch error:", error.message);
    }

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [location.pathname, id, sort]);

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex items-baseline justify-between border-b border-gray-200 pt-24 pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>

          {/* SORT */}
          <select
            className="border px-3 py-2 rounded"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
          </select>
        </div>

        <section className="pt-6 pb-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* FILTER AREA */}
            <div className="hidden lg:block border-r pr-4 text-sm text-gray-600">
              Filters coming soon...
            </div>

            {/* PRODUCT GRID */}
            <div className="lg:col-span-3">
              {loading ? (
                <p className="text-gray-400">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">No products found.</p>
              ) : (
                <ProductList products={products} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

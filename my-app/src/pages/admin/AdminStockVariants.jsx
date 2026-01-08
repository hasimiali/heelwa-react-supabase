"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminStockVariants() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortLowStock, setSortLowStock] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        product_variants (
          id,
          sku,
          color,
          size,
          stock_quantity,
          price
        )
      `
      )
      .order("name", { ascending: true });

    if (!error) {
      setProducts(data || []);
    }

    setLoading(false);
  }

  // ==========================
  // FILTER + SORT
  // ==========================
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .map((p) => ({
      ...p,
      product_variants: sortLowStock
        ? [...p.product_variants].sort(
            (a, b) => a.stock_quantity - b.stock_quantity
          )
        : p.product_variants,
    }));

  if (loading) {
    return <p className="p-6">Loading stock...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Variant Stock</h1>

        <button
          onClick={loadProducts}
          className="text-sm border px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sortLowStock}
            onChange={(e) => setSortLowStock(e.target.checked)}
          />
          Urutkan stok terendah
        </label>
      </div>

      {/* PRODUCT LIST */}
      <div className="space-y-8">
        {filteredProducts.length === 0 && (
          <p className="text-gray-500 text-sm">Produk tidak ditemukan</p>
        )}

        {filteredProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">{product.name}</h2>

            {product.product_variants.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada variant</p>
            ) : (
              <table className="w-full text-sm border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2">SKU</th>
                    <th className="border p-2">Color</th>
                    <th className="border p-2">Size</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Stock</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {product.product_variants.map((v) => {
                    const lowStock = v.stock_quantity <= 3;

                    return (
                      <tr key={v.id} className={lowStock ? "bg-red-50" : ""}>
                        <td className="border p-2">{v.sku || "-"}</td>
                        <td className="border p-2">{v.color || "-"}</td>
                        <td className="border p-2">{v.size || "-"}</td>
                        <td className="border p-2 text-right">
                          Rp {Number(v.price).toLocaleString("id-ID")}
                        </td>
                        <td className="border p-2 text-center font-semibold">
                          {v.stock_quantity}
                        </td>
                        <td className="border p-2 text-center">
                          {v.stock_quantity === 0 ? (
                            <span className="text-red-600 font-medium">
                              Habis
                            </span>
                          ) : lowStock ? (
                            <span className="text-orange-600 font-medium">
                              Stok Rendah
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">
                              Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ShoppingCart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [keepItems, setKeepItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================
  // LOAD CART
  // ==========================
  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCartItems([]);
      setKeepItems([]);
      setLoading(false);
      return;
    }

    const { data: userCart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!userCart) {
      setCartItems([]);
      setKeepItems([]);
      setLoading(false);
      return;
    }

    const { data: items } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        keep,
        product_variants (
          id,
          color,
          size,
          price,
          stock_quantity,
          products (
            name,
            product_images ( image_url, is_primary )
          )
        )
      `
      )
      .eq("cart_id", userCart.id);

    const cart = [];
    const keep = [];

    items?.forEach((item) => {
      const variant = item.product_variants;
      const product = variant?.products;

      if (!variant || !product) return; // defensive

      const images = product.product_images || [];
      const image =
        images.find((i) => i.is_primary)?.image_url ||
        images[0]?.image_url ||
        "";

      const formatted = {
        id: item.id,
        variantId: variant.id,
        name: product.name,
        color: variant.color,
        size: variant.size,
        price: Number(variant.price),
        quantity: item.quantity,
        keep: item.keep,
        stock: variant.stock_quantity,
        imageSrc: image,
      };

      item.keep ? keep.push(formatted) : cart.push(formatted);
    });

    setCartItems(cart);
    setKeepItems(keep);
    setSelectedIds([]);
    setLoading(false);
  }

  // ==========================
  // SELECT ITEM
  // ==========================
  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ==========================
  // REMOVE SELECTED
  // ==========================
  async function removeSelected() {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(`Hapus ${selectedIds.length} item dari cart?`);
    if (!ok) return;

    await supabase.from("cart_items").delete().in("id", selectedIds);

    loadCart();
  }

  // ==========================
  // KEEP SELECTED (MAX 3)
  // ==========================
  async function keepSelected() {
    if (keepItems.length + selectedIds.length > 3) {
      alert("Maksimal 3 item KEEP");
      return;
    }

    const ok = window.confirm(
      "Item KEEP tidak bisa diubah atau dihapus.\n\nLanjutkan?"
    );
    if (!ok) return;

    for (const id of selectedIds) {
      const item = cartItems.find((i) => i.id === id);
      if (!item || item.stock <= 0) continue;

      await supabase.from("cart_items").update({ keep: true }).eq("id", id);

      await supabase
        .from("product_variants")
        .update({
          stock_quantity: item.stock - item.quantity,
        })
        .eq("id", item.variantId);
    }

    loadCart();
  }

  if (loading) {
    return <p className="pt-32 text-center">Loading cart...</p>;
  }

  return (
    <div className="bg-white">
      <div className="pt-28 mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

        <div className="mt-6 border-t"></div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* CART */}
          <div className="lg:col-span-8">
            <ul className="divide-y">
              {cartItems.map((p) => (
                <li key={p.id} className="flex py-6 gap-4 items-start">
                  <input
                    type="checkbox"
                    className="mt-2"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />

                  <img
                    src={p.imageSrc}
                    className="h-24 w-24 rounded-md border object-cover"
                    alt={p.name}
                  />

                  <div className="flex-1">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-sm text-gray-500">
                      {p.color}
                      {p.size ? ` · ${p.size}` : ""}
                    </p>

                    {p.stock > 0 ? (
                      <p className="text-xs text-green-600 mt-1">
                        Stock tersedia: {p.stock}
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 mt-1">Unavailable</p>
                    )}
                  </div>

                  <div className="font-medium whitespace-nowrap">
                    Rp {(p.price * p.quantity).toLocaleString("id-ID")}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* SELECTED PANEL */}
          <div className="lg:col-span-4">
            <div className="rounded-lg border bg-gray-50 p-4">
              <h2 className="font-semibold mb-4">
                Item Dipilih ({selectedIds.length})
              </h2>

              {selectedIds.length === 0 ? (
                <p className="text-sm text-gray-500">Pilih item dari cart</p>
              ) : (
                <>
                  <ul className="space-y-3 text-sm">
                    {cartItems
                      .filter((i) => selectedIds.includes(i.id))
                      .map((p) => (
                        <li key={p.id}>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-gray-500">
                            {p.color}
                            {p.size ? ` · ${p.size}` : ""}
                          </div>
                        </li>
                      ))}
                  </ul>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={removeSelected}
                      className="flex-1 border border-red-600 text-red-600 py-2 rounded text-sm"
                    >
                      Hapus
                    </button>

                    <button
                      onClick={keepSelected}
                      disabled={keepItems.length + selectedIds.length > 3}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded text-sm disabled:opacity-50"
                    >
                      Add to Keep
                    </button>
                  </div>

                  {keepItems.length + selectedIds.length > 3 && (
                    <p className="text-xs text-red-500 mt-2">
                      Maksimal 3 item KEEP
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* KEEP SECTION */}
        {keepItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold">
              Keep (Try Later) {keepItems.length}/3
            </h2>

            <ul className="mt-6 divide-y border-t">
              {keepItems.map((p) => (
                <li key={p.id} className="flex py-6 opacity-80 justify-between">
                  <div className="flex">
                    <img
                      src={p.imageSrc}
                      className="h-24 w-24 rounded-md border object-cover"
                      alt={p.name}
                    />
                    <div className="ml-4">
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="text-sm text-gray-500">
                        {p.color}
                        {p.size ? ` · ${p.size}` : ""}
                      </p>
                      <p className="text-xs mt-1">
                        Item ini tidak dapat diubah
                      </p>
                    </div>
                  </div>

                  <div className="font-medium">
                    Rp {(p.price * p.quantity).toLocaleString("id-ID")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

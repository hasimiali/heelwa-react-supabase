"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ShoppingCart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [keepItems, setKeepItems] = useState([]);
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

    items.forEach((item) => {
      const images = item.product_variants.products.product_images || [];
      const image =
        images.find((i) => i.is_primary)?.image_url ||
        images[0]?.image_url ||
        "";

      const formatted = {
        id: item.id,
        name: item.product_variants.products.name,
        color: item.product_variants.color,
        size: item.product_variants.size,
        price: Number(item.product_variants.price),
        quantity: item.quantity,
        keep: item.keep,
        imageSrc: image,
      };

      cart.push(formatted);
      if (item.keep) keep.push(formatted);
    });

    setCartItems(cart);
    setKeepItems(keep);
    setLoading(false);
  }

  // ==========================
  // KEEP (LOCKED)
  // ==========================
  async function toggleKeep(id) {
    if (keepItems.length >= 3) {
      alert("Maksimal 3 item untuk dicoba");
      return;
    }

    const confirmed = window.confirm(
      "Item yang ditambahkan ke Keep tidak bisa diubah atau dihapus.\n\nLanjutkan?"
    );

    if (!confirmed) return;

    await supabase.from("cart_items").update({ keep: true }).eq("id", id);
    loadCart();
  }

  // ==========================
  // TOTAL (EXCLUDE KEEP)
  // ==========================
  const subtotal = cartItems
    .filter((i) => !i.keep)
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const shipping = subtotal > 0 ? 25000 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (loading) {
    return <p className="pt-32 text-center">Loading cart...</p>;
  }

  return (
    <div className="bg-white">
      <div className="pt-28 mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* CART */}
          <div className="lg:col-span-8">
            <ul className="divide-y border-t">
              {cartItems.map((p) => (
                <li key={p.id} className="flex py-8">
                  <img
                    src={p.imageSrc}
                    className="h-24 w-24 rounded-md border object-cover"
                  />

                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="flex justify-between font-medium">
                      <h3>{p.name}</h3>
                      {!p.keep && (
                        <p>
                          Rp {(p.price * p.quantity).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      {p.color}
                      {p.size ? ` · ${p.size}` : ""}
                    </p>

                    <label className="mt-3 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={p.keep}
                        disabled={p.keep}
                        onChange={() => toggleKeep(p.id)}
                      />
                      Keep (Try later)
                    </label>

                    {p.keep && (
                      <p className="text-xs text-gray-400 mt-1">
                        Item terkunci
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-4">
            <div className="rounded-lg border bg-gray-50 p-6">
              <h2 className="font-medium">Order summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Rp {shipping.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>Rp {tax.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between border-t pt-4 font-semibold">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                disabled={subtotal === 0}
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded bg-indigo-600 py-3 text-white disabled:opacity-50"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* KEEP SECTION */}
        {keepItems.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold">
              Keep (Try Later) {keepItems.length}/3
            </h2>

            <ul className="mt-6 divide-y border-t">
              {keepItems.map((p) => (
                <li key={p.id} className="flex py-8 opacity-80">
                  <img
                    src={p.imageSrc}
                    className="h-24 w-24 rounded-md border object-cover"
                  />

                  <div className="ml-4">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-sm text-gray-500">
                      {p.color}
                      {p.size ? ` · ${p.size}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Item ini tidak dapat diubah
                    </p>
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

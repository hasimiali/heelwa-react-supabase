"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminUserCarts() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================
  // LOAD USERS
  // ==========================
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles") // asumsi ada table profiles
      .select("id, email");

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  // ==========================
  // LOAD USER CART
  // ==========================
  async function loadUserCart(userId) {
    setSelectedUser(userId);
    setCartItems([]);

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!cart) return;

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
          products (
            name
          )
        )
      `
      )
      .eq("cart_id", cart.id);

    setCartItems(items || []);
  }

  // ==========================
  // REMOVE KEEP
  // ==========================
  async function removeKeep(itemId) {
    const ok = confirm("Hapus status KEEP item ini?");
    if (!ok) return;

    await supabase.from("cart_items").update({ keep: false }).eq("id", itemId);

    loadUserCart(selectedUser);
  }

  // ==========================
  // REMOVE ITEM
  // ==========================
  async function removeItem(itemId) {
    const ok = confirm("Hapus item ini dari cart user?");
    if (!ok) return;

    await supabase.from("cart_items").delete().eq("id", itemId);
    loadUserCart(selectedUser);
  }

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Cart Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* USER LIST */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Users</h2>

          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.id}
                onClick={() => loadUserCart(u.id)}
                className={`cursor-pointer rounded px-3 py-2 text-sm ${
                  selectedUser === u.id
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {u.email}
              </li>
            ))}
          </ul>
        </div>

        {/* CART ITEMS */}
        <div className="md:col-span-3 border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Cart Items</h2>

          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              Pilih user untuk melihat cart.
            </p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Variant</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Keep</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="border p-2">
                      {item.product_variants.products.name}
                    </td>

                    <td className="border p-2">
                      {item.product_variants.color}
                      {item.product_variants.size
                        ? ` / ${item.product_variants.size}`
                        : ""}
                    </td>

                    <td className="border p-2 text-center">{item.quantity}</td>

                    <td className="border p-2 text-center">
                      {item.keep ? "YES" : "NO"}
                    </td>

                    <td className="border p-2 space-x-2">
                      {item.keep && (
                        <button
                          onClick={() => removeKeep(item.id)}
                          className="text-indigo-600 text-xs"
                        >
                          Remove Keep
                        </button>
                      )}

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

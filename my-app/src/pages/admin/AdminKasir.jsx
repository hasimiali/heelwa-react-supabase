"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminUserCarts() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [cashier, setCashier] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userKeepCount, setUserKeepCount] = useState({});


  // ==========================
  // LOAD USERS
  // ==========================
  useEffect(() => {
    loadUsers();
    loadCashier();
  }, []);

  async function loadCashier() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Kasir belum login");
      return;
    }

    setCashier(user);
  }

async function loadUsers() {
  setLoading(true);

  // 1. Ambil users
  const { data: usersData } = await supabase
    .from("profiles")
    .select("id, username")
    .order("username", { ascending: true });

  if (!usersData) {
    setUsers([]);
    setLoading(false);
    return;
  }

  // 2. Ambil cart + cart_items keep
  const { data: carts } = await supabase
    .from("carts")
    .select(`
      user_id,
      cart_items ( id )
    `)
    .eq("cart_items.keep", true);

  // 3. Hitung jumlah keep per user
  const keepCount = {};
  carts?.forEach((cart) => {
    keepCount[cart.user_id] = cart.cart_items.length;
  });

  setUsers(usersData);
  setUserKeepCount(keepCount);
  setLoading(false);
}


  async function searchVariants() {
    const { data } = await supabase
      .from("product_variants")
      .select(
        `
  id,
  sku,
  color,
  size,
  price,
  stock_quantity,
  products!inner ( name )
`
      )
      .ilike("products.name", `%${search}%`)

      .limit(10);

    setVariants(data || []);
  }

  async function addToKeep() {
    if (!selectedVariant || qty <= 0) {
      alert("Variant & qty wajib diisi");
      return;
    }

    if (qty > selectedVariant.stock_quantity) {
      alert("Stok tidak cukup");
      return;
    }

    // 1. Ambil / buat cart user
    let { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", selectedUser)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: selectedUser })
        .select("id")
        .single();

      cart = newCart;
    }

    // 2. Insert cart item (KEEP)
    await supabase.from("cart_items").insert({
      cart_id: cart.id,
      variant_id: selectedVariant.id,
      quantity: qty,
      keep: true,
    });

    // 3. Update stok
    await supabase
      .from("product_variants")
      .update({
        stock_quantity: selectedVariant.stock_quantity - qty,
      })
      .eq("id", selectedVariant.id);

    // 4. Inventory log
    await supabase.from("inventory_log").insert({
      variant_id: selectedVariant.id,
      change_type: "adjustment",
      quantity_change: -qty,
      cashier_id: cashier.id,
      customer_id: selectedUser,
    });

    setSearch("");
    setVariants([]);
    setSelectedVariant(null);
    setQty(1);

    loadUserCart(selectedUser);
  }

  // ==========================
  // LOAD USER CART
  // ==========================
  async function loadUserCart(userId) {
    setSelectedUser(userId);
    setCartItems([]);
    setSelectedItems([]);

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
          id,
          color,
          size,
          price,
          products ( name )
        )
      `
      )
      .eq("cart_id", cart.id)
      .eq("keep", true);

    setCartItems(items || []);
  }

  // ==========================
  // CHECKBOX HANDLER
  // ==========================
  function toggleItem(item) {
    setSelectedItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }

  // ==========================
  // TOTAL PRICE
  // ==========================
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.product_variants.price,
    0
  );

  // ==========================
  // BUY SELECTED ITEMS
  // ==========================
  async function buySelectedItems(paymentMethod) {
    if (selectedItems.length === 0) {
      alert("Pilih item terlebih dahulu");
      return;
    }

    const ok = confirm(
      `Apakah pembeli sudah membayar Rp ${totalPrice.toLocaleString()} via ${paymentMethod}?`
    );
    if (!ok) return;

    const transactionId = crypto.randomUUID();

    for (const item of selectedItems) {
      await supabase.from("inventory_log").insert({
        transaction_id: transactionId,
        variant_id: item.product_variants.id,
        change_type: "sale",
        quantity_change: -item.quantity,
        cashier_id: cashier.id,
        customer_id: selectedUser,
        payment_method: paymentMethod, // ✅ SIMPAN
      });

      await supabase.from("cart_items").delete().eq("id", item.id);
    }

    setSelectedItems([]);
    loadUserCart(selectedUser);

    // alert("Pembelian berhasil");
  }

  // ==========================
  // REMOVE KEEP (SINGLE)
  // ==========================
  async function removeKeep(itemId) {
    const ok = confirm("Hapus status KEEP dan kembalikan stok?");
    if (!ok) return;

    // 1. Ambil cart item
    const { data: item, error: itemErr } = await supabase
      .from("cart_items")
      .select("id, variant_id, quantity, keep")
      .eq("id", itemId)
      .single();

    if (itemErr || !item || !item.keep) {
      alert("Item tidak valid");
      return;
    }

    // 2. Update keep = false
    const { error: keepErr } = await supabase
      .from("cart_items")
      .update({ keep: false })
      .eq("id", itemId);

    if (keepErr) {
      alert("Gagal update keep");
      return;
    }

    // 3. Ambil stok
    const { data: variant, error: variantErr } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", item.variant_id)
      .single();

    if (variantErr) {
      alert("Gagal ambil stok");
      return;
    }

    // 4. Update stok
    const newStock = variant.stock_quantity + item.quantity;

    await supabase
      .from("product_variants")
      .update({ stock_quantity: newStock })
      .eq("id", item.variant_id);

    // 5. Inventory log
    await supabase.from("inventory_log").insert({
      variant_id: item.variant_id,
      change_type: "return",
      quantity_change: item.quantity,
      cashier_id: cashier.id,
      customer_id: selectedUser,
    });

    loadUserCart(selectedUser);
  }

  // ==========================
  // REMOVE KEEP (BULK) + RETURN STOCK
  // ==========================
  async function removeKeepSelectedItems() {
    if (selectedItems.length === 0) {
      alert("Pilih item terlebih dahulu");
      return;
    }

    const ok = confirm(
      `Hapus KEEP & kembalikan stok untuk ${selectedItems.length} item?`
    );
    if (!ok) return;

    for (const selected of selectedItems) {
      // 1. Ambil cart item
      const { data: item } = await supabase
        .from("cart_items")
        .select("id, variant_id, quantity, keep")
        .eq("id", selected.id)
        .single();

      if (!item || !item.keep) continue;

      // 2. Update keep
      await supabase
        .from("cart_items")
        .update({ keep: false })
        .eq("id", item.id);

      // 3. Ambil stok
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variant_id)
        .single();

      // 4. Update stok
      const newStock = variant.stock_quantity + item.quantity;

      await supabase
        .from("product_variants")
        .update({ stock_quantity: newStock })
        .eq("id", item.variant_id);

      // 5. Log
      await supabase.from("inventory_log").insert({
        variant_id: item.variant_id,
        change_type: "return",
        quantity_change: item.quantity,
      });
    }

    setSelectedItems([]);
    loadUserCart(selectedUser);
  }

  // ==========================
  // DELETE ITEM
  // ==========================
  async function removeItem(itemId) {
    const ok = confirm("Hapus item ini dari cart?");
    if (!ok) return;

    await supabase.from("cart_items").delete().eq("id", itemId);
    loadUserCart(selectedUser);
  }

  if (loading) return <p className="p-6">Loading...</p>;

const filteredUsers = users
  .filter((u) =>
    (u.username || "").toLowerCase().includes(userSearch.toLowerCase())
  )
  .sort((a, b) => {
    const keepA = userKeepCount[a.id] || 0;
    const keepB = userKeepCount[b.id] || 0;

    // 1️⃣ Prioritaskan yang punya KEEP
    if (keepA > 0 && keepB === 0) return -1;
    if (keepA === 0 && keepB > 0) return 1;

    // 2️⃣ Jika sama-sama punya KEEP → urut jumlah terbanyak
    if (keepA !== keepB) return keepB - keepA;

    // 3️⃣ Fallback: urut username
    return (a.username || "").localeCompare(b.username || "");
  });


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Cart Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* USERS */}
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Users</h2>

          <input
            type="text"
            placeholder="Cari username..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full mb-3 rounded border px-3 py-2 text-sm"
          />

          <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
<li
  key={u.id}
  onClick={() => loadUserCart(u.id)}
  className={`cursor-pointer rounded px-3 py-2 text-sm flex justify-between items-center ${
    selectedUser === u.id
      ? "bg-indigo-600 text-white"
      : "hover:bg-gray-100"
  }`}
>
  <span>{u.username || "(tanpa username)"}</span>

  {userKeepCount[u.id] > 0 && (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        selectedUser === u.id
          ? "bg-white text-indigo-600"
          : "bg-indigo-600 text-white"
      }`}
    >
      {userKeepCount[u.id]}
    </span>
  )}
</li>

            ))}
          </ul>
        </div>

        {selectedUser && (
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Add Product to KEEP</h3>

            <div className="flex gap-2 mb-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="border px-3 py-2 text-sm w-full"
              />
              <button
                onClick={searchVariants}
                className="bg-gray-800 text-white px-4 rounded text-sm"
              >
                Cari
              </button>
            </div>

            {variants.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`p-2 border rounded mb-1 cursor-pointer ${
                  selectedVariant?.id === v.id
                    ? "bg-indigo-50 border-indigo-600"
                    : ""
                }`}
              >
                <div className="font-semibold">
                  {v.products?.name ?? "(Produk tidak tersedia)"}
                </div>

                <div className="text-xs text-gray-600">
                  {v.color} {v.size && ` / ${v.size}`} — Stok:{" "}
                  {v.stock_quantity}
                </div>
              </div>
            ))}

            {selectedVariant && (
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="border px-3 py-2 text-sm w-24"
                />
                <button
                  onClick={addToKeep}
                  className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
                >
                  Add to KEEP
                </button>
              </div>
            )}
          </div>
        )}

        {/* CART ITEMS */}
        <div className="md:col-span-3 border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Cart Items (KEEP)</h2>

          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              Pilih user untuk melihat cart.
            </p>
          ) : (
            <>
              <table className="w-full text-sm border mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-2"></th>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Variant</th>
                    <th className="border p-2">Qty</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={
                            !!selectedItems.find((i) => i.id === item.id)
                          }
                          onChange={() => toggleItem(item)}
                        />
                      </td>

                      <td className="border p-2">
                        {item.product_variants?.products?.name ??
                          "(Produk tidak tersedia)"}
                      </td>

                      <td className="border p-2">
                        {item.product_variants.color}
                        {item.product_variants.size
                          ? ` / ${item.product_variants.size}`
                          : ""}
                      </td>

                      <td className="border p-2 text-center">
                        {item.quantity}
                      </td>

                      <td className="border p-2 text-right">
                        Rp{" "}
                        {(
                          item.product_variants.price * item.quantity
                        ).toLocaleString()}
                      </td>

                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => removeKeep(item.id)}
                          className="text-indigo-600 text-xs"
                        >
                          Remove Keep
                        </button>
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

              {/* ACTION BAR */}
              <div className="flex justify-between items-center">
                <div className="font-semibold">
                  Total: Rp {totalPrice.toLocaleString()}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={removeKeepSelectedItems}
                    disabled={selectedItems.length === 0}
                    className="border border-red-600 text-red-600 px-4 py-2 rounded text-sm disabled:opacity-50"
                  >
                    Hapus Keep Terpilih
                  </button>

                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={selectedItems.length === 0}
                    className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                  >
                    Beli Item Terpilih
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Metode Pembayaran</h3>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="">-- Pilih Metode --</option>
              <option value="EDC">EDC</option>
              <option value="Transfer">Transfer</option>
              <option value="QRIS">QRIS</option>
              <option value="Cash">Cash</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod("");
                }}
                className="px-4 py-2 border rounded text-sm"
              >
                Batal
              </button>

              <button
                disabled={!paymentMethod}
                onClick={() => {
                  setShowPaymentModal(false);
                  buySelectedItems(paymentMethod);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

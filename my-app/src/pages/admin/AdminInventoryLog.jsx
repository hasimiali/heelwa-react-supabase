"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminInventoryLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, [filter]);

  async function loadLogs() {
    setLoading(true);

let query = supabase
  .from("inventory_log")
  .select(
    `
      id,
      transaction_id,
      change_type,
      quantity_change,
      payment_method,
      created_at,
      product_variants (
        sku,
        color,
        size,
        price,
        products ( name )
      ),
      cashier:profiles!inventory_log_cashier_id_fkey (
        username
      ),
      customer:profiles!inventory_log_customer_id_fkey (
        username
      )
    `
  )
  .eq("change_type", "sale") // ✅ HANYA SALE
  .order("created_at", { ascending: false });


    if (filter !== "all") {
      query = query.eq("change_type", filter);
    }

    const { data, error } = await query;

    if (!error) {
      setLogs(groupByTransaction(data || []));
    }

    setLoading(false);
  }

  function groupByTransaction(logs) {
    const grouped = {};

    for (const log of logs) {
      const key = log.transaction_id || log.id;

      if (!grouped[key]) {
        grouped[key] = {
          transaction_id: log.transaction_id,
          created_at: log.created_at,
          cashier: log.cashier?.username || "-",
          customer: log.customer?.username || "-",
          payment_method: log.payment_method || "-",
          items: [],
        };
      }

      grouped[key].items.push(log);
    }

    return Object.values(grouped);
  }

  function badgeColor(type) {
    switch (type) {
      case "sale":
        return "bg-red-100 text-red-700";
      case "restock":
        return "bg-green-100 text-green-700";
      case "return":
        return "bg-blue-100 text-blue-700";
      case "adjustment":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return <p className="p-6">Loading inventory log...</p>;
  }

const totalItemSold = logs.reduce((sum, trx) => {
  return (
    sum +
    trx.items.reduce(
      (s, item) => s + Math.abs(item.quantity_change),
      0
    )
  );
}, 0);

const totalRevenue = logs.reduce((sum, trx) => {
  return (
    sum +
    trx.items.reduce(
      (s, item) =>
        s +
        Math.abs(item.quantity_change) *
          (item.product_variants?.price || 0),
      0
    )
  );
}, 0);

  return (
    <div className="p-6 py-25">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Log</h1>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Total Item Terjual</div>
    <div className="text-2xl font-bold">{totalItemSold}</div>
  </div>

  <div className="border rounded-lg p-4 bg-white">
    <div className="text-sm text-gray-500">Total Penjualan</div>
    <div className="text-2xl font-bold">
      Rp {totalRevenue.toLocaleString()}
    </div>
  </div>
</div>


        {/* FILTER */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="sale">Sale</option>
          <option value="restock">Restock</option>
          <option value="return">Return</option>
          <option value="adjustment">Adjustment</option>
        </select>
      </div>

      <div className="space-y-6">
        {logs.map((trx, idx) => (
          <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
            {/* HEADER NOTA */}
            <div className="mb-3">
              <div className="font-semibold">
                🧾 Nota #{trx.transaction_id?.slice(0, 8)}
              </div>
              <div className="text-sm text-gray-600 flex gap-4">
                <div>
                  Kasir: <b>{trx.cashier}</b>
                </div>
                <div>
                  Pelanggan: <b>{trx.customer}</b>
                </div>
                <div>
                  Pembayaran: <b>{trx.payment_method}</b>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {new Date(trx.created_at).toLocaleString()}
              </div>
            </div>

            {/* ITEM TABLE */}
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Product</th>
                  <th className="border p-2 text-center">Variant</th>
                  <th className="border p-2 text-center">SKU</th>
                  <th className="border p-2 text-center">Qty</th>
                </tr>
              </thead>
              <tbody>
                {trx.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border p-2">
                      {item.product_variants?.products?.name}
                    </td>
                    <td className="border p-2 text-center">
                      {item.product_variants?.color}
                      {item.product_variants?.size &&
                        ` / ${item.product_variants.size}`}
                    </td>
                    <td className="border p-2 text-center">
                      {item.product_variants?.sku}
                    </td>
                      <td className="border p-2 text-center font-semibold">
                        {Math.abs(item.quantity_change)}
                      </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {logs.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No inventory logs found
          </p>
        )}
      </div>
    </div>
  );
}

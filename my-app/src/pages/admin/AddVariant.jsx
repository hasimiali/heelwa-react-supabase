import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AddVariant() {
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.from("product_variants").insert([
      {
        product_id: productId,
        color,
        size,
        price,
        stock_quantity: stock,
      },
    ]);

    if (error) return alert(error.message);
    alert("Variant added");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Variant</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="number" placeholder="Product ID" className="input" value={productId} onChange={(e) => setProductId(e.target.value)} />

        <input type="text" placeholder="Color" className="input" value={color} onChange={(e) => setColor(e.target.value)} />

        <input type="text" placeholder="Size" className="input" value={size} onChange={(e) => setSize(e.target.value)} />

        <input type="number" placeholder="Price" className="input" value={price} onChange={(e) => setPrice(e.target.value)} />

        <input type="number" placeholder="Stock" className="input" value={stock} onChange={(e) => setStock(e.target.value)} />

        <button className="btn-primary">Add Variant</button>
      </form>
    </div>
  );
}

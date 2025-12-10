import { supabase } from "../supabaseClient";
import { useState } from "react";

export default function AddToWishlist({ productId }) {
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return alert("Silakan login terlebih dahulu.");
    }

    await supabase.from("wishlist").insert({
      user_id: user.id,
      product_id: productId,
    });

    setLoading(false);
    alert("Ditambahkan ke wishlist ✅");
  }

  return (
    <button
      onClick={handleAdd}
      className="text-sm text-purple-700 hover:text-purple-900 mt-2"
    >
      {loading ? "Adding..." : "Add to Wishlist"}
    </button>
  );
}

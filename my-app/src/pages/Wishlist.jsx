import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id,
        product:products (
          id,
          name,
          price,
          product_images (image_url, is_primary)
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      setItems([]);
      return;
    }

    setItems(data ?? []);
  }

  async function removeItem(id) {
    await supabase.from("wishlists").delete().eq("id", id);
    fetchWishlist();
  }

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>

      {items.length === 0 ? (
        <p>No products added to the wishlist.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-center">Price</th>
              <th className="p-3 text-center"></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const img = item.product.product_images.find(i => i.is_primary)?.image_url;
              return (
                <tr key={item.id} className="border-t">
                  <td className="p-3 flex items-center gap-3">
                    <img src={img} className="w-14 h-14 object-cover rounded" />
                    {item.product.name}
                  </td>
                  <td className="p-3 text-center">
                    Rp{item.product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove ✖
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      )}
    </div>
  );
}

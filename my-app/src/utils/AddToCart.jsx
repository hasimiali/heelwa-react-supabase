import { supabase } from "../supabaseClient";

export async function addToCart(user_id, variant_id) {
  // cek apakah sudah ada item dengan variant_id yang sama
  const { data: existingItem, error: selectError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user_id)
    .eq("variant_id", variant_id)
    .single();

  if (existingItem) {
    // update quantity (tambah 1)
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + 1 })
      .eq("id", existingItem.id);

    return;
  }

  // kalau belum ada → insert baru
  await supabase.from("cart_items").insert([
    {
      user_id,
      variant_id,
      quantity: 1,
    },
  ]);
}

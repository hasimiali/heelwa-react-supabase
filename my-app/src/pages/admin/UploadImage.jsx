import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function UploadImage() {
  const [productId, setProductId] = useState("");
  const [file, setFile] = useState(null);

  async function uploadImage() {
    if (!file) return;
    
    const filename = `${Date.now()}-${file.name}`;
    
    const { error: storageError } = await supabase
      .storage
      .from("product-images")
      .upload(filename, file);

    if (storageError) return alert(storageError.message);

    const url = supabase.storage.from("product-images").getPublicUrl(filename).data.publicUrl;

    const { error: dbError } = await supabase.from("product_images").insert([
      { product_id: productId, image_url: url }
    ]);

    if (dbError) return alert(dbError.message);

    alert("Image uploaded!");
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Product Image</h1>

      <input type="number" placeholder="Product ID" className="input" onChange={(e) => setProductId(e.target.value)} />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button className="btn-primary" onClick={uploadImage}>Upload</button>
    </div>
  );
}

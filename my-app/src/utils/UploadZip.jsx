import AdmZip from "adm-zip";
import fs from "fs-extra";
import path from "path";
import { supabase } from "./supabaseClient.js";

export async function importProductImages(zipPath) {
  const extractPath = "./tmp_images";
  await fs.ensureDir(extractPath);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);

  // Load DB references
  const { data: products } = await supabase.from("products").select("id,name");
  const { data: categories } = await supabase.from("categories").select("*");

  const normalize = (v) => v.toLowerCase().trim().replace(/\s+/g, " ");

  for (const categoryFolder of await fs.readdir(extractPath)) {
    const category = categories.find(
      (c) => normalize(c.name) === normalize(categoryFolder)
    );
    if (!category) continue;

    const categoryPath = path.join(extractPath, categoryFolder);

    for (const subFolder of await fs.readdir(categoryPath)) {
      const subPath = path.join(categoryPath, subFolder);

      for (const productFolder of await fs.readdir(subPath)) {
        const product = products.find(
          (p) => normalize(p.name) === normalize(productFolder)
        );
        if (!product) continue;

        const productPath = path.join(subPath, productFolder);
        const files = await fs.readdir(productPath);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const buffer = await fs.readFile(path.join(productPath, file));

          const storagePath = `products/${product.id}/${file}`;

          await supabase.storage
            .from("product-images")
            .upload(storagePath, buffer, {
              contentType: "image/jpeg",
              upsert: true,
            });

          const { data: url } = supabase.storage
            .from("product-images")
            .getPublicUrl(storagePath);

          await supabase.from("product_images").insert({
            product_id: product.id,
            image_url: url.publicUrl,
            is_primary: i === 0,
          });
        }
      }
    }
  }

  await fs.remove(extractPath);
}

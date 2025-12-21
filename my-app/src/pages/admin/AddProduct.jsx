import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { useLocation } from "react-router-dom";
import Papa from "papaparse";
import JSZip from "jszip";

const formatRupiah = (value) => {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
};

const parseNumber = (value) => value.replace(/\D/g, "");

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);

  const [variants, setVariants] = useState([
    { color: "", size: "", price: "", stock: "", id: null },
  ]);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const location = useLocation();

  const csvInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const [importing, setImporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // ============================
  // AUTO SLUG
  // ============================
  useEffect(() => {
    if (name) {
      const autoSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(autoSlug);
    }
  }, [name]);

  // ============================
  // FETCH ALL
  // ============================
  const fetchAll = async () => {
    const { data: p } = await supabase
      .from("products")
      .select("*, product_images(image_url,is_primary)")
      .order("id", { ascending: false });

    const { data: c } = await supabase.from("categories").select("*");
    const { data: b } = await supabase.from("brands").select("*");

    const formatted = p?.map((prod) => {
      const sortedImgs = [...(prod.product_images || [])].sort(
        (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
      );
      return { ...prod, product_images: sortedImgs };
    });

    setProducts(formatted || []);
    setCategories(c || []);
    setBrands(b || []);
  };

  useEffect(() => {
    fetchAll();
  }, [location.pathname]);

  const handleDeleteAllProducts = async () => {
    const confirmDelete = confirm(
      "⚠️ This will DELETE ALL PRODUCTS, IMAGES, and VARIANTS. Continue?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      // 1. Ambil semua image url
      const { data: images, error: imgErr } = await supabase
        .from("product_images")
        .select("image_url");

      if (imgErr) throw imgErr;

      // 2. Hapus file di storage
      if (images?.length) {
        const filePaths = images.map(
          (img) => img.image_url.split("/storage/v1/object/public/")[1]
        );

        await supabase.storage.from("product-images").remove(filePaths);
      }

      // 3. Hapus semua variants
      await supabase.from("product_variants").delete().neq("id", 0);

      // 4. Hapus semua product images (DB)
      await supabase.from("product_images").delete().neq("id", 0);

      // 5. Hapus semua products
      await supabase.from("products").delete().neq("id", 0);

      alert("✅ All products deleted successfully");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete all products");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // IMAGE HANDLERS
  // ============================
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const removeExistingImage = async (url) => {
    try {
      const filePath = url.split("/storage/v1/object/public/")[1];
      await supabase.storage.from("product-images").remove([filePath]);
      await supabase.from("product_images").delete().eq("image_url", url);

      setExistingImages(existingImages.filter((img) => img.image_url !== url));
    } catch (err) {
      console.error(err);
      alert("❌ Failed to remove existing image");
    }
  };

  // ============================
  // VARIANTS HANDLERS
  // ============================
  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", size: "", price: "", stock: "", id: null },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // ============================
  // HANDLE EDIT PRODUCT
  // ============================
  const handleEditProduct = async (product) => {
    setEditingProduct(product);

    setName(product.name);
    setSlug(product.slug);
    setCategoryId(product.category_id);
    setBrandId(product.brand_id);
    setDescription(product.description || "");
    setBasePrice(product.base_price);

    setImages([]);
    setExistingImages(product.product_images || []);

    const { data: variantData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id);

    setVariants(
      variantData.map((v) => ({
        color: v.color,
        size: v.size,
        price: v.price,
        stock: v.stock_quantity,
        id: v.id,
      }))
    );

    setShowModal(true);
  };

  // ============================
  // SUBMIT PRODUCT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let product = editingProduct;

      if (!editingProduct) {
        const { data, error } = await supabase
          .from("products")
          .insert([
            {
              name,
              slug,
              category_id: categoryId,
              brand_id: brandId,
              description,
              base_price: basePrice,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        product = data;
      } else {
        const { error } = await supabase
          .from("products")
          .update({
            name,
            slug,
            category_id: categoryId,
            brand_id: brandId,
            description,
            base_price: basePrice,
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
      }

      // ============================
      // UPLOAD NEW IMAGES
      // ============================
      let uploadedImages = [];

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${i}.${ext}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedImages.push({
          product_id: product.id,
          image_url: urlData.publicUrl,
          is_primary: i === 0 && existingImages.length === 0,
        });
      }

      if (uploadedImages.length > 0) {
        await supabase.from("product_images").insert(uploadedImages);
      }

      const mainImage =
        uploadedImages[0]?.image_url || existingImages[0]?.image_url || null;

      // ============================
      // VARIANTS
      // ============================
      if (editingProduct) {
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", product.id);
      }

      const variantPayload = variants.map((v) => ({
        product_id: product.id,
        color: v.color,
        size: v.size,
        price: v.price || basePrice,
        stock_quantity: v.stock || 0,
        sku: `SKU-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        image_url: mainImage,
      }));

      await supabase.from("product_variants").insert(variantPayload);

      alert(`✅ Product ${editingProduct ? "updated" : "added"} successfully!`);
      resetForm();
      setShowModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("❌ " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName("");
    setSlug("");
    setCategoryId("");
    setBrandId("");
    setDescription("");
    setBasePrice("");
    setImages([]);
    setExistingImages([]);
    setVariants([{ color: "", size: "", price: "", stock: "", id: null }]);
  };

  // ============================
  // DELETE PRODUCT
  // ============================
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = confirm(
      "Delete this product and all its images & variants?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const { data: images } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);

      if (images?.length) {
        const filePaths = images.map(
          (img) => img.image_url.split("/storage/v1/object/public/")[1]
        );

        await supabase.storage.from("product-images").remove(filePaths);
      }

      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);
      await supabase.from("products").delete().eq("id", productId);

      alert("✅ Product deleted!");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete product!");
    }

    setLoading(false);
  };

  const handleImportCSV = async (e) => {
    if (isImporting) return; // 🔒 STOP DOUBLE RUN
    setIsImporting(true);

    const file = e.target.files[0];
    if (!file) {
      setIsImporting(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const rows = result.data.map((row) => {
            const clean = {};
            Object.keys(row).forEach((key) => {
              clean[key.trim()] =
                typeof row[key] === "string" ? row[key].trim() : row[key];
            });
            return clean;
          });

          const grouped = {};
          let lastProduct = null;
          let lastVariant = null;

          rows.forEach((row) => {
            // DETECT PRODUCT ROW
            if (row.name && row.category && row.brand) {
              grouped[row.name] = {
                product: row,
                variants: [],
              };
              lastProduct = row.name;
              lastVariant = null; // reset variant context
            }

            // DETECT VARIANT ROW (walaupun kolom kosong)
            if (lastProduct) {
              const variant = {
                color: row.color || lastVariant?.color || "",
                size: row.size || lastVariant?.size || "",
                price: row.price || lastVariant?.price || "",
                stock_quantity:
                  row.stock_quantity || lastVariant?.stock_quantity || 0,
              };

              // HANYA PUSH JIKA ADA SIZE (atau minimal salah satu)
              if (variant.size) {
                grouped[lastProduct].variants.push(variant);
                lastVariant = variant;
              }
            }
          });

          for (const key of Object.keys(grouped)) {
            const { product, variants } = grouped[key];

            const productCategory = (product.category || "").trim();
            const productBrand = (product.brand || "").trim();

            if (!productCategory || !productBrand) {
              console.warn("Missing category/brand, skipping:", product);
              continue;
            }

            const category = categories.find(
              (c) => c.name.trim() === productCategory
            );
            const brand = brands.find((b) => b.name.trim() === productBrand);

            if (!category || !brand) {
              console.warn("Category or brand not found:", product);
              continue;
            }

            const slug = product.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "");

            const basePrice = Number(product.base_price);
            if (isNaN(basePrice)) {
              console.warn("Invalid base price:", product.base_price);
              continue;
            }

            const { data: prod, error } = await supabase
              .from("products")
              .insert([
                {
                  name: product.name,
                  slug,
                  category_id: category.id,
                  brand_id: brand.id,
                  description: product.description || "",
                  base_price: basePrice,
                },
              ])
              .select()
              .single();

            if (error) throw error;

            const cleanVariants = variants.filter((v) => v.color && v.size);

            const variantPayload = cleanVariants.map((v) => ({
              product_id: prod.id,
              color: v.color,
              size: v.size,
              price: Number(v.price || basePrice),
              stock_quantity: Number(v.stock_quantity || 0),
              sku: `SKU-${prod.id}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
            }));

            if (variantPayload.length) {
              await supabase.from("product_variants").insert(variantPayload);
            }
          }

          alert("Import CSV berhasil");
        } catch (err) {
          console.error(err);
          alert("Import gagal");
        } finally {
          setIsImporting(false);
          e.target.value = "";
        }
      },
    });
  };

  const handleImportImageZip = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const zip = await JSZip.loadAsync(file);

    // get products
    const { data: products, error: productErr } = await supabase
      .from("products")
      .select("id, name");

    if (productErr || !products?.length) {
      alert("No products found");
      return;
    }

    for (const path in zip.files) {
      const zipFile = zip.files[path];

      // skip folders
      if (zipFile.dir) continue;

      // only images
      if (!path.match(/\.(jpg|jpeg|png)$/i)) continue;

      /**
       * example path:
       * product_images/Abaya/Adeeva/1.jpg
       */
      const parts = path.split("/");
      const productName = parts[parts.length - 2]; // Adeeva

      const product = products.find(
        (p) => p.name.toLowerCase() === productName.toLowerCase()
      );

      if (!product) {
        console.warn("❌ No product match:", productName);
        continue;
      }

      // convert zip file to blob
      const blob = await zipFile.async("blob");

      const filePath = `products/${product.id}-${Date.now()}.jpg`;

      // upload to storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, blob, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // get public url
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      // check if product already has images
      const { data: existingImages } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", product.id);

      // insert image record
      const { error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          image_url: imageUrl,
          is_primary: existingImages.length === 0, // first image = primary
        });

      if (insertError) {
        console.error("DB insert error:", insertError);
      }
    }

    alert("✅ Images imported successfully");
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="mt-20 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Products</h2>

        <div className="flex gap-2">
          <button
            onClick={handleDeleteAllProducts}
            disabled={loading}
            className="px-4 py-2 bg-red-700 text-white rounded"
          >
            🗑 Delete All
          </button>
          <button
            onClick={() => csvInputRef.current.click()}
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={importing}
          >
            {importing ? "Importing..." : "📥 Import CSV"}
          </button>

          <button
            onClick={() => zipInputRef.current.click()}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            🖼 Import Images ZIP
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            + Add Product
          </button>
        </div>
      </div>

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={handleImportCSV}
      />

      <input
        type="file"
        accept=".zip"
        hidden
        ref={zipInputRef}
        onChange={handleImportImageZip}
      />

      {/* PRODUCT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded bg-white shadow flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => handleEditProduct(p)}
          >
            <div className="flex items-center gap-3">
              {p.product_images?.[0] ? (
                <img
                  src={p.product_images[0].image_url}
                  className="w-20 h-20 object-cover rounded border"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                  No Image
                </div>
              )}

              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-gray-500">{p.slug}</p>
                <p className="text-sm">
                  Rp {new Intl.NumberFormat("id-ID").format(p.base_price)}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProduct(p.id);
              }}
              className="text-red-600 font-bold"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-white p-6 rounded shadow-lg w-[600px] pointer-events-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="border p-2 rounded"
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />

              <select
                className="border p-2 rounded"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="border p-2 rounded"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                required
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <textarea
                className="border p-2 rounded"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                className="border p-2 rounded"
                placeholder="Base Price"
                value={formatRupiah(basePrice)}
                onChange={(e) => setBasePrice(parseNumber(e.target.value))}
                required
              />

              {/* IMAGE PREVIEW */}
              <div>
                <p className="font-semibold mb-1">Product Images</p>
                <div className="flex flex-wrap gap-3 mb-3">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={img.image_url}
                        alt="existing"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      {i === 0 && (
                        <span className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-1 rounded">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.image_url)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      {i === 0 && existingImages.length === 0 && (
                        <span className="absolute top-0 left-0 bg-green-600 text-white text-[10px] px-1 rounded">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-3 py-1 border rounded text-sm"
                >
                  + Add Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleAddImages}
                />
              </div>

              {/* VARIANTS */}
              <h4 className="font-bold mt-3">Variants</h4>
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="border p-3 rounded space-y-2 bg-gray-50"
                >
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Color"
                    value={v.color}
                    onChange={(e) => updateVariant(i, "color", e.target.value)}
                  />
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Size"
                    value={v.size}
                    onChange={(e) => updateVariant(i, "size", e.target.value)}
                  />
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Variant Price"
                    value={formatRupiah(v.price)}
                    onChange={(e) =>
                      updateVariant(i, "price", parseNumber(e.target.value))
                    }
                  />
                  <input
                    className="border p-2 rounded w-full"
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-red-600 text-sm"
                    >
                      ❌ Remove Variant
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addVariant}
                className="text-blue-600 font-medium"
              >
                + Add Another Variant
              </button>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Saving..." : editingProduct ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

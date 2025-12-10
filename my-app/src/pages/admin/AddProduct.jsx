import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { useLocation } from "react-router-dom";

const formatRupiah = (value) => {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
};

const parseNumber = (value) => {
  return value.replace(/\D/g, "");
};

export default function AddProduct() {
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
  const fileInputRef = useRef(null);

  const [variants, setVariants] = useState([
    { color: "", size: "", price: "", stock: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();

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
  // FETCH ALL (WITH IMAGES)
  // ============================
  const fetchAll = async () => {
    const { data: p } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images ( image_url, is_primary )
      `
      )
      .order("id", { ascending: false });

    const { data: c } = await supabase.from("categories").select("*");
    const { data: b } = await supabase.from("brands").select("*");

    // Sort images so primary is first
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

  // ============================
  // VARIANT HANDLERS
  // ============================
  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", price: "", stock: "" }]);
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
  // SUBMIT PRODUCT
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert product
      const { data: product, error: productError } = await supabase
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

      if (productError) throw productError;

      let uploadedImages = [];

      // Upload images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const ext = file.name.split(".").pop();
          const fileName = `${Date.now()}-${i}.${ext}`;
          const filePath = `products/${fileName}`;

          const fileToUpload = new File([file], file.name, { type: file.type });

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, fileToUpload, {
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
            is_primary: i === 0,
          });
        }

        await supabase.from("product_images").insert(uploadedImages);
      }

      const mainImage = uploadedImages[0]?.image_url || null;

      // Insert variants
      const variantPayload = variants.map((v) => ({
        product_id: product.id,
        color: v.color,
        size: v.size,
        price: v.price || basePrice,
        stock_quantity: v.stock || 0,
        image_url: mainImage,
        sku: `SKU-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      }));

      await supabase.from("product_variants").insert(variantPayload);

      alert("✅ Product added successfully!");
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
    setName("");
    setSlug("");
    setCategoryId("");
    setBrandId("");
    setDescription("");
    setBasePrice("");
    setImages([]);
    setVariants([{ color: "", size: "", price: "", stock: "" }]);
  };

  // ============================
  // DELETE FULL PRODUCT
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
        const filePaths = images.map((img) => {
          const parts = img.image_url.split("/storage/v1/object/public/");
          return parts[1];
        });

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

  return (
    <div className="mt-20 p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Products</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded"
      >
        + Add Product
      </button>

      {/* PRODUCT LIST WITH IMAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded bg-white shadow flex items-center justify-between"
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
              onClick={() => handleDeleteProduct(p.id)}
              className="text-red-600 font-bold"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      {/* MODAL ADD PRODUCT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-white p-6 rounded shadow-lg w-[550px] pointer-events-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Product</h3>

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
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      {i === 0 && (
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
                  onClick={() => setShowModal(false)}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

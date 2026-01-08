import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverview() {
  const navigate = useNavigate();

  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);

  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories ( name ),
          brands ( name ),
          product_images ( id, image_url, is_primary ),
          product_variants ( id, color, size, stock_quantity )
        `
        )
        .eq("slug", slug)
        .single();

      if (!error && data) {
        setProduct(data);

        // ===== DEFAULT VARIANT =====
        if (data.product_variants?.length > 0) {
          const firstVariant = data.product_variants[0];

          setSelectedColor(firstVariant.color);

          // ambil size pertama yang stok > 0 untuk warna tersebut
          const firstSizeInStock = data.product_variants.find(
            (v) => v.color === firstVariant.color && v.stock_quantity > 0
          );

          if (firstSizeInStock) {
            setSelectedSize(firstSizeInStock.size);
          }
        }
      }

      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (!product) return <p className="p-10 text-center">Product not found.</p>;

  // Sort images (primary first)
  const images = [...product.product_images].sort(
    (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
  );

  // Unique colors
  const colors = [...new Set(product.product_variants.map((v) => v.color))];

  // Sizes with stock info
  const sizes = product.product_variants.map((v) => ({
    name: v.size,
    color: v.color,
    inStock: v.stock_quantity > 0,
  }));

  const price = `Rp ${Number(product.base_price).toLocaleString("id-ID")}`;

  // ==========================
  // ADD TO CART LOGIC
  // ==========================
  async function handleAddToCart() {
    if (!selectedColor || !selectedSize) {
      alert("Pilih variant terlebih dahulu");
      return;
    }

    setAdding(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAdding(false);
      navigate("/register", {
        state: { from: `/products/${slug}` },
      });
      return;
    }

    // Get selected variant
    const variant = product.product_variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    if (!variant || variant.stock_quantity <= 0) {
      alert("Stok habis");
      setAdding(false);
      return;
    }

    // Get or create cart
    let { data: cart } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select()
        .single();

      cart = newCart;
    }

    // Check existing cart item
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("variant_id", variant.id)
      .single();

    if (existingItem) {
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cart.id,
        variant_id: variant.id,
        quantity: 1,
      });
    }

    navigate("/shoppingcart");
    setAdding(false);
  }

  return (
    <div className="bg-white pt-28">
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-7xl px-4 text-sm text-gray-600">
        {product.categories?.name} / {product.brands?.name} / {product.name}
      </nav>

      {/* Images */}
      <div className="mx-auto mt-6 max-w-7xl px-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[30%]"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={img.image_url}
                  alt={product.name}
                  onClick={() => setZoomImage(img.image_url)}
                  className="h-full w-full object-cover cursor-zoom-in"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-6 text-gray-700">{product.description}</p>
        </div>

        {/* Right */}
        <div>
          <p className="text-3xl font-semibold">{price}</p>

          {/* Colors */}
          <div className="mt-8">
            <h3 className="text-sm font-medium">Variant</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null);
                  }}
                  className={classNames(
                    "px-3 py-1 rounded-md border text-sm",
                    selectedColor === color
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-300"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-8">
            <h3 className="text-sm font-medium">Size</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {sizes
                .filter((s) => s.color === selectedColor)
                .map((s) => (
                  <button
                    key={s.name}
                    disabled={!s.inStock}
                    onClick={() => setSelectedSize(s.name)}
                    className={classNames(
                      "p-2 text-sm rounded-md border",
                      s.inStock
                        ? selectedSize === s.name
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize || adding}
            className="mt-10 w-full bg-indigo-600 text-white py-3 rounded-md disabled:opacity-50"
          >
            {adding ? "Adding..." : "Tambahkan ke keranjang"}
          </button>
        </div>
      </div>

      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomImage(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-white text-3xl font-light"
            onClick={() => setZoomImage(null)}
          >
            ✕
          </button>

          {/* Zoomed image */}
          <img
            src={zoomImage}
            alt="Zoomed product"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

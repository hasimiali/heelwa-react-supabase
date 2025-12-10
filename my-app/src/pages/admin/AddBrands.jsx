import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useLocation } from "react-router-dom";

export default function AddBrands() {
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();

  // ============================
  // Load Brand List
  // ============================
  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setBrands(data || []);
  };

  // ✅ AUTO REFRESH SAAT MASUK HALAMAN
  useEffect(() => {
    fetchBrands();
  }, [location.pathname]);

  // ✅ REALTIME + ALT+TAB FIX
  useEffect(() => {
    const channel = supabase
      .channel("brands-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brands" },
        fetchBrands
      )
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchBrands();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ============================
  // Upload + Insert Brand
  // ============================
  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let logoUrl = null;

      if (logo) {
        const fileExt = logo.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `brands/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("brand-logos")
          .upload(filePath, logo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("brand-logos")
          .getPublicUrl(filePath);

        logoUrl = publicData.publicUrl;
      }

      const { error: insertError } = await supabase.from("brands").insert([
        {
          name: brandName,
          logo_url: logoUrl,
        },
      ]);

      if (insertError) throw insertError;

      setMessage("✅ Brand added successfully!");
      setBrandName("");
      setLogo(null);
      setShowModal(false);
      fetchBrands();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
    }

    setLoading(false);
  };

  // ============================
  // ✅ DELETE BRAND + LOGO STORAGE
  // ============================
  const handleDeleteBrand = async (brand) => {
    const confirmDelete = confirm(`Delete brand "${brand.name}" ?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);

      // ✅ Hapus logo dari storage jika ada
      if (brand.logo_url) {
        const parts = brand.logo_url.split("/storage/v1/object/public/");
        const filePath = parts[1];

        if (filePath) {
          await supabase.storage.from("brand-logos").remove([filePath]);
        }
      }

      // ✅ Hapus data brand dari table
      await supabase.from("brands").delete().eq("id", brand.id);

      alert("✅ Brand deleted!");
      fetchBrands();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete brand!");
    }

    setLoading(false);
  };

  return (
    <div className="mt-20 p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Brands</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Add Brand
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[120px]">
        {brands.length === 0 ? (
          <p className="text-gray-500 italic">No brands found.</p>
        ) : (
          brands.map((b) => (
            <div
              key={b.id}
              className="border p-4 rounded shadow flex items-center justify-between gap-4 bg-white"
            >
              <div className="flex items-center gap-4">
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    className="w-16 h-16 object-contain rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    No Logo
                  </div>
                )}
                <p className="text-lg font-medium">{b.name}</p>
              </div>

              {/* ✅ DELETE BUTTON */}
              <button
                onClick={() => handleDeleteBrand(b)}
                className="text-red-600 text-xl font-bold hover:scale-110 transition"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-white p-6 rounded shadow-lg w-96 pointer-events-auto">
            <h3 className="text-xl font-bold mb-4">Add New Brand</h3>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Brand Name"
                className="border p-2 rounded"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
                className="border p-2 rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>

            {message && (
              <p className="mt-3 text-green-600 font-medium">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useLocation } from "react-router-dom";

export default function AddCategories() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();

  // ============================
  // ✅ Load Categories
  // ============================
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setCategories(data || []);
  };

  // ✅ AUTO REFRESH SAAT MASUK HALAMAN
  useEffect(() => {
    fetchCategories();
  }, [location.pathname]);

  // ✅ REALTIME + ALT+TAB FIX
  useEffect(() => {
    const channel = supabase
      .channel("categories-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        fetchCategories
      )
      .subscribe();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCategories();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ============================
  // ✅ Insert Category
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("categories").insert([
        {
          name: categoryName,
          parent_id: parentId || null,
        },
      ]);

      if (error) throw error;

      setMessage("✅ Category added successfully!");
      setCategoryName("");
      setParentId("");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
    }

    setLoading(false);
  };

  // ============================
  // ✅ DELETE CATEGORY (RECURSIVE)
  // ============================
  const deleteCategoryRecursive = async (id) => {
    const children = categories.filter((c) => c.parent_id === id);

    for (const child of children) {
      await deleteCategoryRecursive(child.id);
    }

    await supabase.from("categories").delete().eq("id", id);
  };

  const handleDelete = async (cat) => {
    const confirmDelete = confirm(
      `Delete category "${cat.name}" and all its subcategories?`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteCategoryRecursive(cat.id);
      alert("✅ Category deleted!");
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete category");
    }

    setLoading(false);
  };

  // ============================
  // ✅ BUILD TREE STRUCTURE
  // ============================
  const buildCategoryTree = (categories) => {
    const map = {};
    const roots = [];

    categories.forEach((cat) => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parent_id) {
        map[cat.parent_id]?.children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    return roots;
  };

  // ============================
  // ✅ RENDER TREE + DELETE BUTTON
  // ============================
  const renderCategories = (nodes, level = 0) => {
    return nodes.map((node) => (
      <div
        key={node.id}
        style={{ marginLeft: level * 24 }}
        className="flex flex-col gap-1 mt-2"
      >
        {/* ✅ CATEGORY ROW */}
        <div className="flex items-center justify-between px-4 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 transition">
          <div className="flex items-center gap-2">
            {level > 0 && <span className="text-gray-400">↳</span>}
            <span className={level === 0 ? "font-bold" : "font-medium"}>
              {node.name}
            </span>
          </div>

          {/* ✅ DELETE BUTTON */}
          <button
            onClick={() => handleDelete(node)}
            className="flex items-center gap-1 text-red-600 text-sm font-semibold hover:scale-105 transition"
          >
            🗑 Delete
          </button>
        </div>

        {/* ✅ CHILDREN */}
        {node.children.length > 0 && (
          <div className="pl-4 border-l border-dashed border-gray-300">
            {renderCategories(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="mt-20 p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Categories</h2>

      {/* BUTTON TAMBAH CATEGORY */}
      <button
        onClick={() => setShowModal(true)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Add Category
      </button>

      {/* ✅ TREE VIEW */}
      <div className="border rounded p-4 shadow bg-white min-h-[100px]">
        {categories.length === 0 ? (
          <p className="text-gray-500 italic">No categories found.</p>
        ) : (
          renderCategories(buildCategoryTree(categories))
        )}
      </div>

      {/* ✅ POPUP FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center pointer-events-none">
          <div className="bg-white p-6 rounded shadow-lg w-96 pointer-events-auto">
            <h3 className="text-xl font-bold mb-4">Add New Category</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Category Name"
                className="border p-2 rounded"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />

              {/* ✅ PARENT CATEGORY */}
              <select
                className="border p-2 rounded"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">None (Main Category)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

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

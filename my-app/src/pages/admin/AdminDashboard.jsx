import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Brand */}
        <Link
          to="/admin/brands"
          className="border rounded-xl p-6 shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Brands</h2>
          <p className="text-sm text-gray-600">
            Manage brand list and create new brands.
          </p>
        </Link>

        {/* Categories */}
        <Link
          to="/admin/categories"
          className="border rounded-xl p-6 shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <p className="text-sm text-gray-600">
            Manage category list and create new categories.
          </p>
        </Link>

        {/* Products */}
        <Link
          to="/admin/product"
          className="border rounded-xl p-6 shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-sm text-gray-600">
            Manage product list and create new products.
          </p>
        </Link>

        {/* 🆕 USER CART MANAGEMENT */}
        <Link
          to="/admin/usercart"
          className="border rounded-xl p-6 shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">User Carts</h2>
          <p className="text-sm text-gray-600">
            Manage user cart items, remove keep status, or delete items.
          </p>
        </Link>
      </div>
    </div>
  );
}

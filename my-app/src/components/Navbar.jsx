"use client";

import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const [showWhiteNav, setShowWhiteNav] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // ==============================
  // FORCE WHITE NAV PAGES
  // ==============================
  const alwaysWhiteNavPages = [
    "/shoppingcart",
    "/productoverview",
    "/checkout",
    "/payment",
    "/profile",
    "/login",
    "/register",
    "/admin",
    "/admin/brands",
    "/admin/product",
    "/admin/categories",
    "/admin/products",
    "/admin/kasir",
    "/admin/stocks",
    "/admin/inventory-log",
    "/products/",
    "/products/new-in",
  ];

  const pathname = location.pathname.toLowerCase();
  const isWhiteForced =
    alwaysWhiteNavPages.includes(pathname) ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/search");

  // ==============================
  // LOAD USER + CATEGORIES
  // ==============================
  useEffect(() => {
    let mounted = true;

    // ==============================
    // LOAD USER (FORCES NETWORK CALL)
    // ==============================
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data?.user) {
        setUser(null);
        return;
      }

      let userData = data.user;

      const { data: roleData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!mounted) return;

      if (roleData) {
        userData = { ...userData, role: roleData.role };
      }

      setUser(userData);
    };

    // ==============================
    // LOAD CATEGORIES (ONCE)
    // ==============================
    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (!mounted) return;
      setCategories(data || []);
    };

    // INITIAL LOAD
    loadUser();
    loadCategories();

    // ==============================
    // AUTH STATE LISTENER
    // ==============================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser(); // login / logout / token refresh
    });

    // ==============================
    // TAB SWITCH / WINDOW FOCUS
    // ==============================
    const handleFocus = () => {
      loadUser(); // revalidate session
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // ==============================
    // CLEANUP
    // ==============================
    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  // ==============================
  // SCROLL BEHAVIOR
  // ==============================
  useEffect(() => {
    if (isWhiteForced) {
      setShowWhiteNav(true);
      return;
    }

    const onScroll = () => setShowWhiteNav(window.scrollY > 100);
    onScroll();

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isWhiteForced]);

  // ==============================
  // CATEGORY LOGIC
  // ==============================
  const parentCategories = categories.filter((c) => !c.parent_id);

  const categoriesWithChildren = parentCategories.map((parent) => ({
    ...parent,
    children: categories.filter((c) => c.parent_id === parent.id),
  }));

  const half = Math.ceil(categoriesWithChildren.length / 2);
  const leftCategories = categoriesWithChildren.slice(0, half);
  const rightCategories = categoriesWithChildren.slice(half);

  // ==============================
  // CATEGORY MENU (DESKTOP)
  // ==============================
  const renderCategoryMenu = (menu, whiteMode) => (
    <div key={menu.id} className="relative group">
      <Link
        to={`/category/${menu.id}`}
        className={`flex items-center gap-1 font-semibold transition ${
          whiteMode
            ? "text-black hover:text-gray-700"
            : "text-white hover:text-gray-200"
        }`}
      >
        {menu.name}
        {menu.children.length > 0 && <ChevronDownIcon className="w-4 h-4" />}
      </Link>

      {menu.children.length > 0 && (
        <div className="absolute left-0 top-full bg-black/70 text-white rounded shadow-lg py-2 min-w-[180px] z-50 hidden group-hover:block animate-fadeIn">
          {menu.children.map((child) => (
            <Link
              key={child.id}
              to={`/category/${child.id}`}
              className="block px-4 py-2 hover:bg-black/50"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  // ==============================
  // NAVBAR CONTENT
  // ==============================
  const renderNavbar = (whiteMode) => (
    <div className="max-w-7xl mx-auto px-6 py-4 relative">
      {/* ================= MOBILE ================= */}
      <div className="md:hidden flex items-center justify-between relative">
        {/* LEFT: BURGER */}
        <button onClick={() => setMobileOpen(true)} className="p-0.5">
          <Bars3Icon
            className={`w-5 h-5 ${whiteMode ? "text-black" : "text-white"}`}
          />
        </button>

        {/* CENTER: LOGO */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img
            src="/images/logos/heelwa.png"
            alt="Logo"
            className={`h-9 ${whiteMode ? "" : "brightness-0 invert"}`}
          />
        </Link>

        {/* RIGHT: ICONS */}
        <div className="flex items-center gap-4">
          <UserIcon
            className={`w-6 h-6 cursor-pointer ${
              whiteMode ? "text-black" : "text-white"
            }`}
            onClick={() =>
              user ? navigate("/profile") : navigate("/register")
            }
          />
          {user && (
            <Link to="/shoppingcart">
              <ShoppingCartIcon
                className={`w-6 h-6 ${whiteMode ? "text-black" : "text-white"}`}
              />
            </Link>
          )}
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex justify-between items-center">
        {/* ADMIN */}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className={`absolute left-6 font-semibold ${
              whiteMode ? "text-black" : "text-white"
            }`}
          >
            Admin
          </Link>
        )}

        {/* SEARCH */}
        <div className="flex items-center ml-20">
          <div className="relative w-60">
            <MagnifyingGlassIcon
              className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${
                whiteMode ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  navigate(`/search?q=${encodeURIComponent(search)}`);
                  setSearch("");
                }
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-full outline-none ${
                whiteMode
                  ? "bg-gray-100 border text-black"
                  : "bg-white/20 text-white placeholder-gray-200"
              }`}
            />
          </div>
        </div>

        {/* MENU */}
        <div className="flex items-center gap-8">
          <Link
            to="/products/new-in"
            className={`font-semibold ${
              whiteMode ? "text-black" : "text-white"
            }`}
          >
            New In
          </Link>

          <Link to="/">
            <img
              src="/images/logos/heelwa.png"
              alt="Logo"
              className={`h-12 ${whiteMode ? "" : "brightness-0 invert"}`}
            />
          </Link>

          {leftCategories.map((m) => renderCategoryMenu(m, whiteMode))}
          {rightCategories.map((m) => renderCategoryMenu(m, whiteMode))}
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-5">
          <UserIcon
            className={`w-6 h-6 cursor-pointer ${
              whiteMode ? "text-black" : "text-white"
            }`}
            onClick={() =>
              user ? navigate("/profile") : navigate("/register")
            }
          />
          {user && (
            <Link to="/shoppingcart">
              <ShoppingCartIcon
                className={`w-6 h-6 ${whiteMode ? "text-black" : "text-white"}`}
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (id) => {
    setOpenCategory((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition ${
          showWhiteNav ? "bg-white shadow" : ""
        }`}
      >
        {renderNavbar(showWhiteNav)}
      </nav>

      {/* MOBILE DRAWER */}
      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />

          {/* DRAWER */}
          <div className="relative w-80 h-full bg-white animate-slideIn">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <span className="text-sm tracking-widest uppercase">Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* MENU */}
            <nav className="flex flex-col text-[15px] uppercase tracking-wide text-black">
              {/* NEW IN */}
              <Link
                to="/products/new-in"
                onClick={() => setMobileOpen(false)}
                className="px-6 py-4 border-b"
              >
                New In
              </Link>

              {/* CATEGORIES */}
              {categoriesWithChildren.map((cat) => {
                const isOpen = openCategory === cat.id;
                const hasChildren = cat.children.length > 0;

                return (
                  <div key={cat.id} className="border-b">
                    {/* ROW */}
                    <button
                      onClick={() =>
                        hasChildren
                          ? toggleCategory(cat.id)
                          : (setMobileOpen(false),
                            navigate(`/category/${cat.id}`))
                      }
                      className="w-full flex items-center justify-between px-6 py-4"
                    >
                      <span>{cat.name}</span>

                      {hasChildren && (
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* SUB MENU */}
                    {hasChildren && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="pl-10 pb-4 flex flex-col gap-3 text-sm">
                          <Link
                            to={`/category/${cat.id}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-black"
                          >
                            View All
                          </Link>

                          {cat.children.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.id}`}
                              onClick={() => setMobileOpen(false)}
                              className="text-gray-600"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* LOGIN */}
              <Link
                to={user ? "/profile" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="px-6 py-4 border-b"
              >
                {user ? "My Account" : "Log In"}
              </Link>
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

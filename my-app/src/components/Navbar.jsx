"use client";

import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const [showWhiteNav, setShowWhiteNav] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // =====================================
  // PAGE YANG SELALU PUTIH
  // =====================================
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
    "/products/",
    "/products/new-in",
  ];

  const pathname = location.pathname.toLowerCase();
  const isWhiteForced =
    alwaysWhiteNavPages.includes(pathname) ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/products");

  // =====================================
  // LOAD USER + CATEGORY
  // =====================================
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        return;
      }

      let userData = session.user;

      const { data: roleData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (roleData) userData = { ...userData, role: roleData.role };

      setUser(userData);
    };

    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      setCategories(data || []);
    };

    loadUser();
    loadCategories();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => loadUser());

    return () => subscription.unsubscribe();
  }, []);

  // =====================================
  // NAVBAR BEHAVIOR
  // =====================================
  useEffect(() => {
    if (isWhiteForced) {
      setShowWhiteNav(true);
      return; // stop scroll behavior
    }

    const handleScroll = () => {
      if (window.scrollY > 100) setShowWhiteNav(true);
      else setShowWhiteNav(false);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isWhiteForced]);

  // =====================================
  // CATEGORY LOGIC
  // =====================================
  const parentCategories = categories.filter((c) => !c.parent_id);

  const categoriesWithChildren = parentCategories.map((parent) => ({
    ...parent,
    children: categories.filter((c) => c.parent_id === parent.id),
  }));

  const half = Math.ceil(categoriesWithChildren.length / 2);
  const leftCategories = categoriesWithChildren.slice(0, half);
  const rightCategories = categoriesWithChildren.slice(half);

  // =====================================
  // CATEGORY MENU
  // =====================================
  const renderCategoryMenu = (menu, whiteMode = false) => (
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
              className="block px-4 py-2 hover:bg-black/50 transition"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  // =====================================
  // NAVBAR UI
  // =====================================
  const renderNavbar = (whiteMode = false) => (
    <div className="max-w-7xl mx-auto flex justify-between items-center w-full py-4 px-6 relative">
      {/* ADMIN BUTTON */}
      {user?.role === "admin" && (
        <Link
          to="/admin"
          className={`absolute left-0 ml-6 top-1/2 -translate-y-1/2 font-semibold ${
            whiteMode ? "text-black" : "text-white"
          } hover:underline`}
        >
          Admin
        </Link>
      )}

      {/* SEARCH */}
      <div className="flex items-center gap-4 ml-20">
        <div className="relative w-60">
          <MagnifyingGlassIcon
            className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${
              whiteMode ? "text-gray-600" : "text-gray-300"
            }`}
          />
          <input
            type="text"
            placeholder="Search"
            className={`w-full pl-10 pr-4 py-2 rounded-full transition ${
              whiteMode
                ? "bg-gray-100 border border-gray-300 text-black placeholder-gray-500"
                : "bg-white/20 text-white placeholder-gray-200"
            }`}
          />
        </div>
      </div>

      {/* MENU */}
      <div className="flex items-center gap-8">
        <Link
          to="/products/new-in"
          className={`font-semibold transition ${
            whiteMode ? "text-black" : "text-white"
          }`}
        >
          New In
        </Link>

        <Link to="/" className="flex items-center">
          <img
            src="/images/logos/heelwa.png"
            alt="Heelwa Logo"
            className={`h-12 w-auto transition ${
              whiteMode ? "" : "brightness-0 invert"
            }`}
          />
        </Link>

        {leftCategories.map((menu) => renderCategoryMenu(menu, whiteMode))}

        {rightCategories.map((menu) => renderCategoryMenu(menu, whiteMode))}
      </div>

      {/* ICONS */}
      <div className="flex items-center gap-5">
        <UserIcon
          className={`w-6 h-6 cursor-pointer ${
            whiteMode ? "text-black" : "text-white"
          }`}
          onClick={() => (user ? navigate("/profile") : navigate("/login"))}
        />

        <Link to="/shoppingcart">
          <ShoppingCartIcon
            className={`w-6 h-6 cursor-pointer ${
              whiteMode ? "text-black" : "text-white"
            }`}
          />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition ${
          showWhiteNav ? "bg-white shadow" : ""
        }`}
      >
        {renderNavbar(showWhiteNav)}
      </nav>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

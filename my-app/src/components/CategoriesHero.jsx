"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

/**
 * CURATED CATEGORY IMAGES
 * (same categories as Supabase, marketing-controlled)
 */
const CATEGORY_IMAGES = {
  Abaya: "/images/categories/Cover Abaya_2.jpg",
  Hijab: "/images/categories/Cover Hijab_2.jpg",
  Inner: "/images/categories/Cover Inner_2.jpg",
};

export default function CategoriesHero() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*") // SAME AS NAVBAR
        .is("parent_id", null) // parent categories only
        .order("name");

      console.log("CategoriesHero:", data, error);

      if (!error) setCategories(data || []);
      setLoading(false);
    };

    loadCategories();
  }, []);

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[420px] rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (!categories.length) {
    return (
      <section className="py-20 text-center text-gray-400">
        No categories found
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-gray-600">
            Discover our collections curated for comfort and elegance
          </p>
        </div>

        {/* CATEGORY GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`} // 🔥 SAME AS NAVBAR
              className="group relative overflow-hidden rounded-2xl shadow-sm"
            >
              {/* IMAGE */}
              <img
                src={
                  CATEGORY_IMAGES[category.name] ||
                  "/images/categories/fallback.jpg"
                }
                alt={category.name}
                className="h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* TEXT */}
              <div className="absolute bottom-0 p-6">
                <h3 className="text-xl font-semibold text-white">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="mt-1 max-w-xs text-sm text-gray-200">
                    {category.description}
                  </p>
                )}

                <span className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

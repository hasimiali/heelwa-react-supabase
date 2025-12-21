import React from "react";
import Hero from "../components/Hero";
import ProductHero from "../components/ProductHero";
import CategoriesHero from "../components/CategoriesHero";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Hero />
      <CategoriesHero />
      <ProductHero />
      <Footer />
    </div>
  );
}

import React from "react";
import Hero from "../components/Hero";
import HeelwaIntro from "../components/HeelwaIntro";
import CategoriesHero from "../components/CategoriesHero";
import ProductHero from "../components/ProductHero";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Hero />
      <HeelwaIntro />
      {/* <CategoriesHero /> */}
      <ProductHero />
      <Footer />
    </div>
  );
}

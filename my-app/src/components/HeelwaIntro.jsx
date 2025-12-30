import React from "react";

export default function HeelwaIntro() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          About Heelwa
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          <span className="font-medium text-gray-900">Heelwa</span> dalam bahasa
          Arab yang berasal dari kata <span className="italic">Halawa</span>{" "}
          memiliki arti <span className="font-medium text-gray-900">manis</span>
          .
          <br />
          Heelwa menghadirkan pakaian yang akan menemani keseharianmu dengan
          gaya yang lebih{" "}
          <span className="font-medium text-gray-900">bold</span> dan{" "}
          <span className="font-medium text-gray-900">stylish</span>.
        </p>
      </div>
    </section>
  );
}

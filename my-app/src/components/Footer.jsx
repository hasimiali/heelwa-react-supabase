// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Links */}
        <div className="flex justify-center space-x-8 mb-8">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Products</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6">
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              {/* Facebook icon */}
              <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5.004 3.657 9.128 8.438 9.879v-6.988h-2.54v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 17.004 22 12z" />
            </svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              {/* Twitter icon */}
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4 1s-4.2 2.05-6.63 2.5A4.48 4.48 0 0016 0c-2.63 0-4.77 2.14-4.77 4.77 0 .37.04.73.12 1.08C7.72 6.7 4.1 4.76 1.67 1.9a4.77 4.77 0 00-.64 2.4c0 1.66.84 3.12 2.13 3.97A4.48 4.48 0 012 7.23v.05c0 2.3 1.63 4.2 3.77 4.63a4.48 4.48 0 01-2.15.08c.61 1.92 2.37 3.32 4.45 3.36A9 9 0 010 18.54 12.7 12.7 0 006.88 21c8.26 0 12.77-6.85 12.77-12.78 0-.19 0-.38-.01-.57A9.2 9.2 0 0023 3z" />
            </svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              {/* Instagram icon */}
              <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.055 1.963.24 2.422.403a4.89 4.89 0 011.758 1.05 4.89 4.89 0 011.05 1.758c.163.459.348 1.252.403 2.422.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.963-.403 2.422a4.89 4.89 0 01-1.05 1.758 4.89 4.89 0 01-1.758 1.05c-.459.163-1.252.348-2.422.403-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.963-.24-2.422-.403a4.89 4.89 0 01-1.758-1.05 4.89 4.89 0 01-1.05-1.758c-.163-.459-.348-1.252-.403-2.422-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.055-1.17.24-1.963.403-2.422a4.89 4.89 0 011.05-1.758 4.89 4.89 0 011.758-1.05c.459-.163 1.252-.348 2.422-.403 1.266-.058 1.65-.07 4.85-.07zm0-2.2C8.735 0 8.332.013 7.052.072 5.782.13 4.842.326 4.042.598c-.843.27-1.57.63-2.285 1.344-.715.715-1.074 1.442-1.344 2.285C.326 5.158.13 6.098.072 7.368.013 8.648 0 9.051 0 12s.013 3.352.072 4.632c.058 1.27.254 2.21.526 3.01.27.843.63 1.57 1.344 2.285.715.715 1.442 1.074 2.285 1.344.8.272 1.74.468 3.01.526C8.648 23.987 9.051 24 12 24s3.352-.013 4.632-.072c1.27-.058 2.21-.254 3.01-.526a5.92 5.92 0 002.285-1.344 5.92 5.92 0 001.344-2.285c.272-.8.468-1.74.526-3.01.059-1.28.072-1.683.072-4.632s-.013-3.352-.072-4.632c-.058-1.27-.254-2.21-.526-3.01a5.92 5.92 0 00-1.344-2.285 5.92 5.92 0 00-2.285-1.344c-.8-.272-1.74-.468-3.01-.526C15.352.013 14.949 0 12 0z" />
              <circle cx="12" cy="12" r="3.2" />
              <circle cx="17.5" cy="6.5" r="1.5" />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Mahdaly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

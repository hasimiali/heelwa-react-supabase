import { useNavigate } from "react-router-dom";
import React from "react";

export default function CheckoutPage() {
  const navigate = useNavigate(); // ← WAJIB ADA

  // ------------- FIX: FUNGSI INI WAJIB ADA -------------
  const handleCreateOrder = () => {
    navigate("/payment", {
      state: {
        totalPrice: 414610,
        bank: "BCA",
        va: "126081358579850",
      },
    });
  };
  // -----------------------------------------------------

  return (
    <div className="bg-white min-h-screen">
      <div className="pt-28 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Checkout
        </h1>

        <div className="mt-12 grid grid-cols-1 gap-12">
          
          {/* ---------------- ADDRESS ---------------- */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Address
            </h2>

            <div className="space-y-1 text-sm">
              <div className="font-semibold text-gray-900">
                Nama Baru Kamu
              </div>

              <div className="text-gray-700">
                Alamat Baru Kamu, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi
              </div>

              <div className="text-gray-500 text-xs">+62 8xx-xxxx-xxxx</div>
            </div>
          </div>

          {/* ---------------- PRODUCT ---------------- */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Product
            </h2>

            <div className="flex items-start gap-4">
              <img
                src="https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg"
                alt="Product"
                className="h-24 w-24 rounded-md border border-gray-200 object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold text-gray-900">Vegue</div>
                <div className="text-sm text-gray-700">
                  MD22 - Monitor Kartu Suara Profesional
                </div>
                <div className="text-indigo-600 font-semibold text-lg mt-2">
                  Rp394.110
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- PAYMENT METHOD ---------------- */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Payment Method
            </h2>

            <label className="flex justify-between items-center text-sm cursor-pointer">
              <span className="text-gray-700">BCA Transfer Bank</span>
              <input type="radio" name="pay" className="h-4 w-4" />
            </label>
          </div>

          {/* ---------------- PAYMENT SUMMARY ---------------- */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Payment Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal Pesanan</span>
                <span>Rp453.000</span>
              </div>

              <div className="flex justify-between">
                <span>Total Proteksi Produk</span>
                <span>Rp18.000</span>
              </div>

              <div className="flex justify-between">
                <span>Total Pengiriman</span>
                <span>Rp0</span>
              </div>

              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span>Rp2.500</span>
              </div>

              <div className="flex justify-between">
                <span>Voucher Diskon</span>
                <span className="text-indigo-600">-Rp58.890</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between font-semibold text-base">
                <span>Total Pembayaran</span>
                <span className="text-indigo-600">Rp414.610</span>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleCreateOrder}
            className="w-full rounded-md bg-indigo-600 py-3 text-center text-white font-medium hover:bg-indigo-700 text-lg"
          >
            Buat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}

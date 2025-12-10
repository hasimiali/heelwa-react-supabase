import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Copy, ArrowLeft } from "lucide-react";
import bcaLogo from "../assets/images/bca_logo.png"; // ← gunakan logo BCA kamu

export default function PaymentPage() {
  const location = useLocation();
  const { totalPrice, bank, va } = location.state || {
    totalPrice: 0,
    bank: "BANK",
    va: "0000000000",
  };

  const [countdown, setCountdown] = useState(24 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);
  const seconds = countdown % 60;

  const expiredDate = "20 November 2025, 19:25";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(va);
    alert("Virtual Account telah disalin!");
  };

  return (
    <div className="bg-white min-h-screen">

      {/* MAIN */}
      <div className="pt-28 max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* TOTAL PEMBAYARAN */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <p className="text-gray-600 text-sm">Total Pembayaran</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            Rp{totalPrice.toLocaleString("id-ID")}
          </p>
        </div>

        {/* COUNTDOWN */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <p className="text-gray-600 text-sm">Bayar Dalam</p>
          <p className="text-indigo-600 font-semibold text-xl mt-1">
            {hours} jam {minutes} menit {seconds} detik
          </p>
          <p className="text-xs text-gray-500 mt-2">Jatuh tempo {expiredDate}</p>
        </div>

        {/* BANK INFO */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Metode Pembayaran
          </h2>

          <div className="flex items-center gap-3">
            <img src={bcaLogo} alt="Bank Logo" className="w-12" />
            <div>
              <p className="font-semibold text-gray-900 text-lg">{bank}</p>
              <p className="text-xs text-gray-500">Virtual Account</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-600 text-sm">Nomor Virtual Account</p>

            <div className="flex items-center justify-between mt-2 bg-white p-3 rounded-lg border">
              <p className="text-indigo-600 font-bold tracking-wider text-lg">
                {va.replace(/\B(?=(\d{4})+(?!\d))/g, " ")}
              </p>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Copy size={18} /> Salin
              </button>
            </div>
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">
            Petunjuk Transfer m-Banking
          </h3>

          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>Pilih menu <strong>m-Transfer → Virtual Account</strong></li>
            <li>Masukkan <strong>{va}</strong> lalu tekan "Lanjut".</li>
            <li>Periksa detail pembayaran dan pastikan jumlah benar.</li>
            <li>Masukkan PIN untuk menyelesaikan pembayaran.</li>
            <li>Jika gagal, coba kembali atau gunakan metode lain.</li>
          </ol>
        </div>

        {/* BUTTON */}
        <button className="w-full rounded-lg bg-indigo-600 py-4 text-center text-white text-lg font-semibold hover:bg-indigo-700 active:scale-95 transition">
          Saya Sudah Transfer
        </button>
      </div>
    </div>
  );
}

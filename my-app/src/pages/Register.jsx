// import { useState } from "react";
// import { supabase } from "../supabaseClient";
// import { Link } from "react-router-dom";

// export default function Register() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         emailRedirectTo: "http://localhost:5173/login",
//       },
//     });

//     if (error) setMessage(error.message);
//     else setMessage("Check your email to confirm your account!");

//     setLoading(false);
//   };

//   return (
//     <>
//       <div className="pt-28 flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white">
//         <div className="sm:mx-auto sm:w-full sm:max-w-sm">
//           {/* <img
//             alt="Your Company"
//             src="/images/logos/heelwa.png"
//             className="mx-auto h-10 w-auto"
//           /> */}
//           <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
//             Sign up to your account
//           </h2>
//         </div>

//         <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
//           {/* ⬇️ FIXED: onSubmit added */}
//           <form onSubmit={handleSignup} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <div className="mt-2">
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full rounded-md border border-gray-300 px-3 py-1.5"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-2">
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full rounded-md border border-gray-300 px-3 py-1.5"
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white"
//               >
//                 {loading ? "Signing up..." : "Sign up"}
//               </button>
//             </div>

//             {message && (
//               <p className="text-center text-sm text-red-600">{message}</p>
//             )}
//           </form>

//           <p className="mt-10 text-center text-sm text-gray-500">
//             Already have an account?{" "}
//             <Link
//               to="/login"
//               className="font-semibold text-indigo-600 hover:text-indigo-500"
//             >
//               Login
//             </Link>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// Register menggunakan phone number tanpa OTP

import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // 🔁 halaman asal (misalnya dari product detail)
  const from = location.state?.from || "/";

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 🔐 fake email dari phone
    const email = `${phone}@heelwa.com`;

    try {
      // 1️⃣ Signup Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone,
          },
        },
      });

      if (error) throw error;

      // 2️⃣ Simpan ke table profiles
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        username,
        phone,
      });

      if (profileError) throw profileError;

      setMessage("✅ Register success! Redirecting...");
      setLoading(false);

      // 🔁 redirect ke halaman sebelumnya
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1200);
    } catch (err) {
      setMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 flex min-h-full flex-col justify-center px-6 py-12 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
          Create Account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Nama"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          <input
            type="tel"
            placeholder="Nomor WA (ex: 08123456789)"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          {message && (
            <p className="text-center text-sm text-red-600">{message}</p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

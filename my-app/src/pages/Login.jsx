// import { useState } from "react";
// import { supabase } from "../supabaseClient";
// import { Link, useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const navigate = useNavigate();

//   const handleSignin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setMessage(error.message);
//     } else {
//       setMessage("Login successful!");
//       navigate("/"); // ⬅ redirect to homepage
//     }

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
//             Sign in to your account
//           </h2>
//         </div>

//         <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
//           <form onSubmit={handleSignin} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="block w-full rounded-md border border-gray-300 px-3 py-1.5"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="block w-full rounded-md border border-gray-300 px-3 py-1.5"
//               />
//             </div>

//             {message && (
//               <p className="text-center text-sm text-red-600">{message}</p>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
//             >
//               {loading ? "Signing in..." : "Sign in"}
//             </button>
//           </form>

//           <p className="mt-10 text-center text-sm text-gray-500">
//             Not a member?{" "}
//             <Link
//               to="/register"
//               className="font-semibold text-indigo-600 hover:text-indigo-500"
//             >
//               Register
//             </Link>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// Login phone number tanpa OTP

import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // 🔁 halaman asal (misalnya dari product detail)
  const from = location.state?.from || "/";

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const email = `${phone}@heelwa.com`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 🔁 redirect ke halaman sebelumnya
      navigate(from, { replace: true });
    } catch (err) {
      setMessage("Invalid phone number or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 flex min-h-full flex-col justify-center px-6 py-12 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
          Sign In
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSignin} className="space-y-4">
          <input
            type="tel"
            placeholder="Nomor WA"
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

          {message && (
            <p className="text-center text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            state={{ from }}
            className="text-indigo-600 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

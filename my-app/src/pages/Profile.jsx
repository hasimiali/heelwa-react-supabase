"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // LOAD PROFILE
  // -----------------------------------------
  useEffect(() => {
    async function loadProfile() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (error) console.log(error);

      if (data) {
        setUser({
          username: data.username || "",
          email: data.email || auth.user.email,
          phone: data.phone || "",
          street: data.street || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          country: data.country || "",
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  // -----------------------------------------
  // HANDLE INPUT CHANGE
  // -----------------------------------------
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // -----------------------------------------
  // UPDATE PROFILE
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) {
      alert("You must be logged in.");
      return;
    }

    const updates = {
      id: auth.user.id,
      ...user,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      console.error(error);
      alert("Failed to update profile.");
    } else {
      alert("Profile updated!");
    }
  };

  // -----------------------------------------
  // SIGN OUT
  // -----------------------------------------
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="mt-14 min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="mt-14 min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="flex justify-end">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900">
          Your Profile
        </h2>

        <form
          className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          {/* USERNAME */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* EMAIL */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              disabled
              className="mt-1 block w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* PHONE */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* STREET */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Street Address</label>
            <input
              type="text"
              name="street"
              value={user.street}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* CITY */}
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              name="city"
              value={user.city}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* STATE */}
          <div>
            <label className="block text-sm font-medium">State</label>
            <input
              type="text"
              name="state"
              value={user.state}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* ZIP */}
          <div>
            <label className="block text-sm font-medium">ZIP Code</label>
            <input
              type="text"
              name="zip"
              value={user.zip}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* COUNTRY */}
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input
              type="text"
              name="country"
              value={user.country}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </div>

          {/* SUBMIT */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

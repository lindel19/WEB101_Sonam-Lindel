"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { FaHome, FaCompass, FaUpload, FaUser } from "react-icons/fa";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-white z-50 flex items-center justify-between px-6">
        <Link href="/" className="text-3xl font-extrabold">
          TikTok
        </Link>

        <input
          placeholder="Search"
          className="hidden md:block w-80 bg-gray-100 rounded-full px-5 py-2 outline-none"
        />

        <div>
          {user ? (
            <button
              onClick={logout}
              className="border px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-red-500 text-white px-5 py-2 rounded-md font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <aside className="fixed top-16 left-0 bottom-0 w-60 border-r bg-white p-5">
        <nav className="space-y-5 text-lg font-semibold">
          <Link href="/" className="flex items-center gap-3 hover:text-red-500">
            <FaHome /> For You
          </Link>

          <Link href="/explore" className="flex items-center gap-3 hover:text-red-500">
            <FaCompass /> Explore
          </Link>

          <Link href="/upload" className="flex items-center gap-3 hover:text-red-500">
            <FaUpload /> Upload
          </Link>

          <Link href="/profile" className="flex items-center gap-3 hover:text-red-500">
            <FaUser /> Profile
          </Link>
        </nav>

        <div className="mt-8">
          {user ? (
            <p className="text-sm text-gray-600">Logged in as @{user.username}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Login to upload, like, and comment.
            </p>
          )}
        </div>
      </aside>

      <main className="pt-20 ml-60 px-8">{children}</main>
    </div>
  );
}
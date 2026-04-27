"use client";

import { useAuth } from "@/contexts/authContext";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Please login to view your profile.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
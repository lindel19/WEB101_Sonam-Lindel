"use client";

import { useState } from "react";
import { createVideo } from "@/services/videoService";
import { useAuth } from "@/contexts/authContext";

export default function UploadPage() {
  const { user } = useAuth();

  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      await createVideo({
        caption,
        videoUrl,
        userId: user.id,
      });

      alert("Video uploaded");
      setCaption("");
      setVideoUrl("");
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          className="border p-2 w-full rounded"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>
    </div>
  );
}
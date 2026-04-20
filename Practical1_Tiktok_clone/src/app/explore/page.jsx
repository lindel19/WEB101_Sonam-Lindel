"use client";

import { useEffect, useState } from "react";
import { getVideos } from "@/services/videoService";

export default function ExplorePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getVideos();

        // handle either array response or object response
        if (Array.isArray(data)) {
          setVideos(data);
        } else if (Array.isArray(data.videos)) {
          setVideos(data.videos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Explore</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Trending Hashtags</h3>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video bg-gray-200 rounded-md flex flex-col items-center justify-center p-4"
            >
              <p className="font-bold text-lg">#Trending{index + 1}</p>
              <p className="text-sm text-gray-500">{(index + 1) * 1.5}M views</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Popular Videos</h3>

        {loading && <p>Loading videos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && videos.length === 0 && (
          <p>No videos found.</p>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {videos.map((video, index) => (
              <div
                key={video._id || video.id || index}
                className="aspect-[9/16] bg-gray-300 rounded-md overflow-hidden"
              >
                {video.videoUrl || video.url ? (
                  <video
                    src={video.videoUrl || video.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm">
                      {video.caption || video.title || `Video ${index + 1}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
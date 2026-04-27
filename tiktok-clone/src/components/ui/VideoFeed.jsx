"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getVideos } from "@/services/videoService";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { FaHeart, FaCommentDots, FaShare } from "react-icons/fa";

export default function VideoFeed() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["videos"],
    queryFn: ({ pageParam = null }) =>
      getVideos({ cursor: pageParam, limit: 5 }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  const loadMoreRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  if (isLoading) {
    return <p className="text-center mt-10">Loading videos...</p>;
  }

  if (isError) {
    return <p className="text-center mt-10 text-red-500">Failed to load videos.</p>;
  }

  const videos = data?.pages.flatMap((page) => page.videos) || [];

  return (
    <div className="flex justify-center bg-white">
      <div className="w-full max-w-xl">
        {videos.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No videos yet.</p>
        )}

        {videos.map((video) => (
          <div
            key={video.id}
            className="flex gap-4 border-b border-gray-200 py-6"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold">
              {video.user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex-1">
              <div className="mb-2">
                <p className="font-bold">@{video.user?.username || "user"}</p>
                <p className="text-sm text-gray-700">{video.caption}</p>
              </div>

              <div className="flex gap-4">
                <video
                  controls
                  src={video.videoUrl}
                  className="w-[320px] h-[520px] object-cover rounded-xl bg-black"
                />

                <div className="flex flex-col justify-end gap-5 pb-4">
                  <button className="flex flex-col items-center">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <FaHeart />
                    </div>
                    <span className="text-xs mt-1">{video.likes?.length || 0}</span>
                  </button>

                  <button className="flex flex-col items-center">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <FaCommentDots />
                    </div>
                    <span className="text-xs mt-1">{video.comments?.length || 0}</span>
                  </button>

                  <button className="flex flex-col items-center">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <FaShare />
                    </div>
                    <span className="text-xs mt-1">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
          {isFetchingNextPage && <p>Loading more...</p>}
          {!hasNextPage && videos.length > 0 && (
            <p className="text-gray-400 text-sm">No more videos</p>
          )}
        </div>
      </div>
    </div>
  );
}
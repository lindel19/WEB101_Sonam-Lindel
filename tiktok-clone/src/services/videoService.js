import api from "@/lib/api-config";

export const getVideos = async ({ cursor = null, limit = 5 }) => {
  const res = await api.get("/videos", {
    params: {
      cursor,
      limit,
    },
  });

  return res.data;
};

export const createVideo = async (data) => {
  const res = await api.post("/videos", data);
  return res.data;
};
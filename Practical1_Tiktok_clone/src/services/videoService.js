import api from "@/lib/api-config";

export const getVideos = async () => {
  const res = await api.get("/videos");
  return res.data;
};
export const searchOtakudesu = async (query: string) => {
  const response = await fetch(`/api/otakudesu/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  return response.json();
};

export const getOtakudesuAnime = async (id: string) => {
  const response = await fetch(`/api/otakudesu/anime/${id}`);
  if (!response.ok) return null;
  return response.json();
};

export const getOtakudesuEpisode = async (id: string) => {
  const response = await fetch(`/api/otakudesu/episode/${id}`);
  if (!response.ok) return null;
  return response.json();
};

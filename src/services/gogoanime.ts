
export const searchGogoanime = async (query: string) => {
  try {
    const response = await fetch(`/api/gogoanime/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching gogoanime:', error);
    return [];
  }
};

export const getGogoanimeAnime = async (id: string) => {
  try {
    const response = await fetch(`/api/gogoanime/anime/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error getting gogoanime details:', error);
    return null;
  }
};

export const getGogoanimeEpisode = async (id: string) => {
  try {
    const response = await fetch(`/api/gogoanime/episode/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error getting gogoanime episode:', error);
    return null;
  }
};

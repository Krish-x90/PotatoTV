import { parse } from 'node-html-parser';
import UserAgent from 'user-agents';

const BASE_URL = 'https://otakudesu.cloud';

const getHeaders = () => ({
  'User-Agent': new UserAgent().toString(),
  'Referer': BASE_URL,
  'Origin': BASE_URL,
});

export const searchAnime = async (query: string) => {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const response = await fetch(url, { headers: getHeaders() });
    const html = await response.text();
    const root = parse(html);
    
    const animeList = root.querySelectorAll('ul.chivsrc li').map((el) => {
      const title = el.querySelector('h2 a')?.text || '';
      const id = el.querySelector('h2 a')?.getAttribute('href')?.split('/anime/')[1]?.replace('/', '') || '';
      const poster = el.querySelector('img')?.getAttribute('src') || '';
      const status = el.querySelectorAll('.set')[1]?.text.replace('Status : ', '') || '';
      const rating = el.querySelectorAll('.set')[2]?.text.replace('Rating : ', '') || '';
      
      return { id, title, poster, status, rating };
    });
    
    return animeList;
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
};

export const getAnimeDetails = async (id: string) => {
  try {
    const url = `${BASE_URL}/anime/${id}/`;
    const response = await fetch(url, { headers: getHeaders() });
    const html = await response.text();
    const root = parse(html);
    
    const title = root.querySelector('.venutama h1.posttl')?.text || '';
    const poster = root.querySelector('.fotoanime img')?.getAttribute('src') || '';
    const synopsis = root.querySelectorAll('.sinopc p').map(p => p.text).join('\n');
    
    const info: any = {};
    root.querySelectorAll('.infozingle p').forEach(p => {
      const text = p.text;
      const [key, value] = text.split(':').map(s => s.trim());
      if (key && value) info[key.toLowerCase()] = value;
    });

    const episodes = root.querySelectorAll('.keyingpost li').map(el => {
      const a = el.querySelector('a');
      const epTitle = a?.text || '';
      const epId = a?.getAttribute('href')?.split('/episode/')[1]?.replace('/', '') || '';
      const date = el.querySelector('.date')?.text || '';
      
      return { id: epId, title: epTitle, date };
    }).reverse(); // Usually listed newest first

    return {
      id,
      title,
      poster,
      synopsis,
      info,
      episodes,
    };
  } catch (error) {
    console.error('Error getting anime details:', error);
    return null;
  }
};

export const getEpisodeDetails = async (id: string) => {
  try {
    const url = `${BASE_URL}/episode/${id}/`;
    const response = await fetch(url, { headers: getHeaders() });
    const html = await response.text();
    const root = parse(html);
    
    const title = root.querySelector('.venutama h1.posttl')?.text || '';
    const streamUrl = root.querySelector('#pembed iframe')?.getAttribute('src') || '';
    
    // Attempt to extract servers
    const servers: any[] = [];
    const serverList = root.querySelectorAll('.mirrorstream ul li');
    
    // Note: Implementing full server extraction requires handling AJAX and nonces which is complex.
    // For now, we'll try to get the default stream URL if available.
    
    const prevEp = root.querySelector('.flir a[href*="/episode/"]')?.getAttribute('href')?.split('/episode/')[1]?.replace('/', '');
    const nextEp = root.querySelectorAll('.flir a[href*="/episode/"]')[1]?.getAttribute('href')?.split('/episode/')[1]?.replace('/', '');

    return {
      id,
      title,
      streamUrl,
      servers,
      prevEp,
      nextEp
    };
  } catch (error) {
    console.error('Error getting episode details:', error);
    return null;
  }
};

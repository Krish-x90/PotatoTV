import { parse } from 'node-html-parser';
import UserAgent from 'user-agents';

const BASE_URL = 'https://anitaku.pe';

const getHeaders = () => ({
  'User-Agent': new UserAgent().toString(),
  'Referer': BASE_URL,
  'Origin': BASE_URL,
});

export const searchGogoanime = async (query: string) => {
  try {
    const url = `${BASE_URL}/search.html?keyword=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: getHeaders() });
    const html = await response.text();
    const root = parse(html);
    
    const animeList = root.querySelectorAll('.last_episodes ul.items li').map((el) => {
      const a = el.querySelector('.name a');
      const title = a?.getAttribute('title') || '';
      const id = a?.getAttribute('href')?.replace('/category/', '') || '';
      const poster = el.querySelector('.img a img')?.getAttribute('src') || '';
      const released = el.querySelector('.released')?.text.trim() || '';
      
      return { id, title, poster, released };
    });
    
    return animeList;
  } catch (error) {
    console.error('Error searching gogoanime:', error);
    return [];
  }
};

export const getGogoanimeAnime = async (id: string) => {
  try {
    const url = `${BASE_URL}/category/${id}`;
    const response = await fetch(url, { headers: getHeaders() });
    const html = await response.text();
    const root = parse(html);
    
    const title = root.querySelector('.anime_info_body_bg h1')?.text || '';
    const poster = root.querySelector('.anime_info_body_bg img')?.getAttribute('src') || '';
    const synopsis = root.querySelectorAll('.anime_info_body_bg p.type')[1]?.text.replace('Plot Summary: ', '') || '';
    
    // Get episode ID range to fetch full list
    const movie_id = root.querySelector('#movie_id')?.getAttribute('value');
    const alias = root.querySelector('#alias_anime')?.getAttribute('value');
    const ep_start = root.querySelector('#episode_page a.active')?.getAttribute('ep_start') || '0';
    const ep_end = root.querySelector('#episode_page a.active')?.getAttribute('ep_end') || '0'; // This might only get the first page range

    // We need to fetch the full episode list via AJAX
    // URL: https://ajax.gogocdn.net/ajax/load-list-episode?ep_start=0&ep_end=2000&id=...
    // But getting the 'id' (movie_id) is crucial.
    
    if (!movie_id) return null;

    const epUrl = `https://ajax.gogocdn.net/ajax/load-list-episode?ep_start=0&ep_end=10000&id=${movie_id}&default_ep=${0}&alias=${alias}`;
    const epResponse = await fetch(epUrl, { headers: getHeaders() });
    const epHtml = await epResponse.text();
    const epRoot = parse(epHtml);

    const episodes = epRoot.querySelectorAll('li').map(el => {
      const a = el.querySelector('a');
      const epTitle = a?.querySelector('.name')?.text.trim() || '';
      const epId = a?.getAttribute('href')?.trim().replace('/', '') || ''; // e.g. /naruto-episode-1 -> naruto-episode-1
      // Extract number from title "EP 1"
      const numMatch = epTitle.match(/EP\s+(\d+)/i);
      const number = numMatch ? parseInt(numMatch[1]) : 0;
      
      return { id: epId, title: epTitle, number };
    }).reverse();

    return {
      id,
      title,
      poster,
      synopsis,
      episodes,
    };
  } catch (error) {
    console.error('Error getting gogoanime details:', error);
    return null;
  }
};

export const getGogoanimeEpisode = async (id: string) => {
  try {
    const url = `${BASE_URL}/${id}`;
    const response = await fetch(url, { headers: getHeaders() });
    const html = await response.text();
    const root = parse(html);
    
    const title = root.querySelector('.anime_video_body h1')?.text || '';
    const iframe = root.querySelector('iframe')?.getAttribute('src') || '';
    
    // The iframe src usually looks like: //s3taku.com/streaming.php?id=...
    const streamUrl = iframe.startsWith('//') ? `https:${iframe}` : iframe;

    return {
      id,
      title,
      streamUrl,
    };
  } catch (error) {
    console.error('Error getting gogoanime episode:', error);
    return null;
  }
};

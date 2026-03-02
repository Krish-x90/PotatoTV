import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchAnime, getAnimeDetails, getEpisodeDetails } from './src/server/otakudesu';
import { searchGogoanime, getGogoanimeAnime, getGogoanimeEpisode } from './src/server/gogoanime';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Gogoanime Routes
  app.get('/api/gogoanime/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const results = await searchGogoanime(query);
    res.json(results);
  });

  app.get('/api/gogoanime/anime/:id', async (req, res) => {
    const { id } = req.params;
    const details = await getGogoanimeAnime(id);
    if (!details) return res.status(404).json({ error: 'Anime not found' });
    res.json(details);
  });

  app.get('/api/gogoanime/episode/:id', async (req, res) => {
    const { id } = req.params;
    const details = await getGogoanimeEpisode(id);
    if (!details) return res.status(404).json({ error: 'Episode not found' });
    res.json(details);
  });

  app.get('/api/otakudesu/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const results = await searchAnime(query);
    res.json(results);
  });

  app.get('/api/otakudesu/anime/:id', async (req, res) => {
    const { id } = req.params;
    const details = await getAnimeDetails(id);
    if (!details) return res.status(404).json({ error: 'Anime not found' });
    res.json(details);
  });

  app.get('/api/otakudesu/episode/:id', async (req, res) => {
    const { id } = req.params;
    const details = await getEpisodeDetails(id);
    if (!details) return res.status(404).json({ error: 'Episode not found' });
    res.json(details);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

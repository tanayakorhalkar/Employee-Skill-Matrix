import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const PORT = Number(process.env.PORT) || 3000;
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

async function startServer() {
  const app = express();
  app.use(express.json());

  app.use('/api', async (req, res, next) => {
    try {
      const headers = new Headers();
      const authorization = req.header('authorization');
      const accept = req.header('accept');
      if (authorization) headers.set('Authorization', authorization);
      if (accept) headers.set('Accept', accept);
      if (req.body !== undefined && !['GET', 'HEAD'].includes(req.method)) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(new URL(req.originalUrl, BACKEND_API_URL), {
        method: req.method,
        headers,
        body: req.body !== undefined && !['GET', 'HEAD'].includes(req.method)
          ? JSON.stringify(req.body)
          : undefined,
      });

      res.status(response.status);
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('API proxy request failed:', error);
    res.status(502).json({ error: 'The API backend is unavailable. Ensure FastAPI is running on port 8000.' });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Evonence Skill Matrix] Web app and API proxy running at http://0.0.0.0:${PORT}`);
    console.log(`[Evonence Skill Matrix] API backend: ${BACKEND_API_URL}`);
  });
}

startServer().catch(error => {
  console.error('Fatal: Failed to start server:', error);
  process.exit(1);
});

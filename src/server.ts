import { createApp } from './app';

try {
  process.loadEnvFile('.env');
} catch {
  // Environment variables may be supplied by the hosting platform instead.
}

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, () => {
  console.log(`Smart Planner API listening on http://localhost:${port}`);
});

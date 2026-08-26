import { createApp } from './app.js';
import { connectDB } from './db/connect.js';
import { env } from './config/env.js';

async function main() {
  await connectDB(env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');

  const app = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

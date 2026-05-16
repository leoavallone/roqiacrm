import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { seedAdmin } from './seed/seedAdmin.js';

await connectDatabase();
await seedAdmin();

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});

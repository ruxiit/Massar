// Load environment variables FIRST – before any other import reads process.env.
// This must be the very first executable statement in the application.
import 'dotenv/config';

import app from './app';

const PORT = Number(process.env['PORT'] ?? 3000);

app.listen(PORT, () => {
  console.log(`[server] Massar API running on http://localhost:${PORT} `);
});

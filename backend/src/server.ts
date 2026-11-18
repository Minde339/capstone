import { buildApp } from './app';
import { config } from './config';
import { getDatabase } from './db';

async function start() {
  const app = buildApp();

  try {
    // Ensure DB is initialized
    getDatabase();

    await app.ready();
    await app.listen({ port: config.port, host: config.host });
    console.log(`🚀 E-Bookstore Backend Server running on http://${config.host}:${config.port}`);
    console.log(`📚 OpenAPI / Swagger UI documentation at http://${config.host}:${config.port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

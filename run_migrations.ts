import 'dotenv/config';
import { runMigrations } from './backend/src/config/migrate';

async function run() {
  try {
    await runMigrations();
    console.log('Finished.');
  } catch (err) {
    console.error(err);
  }
}

run();

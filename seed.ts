
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from './shared/schema';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  await db.update(users).set({ persona: {} });
  console.log('Seeding complete.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

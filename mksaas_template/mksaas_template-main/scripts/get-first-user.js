/**
 * Get first user ID for import script
 */
require('dotenv/config');
const postgres = require('postgres');

async function getFirstUser() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(dbUrl);

  try {
    const result = await client`SELECT id, name, email FROM "user" LIMIT 1`;

    if (result.length === 0) {
      console.error('❌ No users found in database');
      process.exit(1);
    }

    const user = result[0];
    console.log('✅ Found user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);

    return user.id;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

getFirstUser().then((userId) => {
  process.stdout.write(userId);
});

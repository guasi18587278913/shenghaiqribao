require('dotenv/config');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function debugTopicData() {
  try {
    // Get a few topics from the special report
    const topics = await sql`
      SELECT *
      FROM daily_topic
      WHERE report_id = 'special-knowledge-essentials-2024-10'
      LIMIT 2
    `;

    console.log('\n=== 📊 Topic Data Structure ===\n');

    if (topics.length > 0) {
      const topic = topics[0];
      console.log('Topic Fields:');
      for (const [key, value] of Object.entries(topic)) {
        const type =
          value === null
            ? 'null'
            : Array.isArray(value)
              ? `array[${value.length}]`
              : value instanceof Date
                ? `Date (${value.toISOString()})`
                : typeof value;
        console.log(`  ${key}: ${type}`);

        // Show value for non-large fields
        if (
          key !== 'content' &&
          key !== 'source_messages' &&
          key !== 'summary'
        ) {
          console.log(`    Value: ${JSON.stringify(value, null, 2)}`);
        }
      }

      // Check tags specifically
      console.log('\n=== 🏷️ Tags Field Detail ===');
      console.log('Tags value:', topic.tags);
      console.log('Tags type:', typeof topic.tags);
      console.log('Is array:', Array.isArray(topic.tags));
      if (Array.isArray(topic.tags)) {
        console.log('Tags length:', topic.tags.length);
        topic.tags.forEach((tag, i) => {
          console.log(`  [${i}]: "${tag}" (${typeof tag})`);
        });
      }
    }

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugTopicData();

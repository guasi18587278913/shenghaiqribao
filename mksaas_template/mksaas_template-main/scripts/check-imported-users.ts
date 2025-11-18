import 'dotenv/config';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

async function main() {
  console.log('📊 用户导入统计报告\n');
  console.log('=====================================\n');

  // 总用户数
  const total = await client`
    SELECT COUNT(*) as count FROM "user"
  `;
  console.log(`👥 总用户数: ${total[0].count} 人\n`);

  // 星球用户数（有手机号的）
  const planetUsers = await client`
    SELECT COUNT(*) as count FROM "user"
    WHERE phone IS NOT NULL
  `;
  console.log(`🌐 星球用户数: ${planetUsers[0].count} 人\n`);

  // 按创建时间统计
  const today = await client`
    SELECT COUNT(*) as count FROM "user"
    WHERE phone IS NOT NULL
    AND created_at::date = CURRENT_DATE
  `;
  console.log(`📅 今天导入: ${today[0].count} 人\n`);

  console.log('=====================================\n');

  // 随机显示10个用户
  const sample = await client`
    SELECT name, phone, planet_number
    FROM "user"
    WHERE phone IS NOT NULL
    ORDER BY RANDOM()
    LIMIT 10
  `;

  console.log('🎲 随机用户样本:');
  console.log('=====================================');
  for (const u of sample) {
    console.log(`  👤 ${u.name} | 📱 ${u.phone} | 🌐 ${u.planet_number}`);
  }
  console.log('');

  await client.end();
}

main();

const fs = require('fs');
const { Client } = require('pg');
const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
const connStr = process.env.SUPABASE_DB_URL;
if (!connStr) { console.error("SUPABASE_DB_URL missing"); process.exit(1); }
console.log("Host:", connStr.replace(/:[^:@]+@/, ':****@').split('@')[1]);
const statements = schema.split(';').map(s=>s.trim()).filter(s=>s && !s.startsWith('--'));
(async () => {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected.");
  for (const stmt of statements) {
    const label = stmt.replace(/\s+/g,' ').slice(0,70);
    try { await client.query(stmt); console.log("OK  :", label); }
    catch (e) { console.log("WARN:", label, "->", e.message); }
  }
  await client.end();
  console.log("Done.");
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });

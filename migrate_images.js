const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aigyflxgtbkwhlhkdznd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ3lmbHhndGJrd2hsaGtkem5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDE2MDAsImV4cCI6MjA5ODM3NzYwMH0.S-9Ti5SyZ0_bpc0RKcM28eDY8okWmte3O-ePP_RGCT4';
const db = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'product-images';

async function uploadBase64ToStorage(base64Str, filename) {
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const path = `${filename}.${ext}`;

  const { data, error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: true
  });
  if (error) throw error;

  const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

async function migrateProducts() {
  console.log('Fetching products...');
  const { data: products, error } = await db.from('products').select('id, img_url');
  if (error) { console.error('Failed:', error); return; }

  let migrated = 0;
  for (const p of products) {
    if (p.img_url && p.img_url.startsWith('data:')) {
      console.log(`  Migrating product ${p.id} (${(p.img_url.length / 1024).toFixed(0)} KB base64)...`);
      try {
        const publicUrl = await uploadBase64ToStorage(p.img_url, `product-${p.id}`);
        const { error: updateErr } = await db.from('products').update({ img_url: publicUrl }).eq('id', p.id);
        if (updateErr) throw updateErr;
        console.log(`    Done -> ${publicUrl}`);
        migrated++;
      } catch (err) {
        console.error(`    Failed:`, err.message);
      }
    }
  }
  console.log(`Products migrated: ${migrated}`);
}

async function migrateDeals() {
  console.log('Fetching deals...');
  const { data: deals, error } = await db.from('deals').select('id, image_url');
  if (error) { console.error('Failed:', error); return; }

  let migrated = 0;
  for (const d of deals) {
    if (d.image_url && d.image_url.startsWith('data:')) {
      console.log(`  Migrating deal ${d.id} (${(d.image_url.length / 1024).toFixed(0)} KB base64)...`);
      try {
        const publicUrl = await uploadBase64ToStorage(d.image_url, `deal-${d.id}`);
        const { error: updateErr } = await db.from('deals').update({ image_url: publicUrl }).eq('id', d.id);
        if (updateErr) throw updateErr;
        console.log(`    Done -> ${publicUrl}`);
        migrated++;
      } catch (err) {
        console.error(`    Failed:`, err.message);
      }
    }
  }
  console.log(`Deals migrated: ${migrated}`);
}

async function run() {
  console.log('Authenticating...');
  const { data: authData, error: authErr } = await db.auth.signInWithPassword({
    email: 'mkrockstar149@gmail.com',
    password: 'mohsinkhan786'
  });
  if (authErr) {
    console.error('Authentication failed:', authErr.message);
    console.log('Continuing as anonymous...');
  } else {
    console.log('Authenticated successfully!');
  }

  console.log(`Starting migration to "${BUCKET}"...\n`);

  await migrateProducts();
  console.log('');
  await migrateDeals();

  console.log('\nMigration complete!');
}

run();

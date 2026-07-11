const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabaseUrl = 'https://aigyflxgtbkwhlhkdznd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ3lmbHhndGJrd2hsaGtkem5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDE2MDAsImV4cCI6MjA5ODM3NzYwMH0.S-9Ti5SyZ0_bpc0RKcM28eDY8okWmte3O-ePP_RGCT4';
const dbClient = createClient(supabaseUrl, supabaseKey);

async function compressBase64(base64Str) {
  try {
    // base64Str looks like data:image/png;base64,iVBORw0KGgo...
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;
    const type = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    
    const compressed = await sharp(data)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
      
    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch (err) {
    console.error('Error compressing image:', err.message);
    return base64Str;
  }
}

async function run() {
  console.log('Fetching products...');
  const { data: products, error } = await dbClient.from('products').select('id, image_url');
  if (error) {
    console.error('Failed to fetch products', error);
    return;
  }
  
  console.log(`Found ${products.length} products.`);
  let updatedProducts = 0;
  
  for (let p of products) {
    if (p.img_url && p.img_url.length > 300000) { // If > 300KB
      console.log(`Compressing product ${p.id}... original size: ${(p.img_url.length / 1024 / 1024).toFixed(2)} MB`);
      const newImg = await compressBase64(p.img_url);
      console.log(`Compressed to: ${(newImg.length / 1024 / 1024).toFixed(2)} MB`);
      
      const { error: updateErr } = await dbClient.from('products').update({ image_url: newImg }).eq('id', p.id);
      if (updateErr) console.error(`Failed to update product ${p.id}`, updateErr);
      else updatedProducts++;
    }
  }
  
  console.log(`Updated ${updatedProducts} products.`);
  
  console.log('Fetching deals...');
  const { data: deals, error: dError } = await dbClient.from('deals').select('id, image_url');
  if (dError) {
    console.error('Failed to fetch deals', dError);
    return;
  }
  
  console.log(`Found ${deals.length} deals.`);
  let updatedDeals = 0;
  
  for (let d of deals) {
    if (d.image_url && d.image_url.length > 300000) {
      console.log(`Compressing deal ${d.id}... original size: ${(d.image_url.length / 1024 / 1024).toFixed(2)} MB`);
      const newImg = await compressBase64(d.image_url);
      console.log(`Compressed to: ${(newImg.length / 1024 / 1024).toFixed(2)} MB`);
      
      const { error: updateErr } = await dbClient.from('deals').update({ image_url: newImg }).eq('id', d.id);
      if (updateErr) console.error(`Failed to update deal ${d.id}`, updateErr);
      else updatedDeals++;
    }
  }
  
  console.log(`Updated ${updatedDeals} deals.`);
  console.log('Done!');
}

run();

const fs = require('fs');
const path = require('path');

function processFile(filePath, isHome) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add esc helper
  if (!content.includes('function esc(str)')) {
    content = content.replace(/const dbClient = window\.supabase\.createClient\(supabaseUrl, supabaseKey\);/,
      'const dbClient = window.supabase.createClient(supabaseUrl, supabaseKey);\n\n    // XSS Escaping Helper\n    function esc(str) {\n      const d = document.createElement(\'div\');\n      d.textContent = str == null ? \'\' : String(str);\n      return d.innerHTML;\n    }\n');
  }

  // Add noopener noreferrer
  content = content.replace(/target=\"_blank\"(?! rel=\"noopener noreferrer\")/g, 'target=\"_blank\" rel=\"noopener noreferrer\"');

  // XSS fixes - only replace if not already wrapped in esc()
  // We use a regex that looks for ${p.name} that doesn't have esc( right before it.
  content = content.replace(/(?<!esc\()\$\{p\.name\}/g, '${esc(p.name)}');
  content = content.replace(/(?<!esc\()\$\{p\.color\}/g, '${esc(p.color)}');
  content = content.replace(/(?<!esc\()\$\{p\.badge\}/g, '${esc(p.badge)}');
  content = content.replace(/(?<!esc\()\$\{p\.category\}/g, '${esc(p.category)}');
  content = content.replace(/(?<!esc\()\$\{d\.title\}/g, '${esc(d.title)}');
  content = content.replace(/(?<!esc\()\$\{d\.description \|\| \'\'\}/g, '${esc(d.description || \'\')}');
  content = content.replace(/(?<!esc\()\$\{d\.description \|\| \'Exclusive bundle deal. Limited time offer.\'\}/g, '${esc(d.description || \'Exclusive bundle deal. Limited time offer.\')}');
  content = content.replace(/(?<!esc\()\$\{c\.name\}/g, '${esc(c.name)}');
  content = content.replace(/(?<!esc\()\$\{c\.color\}/g, '${esc(c.color)}');
  content = content.replace(/(?<!esc\()\$\{c\.email\}/g, '${esc(c.email)}');
  content = content.replace(/(?<!esc\()\$\{c\.phone\}/g, '${esc(c.phone)}');
  content = content.replace(/(?<!esc\()\$\{c\.address\}/g, '${esc(c.address)}');
  
  if (content.includes('${o.customer}')) {
     content = content.replace(/(?<!esc\()\$\{o\.customer\}/g, '${esc(o.customer)}');
  }
  content = content.replace(/(?<!esc\()\$\{o\.id\.substring\(0, 8\)\}/g, '${esc(o.id).substring(0, 8)}');
  content = content.replace(/(?<!esc\()\$\{o\.date\}/g, '${esc(o.date)}');

  if (isHome) {
    // Checkout RPC replace
    const oldCheckout = `    // Upsert customer
    let customerId;
    let customerData = { email: checkoutEmail, phone, first_name: fname, last_name: lname, address };
    
    const { data: existing } = await dbClient.from('customers').select('id').eq('email', checkoutEmail).maybeSingle();
    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: custErr } = await dbClient.from('customers')
        .insert([customerData])
        .select('id').single();
      if (custErr) throw custErr;
      customerId = newCust.id;
    }`;
    const newCheckout = `    // Upsert customer using secure RPC
    let customerData = { email: checkoutEmail, phone, first_name: fname, last_name: lname, address };
    const { data: customerId, error: custErr } = await dbClient.rpc('upsert_customer', {
      p_email: customerData.email,
      p_first_name: customerData.first_name,
      p_last_name: customerData.last_name,
      p_phone: customerData.phone,
      p_address: customerData.address
    });
    if (custErr) throw custErr;
    if (!customerId) throw new Error('Failed to secure customer profile.');`;
    
    if (content.includes(oldCheckout)) {
      content = content.replace(oldCheckout, newCheckout);
    }

    // Rollback test mode fix
    const oldRollback = `      if (itemsErr) {
        if (isTest) {
          console.error('[LoadTest] order_items insert failed:', itemsErr);
          // Rollback the created order to avoid orphans
          console.log('[LoadTest] Rolling back created test order:', order.id);
          await dbClient.from('orders').delete().eq('id', order.id);
          console.log('[LoadTest] Test order rolled back successfully.');
        }
        throw itemsErr;
      }`;
    const newRollback = `      if (itemsErr) {
        // Rollback the created order to avoid orphans
        await dbClient.from('orders').delete().eq('id', order.id);
        throw itemsErr;
      }`;
    if (content.includes(oldRollback)) {
      content = content.replace(oldRollback, newRollback);
    }

    // Currency cart total
    content = content.replace(/document\.getElementById\('cart-total'\)\.textContent = '\$'\+total\.toFixed\(2\);/, 
                              'document.getElementById(\'cart-total\').textContent = \'Rs. \'+total.toFixed(0);');
    content = content.replace(/\$\{total\.toFixed\(2\)\}/g, '${total.toFixed(0)}');
  } else if (filePath.includes('admin_suite')) {
    // Admin fixes
    const oldUpdateStatus = `function updateStatus(id, newStatus) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  o.status = newStatus;
  renderOrders();
  updateStats();
  showToast('Order status updated', 'success');
}`;
    const newUpdateStatus = `async function updateStatus(id, newStatus) {
  try {
    const { error } = await dbClient.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
    
    const o = orders.find(x => x.id === id);
    if (o) o.status = newStatus;
    
    renderOrders();
    updateStats();
    showToast('Order status updated', 'success');
  } catch (err) {
    showToast('Failed to update status: ' + err.message, 'error');
  }
}`;
    if (content.includes(oldUpdateStatus)) {
      content = content.replace(oldUpdateStatus, newUpdateStatus);
    }

    const oldSuppressors = `// Suppress non-critical warnings
window.onerror = () => true;
window.addEventListener('unhandledrejection', () => true);`;
    const newSuppressors = `// Replaced error suppressors with user-friendly toasts
window.onerror = function(msg, url, lineNo, columnNo, error) {
  showToast('An unexpected error occurred. Please try again.', 'error');
  return false; // let it log to console
};
window.addEventListener('unhandledrejection', function(e) {
  showToast('An unexpected error occurred. Please try again.', 'error');
});`;
    if (content.includes(oldSuppressors)) {
      content = content.replace(oldSuppressors, newSuppressors);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

processFile('mk_rockstar_home/code.html', true);
processFile('shop_all_mk_rockstar/code.html', false);
processFile('oversized_hoodie_mk_rockstar/code.html', false);
processFile('mk_rockstar_admin_suite/code.html', false);

console.log('Processed all files successfully.');

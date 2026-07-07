
// ═══════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════

const supabaseUrl = 'https://aigyflxgtbkwhlhkdznd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ3lmbHhndGJrd2hsaGtkem5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDE2MDAsImV4cCI6MjA5ODM3NzYwMH0.S-9Ti5SyZ0_bpc0RKcM28eDY8okWmte3O-ePP_RGCT4';
const dbClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let PRODUCTS = [];
let DEALS = [];

let cart = JSON.parse(localStorage.getItem('mkr_cart') || '[]');
let wishlist = new Set();
let currentFilter = 'all';

function saveCart() {
  localStorage.setItem('mkr_cart', JSON.stringify(cart));
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupScrollSpy();
  
  // Show skeletons immediately
  renderSkeletons();

  // Fetch products asynchronously
  dbClient.from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data: prodData, error: prodErr }) => {
      if (prodErr) throw prodErr;
      if (prodData) {
        PRODUCTS = prodData.map(p => ({
          ...p,
          img: p.img_url,
          hex: p.hex_color
        }));
        renderProducts(PRODUCTS);
        setupReveal(); // Re-trigger reveal for loaded items
      }
    })
    .catch(err => {
      console.error('Error fetching products:', err);
      showToast('Failed to load products', 'error');
    });

  // Fetch deals asynchronously
  dbClient.from('deals')
    .select('*, products(*)')
    .eq('is_active', true)
    .then(({ data: dealData, error: dealErr }) => {
      if (dealErr) throw dealErr;
      if (dealData) {
        DEALS = dealData;
        renderDeals(DEALS);
        setupReveal();
      }
    })
    .catch(err => console.error('Error fetching deals:', err));
});

// ═══════════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════════
function setupReveal() {
  function check() {
    document.querySelectorAll('.reveal').forEach(el => {
      if(el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add('active');
    });
  }
  window.addEventListener('scroll', check, {passive:true});
  check();
}

// ═══════════════════════════════════════════
//  NAV SCROLL EFFECT
// ═══════════════════════════════════════════
function setupNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, {passive:true});
}

// ═══════════════════════════════════════════
//  NAV ACTIVE STATE (SCROLL SPY)
// ═══════════════════════════════════════════
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#nav-links .nav-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('data-active', 'true');
          } else {
            link.setAttribute('data-active', 'false');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: "-10% 0px -40% 0px" });

  sections.forEach(section => observer.observe(section));
}

// ═══════════════════════════════════════════
//  MOBILE MENU
// ═══════════════════════════════════════════
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  overlay.style.opacity = isOpen ? '0' : '1';
  overlay.style.pointerEvents = isOpen ? 'none' : 'auto';
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

// ═══════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════
function renderSkeletons() {
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  const skeletonHtml = Array(8).fill(0).map(() => `
    <div class="product-card skeleton-card animate-pulse">
      <div class="w-full bg-white/10 mb-4 lg:mb-6" style="aspect-ratio:3/4;"></div>
      <div class="h-3 bg-white/20 w-3/4 mb-2"></div>
      <div class="h-2 bg-white/10 w-1/2 mb-3"></div>
      <div class="h-4 bg-white/20 w-1/3"></div>
    </div>
  `).join('');
  grid.innerHTML = skeletonHtml;
}

function renderProducts(list) {
  const grid = document.getElementById('products-grid');
  if(!list.length) { grid.innerHTML = '<div class="col-span-4 text-center py-16 text-on-surface-variant" style="font-size:14px;">No products found in this category.</div>'; return; }
  grid.innerHTML = list.map((p, i) => `
    <div class="product-card group reveal" style="transition-delay:${(i%4)*80}ms;">
      <div class="relative overflow-hidden mb-4 lg:mb-6 img-zoom" style="aspect-ratio:3/4;background:#201f1f;">
        <img class="product-img w-full h-full object-cover" src="${p.img}" alt="${p.name}" loading="lazy"/>
        <!-- Quick View -->
        <button class="quick-view absolute bottom-0 left-0 w-full bg-white text-black py-3 lg:py-4" style="font-size:10px;letter-spacing:0.15em;" onclick="quickView(${p.id})">QUICK VIEW</button>
        <!-- Wishlist -->
        <button class="wishlist-btn absolute top-3 right-3 lg:top-4 lg:right-4 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors" id="wl-${p.id}" onclick="toggleWishlist(${p.id},event)" title="Wishlist">
          <span class="material-symbols-outlined" style="font-size:18px;color:#e5e2e1;">favorite</span>
        </button>
        ${p.badge ? `<div class="absolute top-3 left-3 lg:top-4 lg:left-4"><span class="bg-black/80 text-white px-2 py-0.5" style="font-size:9px;letter-spacing:0.12em;">${p.badge.toUpperCase()}</span></div>` : ''}
      </div>
      <h4 class="text-white mb-0.5 uppercase" style="font-size:11px;letter-spacing:0.1em;">${p.name}</h4>
      <p class="text-secondary/60 mb-1 uppercase" style="font-size:10px;">${p.color}</p>
      <p class="text-tertiary font-bold" style="font-size:14px;">Rs. ${p.price}.00</p>
    </div>`).join('');
  // Re-run reveal for new items
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => {
    if(el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('active');
  }), 50);
}

function setFilter(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-tab').forEach(btn => {
    const active = btn.dataset.filter === cat;
    btn.className = `filter-tab px-5 py-2 border whitespace-nowrap transition-colors ${active ? 'border-tertiary text-tertiary' : 'border-white/20 text-on-surface-variant hover:border-white/50'}`;
    btn.style.fontSize = '10px'; btn.style.letterSpacing = '0.15em';
  });
  const filtered = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
  renderProducts(filtered);
}

function filterCategory(cat) {
  document.getElementById('new-arrivals').scrollIntoView({behavior:'smooth'});
  setTimeout(() => setFilter(cat), 400);
}
function scrollToProducts() {
  document.getElementById('new-arrivals').scrollIntoView({behavior:'smooth'});
}

// ═══════════════════════════════════════════
//  DEALS
// ═══════════════════════════════════════════
function renderDeals(list) {
  const grid = document.getElementById('deals-grid');
  if(!grid) return;
  if(!list || !list.length) { 
    grid.innerHTML = '<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-on-surface-variant" style="font-size:14px;">No active deals at the moment.</div>'; 
    return; 
  }
  grid.innerHTML = list.map((d, i) => `
    <div class="glass flex flex-col h-full relative group reveal" style="transition-delay:${(i%3)*80}ms;">
      <div class="relative overflow-hidden h-64 img-zoom">
        <img src="${d.image_url || 'https://via.placeholder.com/400x500?text=No+Image'}" alt="${d.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy">
        ${d.original_price > 0 ? `<div class="absolute top-4 left-4 bg-error text-on-error px-3 py-1 font-bold shadow-lg" style="font-size:10px;letter-spacing:0.1em;">
          SALE -${Math.round(((d.original_price - d.deal_price)/d.original_price)*100)}%
        </div>` : ''}
      </div>
      <div class="p-6 flex flex-col flex-1 border-t border-white/5">
        <h3 class="text-white uppercase mb-2" style="font-family:Anton,sans-serif;font-size:24px;letter-spacing:0.02em;">${d.title}</h3>
        <p class="text-on-surface-variant mb-6 text-sm leading-relaxed">${d.description || ''}</p>
        <div class="mt-auto flex items-end gap-3 mb-6">
          <span class="text-tertiary font-bold" style="font-family:Anton,sans-serif;font-size:28px;">Rs. ${d.deal_price}</span>
          <span class="text-on-surface-variant line-through mb-1" style="font-size:14px;">Rs. ${d.original_price}</span>
        </div>
        <button onclick="quickViewDeal('${d.id}')" class="w-full bg-white text-black py-4 hover:bg-tertiary transition-colors" style="font-size:11px;letter-spacing:0.15em;font-weight:700;">GRAB DEAL</button>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════
//  WISHLIST
// ═══════════════════════════════════════════
function toggleWishlist(id, e) {
  if (e) { e.stopPropagation(); }
  const p = PRODUCTS.find(x=>x.id===id);
  const wasAdded = !wishlist.has(id);
  
  if (wasAdded) {
    wishlist.add(id);
    showToast(`${p ? p.name : 'Item'} added to wishlist`,'success');
  } else {
    wishlist.delete(id);
    showToast(`Removed from wishlist`,'info');
  }
  
  updateBadges();

  const btn = document.getElementById('wl-'+id);
  const qvBtn = document.getElementById('qv-wl-'+id);
  
  if (btn) {
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.style.fontVariationSettings = wasAdded ? "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24";
      icon.style.color = wasAdded ? '#e9c349' : '#e5e2e1';
    }
  }

  if (qvBtn) {
    const qvIcon = qvBtn.querySelector('.material-symbols-outlined');
    if (qvIcon) {
      qvIcon.style.fontVariationSettings = wasAdded ? "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24";
      qvIcon.style.color = wasAdded ? '#e9c349' : '#e5e2e1';
    }
  }
}
function openWishlist() {
  renderWishlist();
  document.getElementById('wishlist-overlay').classList.remove('opacity-0', 'pointer-events-none');
  document.getElementById('wishlist-drawer').classList.remove('translate-x-full');
}

function closeWishlist() {
  document.getElementById('wishlist-overlay').classList.add('opacity-0', 'pointer-events-none');
  document.getElementById('wishlist-drawer').classList.add('translate-x-full');
}

function renderWishlist() {
  const wlContainer = document.getElementById('wishlist-items');
  if(!wishlist.size) {
    wlContainer.innerHTML = '<p class="text-on-surface-variant text-center mt-10" style="font-size:14px;">Your wishlist is empty.</p>';
    return;
  }
  let html = '';
  wishlist.forEach(id => {
    const p = PRODUCTS.find(x => x.id == id);
    if(p) {
      html += `
      <div class="flex gap-4 border-b border-white/5 pb-4">
        <img src="${p.img}" class="w-20 h-24 object-cover" alt="${p.name}">
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h4 class="text-white text-sm font-bold uppercase tracking-wider">${p.name}</h4>
            <p class="text-on-surface-variant text-xs mt-1">Rs. ${p.price}</p>
          </div>
          <div class="flex gap-3 mt-2">
            <button onclick="quickView(${p.id});closeWishlist()" class="text-[10px] tracking-widest text-tertiary hover:text-white transition-colors uppercase font-bold">VIEW</button>
            <button onclick="toggleWishlist(${p.id});renderWishlist()" class="text-[10px] tracking-widest text-error hover:text-red-400 transition-colors uppercase font-bold">REMOVE</button>
          </div>
        </div>
      </div>
      `;
    }
  });
  wlContainer.innerHTML = html;
}

// ═══════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════
function addToCart(id, size='M') {
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(c=>c.id===id&&c.size===size);
  if(existing) existing.qty++;
  else cart.push({...p,size,qty:1});
  saveCart();
  renderCart();
  updateBadges();
  showToast(`${p.name} added to cart`,'success');
}

function removeFromCart(id, size) {
  cart = cart.filter(c=>!(c.id===id&&c.size===size));
  saveCart();
  renderCart();
  updateBadges();
  showToast('Item removed','info');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);
  document.getElementById('cart-total').textContent = '$'+total.toFixed(2);
  document.getElementById('cart-header-count').textContent = `(${cart.reduce((s,c)=>s+c.qty,0)})`;
  if(!cart.length) {
    container.innerHTML = `<div class="py-16 text-center text-on-surface-variant" style="font-size:14px;">Your cart is empty.<br/><br/><button onclick="closeCart()" class="border border-white/20 px-6 py-2 hover:border-white/50 transition-colors" style="font-size:11px;letter-spacing:0.1em;">SHOP NOW</button></div>`;
    return;
  }
  container.innerHTML = cart.map(c=>`
    <div class="py-5 flex gap-4">
      <div class="w-16 h-20 flex-shrink-0 overflow-hidden bg-surface-container">
        <img src="${c.img}" alt="${c.name}" class="w-full h-full object-cover"/>
      </div>
      <div class="flex-1 min-w-0">
        <p style="font-size:12px;letter-spacing:0.08em;" class="text-white uppercase truncate">${c.name}</p>
        <p class="text-on-surface-variant mt-0.5" style="font-size:11px;">${c.color} · Size ${c.size}</p>
        <div class="flex justify-between items-center mt-3">
          <p class="text-tertiary font-bold" style="font-size:14px;">Rs. ${(c.price*c.qty).toFixed(2)}</p>
          <div class="flex items-center gap-3">
            <button onclick="adjustQty(${c.id},'${c.size}',-1)" class="w-6 h-6 flex items-center justify-center border border-white/20 hover:border-white/50 transition-colors text-on-surface-variant hover:text-white" style="font-size:14px;">−</button>
            <span style="font-size:13px;">${c.qty}</span>
            <button onclick="adjustQty(${c.id},'${c.size}',1)" class="w-6 h-6 flex items-center justify-center border border-white/20 hover:border-white/50 transition-colors text-on-surface-variant hover:text-white" style="font-size:14px;">+</button>
            <button onclick="removeFromCart(${c.id},'${c.size}')" class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors ml-1" style="font-size:18px;">delete</button>
          </div>
        </div>
      </div>
    </div>`).join('');
}

function adjustQty(id, size, delta) {
  const item = cart.find(c=>c.id===id&&c.size===size);
  if(!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  updateBadges();
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  renderCart();
  drawer.classList.add('open');
  overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  drawer.classList.remove('open');
  overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}
function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty', 'info'); return; }
  closeCart();
  const modal = document.getElementById('checkout-modal');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    document.getElementById('checkout-modal-content').classList.remove('scale-95');
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('opacity-0');
  document.getElementById('checkout-modal-content').classList.add('scale-95');
  setTimeout(() => { modal.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    const content = document.getElementById(id + '-content');
    if (content) content.classList.remove('scale-95');
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('opacity-0');
  const content = document.getElementById(id + '-content');
  if (content) content.classList.add('scale-95');
  setTimeout(() => { modal.classList.add('hidden'); document.body.style.overflow = ''; }, 300);
}

async function sendOrderNotification(order, customer, cartItems, total) {
  const orderData = {
    order_id: String(order.id).substring(0, 8).toUpperCase(),
    customer_name: `${customer.first_name} ${customer.last_name}`,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: 'N/A',
    items: cartItems.map(c => ({
      name: c.name,
      size: c.size,
      color: c.color || 'N/A',
      qty: c.qty,
      price: c.price
    })),
    total_amount: total.toFixed(2),
    payment_method: 'Cash on Delivery',
    notes: ''
  };

  let email_status = 'failed';
  let email_provider = 'none';
  let email_error = '';

  try {
    // 1. Try Resend via Supabase Edge Function
    const { data, error } = await dbClient.functions.invoke('send-order-email', {
      body: { orderData }
    });
    
    if (error) throw new Error(error.message || 'Edge Function Error');
    if (data && data.error) throw new Error(data.error);

    email_status = 'sent';
    email_provider = 'resend';
  } catch (resendErr) {
    console.warn('Resend failed, trying EmailJS fallback...', resendErr);
    
    // 2. Fallback to EmailJS (best effort to owner)
    try {
      const orderSummary = cartItems.map(c => `${c.qty}x ${c.name} (Size: ${c.size}) — Rs. ${(c.price * c.qty).toFixed(0)}`).join('\n');
      await emailjs.send('service_i9tzjls', 'template_7c5tcmd', {
        to_email: 'Admin', // The template likely has the owner's actual email hardcoded as the recipient in EmailJS dashboard
        email: customer.email,
        reply_to: customer.email,
        to_name: 'Store Owner',
        order_id: orderData.order_id,
        order_total: `Rs. ${total.toFixed(0)}`,
        order_summary: orderSummary,
        address: customer.address
      });
      email_status = 'sent';
      email_provider = 'emailjs';
      email_error = resendErr.message || 'Resend failed';
    } catch (emailjsErr) {
      console.error('EmailJS fallback also failed:', emailjsErr);
      email_status = 'failed';
      email_provider = 'none';
      email_error = `Resend: ${resendErr.message || 'Failed'}. EmailJS: ${emailjsErr.text || 'Failed'}`;
    }
  }

  // 3. Update order in Supabase with email tracking status
  try {
    await dbClient.from('orders').update({
      email_status,
      email_provider,
      email_error: email_error ? email_error.substring(0, 250) : null
    }).eq('id', order.id);
  } catch (dbErr) {
    console.warn('Failed to update email status on order:', dbErr);
  }

  return { email_status, email_provider };
}

async function processCheckout(e) {
  e.preventDefault();
  const fname = document.getElementById('co-fname').value;
  const lname = document.getElementById('co-lname').value;
  const email = document.getElementById('co-email').value;
  const phone = document.getElementById('co-phone').value;
  const address = document.getElementById('co-address').value;
  const total = cart.reduce((s,c) => s + c.price * c.qty, 0);

  const submitText = document.getElementById('co-submit-text');
  const spinner = document.getElementById('co-spinner');
  const submitBtn = document.getElementById('co-submit-btn');
  submitText.classList.add('invisible');
  spinner.classList.remove('hidden');
  submitBtn.disabled = true;

  try {
    // Upsert customer
    let customerId;
    let customerData = { email, phone, first_name: fname, last_name: lname, address };
    
    const { data: existing } = await dbClient.from('customers').select('id').eq('email', email).maybeSingle();
    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: custErr } = await dbClient.from('customers')
        .insert([customerData])
        .select().single();
      if (custErr) throw custErr;
      customerId = newCust.id;
    }

    // Validate Deals
    for (const c of cart) {
      if (c.color === 'DEAL' && c.deal_id) {
        const { data: d } = await dbClient.from('deals').select('*').eq('id', c.deal_id).maybeSingle();
        if (!d || !d.is_active) throw new Error(`The deal "${c.name}" is no longer active.`);
      }
    }

    // Create order
    const { data: order, error: orderErr } = await dbClient.from('orders')
      .insert([{ customer_id: customerId, total_amount: total, status: 'Pending' }])
      .select().single();
    if (orderErr) throw orderErr;

    // Create order items
    let fallbackProductId = null;
    const items = [];
    for (const c of cart) {
      let pId = c.id;
      // If pId is a UUID string (Deal without linked product)
      if (typeof pId === 'string' && isNaN(pId)) {
        if (!fallbackProductId) {
          const { data: anyProd } = await dbClient.from('products').select('id').limit(1).maybeSingle();
          if (anyProd) fallbackProductId = anyProd.id;
        }
        pId = fallbackProductId;
      }
      items.push({
        order_id: order.id,
        product_id: pId,
        size: c.size,
        quantity: c.qty,
        price_at_purchase: c.price
      });
    }

    if (items.length > 0) {
      const { error: itemsErr } = await dbClient.from('order_items').insert(items);
      if (itemsErr) {
        console.error('Order items error:', itemsErr);
        throw itemsErr;
      }
    }

    // Trigger Notification Flow (Resend -> EmailJS fallback)
    await sendOrderNotification(order, customerData, cart, total);

    cart = [];
    saveCart();
    renderCart();
    updateBadges();
    closeCheckout();
    showToast('Order placed successfully!', 'success');

  } catch (err) {
    console.error('Checkout error:', err);
    const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
    showToast(msg, 'error');
  } finally {
    submitText.classList.remove('invisible');
    spinner.classList.add('hidden');
    submitBtn.disabled = false;
  }
}

function updateBadges() {
  const total = cart.reduce((s,c)=>s+c.qty,0);
  const cc = document.getElementById('cart-count');
  cc.textContent = total; cc.classList.toggle('hidden', total===0);
  const wc = document.getElementById('wishlist-count');
  wc.textContent = wishlist.size; wc.classList.toggle('hidden', wishlist.size===0);
}

// ═══════════════════════════════════════════
//  QUICK VIEW MODAL
// ═══════════════════════════════════════════
function quickView(id) {
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const sizes = ['XS','S','M','L','XL','XXL'];
  document.getElementById('qv-content').innerHTML = `
    <div class="flex flex-col sm:flex-row">
      <div class="sm:w-1/2 img-zoom" style="aspect-ratio:3/4;max-height:50vh;overflow:hidden;">
        <img src="${p.img}" alt="${p.name}" class="product-img w-full h-full object-cover"/>
      </div>
      <div class="sm:w-1/2 p-6 lg:p-8 flex flex-col">
        <div class="flex justify-between items-start mb-1">
          <span class="text-on-surface-variant uppercase" style="font-size:10px;letter-spacing:0.15em;">${p.category}</span>
          <button onclick="closeQV()" class="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
        </div>
        <h3 class="text-white uppercase mb-1 mt-2" style="font-family:Anton,sans-serif;font-size:26px;letter-spacing:0.04em;">${p.name}</h3>
        <p class="text-on-surface-variant mb-4" style="font-size:13px;">${p.color}</p>
        <p class="text-tertiary font-bold mb-6" style="font-size:24px;font-family:Anton,sans-serif;">Rs. ${p.price}.00</p>
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">SELECT SIZE</p>
        <div class="flex flex-wrap gap-2 mb-6" id="qv-sizes">
          ${sizes.map((s,i)=>`<button onclick="selectSize(this)" data-size="${s}" class="size-btn border border-white/20 px-3 py-2 text-on-surface-variant hover:border-white hover:text-white transition-colors ${i===2?'border-tertiary text-tertiary':''}" style="font-size:10px;letter-spacing:0.1em;">${s}</button>`).join('')}
        </div>
        <div class="flex gap-3 mt-auto">
          <button onclick="addFromQV(${p.id})" class="flex-1 bg-white text-black py-4 hover:bg-tertiary transition-all" style="font-size:11px;letter-spacing:0.15em;">ADD TO CART</button>
          <button onclick="toggleWishlist(${p.id},event)" class="wishlist-btn w-12 border border-white/20 hover:border-tertiary transition-colors flex items-center justify-center" id="qv-wl-${p.id}">
            <span class="material-symbols-outlined" style="font-size:20px;">favorite</span>
          </button>
        </div>
      </div>
    </div>`;
  const modal = document.getElementById('qv-modal');
  modal.classList.remove('modal-hidden');
  document.body.style.overflow = 'hidden';
}
function closeQV() {
  document.getElementById('qv-modal').classList.add('modal-hidden');
  document.body.style.overflow = '';
}
function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => {
    b.className = `size-btn border border-white/20 px-3 py-2 text-on-surface-variant hover:border-white hover:text-white transition-colors`;
    b.style.fontSize='10px'; b.style.letterSpacing='0.1em';
  });
  btn.className = 'size-btn border border-tertiary px-3 py-2 text-tertiary transition-colors';
  btn.style.fontSize='10px'; btn.style.letterSpacing='0.1em';
}

function quickViewDeal(id) {
  const d = DEALS.find(x => String(x.id) === String(id));
  if(!d) return;
  // If it's linked to a product, show the actual product instead
  if(d.product_id) {
    const p = PRODUCTS.find(x => String(x.id) === String(d.product_id));
    if(p) {
      // Create a temporary product object with deal price
      const dealProduct = { ...p, price: d.deal_price };
      // Push temporarily to PRODUCTS so quickView can find it if needed, or we just rewrite quickView logic.
      // Easiest is to manually render the modal for the deal.
    }
  }

  const sizes = ['XS','S','M','L','XL','XXL'];
  document.getElementById('qv-content').innerHTML = `
    <div class="flex flex-col sm:flex-row">
      <div class="sm:w-1/2 img-zoom" style="aspect-ratio:3/4;max-height:50vh;overflow:hidden;">
        <img src="${d.image_url || 'https://via.placeholder.com/400x500?text=No+Image'}" alt="${d.title}" class="product-img w-full h-full object-cover"/>
      </div>
      <div class="sm:w-1/2 p-6 lg:p-8 flex flex-col">
        <div class="flex justify-between items-start mb-1">
          <span class="text-on-surface-variant uppercase" style="font-size:10px;letter-spacing:0.15em;">SPECIAL DEAL</span>
          <button onclick="closeQV()" class="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
        </div>
        <h3 class="text-white uppercase mb-1 mt-2" style="font-family:Anton,sans-serif;font-size:26px;letter-spacing:0.04em;">${d.title}</h3>
        <p class="text-on-surface-variant mb-4" style="font-size:13px;">${d.description || 'Exclusive Promotion'}</p>
        <div class="flex gap-3 items-end mb-6">
          <p class="text-tertiary font-bold" style="font-size:24px;font-family:Anton,sans-serif;">Rs. ${d.deal_price}</p>
          <p class="text-on-surface-variant line-through mb-1" style="font-size:14px;">Rs. ${d.original_price}</p>
        </div>
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">SELECT SIZE</p>
        <div class="flex flex-wrap gap-2 mb-6" id="qv-sizes">
          ${sizes.map((s,i)=>`<button onclick="selectSize(this)" data-size="${s}" class="size-btn border border-white/20 px-3 py-2 text-on-surface-variant hover:border-white hover:text-white transition-colors ${i===2?'border-tertiary text-tertiary':''}" style="font-size:10px;letter-spacing:0.1em;">${s}</button>`).join('')}
        </div>
        <div class="flex gap-3 mt-auto">
          <button onclick="addDealToCart('${d.id}')" class="flex-1 bg-white text-black py-4 hover:bg-tertiary transition-all" style="font-size:11px;letter-spacing:0.15em;">ADD TO CART</button>
        </div>
      </div>
    </div>`;
  const modal = document.getElementById('qv-modal');
  modal.classList.remove('modal-hidden');
  document.body.style.overflow = 'hidden';
}

function addDealToCart(id) {
  const d = DEALS.find(x => String(x.id) === String(id));
  if(!d) return;
  const activeSize = document.querySelector('.size-btn.border-tertiary');
  const size = activeSize ? activeSize.dataset.size : 'M';
  
  const pseudoProduct = {
    id: d.product_id || d.id, // using linked product id if available, else deal id
    deal_id: d.id,
    name: d.title,
    price: parseFloat(d.deal_price),
    img: d.image_url || 'https://via.placeholder.com/400x500?text=No+Image',
    size: size,
    color: 'DEAL',
    qty: 1
  };
  
  const ex = cart.find(x => x.id === pseudoProduct.id && x.size === size);
  if(ex) ex.qty++;
  else cart.push(pseudoProduct);
  
  saveCart();
  
  closeQV();
  openCart();
}

function addFromQV(id) {
  const activeSize = document.querySelector('.size-btn.border-tertiary');
  const size = activeSize ? activeSize.dataset.size : 'M';
  addToCart(id, size);
  closeQV();
  openCart();
}
// Close QV on backdrop
document.getElementById('qv-modal').addEventListener('click', e => {
  if(e.target === document.getElementById('qv-modal')) closeQV();
});

// ═══════════════════════════════════════════
//  NEWSLETTER
// ═══════════════════════════════════════════
async function subscribeNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('nl-email').value;
  try {
    await dbClient.from('subscribers').insert([{ email }]);
  } catch (err) {
    console.warn('Could not save to subscribers table', err);
  }
  document.getElementById('nl-success').classList.remove('hidden');
  document.getElementById('nl-form').style.opacity = '0.4';
  document.getElementById('nl-form').style.pointerEvents = 'none';
  showToast(`Subscribed! Check ${email} for confirmation.`,'success');
}

// ═══════════════════════════════════════════
//  ACCOUNT
// ═══════════════════════════════════════════
function openAccount() {
  showToast('Sign in coming soon','info');
}

// ═══════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════
let toastTimer;
function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  document.getElementById('toast-msg').textContent = msg;
  const cfg = {success:['check_circle','#e9c349'],error:['error','#ffb4ab'],info:['info','#c6c6c6']};
  icon.textContent = cfg[type][0]; icon.style.color = cfg[type][1];
  t.style.borderColor = cfg[type][1]+'40';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════
//  EXPOSE GLOBALS
// ═══════════════════════════════════════════
window.toggleMobileMenu = toggleMobileMenu;
window.setFilter = setFilter;
window.filterCategory = filterCategory;
window.scrollToProducts = scrollToProducts;
window.quickView = quickView;
window.closeQV = closeQV;
window.selectSize = selectSize;
window.quickViewDeal = quickViewDeal;
window.addDealToCart = addDealToCart;
window.addFromQV = addFromQV;
window.toggleWishlist = toggleWishlist;
window.openWishlist = openWishlist;
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.adjustQty = adjustQty;
window.checkout = checkout;
window.openAccount = openAccount;
window.subscribeNewsletter = subscribeNewsletter;
window.openModal = openModal;
window.closeModal = closeModal;



    window.onerror = function (msg, url, lineNo, columnNo, error) {
      alert('Global JS Error: ' + msg + '\nLine: ' + lineNo);
      return false;
    };
    window.addEventListener('unhandledrejection', function (event) {
      alert('Unhandled Promise Rejection: ' + (event.reason && event.reason.message ? event.reason.message : event.reason));
    });

    // App State═══════════════════════════════════════════
    //  DATA STORE
    // ═══════════════════════════════════════════
    const STATUS_LIST = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const CATEGORIES = ['Outerwear', 'Footwear', 'Accessories', 'Tops', 'Bottoms'];


    const supabaseUrl = 'https://aigyflxgtbkwhlhkdznd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZ3lmbHhndGJrd2hsaGtkem5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDE2MDAsImV4cCI6MjA5ODM3NzYwMH0.S-9Ti5SyZ0_bpc0RKcM28eDY8okWmte3O-ePP_RGCT4';
    const dbClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    let products = [];


    let orders = [];

    let customers = [];

    let deals = [];
    let notifications = [
      { icon: 'shopping_bag', msg: 'New order #RS-20412 received', sub: '2 minutes ago', read: false },
      { icon: 'inventory_2', msg: 'Low stock: Midnight Parka (4 left)', sub: '1 hour ago', read: false },
      { icon: 'person_add', msg: 'New customer: Elena Haze', sub: '3 hours ago', read: false },
      { icon: 'payments', msg: 'Payment confirmed for #RS-20410', sub: 'Yesterday', read: true },
    ];

    const MONTHLY_DATA = [
      { label: 'JAN', val: 40 }, { label: 'FEB', val: 55 }, { label: 'MAR', val: 38 }, { label: 'APR', val: 72 },
      { label: 'MAY', val: 85 }, { label: 'JUN', val: 65 }, { label: 'JUL', val: 95 }
    ];
    const QUARTERLY_DATA = [
      { label: 'Q1', val: 55 }, { label: 'Q2', val: 75 }, { label: 'Q3', val: 90 }, { label: 'Q4', val: 60 }
    ];
    const CATEGORIES_DATA = [
      { name: 'Outerwear', pct: 42 }, { name: 'Footwear', pct: 30 }, { name: 'Accessories', pct: 18 }, { name: 'Others', pct: 10 }
    ];

    let currentChart = 'monthly';
    let currentCtxOrderId = null;

    // ═══════════════════════════════════════════
    //  AUTH & INIT
    // ═══════════════════════════════════════════
    async function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-pass').value;
      const btn = document.getElementById('login-btn');
      btn.textContent = 'LOGGING IN...';
      const { data, error } = await dbClient.auth.signInWithPassword({ email, password: pass });
      btn.textContent = 'LOG IN';
      if (error) {
        showToast(error.message, 'error');
      }
    }

    async function handleLogout() {
      await dbClient.auth.signOut();
    }

    document.addEventListener('DOMContentLoaded', async () => {
      const { data: { session } } = await dbClient.auth.getSession();
      if (!session) {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-content').style.display = 'none';
      } else {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';
        initApp();
      }

      dbClient.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          document.getElementById('login-screen').style.display = 'flex';
          document.getElementById('app-content').style.display = 'none';
        } else {
          document.getElementById('login-screen').style.display = 'none';
          document.getElementById('app-content').style.display = 'block';
          initApp();
        }
      });
    });

    async function initApp() {
      // 1. Fetch Products Independently
      dbClient.from('products').select('*').then(prodRes => {
        if (prodRes.data) {
          products = prodRes.data.map(p => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            price: p.price,
            stock: 50,
            sku: 'MK-' + p.id.toString().substring(0, 6),
            desc: p.name,
            image: p.img_url,
            is_new: p.is_new_arrival
          }));
          renderProducts();
          renderAnalytics();
        }
      }).catch(err => console.error('Error fetching products:', err));

      // 2. Fetch Deals Independently
      dbClient.from('deals').select('*').then(dealsRes => {
        if (dealsRes.data) {
          deals = dealsRes.data;
          renderDeals();
        }
      }).catch(err => console.error('Error fetching deals:', err));

      // 3. Fetch Customers & Orders Together
      Promise.all([
        dbClient.from('customers').select('*'),
        dbClient.from('orders').select('*, customers(first_name, last_name)')
      ]).then(([custRes, ordRes]) => {
        let customerMap = {};
        if (custRes.data) {
          custRes.data.forEach(c => {
            const name = (c.first_name || '') + ' ' + (c.last_name || '');
            customerMap[c.id] = {
              id: c.id,
              name: name.trim() || c.email,
              initials: name.trim() ? name.trim().substring(0, 2).toUpperCase() : c.email.substring(0, 2).toUpperCase(),
              email: c.email,
              phone: c.phone || 'N/A',
              address: c.address || 'N/A',
              orders: 0,
              spent: 0,
              tier: 'New',
              joined: new Date(c.created_at).toLocaleDateString()
            };
          });
        }

        if (ordRes.data) {
          orders = ordRes.data.map(o => {
            if (customerMap[o.customer_id]) {
              customerMap[o.customer_id].orders += 1;
              customerMap[o.customer_id].spent += Number(o.total_amount);
              customerMap[o.customer_id].tier = customerMap[o.customer_id].spent > 50000 ? 'VIP' : (customerMap[o.customer_id].spent > 15000 ? 'Gold' : 'New');
            }
            const cName = o.customers ? ((o.customers.first_name || '') + ' ' + (o.customers.last_name || '')).trim() : 'Unknown';
            return {
              id: String(o.id).substring(0, 8),
              customer: cName,
              initials: cName.substring(0, 2).toUpperCase(),
              date: new Date(o.created_at).toLocaleDateString(),
              items: 1, // mock items
              amount: Number(o.total_amount),
              status: o.status || 'Pending'
            };
          });
        }

        customers = Object.values(customerMap);
      }).catch(err => {
        console.error('Error fetching admin data:', err);
        showToast('Failed to load dashboard data', 'error');
      });

      // Set date
      const now = new Date();
      const d = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      document.getElementById('session-date').textContent = d;
      const mob = document.getElementById('session-date-mob');
      if (mob) mob.textContent = d;

      renderDashboard();
      renderProducts();
      renderDeals();
      renderOrders();
      renderCustomers();
      renderAnalytics();
      renderNotifications();

      // Close ctx menu on click outside
      document.addEventListener('click', (e) => {
        const menu = document.getElementById('ctx-menu');
        if (!menu.contains(e.target) && !e.target.closest('.ctx-trigger')) {
          menu.classList.remove('open');
        }
      });
    }

    // ═══════════════════════════════════════════
    //  NAVIGATION
    // ═══════════════════════════════════════════
    function navigate(page, el) {
      document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
      const target = document.getElementById('page-' + page);
      if (target) target.classList.add('active');

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const navEl = el || document.querySelector('[data-page="' + page + '"]');
      if (navEl && navEl.classList) navEl.classList.add('active');

      document.title = 'MK Rockstar | ' + page.charAt(0).toUpperCase() + page.slice(1);

      if (window.innerWidth < 1024) closeSidebar();

      // Re-render stats
      if (page === 'dashboard') renderDashboard();
    }

    // ═══════════════════════════════════════════
    //  SIDEBAR
    // ═══════════════════════════════════════════
    function toggleSidebar() {
      const s = document.getElementById('sidebar'), o = document.getElementById('sidebar-overlay');
      s.classList.contains('open') ? closeSidebar() : (s.classList.add('open'), o.classList.add('visible'), document.body.style.overflow = 'hidden');
    }
    function closeSidebar() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('visible');
      document.body.style.overflow = '';
    }
    window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeSidebar(); });

    // ═══════════════════════════════════════════
    //  MODALS
    // ═══════════════════════════════════════════
    function openModal(id) {
      const m = document.getElementById(id);
      m.classList.remove('modal-hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(id) {
      document.getElementById(id).classList.add('modal-hidden');
      document.body.style.overflow = '';
    }
    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
    });

    // ═══════════════════════════════════════════
    //  TOAST
    // ═══════════════════════════════════════════
    let toastTimer;
    function showToast(msg, type = 'success') {
      const t = document.getElementById('toast');
      const icon = document.getElementById('toast-icon');
      document.getElementById('toast-msg').textContent = msg;
      const cfg = { success: ['check_circle', '#e9c349'], error: ['error', '#ffb4ab'], info: ['info', '#c6c6c6'] };
      icon.textContent = cfg[type][0];
      icon.style.color = cfg[type][1];
      t.style.borderColor = cfg[type][1] + '40';
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
    }

    // ═══════════════════════════════════════════
    //  NOTIFICATIONS
    // ═══════════════════════════════════════════
    function toggleNotif() {
      const p = document.getElementById('notif-panel'), o = document.getElementById('notif-overlay');
      const isOpen = p.classList.contains('open');
      if (isOpen) {
        p.classList.remove('open'); o.style.opacity = '0'; o.style.pointerEvents = 'none';
      } else {
        p.classList.add('open'); o.style.opacity = '1'; o.style.pointerEvents = 'auto';
        // Mark all read
        notifications.forEach(n => n.read = true);
        document.getElementById('notif-dot').style.display = 'none';
        document.getElementById('notif-dot-mob').style.display = 'none';
        renderNotifications();
      }
    }
    function clearNotifications() {
      notifications = [];
      renderNotifications();
      showToast('Notifications cleared', 'info');
    }
    function renderNotifications() {
      const list = document.getElementById('notif-list');
      if (!notifications.length) {
        list.innerHTML = '<div class="text-center py-16 text-on-surface-variant" style="font-size:13px;">No notifications</div>';
        return;
      }
      list.innerHTML = notifications.map(n => `
    <div class="flex items-start gap-4 px-6 py-4 ${n.read ? 'opacity-50' : ''}">
      <span class="material-symbols-outlined text-tertiary mt-0.5">${n.icon}</span>
      <div><p style="font-size:13px;">${n.msg}</p><p class="text-on-surface-variant mt-0.5" style="font-size:11px;">${n.sub}</p></div>
    </div>`).join('');
      const unread = notifications.filter(n => !n.read).length;
      ['notif-dot', 'notif-dot-mob'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = unread ? 'block' : 'none';
      });
    }

    // ═══════════════════════════════════════════
    //  DASHBOARD
    // ═══════════════════════════════════════════
    function renderDashboard() {
      // Stats
      const total = orders.reduce((s, o) => s + o.amount, 0);
      document.getElementById('stat-sales').textContent = 'Rs. ' + (total / 1000).toFixed(1) + 'K';
      document.getElementById('stat-orders').textContent = orders.length;
      const pend = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
      document.getElementById('stat-pending').textContent = pend;
      document.getElementById('stat-urgent').textContent = pend > 0 ? pend + ' URGENT' : '';

      // Chart
      setChart(currentChart);

      // Categories
      const cats = document.getElementById('category-bars');
      cats.innerHTML = CATEGORIES_DATA.map(c => `
    <div>
      <div class="flex justify-between items-center mb-1">
        <span style="font-size:14px;">${c.name}</span>
        <span class="text-tertiary font-bold" style="font-size:12px;letter-spacing:0.1em;">${c.pct}%</span>
      </div>
      <div class="w-full h-1 overflow-hidden" style="background:rgba(255,255,255,0.1);">
        <div class="h-full bg-tertiary" style="width:${c.pct}%"></div>
      </div>
    </div>`).join('');

      // Recent orders table (last 4)
      renderDashOrders();
    }

    function renderDashOrders() {
      const recent = orders.slice(0, 4);
      // Mobile
      document.getElementById('dash-orders-mobile').innerHTML = recent.map(o => `
    <div class="row-hover px-5 py-5 transition-colors">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold flex-shrink-0" style="font-size:10px;">${o.initials}</div>
          <div><p style="font-size:14px;">${o.customer}</p><p class="text-on-surface-variant opacity-60" style="font-size:10px;">${o.id} · ${o.date}</p></div>
        </div>
        <span class="px-2 py-1 badge-${o.status.toLowerCase()}" style="font-size:10px;letter-spacing:0.1em;">${o.status.toUpperCase()}</span>
      </div>
      <div class="flex justify-between items-center">
        <span style="font-size:14px;">Rs. ${o.amount.toFixed(2)}</span>
        <button class="material-symbols-outlined text-on-surface-variant hover:text-white ctx-trigger" onclick="openCtx(event,'${o.id}')">more_vert</button>
      </div>
    </div>`).join('');
      // Desktop
      document.getElementById('dash-orders-table').innerHTML = recent.map(o => `
    <tr class="row-hover transition-colors">
      <td class="px-6 lg:px-8 py-5 whitespace-nowrap" style="font-size:14px;">${o.id}</td>
      <td class="px-6 lg:px-8 py-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold flex-shrink-0" style="font-size:10px;">${o.initials}</div>
          <span class="whitespace-nowrap" style="font-size:14px;">${o.customer}</span>
        </div>
      </td>
      <td class="px-6 lg:px-8 py-5 opacity-60 whitespace-nowrap" style="font-size:14px;">${o.date}</td>
      <td class="px-6 lg:px-8 py-5 whitespace-nowrap" style="font-size:14px;">Rs. ${o.amount.toFixed(2)}</td>
      <td class="px-6 lg:px-8 py-5"><span class="px-3 py-1 badge-${o.status.toLowerCase()} whitespace-nowrap" style="font-size:10px;letter-spacing:0.1em;">${o.status.toUpperCase()}</span></td>
      <td class="px-6 lg:px-8 py-5"><button class="material-symbols-outlined text-on-surface-variant hover:text-white ctx-trigger" onclick="openCtx(event,'${o.id}')">more_vert</button></td>
    </tr>`).join('');
    }

    function setChart(mode) {
      currentChart = mode;
      const data = mode === 'monthly' ? MONTHLY_DATA : QUARTERLY_DATA;

      document.getElementById('btn-monthly').className = 'px-3 py-1 border font-label-caps transition-colors ' +
        (mode === 'monthly' ? 'border-tertiary text-tertiary' : 'border-white/20 hover:border-tertiary');
      document.getElementById('btn-quarterly').className = 'px-3 py-1 border font-label-caps transition-colors ' +
        (mode === 'quarterly' ? 'border-tertiary text-tertiary' : 'border-white/20 hover:border-tertiary');

      const container = document.getElementById('chart-bars');
      container.innerHTML = data.map(d => `
    <div class="flex-1 mx-0.5 lg:mx-1 relative group flex flex-col justify-end" style="height:100%">
      <div class="bg-white/5 w-full relative overflow-hidden transition-all duration-500 hover:bg-white/10" style="height:${d.val}%">
        <div class="absolute bottom-0 w-full bg-tertiary opacity-80 group-hover:opacity-100 bar-fill" style="height:${d.val}%"></div>
      </div>
      <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-on-surface-variant opacity-40" style="font-size:9px;letter-spacing:0.1em;">${d.label}</span>
    </div>`).join('');
    }

    // ═══════════════════════════════════════════
    //  PRODUCTS
    // ═══════════════════════════════════════════
    function renderProducts() {
      const q = (document.getElementById('product-search')?.value || '').toLowerCase();
      const cat = document.getElementById('product-filter')?.value || '';
      const grid = document.getElementById('products-grid');
      const noMsg = document.getElementById('no-products');
      const filtered = products.filter(p =>
        (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
        (!cat || p.category === cat)
      );
      noMsg.classList.toggle('hidden', filtered.length > 0);
      grid.innerHTML = filtered.map(p => `
    <div class="product-card flex flex-col" style="overflow:hidden;">
      <!-- Product Image -->
      <div style="height:200px;overflow:hidden;background:rgba(255,255,255,0.04);position:relative;">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;"/>`
          : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0.25;">
               <span class="material-symbols-outlined" style="font-size:40px;">image_not_supported</span>
               <span style="font-size:10px;letter-spacing:0.1em;">NO IMAGE</span>
             </div>`
        }
        <div style="position:absolute;top:8px;right:8px;">
          <span style="background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);padding:2px 8px;font-size:9px;letter-spacing:0.12em;color:#cfc4c5;">${p.category.toUpperCase()}</span>
        </div>
      </div>
      <!-- Card body -->
      <div class="p-4 flex flex-col gap-2 flex-1">
        <div class="flex justify-between items-start">
          <h4 style="font-size:14px;font-weight:500;line-height:1.3;flex:1;margin-right:8px;">${p.name}</h4>
          <span class="text-on-surface-variant flex-shrink-0" style="font-size:10px;">${p.sku}</span>
        </div>
        <p class="text-on-surface-variant flex-1" style="font-size:12px;line-height:1.5;">${p.desc}</p>
        <div class="flex justify-between items-center border-t border-white/10 pt-3 mt-auto">
          <div>
            <p style="font-family:Anton,sans-serif;font-size:22px;">Rs. ${p.price}</p>
            <p class="${p.stock <= 5 ? 'text-error' : 'text-on-surface-variant'}" style="font-size:11px;">${p.stock} in stock</p>
          </div>
          <div class="flex gap-2">
            <button onclick="editProduct('${p.id}')" class="material-symbols-outlined text-on-surface-variant hover:text-tertiary transition-colors" title="Edit">edit</button>
            <button onclick="confirmDeleteProduct('${p.id}')" class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" title="Delete">delete</button>
          </div>
        </div>
      </div>
    </div>`).join('');
    }

    function openProductModal(id) {
      try {
        if (id && typeof id !== 'string' && typeof id !== 'number') {
          id = null;
        }
        document.getElementById('product-modal-title').textContent = id ? 'EDIT PRODUCT' : 'ADD PRODUCT';
        document.getElementById('edit-product-id').value = id || '';
        // Reset image UI
        setImagePreview(null);
        if (id) {
          const p = products.find(x => x.id === id);
          if (p) {
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-stock').value = p.stock;
            document.getElementById('p-category').value = p.category;
            document.getElementById('p-sku').value = p.sku;
            document.getElementById('p-desc').value = p.desc;
            // Restore image if exists
            if (p.image) setImagePreview(p.image);
          }
        } else {
          document.getElementById('product-form').reset();
          document.getElementById('p-image-data').value = '';
        }
        openModal('product-modal');
      } catch (err) {
        alert("Error opening product modal: " + err.message);
        console.error("Error opening product modal:", err);
      }
    }

    function editProduct(id) { openProductModal(id); }

    // ── Image helpers ──
    function setImagePreview(dataUrl) {
      const zone = document.getElementById('img-drop-zone');
      const preview = document.getElementById('img-preview-el');
      const placeholder = document.getElementById('img-placeholder');
      const removeBtn = document.getElementById('img-remove-btn');
      const hidden = document.getElementById('p-image-data');
      if (dataUrl) {
        preview.src = dataUrl;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        zone.classList.add('has-image');
        removeBtn.classList.remove('hidden');
        hidden.value = dataUrl;
      } else {
        preview.src = '';
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        zone.classList.remove('has-image');
        removeBtn.classList.add('hidden');
        hidden.value = '';
      }
    }

    function removeProductImage() {
      setImagePreview(null);
      // Clear both file inputs so same file can be re-selected
      document.getElementById('p-image-file').value = '';
      document.getElementById('p-camera-file').value = '';
    }

    function handleImageFile(input) {
      const file = input.files[0];
      if (!file) return;
      // Validate type
      if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
      // Validate size (10MB max)
      if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB', 'error'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width; let height = img.height;
          const MAX_DIM = 800;
          if (width > height && width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
          else if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setImagePreview(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function handleDragOver(e) {
      e.preventDefault();
      document.getElementById('img-drop-zone').classList.add('drag-over');
    }
    function handleDragLeave(e) {
      document.getElementById('img-drop-zone').classList.remove('drag-over');
    }
    function handleDrop(e) {
      e.preventDefault();
      document.getElementById('img-drop-zone').classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        const input = document.getElementById('p-image-file');
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleImageFile(input);
      }
    }

    // ── Deal Image Helpers ──
    function setDealImagePreview(dataUrl) {
      const zone = document.getElementById('d-img-drop-zone');
      const preview = document.getElementById('d-img-preview-el');
      const placeholder = document.getElementById('d-img-placeholder');
      const removeBtn = document.getElementById('d-img-remove-btn');
      const hidden = document.getElementById('d-image-data');
      if (dataUrl) {
        preview.src = dataUrl;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        zone.classList.add('has-image');
        removeBtn.classList.remove('hidden');
        hidden.value = dataUrl;
      } else {
        preview.src = '';
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
        zone.classList.remove('has-image');
        removeBtn.classList.add('hidden');
        hidden.value = '';
      }
    }

    function removeDealImage() {
      setDealImagePreview(null);
      document.getElementById('d-image-file').value = '';
      document.getElementById('d-camera-file').value = '';
    }

    function handleDealImageFile(input) {
      const file = input.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
      if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB', 'error'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width; let height = img.height;
          const MAX_DIM = 800;
          if (width > height && width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
          else if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setDealImagePreview(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function handleDealDragOver(e) {
      e.preventDefault();
      document.getElementById('d-img-drop-zone').classList.add('drag-over');
    }
    function handleDealDragLeave(e) {
      e.preventDefault();
      document.getElementById('d-img-drop-zone').classList.remove('drag-over');
    }
    function handleDealDrop(e) {
      e.preventDefault();
      document.getElementById('d-img-drop-zone').classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        const input = document.getElementById('d-image-file');
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        handleDealImageFile(input);
      }
    }
    async function saveProduct(e) {
      e.preventDefault();
      const id = document.getElementById('edit-product-id').value;
      const imageData = document.getElementById('p-image-data').value || null;
      const dbData = {
        name: document.getElementById('p-name').value,
        price: parseFloat(document.getElementById('p-price').value),
        category: document.getElementById('p-category').value,
        color: 'DEFAULT',
        hex_color: '#000000',
        is_new_arrival: document.getElementById('p-is-new').checked
      };

      if (imageData) {
        dbData.img_url = imageData;
      }

      try {
        if (id) {
          const { error } = await dbClient.from('products').update(dbData).eq('id', id);
          if (error) throw error;
          showToast('Product updated', 'success');
        } else {
          const { error } = await dbClient.from('products').insert(dbData);
          if (error) throw error;
          notifications.unshift({ icon: 'inventory_2', msg: `New product added: ${dbData.name}`, sub: 'Just now', read: false });
          showToast('Product added', 'success');
        }

        // Refresh products list
        const { data: refreshed } = await dbClient.from('products').select('*');
        if (refreshed) {
          products = refreshed.map(p => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category,
            price: p.price,
            stock: 50,
            sku: 'MK-' + p.id.toString().substring(0, 6),
            desc: p.name,
            image: p.img_url,
            is_new: p.is_new_arrival
          }));
        }

        closeModal('product-modal');
        renderProducts();
        renderAnalytics();
      } catch (err) {
        console.error('Error saving product:', err);
        alert('Failed to save product: ' + (err.message || err));
        showToast('Failed to save product', 'error');
      }
    }

    function confirmDeleteProduct(id) {
      const p = products.find(x => x.id === id);
      document.getElementById('confirm-message').textContent = `Delete "${p.name}"? This cannot be undone.`;
      document.getElementById('confirm-yes').onclick = async () => {
        try {
          const { error } = await dbClient.from('products').delete().eq('id', id);
          if (error) throw error;
          products = products.filter(x => x.id !== id);
          closeModal('confirm-modal');
          renderProducts();
          showToast('Product deleted', 'error');
        } catch (err) {
          showToast('Error deleting product', 'error');
          console.error(err);
        }
      };
      openModal('confirm-modal');
    }

    // ═══════════════════════════════════════════
    //  DEALS
    // ═══════════════════════════════════════════
    function renderDeals() {
      const grid = document.getElementById('deals-grid');
      const noMsg = document.getElementById('no-deals');
      if (!grid) return;
      noMsg.classList.toggle('hidden', deals.length > 0);

      grid.innerHTML = deals.map(d => `
    <div class="product-card flex flex-col" style="overflow:hidden; ${!d.is_active ? 'opacity:0.6;' : ''}">
      <div style="height:200px;overflow:hidden;background:rgba(255,255,255,0.04);position:relative;">
        <img src="${d.image_url || 'https://via.placeholder.com/400x500?text=No+Image'}" alt="${d.title}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;top:8px;right:8px;">
          <span style="background:${d.is_active ? 'rgba(0,180,0,0.6)' : 'rgba(180,0,0,0.6)'};backdrop-filter:blur(4px);padding:2px 8px;font-size:9px;letter-spacing:0.12em;color:#fff;">
            ${d.is_active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>
      <div class="p-4 flex flex-col gap-2 flex-1">
        <h4 style="font-size:14px;font-weight:500;line-height:1.3;flex:1;">${d.title}</h4>
        <p class="text-on-surface-variant flex-1" style="font-size:12px;line-height:1.5;">${d.description || ''}</p>
        <div class="flex justify-between items-center border-t border-white/10 pt-3 mt-auto">
          <div>
            <p style="font-family:Anton,sans-serif;font-size:22px;">Rs. ${d.deal_price}</p>
            <p class="text-on-surface-variant line-through" style="font-size:11px;">Rs. ${d.original_price}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="editDeal('${d.id}')" class="material-symbols-outlined text-on-surface-variant hover:text-tertiary transition-colors" title="Edit">edit</button>
            <button onclick="confirmDeleteDeal('${d.id}')" class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors" title="Delete">delete</button>
          </div>
        </div>
      </div>
    </div>`).join('');
    }

    function openDealModal(id = null) {
      document.getElementById('edit-deal-id').value = id || '';
      if (id) {
        const d = deals.find(x => String(x.id) === String(id));
        if (d) {
          document.getElementById('d-title').value = d.title || '';
          document.getElementById('d-desc').value = d.description || '';
          document.getElementById('d-product-id').value = d.product_id || '';
          document.getElementById('d-orig-price').value = d.original_price || '';
          document.getElementById('d-deal-price').value = d.deal_price || '';
          if (d.image_url) setDealImagePreview(d.image_url);
          document.getElementById('d-is-active').checked = d.is_active;
        }
      } else {
        document.getElementById('deal-form').reset();
        document.getElementById('d-image-data').value = '';
        setDealImagePreview(null);
      }
      openModal('deal-modal');
    }

    function editDeal(id) { openDealModal(id); }

    async function saveDeal(e) {
      e.preventDefault();
      const id = document.getElementById('edit-deal-id').value;
      const imageData = document.getElementById('d-image-data').value || null;
      const dbData = {
        title: document.getElementById('d-title').value,
        description: document.getElementById('d-desc').value || null,
        product_id: document.getElementById('d-product-id').value.trim() ? parseInt(document.getElementById('d-product-id').value.trim()) : null,
        original_price: parseFloat(document.getElementById('d-orig-price').value),
        deal_price: parseFloat(document.getElementById('d-deal-price').value),
        start_date: null,
        end_date: null,
        is_active: document.getElementById('d-is-active').checked
      };

      if (imageData) {
        dbData.image_url = imageData;
      }

      try {
        if (id) {
          const { error } = await dbClient.from('deals').update(dbData).eq('id', id);
          if (error) throw error;
          showToast('Deal updated', 'success');
        } else {
          const { error } = await dbClient.from('deals').insert(dbData);
          if (error) throw error;
          showToast('Deal added', 'success');
        }

        // Refresh
        const { data: refreshed } = await dbClient.from('deals').select('*');
        if (refreshed) deals = refreshed;

        closeModal('deal-modal');
        renderDeals();
      } catch (err) {
        console.error('Error saving deal:', err);
        alert('Failed to save deal: ' + (err.message || err));
        showToast('Failed to save deal', 'error');
      }
    }

    function confirmDeleteDeal(id) {
      const d = deals.find(x => String(x.id) === String(id));
      document.getElementById('confirm-message').textContent = `Delete deal "${d.title}"? This cannot be undone.`;
      document.getElementById('confirm-yes').onclick = async () => {
        try {
          const { error } = await dbClient.from('deals').delete().eq('id', id);
          if (error) throw error;
          deals = deals.filter(x => String(x.id) !== String(id));
          closeModal('confirm-modal');
          renderDeals();
          showToast('Deal deleted', 'error');
        } catch (err) {
          showToast('Error deleting deal', 'error');
          console.error(err);
        }
      };
      openModal('confirm-modal');
    }

    // ═══════════════════════════════════════════
    //  ORDERS
    // ═══════════════════════════════════════════
    function renderOrders() {
      const q = (document.getElementById('order-search')?.value || '').toLowerCase();
      const st = document.getElementById('order-filter')?.value || '';
      const filtered = orders.filter(o =>
        (String(o.id).toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)) &&
        (!st || o.status === st)
      );
      const noMsg = document.getElementById('no-orders');
      noMsg.classList.toggle('hidden', filtered.length > 0);

      // Mobile cards
      document.getElementById('orders-mobile').innerHTML = filtered.map(o => `
    <div class="glass p-5">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center font-bold flex-shrink-0" style="font-size:11px;">${o.initials}</div>
          <div><p style="font-size:14px;font-weight:500;">${o.customer}</p><p class="text-on-surface-variant" style="font-size:10px;letter-spacing:0.05em;">${o.id}</p></div>
        </div>
        <span class="px-2 py-1 badge-${o.status.toLowerCase()}" style="font-size:10px;letter-spacing:0.1em;">${o.status.toUpperCase()}</span>
      </div>
      <div class="flex justify-between items-center text-on-surface-variant border-t border-white/10 pt-3" style="font-size:12px;">
        <span>${o.date}</span><span>${o.items} items</span><span style="color:#e5e2e1;font-size:14px;">Rs. ${o.amount.toFixed(2)}</span>
        <button class="material-symbols-outlined hover:text-white ctx-trigger" onclick="openCtx(event,'${o.id}')">more_vert</button>
      </div>
    </div>`).join('');

      // Desktop table
      document.getElementById('orders-table').innerHTML = filtered.map(o => `
    <tr class="row-hover transition-colors">
      <td class="px-6 py-5 whitespace-nowrap" style="font-size:14px;">${o.id}</td>
      <td class="px-6 py-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold flex-shrink-0" style="font-size:10px;">${o.initials}</div>
          <span class="whitespace-nowrap" style="font-size:14px;">${o.customer}</span>
        </div>
      </td>
      <td class="px-6 py-5 opacity-60 whitespace-nowrap" style="font-size:13px;">${o.date}</td>
      <td class="px-6 py-5 opacity-70 whitespace-nowrap" style="font-size:13px;">${o.items} items</td>
      <td class="px-6 py-5 whitespace-nowrap" style="font-size:14px;">Rs. ${o.amount.toFixed(2)}</td>
      <td class="px-6 py-5"><span class="px-3 py-1 badge-${o.status.toLowerCase()} whitespace-nowrap" style="font-size:10px;letter-spacing:0.1em;">${o.status.toUpperCase()}</span></td>
      <td class="px-6 py-5"><button class="material-symbols-outlined text-on-surface-variant hover:text-white ctx-trigger" onclick="openCtx(event,'${o.id}')">more_vert</button></td>
    </tr>`).join('');
    }

    // Context menu
    function openCtx(e, orderId) {
      e.stopPropagation();
      currentCtxOrderId = orderId;
      const menu = document.getElementById('ctx-menu');
      const rect = e.currentTarget.getBoundingClientRect();
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.left + window.scrollX - 140;
      if (left < 8) left = 8;
      if (top + 160 > window.innerHeight + window.scrollY) top = rect.top + window.scrollY - 164;
      menu.style.top = top + 'px';
      menu.style.left = left + 'px';
      menu.classList.add('open');

      document.getElementById('ctx-view').onclick = () => { menu.classList.remove('open'); viewOrder(orderId); };
      document.getElementById('ctx-status').onclick = () => { menu.classList.remove('open'); openStatusModal(orderId); };
      document.getElementById('ctx-delete').onclick = () => { menu.classList.remove('open'); confirmDeleteOrder(orderId); };
    }

    function viewOrder(orderId) {
      const o = orders.find(x => x.id === orderId);
      if (!o) return;
      document.getElementById('order-modal-id').textContent = o.id;
      document.getElementById('order-modal-content').innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div><p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">CUSTOMER</p><p style="font-size:15px;">${o.customer}</p></div>
      <div><p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">DATE</p><p style="font-size:15px;">${o.date}</p></div>
      <div><p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">AMOUNT</p><p style="font-family:Anton,sans-serif;font-size:24px;">Rs. ${o.amount.toFixed(2)}</p></div>
      <div><p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">ITEMS</p><p style="font-size:15px;">${o.items} items</p></div>
    </div>
    <div class="border-t border-white/10 pt-4">
      <p class="text-on-surface-variant mb-3" style="font-size:10px;letter-spacing:0.15em;">STATUS</p>
      <span class="px-3 py-2 badge-${o.status.toLowerCase()}" style="font-size:12px;letter-spacing:0.1em;">${o.status.toUpperCase()}</span>
    </div>
    <div class="flex gap-3 pt-2">
      <button onclick="openStatusModal('${o.id}');closeModal('order-modal')" class="flex-1 border border-white/20 py-3 text-on-surface-variant hover:border-tertiary hover:text-tertiary transition-all" style="font-size:11px;letter-spacing:0.15em;">UPDATE STATUS</button>
      <button onclick="confirmDeleteOrder('${o.id}');closeModal('order-modal')" class="flex-1 border border-error/40 py-3 text-error hover:border-error transition-all" style="font-size:11px;letter-spacing:0.15em;">DELETE ORDER</button>
    </div>`;
      openModal('order-modal');
    }

    function viewCustomer(customerId) {
      const c = customers.find(x => x.id === customerId);
      if (!c) return;
      document.getElementById('customer-modal-content').innerHTML = `
    <div class="flex items-center gap-4 mb-6">
      <div class="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-lg flex-shrink-0">${c.initials}</div>
      <div>
        <h4 style="font-family:Anton,sans-serif;font-size:20px;letter-spacing:0.02em;">${c.name}</h4>
        <p class="text-on-surface-variant" style="font-size:13px;">Customer since ${c.joined}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4">
      <div class="glass p-4 border border-white/5">
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">EMAIL</p>
        <p style="font-size:15px;">${c.email}</p>
      </div>
      <div class="glass p-4 border border-white/5">
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">PHONE NUMBER</p>
        <p style="font-size:15px;">${c.phone}</p>
      </div>
      <div class="glass p-4 border border-white/5">
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">SHIPPING ADDRESS</p>
        <p style="font-size:15px;">${c.address}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-4">
      <div class="glass p-4 text-center">
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">ORDERS</p>
        <p style="font-family:Anton,sans-serif;font-size:24px;">${c.orders}</p>
      </div>
      <div class="glass p-4 text-center">
        <p class="text-on-surface-variant mb-1" style="font-size:10px;letter-spacing:0.15em;">TOTAL SPENT</p>
        <p style="font-family:Anton,sans-serif;font-size:24px;">Rs. ${c.spent.toLocaleString()}</p>
      </div>
    </div>
  `;
      openModal('customer-modal');
    }

    function openStatusModal(orderId) {
      const o = orders.find(x => x.id === orderId);
      if (!o) return;
      document.getElementById('status-order-id').value = orderId;
      document.getElementById('status-order-ref').textContent = 'Order ' + orderId + ' — ' + o.customer;
      document.getElementById('status-options').innerHTML = STATUS_LIST.map(s => `
    <button onclick="updateStatus('${orderId}','${s}')"
      class="w-full text-left px-4 py-3 border transition-colors flex items-center justify-between
        ${o.status === s ? 'border-tertiary text-tertiary' : 'border-white/10 text-on-surface-variant hover:border-white/30 hover:text-on-surface'}"
      style="font-size:12px;letter-spacing:0.1em;">
      ${s.toUpperCase()}
      ${o.status === s ? '<span class="material-symbols-outlined text-sm">check</span>' : ''}
    </button>`).join('');
      openModal('status-modal');
    }

    function updateStatus(orderId, newStatus) {
      const i = orders.findIndex(o => o.id === orderId);
      if (i >= 0) orders[i].status = newStatus;
      closeModal('status-modal');
      renderOrders();
      renderDashOrders();
      // Re-render stats
      const pend = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
      document.getElementById('stat-pending').textContent = pend;
      document.getElementById('stat-urgent').textContent = pend > 0 ? pend + ' URGENT' : '';
      showToast(`Order ${orderId} → ${newStatus}`, 'success');
      notifications.unshift({ icon: 'swap_horiz', msg: `Order ${orderId} status → ${newStatus}`, sub: 'Just now', read: false });
      document.getElementById('notif-dot').style.display = 'block';
      document.getElementById('notif-dot-mob').style.display = 'block';
    }

    function confirmDeleteOrder(orderId) {
      document.getElementById('confirm-message').textContent = `Delete order ${orderId}? This cannot be undone.`;
      document.getElementById('confirm-yes').onclick = () => {
        orders = orders.filter(o => o.id !== orderId);
        closeModal('confirm-modal');
        renderOrders();
        renderDashOrders();
        const pend = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
        document.getElementById('stat-pending').textContent = pend;
        document.getElementById('stat-orders').textContent = orders.length;
        showToast('Order deleted', 'error');
      };
      openModal('confirm-modal');
    }

    // ═══════════════════════════════════════════
    //  CUSTOMERS
    // ═══════════════════════════════════════════
    function renderCustomers() {
      const q = (document.getElementById('customer-search')?.value || '').toLowerCase();
      const filtered = customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
      document.getElementById('cust-total').textContent = customers.length;

      const tierBadge = (t) => {
        const map = { VIP: 'text-tertiary border-tertiary', Regular: 'text-primary border-primary', New: 'text-on-surface-variant border-white/20' };
        return `<span class="px-2 py-0.5 border ${map[t] || ''}" style="font-size:10px;letter-spacing:0.1em;">${t.toUpperCase()}</span>`;
      };

      // Mobile
      document.getElementById('customers-mobile').innerHTML = filtered.map(c => `
    <div class="glass p-5 cursor-pointer" onclick="viewCustomer('${c.id}')">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold flex-shrink-0" style="font-size:12px;">${c.initials}</div>
        <div><p style="font-size:14px;font-weight:500;">${c.name}</p><p class="text-on-surface-variant" style="font-size:11px;">${c.email}</p></div>
        ${tierBadge(c.tier)}
      </div>
      <div class="flex justify-between text-on-surface-variant border-t border-white/10 pt-3" style="font-size:12px;">
        <span>${c.orders} orders</span><span>Rs. ${c.spent.toLocaleString()} spent</span><span>${c.joined}</span>
      </div>
    </div>`).join('');

      // Desktop
      document.getElementById('customers-table').innerHTML = filtered.map(c => `
    <tr class="row-hover transition-colors cursor-pointer" onclick="viewCustomer('${c.id}')">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center font-bold flex-shrink-0" style="font-size:11px;">${c.initials}</div>
          <span style="font-size:14px;">${c.name}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-on-surface-variant" style="font-size:13px;">${c.email}</td>
      <td class="px-6 py-4" style="font-size:14px;">${c.orders}</td>
      <td class="px-6 py-4" style="font-size:14px;">Rs. ${c.spent.toLocaleString()}</td>
      <td class="px-6 py-4">${tierBadge(c.tier)}</td>
      <td class="px-6 py-4 text-on-surface-variant" style="font-size:13px;">${c.joined}</td>
    </tr>`).join('');
    }

    // ═══════════════════════════════════════════
    //  ANALYTICS
    // ═══════════════════════════════════════════
    function renderAnalytics() {
      // Monthly bars
      const container = document.getElementById('analytics-monthly-bars');
      if (container) {
        container.innerHTML = MONTHLY_DATA.map(d => `
      <div class="flex-1 mx-0.5 flex flex-col justify-end group" style="height:100%;position:relative;">
        <div class="w-full analytics-bar" style="height:${d.val}%;position:relative;">
          <div class="absolute inset-0" style="background:linear-gradient(to top,#e9c349,rgba(233,195,73,0.4));"></div>
        </div>
        <span class="text-center text-on-surface-variant opacity-50 mt-2" style="font-size:9px;letter-spacing:0.1em;">${d.label}</span>
      </div>`).join('');
      }

      // Top products table
      const tbody = document.getElementById('analytics-products');
      if (tbody) {
        const topProds = [...products].sort((a, b) => b.price - a.price).slice(0, 5);
        tbody.innerHTML = topProds.map((p, i) => `
      <tr class="row-hover transition-colors">
        <td class="px-6 py-4" style="font-size:14px;">${p.name}</td>
        <td class="px-6 py-4 text-on-surface-variant" style="font-size:13px;">${p.category}</td>
        <td class="px-6 py-4" style="font-size:14px;">${Math.floor(Math.random() * 50) + 10}</td>
        <td class="px-6 py-4" style="font-size:14px;">Rs. ${(p.price * (Math.floor(Math.random() * 50) + 10)).toLocaleString()}</td>
        <td class="px-6 py-4"><span class="text-tertiary font-bold" style="font-size:13px;">↑ ${(Math.random() * 20 + 5).toFixed(1)}%</span></td>
      </tr>`).join('');
      }
    }

    // Expose to HTML onclick attributes
    window.navigate = navigate;
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showToast = showToast;
    window.toggleNotif = toggleNotif;
    window.clearNotifications = clearNotifications;
    window.setChart = setChart;
    window.renderProducts = renderProducts;
    window.renderOrders = renderOrders;
    window.renderCustomers = renderCustomers;
    window.editProduct = editProduct;
    window.saveProduct = saveProduct;
    window.confirmDeleteProduct = confirmDeleteProduct;
    window.openCtx = openCtx;
    window.viewOrder = viewOrder;
    window.openStatusModal = openStatusModal;
    window.updateStatus = updateStatus;
    window.confirmDeleteOrder = confirmDeleteOrder;
    window.saveDeal = saveDeal;
    window.openDealModal = openDealModal;
    window.openProductModal = openProductModal;
    window.editDeal = editDeal;
    window.confirmDeleteDeal = confirmDeleteDeal;
  

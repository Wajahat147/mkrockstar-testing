const fs = require('fs');

const addition = `
          <div><label class="block text-on-surface-variant mb-2" style="font-size:10px;letter-spacing:0.15em;">AVAILABLE SIZES (Leave all unchecked for all sizes)</label>
            <div class="flex flex-wrap gap-3" id="p-sizes">
              <label class="flex items-center gap-2"><input type="checkbox" value="XS" class="size-cb form-checkbox bg-transparent border-white/20 text-tertiary"> <span style="font-size:12px;">XS</span></label>
              <label class="flex items-center gap-2"><input type="checkbox" value="S" class="size-cb form-checkbox bg-transparent border-white/20 text-tertiary"> <span style="font-size:12px;">S</span></label>
              <label class="flex items-center gap-2"><input type="checkbox" value="M" class="size-cb form-checkbox bg-transparent border-white/20 text-tertiary"> <span style="font-size:12px;">M</span></label>
              <label class="flex items-center gap-2"><input type="checkbox" value="L" class="size-cb form-checkbox bg-transparent border-white/20 text-tertiary"> <span style="font-size:12px;">L</span></label>
              <label class="flex items-center gap-2"><input type="checkbox" value="XL" class="size-cb form-checkbox bg-transparent border-white/20 text-tertiary"> <span style="font-size:12px;">XL</span></label>
              <label class="flex items-center gap-2"><input type="checkbox" value="XXL" class="size-cb form-checkbox bg-transparent border-white/20 text-tertiary"> <span style="font-size:12px;">XXL</span></label>
            </div>
          </div>
`;

let file = 'mk_rockstar_admin_suite/code.html';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/(<select class="mk-input" id="p-category">[\s\S]*?<\/select>\s*<\/div>)/, '$1\n' + addition);

// 1. Update SELECT queries in admin suite to include available_sizes
c = c.replace(/'id, name, category, color, price, badge, img_url, hex_color, is_new_arrival, created_at'/g, 
              "'id, name, category, color, price, badge, img_url, hex_color, is_new_arrival, created_at, available_sizes'");

// 2. Map available_sizes in products mapping
c = c.replace(/is_new: p\.is_new_arrival/g, "is_new: p.is_new_arrival,\n            available_sizes: p.available_sizes || null");

// 3. Populate sizes in openProductModal
c = c.replace(/(document\.getElementById\('p-desc'\)\.value = p\.desc;)/, 
`$1
            document.querySelectorAll('.size-cb').forEach(cb => cb.checked = false);
            if (p.available_sizes && Array.isArray(p.available_sizes)) {
              p.available_sizes.forEach(s => {
                const cb = document.querySelector(\`.size-cb[value='\${s}']\`);
                if (cb) cb.checked = true;
              });
            }`);

c = c.replace(/(document\.getElementById\('p-image-data'\)\.value = '';)/, 
`$1
          document.querySelectorAll('.size-cb').forEach(cb => cb.checked = false);
`);

// 4. Save sizes in saveProduct
c = c.replace(/(is_new_arrival: document\.getElementById\('p-is-new'\)\.checked)/,
`$1,
          available_sizes: Array.from(document.querySelectorAll('.size-cb:checked')).map(cb => cb.value)
`);

fs.writeFileSync(file, c);
console.log('done admin suite');

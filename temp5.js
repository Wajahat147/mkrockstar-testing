const fs = require('fs');

let file = 'oversized_hoodie_mk_rockstar/code.html';
let c = fs.readFileSync(file, 'utf8');

const sizeHTML = `
        <div class="grid grid-cols-4 gap-3" id="size-options">
        </div>
`;

c = c.replace(/<div class="grid grid-cols-4 gap-3" id="size-options">[\s\S]*?<\/div>/, sizeHTML);

const jsAdd = `
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('size-options');
  if(container) {
    let sizes = currentProduct.available_sizes;
    if(!sizes || sizes.length === 0) sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    
    container.innerHTML = sizes.map(s => {
      let isDefault = s === 'M' || (s === sizes[0] && !sizes.includes('M'));
      if (isDefault) selectedSize = s;
      let activeClass = isDefault ? 'border-tertiary text-tertiary' : 'border-white/20 text-white';
      return \`<button onclick="selectSize(this, '\${s}')" class="size-btn py-3 border hover:border-white transition-colors font-bold \${activeClass}" style="font-size:11px;letter-spacing:0.15em;">\${s}</button>\`;
    }).join('');
  }
});
</script>`;

c = c.replace(/<\/script>/, jsAdd);

fs.writeFileSync(file, c);
console.log('done oversized hoodie');

const fs = require('fs');

const addition = `
      <div class="mt-4 text-center space-y-1 text-on-surface-variant" style="font-size:12px;">
        <p>Cash on Delivery Charges: <span class="text-white font-bold">Rs. 299</span></p>
        <p>For any queries contact: <span class="text-white font-bold">03330610700</span></p>
      </div>
`;

function applyTo(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/(<button type="submit" id="co-submit-btn"[\s\S]*?<\/button>)/, '$1' + addition);
  fs.writeFileSync(file, c);
}

applyTo('mk_rockstar_home/code.html');
applyTo('shop_all_mk_rockstar/code.html');
console.log('done');

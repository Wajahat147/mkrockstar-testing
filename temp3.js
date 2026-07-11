const fs = require('fs');

const btn = `
<!-- Floating Contact Button -->
<a href="tel:03330610700" class="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-tertiary text-black px-4 py-3 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300 font-bold uppercase" style="font-size:12px;letter-spacing:0.1em;border:2px solid #ccc;">
  <span class="material-symbols-outlined" style="font-size:16px;">call</span>
  03330610700
</a>
</body>
`;

let file = 'mk_rockstar_home/code.html';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/<\/body>/, btn);
fs.writeFileSync(file, c);
console.log('done');

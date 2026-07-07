const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('mk_rockstar_home/code.html', 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.console.error = (...args) => {
  console.log("BROWSER ERROR:", ...args);
};

dom.window.addEventListener("error", (event) => {
  console.log("UNCAUGHT EXCEPTION:", event.error);
});

dom.window.addEventListener("unhandledrejection", (event) => {
  console.log("UNHANDLED REJECTION:", event.reason);
});

setTimeout(() => {
  console.log("DOM content length:", dom.window.document.getElementById('products-grid').innerHTML.length);
  process.exit(0);
}, 5000);

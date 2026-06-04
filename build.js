const fs = require('fs');
const date = new Date().toLocaleString('pl-PL', {
  day: '2-digit', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
  timeZone: 'Europe/Warsaw'
});
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('__BUILD_DATE__', date);
fs.writeFileSync('index.html', html);
console.log('Build date set:', date);

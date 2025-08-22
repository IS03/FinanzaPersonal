const fs = require('fs');
const path = require('path');

// Función para crear un icono SVG
function createSVGIcon(size, text, filename) {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="url(#gradient)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.6}" fill="white">${text}</text>
</svg>`;

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, filename), svg);
  console.log(`✅ Generado: ${filename}`);
}

// Generar iconos
console.log('🎨 Generando iconos...');

// Icono principal 32x32
createSVGIcon(32, '💰', 'icon.svg');

// Icono Apple 180x180
createSVGIcon(180, '💰', 'apple-icon.svg');

// Icono para manifest 192x192
createSVGIcon(192, '💰', 'icon-192.svg');

// Icono para manifest 512x512
createSVGIcon(512, '💰', 'icon-512.svg');

console.log('🎉 ¡Iconos generados exitosamente!');

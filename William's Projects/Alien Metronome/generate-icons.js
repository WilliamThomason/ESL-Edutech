const sharp = require('sharp');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, 'icon-source.png');
const OUTPUT_DIR = __dirname;

const SIZES = [192, 512];

async function generateIcons() {
  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 100 })
        .toFile(outputPath);
      console.log(`Generated ${outputPath}`);
    } catch (e) {
      // If source doesn't exist, create a placeholder
      console.log(`Source icon not found, creating placeholder ${size}x${size}`);
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 10, g: 14, b: 26, alpha: 1 }
        }
      })
      .composite([{
        input: Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#22d3ee"/>
            <stop offset="100%" style="stop-color:#a78bfa"/>
          </linearGradient></defs>
          <rect width="${size}" height="${size}" rx="${size*.15}" fill="#0a0e1a"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size*.3}" fill="none" stroke="url(#g)" stroke-width="${size*.05}"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size*.12}" fill="#22d3ee"/>
          <text x="${size/2}" y="${size*.85}" text-anchor="middle" fill="#22d3ee" font-family="Arial" font-size="${size*.08}" font-weight="bold">ALIEN</text>
        </svg>`),
        top: 0,
        left: 0
      }])
      .png()
      .toFile(outputPath);
    }
  }
  
  // Generate iOS splash screens
  const splashSizes = [
    [1125, 2436], [1242, 2688], [750, 1334], [1242, 2208], [640, 1136]
  ];
  
  for (const [w, h] of splashSizes) {
    const outputPath = path.join(OUTPUT_DIR, `splash-${w}x${h}.png`);
    try {
      await sharp({
        create: { width: w, height: h, channels: 4, background: { r: 10, g: 14, b: 26, alpha: 1 } }
      })
      .composite([{
        input: Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#22d3ee"/>
            <stop offset="100%" style="stop-color:#a78bfa"/>
          </linearGradient></defs>
          <circle cx="${w/2}" cy="${h*.4}" r="${Math.min(w,h)*.15}" fill="none" stroke="url(#g)" stroke-width="3"/>
          <circle cx="${w/2}" cy="${h*.4}" r="${Math.min(w,h)*.06}" fill="#22d3ee"/>
          <text x="${w/2}" y="${h*.65}" text-anchor="middle" fill="#22d3ee" font-family="Arial" font-size="${Math.min(w,h)*.04}" font-weight="bold">ALIEN METRONOME</text>
        </svg>`),
        top: 0, left: 0
      }])
      .png().toFile(outputPath);
      console.log(`Generated ${outputPath}`);
    } catch(e) {}
  }
  
  console.log('Done generating icons and splash screens');
}

generateIcons().catch(console.error);

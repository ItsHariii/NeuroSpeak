import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  try {
    const sizes = [192, 512];
    const svgPath = path.resolve(__dirname, '../public/icons/icon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create a data URL from the SVG content
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Load the SVG image
    const image = await loadImage(svgDataUrl);
    
    // Generate icons for each size
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the image on the canvas
      ctx.drawImage(image, 0, 0, size, size);
      
      // Save the canvas as a PNG file
      const pngPath = path.resolve(__dirname, `../public/icons/icon-${size}.png`);
      const out = fs.createWriteStream(pngPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      out.on('finish', () => {
        console.log(`Icon generated: ${pngPath}`);
      });
    }
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();

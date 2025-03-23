import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create splash directory if it doesn't exist
const splashDir = path.join(__dirname, '../public/icons/splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Define splash screen sizes for iOS devices
const splashScreens = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' }, // iPad Pro 11"
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' }, // iPad Air
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone X/XS
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },   // iPhone 8
  { width: 640, height: 1136, name: 'apple-splash-640-1136.png' },   // iPhone SE
];

// Background color from our theme
const backgroundColor = '#F8FAFC';

// Path to our logo
const logoPath = path.join(__dirname, '../public/icons/icon-512.png');

// Generate each splash screen
async function generateSplashScreens() {
  for (const screen of splashScreens) {
    try {
      // Create a blank canvas with our background color
      const canvas = Buffer.from(
        `<svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
        </svg>`
      );
      
      // Calculate logo size (40% of the smallest dimension)
      const logoSize = Math.min(screen.width, screen.height) * 0.4;
      
      // Resize the logo
      const resizedLogo = await sharp(logoPath)
        .resize(Math.round(logoSize), Math.round(logoSize))
        .toBuffer();
      
      // Calculate position to center the logo
      const left = Math.round((screen.width - logoSize) / 2);
      const top = Math.round((screen.height - logoSize) / 2);
      
      // Composite the logo onto the canvas
      await sharp(canvas)
        .composite([
          {
            input: resizedLogo,
            left,
            top,
          },
        ])
        .toFile(path.join(splashDir, screen.name));
      
      console.log(`Generated ${screen.name}`);
    } catch (error) {
      console.error(`Error generating ${screen.name}:`, error);
    }
  }
}

generateSplashScreens().then(() => {
  console.log('All splash screens generated successfully!');
}).catch(error => {
  console.error('Error generating splash screens:', error);
});

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.resolve('src/assets');

const mappings = [
  // Brand
  { src: 'logo.png', destDir: 'brand', destName: 'logo.webp', quality: 90 },
  { src: 'heritage.jpg', destDir: 'brand', destName: 'heritage.webp', quality: 80 },

  // Hero
  { src: 'hero-saree.jpg', destDir: 'hero', destName: 'hero-saree.webp', quality: 80 },
  { src: 'herosectionimg1.jpeg', destDir: 'hero', destName: 'herosectionimg1.webp', quality: 80 },
  { src: 'herosectionimg2.jpeg', destDir: 'hero', destName: 'herosectionimg2.webp', quality: 80 },
  { src: 'herosectionimg3.jpeg', destDir: 'hero', destName: 'herosectionimg3.webp', quality: 80 },
  { src: 'herosectionimg4.jpeg', destDir: 'hero', destName: 'herosectionimg4.webp', quality: 80 },
  { src: 'herosectionimg5.jpeg', destDir: 'hero', destName: 'herosectionimg5.webp', quality: 80 },

  // Collections
  { src: 'newarrivals.jpg', destDir: 'collections', destName: 'newarrivals.webp', quality: 80 },
  { src: 'weddingcollection.jpg', destDir: 'collections', destName: 'weddingcollection.webp', quality: 80 },
  { src: 'traditionalcollection.jpg', destDir: 'collections', destName: 'traditionalcollection.webp', quality: 80 },
  { src: 'festivecollection.jpg', destDir: 'collections', destName: 'festivecollection.webp', quality: 80 },

  // Categories
  { src: 'Body Butta.webp', destDir: 'categories', destName: 'body-butta.webp', quality: 85 },
  { src: 'Border Butta.webp', destDir: 'categories', destName: 'border-butta.webp', quality: 85 },
  { src: 'Butta sarees.webp', destDir: 'categories', destName: 'butta-sarees.webp', quality: 85 },
  { src: 'Korvai sarees.webp', destDir: 'categories', destName: 'korvai-sarees.webp', quality: 85 },
  { src: 'Pure Brocade.webp', destDir: 'categories', destName: 'pure-brocade.webp', quality: 85 },
  { src: 'Pure Checked Butta.webp', destDir: 'categories', destName: 'pure-checked-butta.webp', quality: 85 },
  { src: 'Pure Jakkad.webp', destDir: 'categories', destName: 'pure-jakkad.webp', quality: 85 },

  // Products
  { src: 'saree-1.jpg', destDir: 'products', destName: 'saree-1.webp', quality: 80 },
  { src: 'saree-2.jpg', destDir: 'products', destName: 'saree-2.webp', quality: 80 },
  { src: 'saree-3.jpg', destDir: 'products', destName: 'saree-3.webp', quality: 80 },
  { src: 'saree-4.jpg', destDir: 'products', destName: 'saree-4.webp', quality: 80 },
  { src: 'saree-5.jpg', destDir: 'products', destName: 'saree-5.webp', quality: 80 },
  { src: 'saree-6.jpg', destDir: 'products', destName: 'saree-6.webp', quality: 80 }
];

async function main() {
  console.log('Starting image compression and restructuring...');

  for (const mapping of mappings) {
    const srcPath = path.join(assetsDir, mapping.src);
    const targetDir = path.join(assetsDir, mapping.destDir);
    const destPath = path.join(targetDir, mapping.destName);

    if (!fs.existsSync(srcPath)) {
      console.warn(`Warning: Source file not found: ${srcPath}`);
      continue;
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
      await sharp(srcPath)
        .webp({ quality: mapping.quality })
        .toFile(destPath);
      
      const origSize = fs.statSync(srcPath).size;
      const optSize = fs.statSync(destPath).size;
      const ratio = ((origSize - optSize) / origSize * 100).toFixed(1);
      
      console.log(`Successfully processed: ${mapping.src} -> ${mapping.destDir}/${mapping.destName} (Reduced by ${ratio}%, ${origSize} B -> ${optSize} B)`);
    } catch (err) {
      console.error(`Error processing ${mapping.src}:`, err);
    }
  }

  console.log('Finished image compression and restructuring.');
}

main().catch(console.error);

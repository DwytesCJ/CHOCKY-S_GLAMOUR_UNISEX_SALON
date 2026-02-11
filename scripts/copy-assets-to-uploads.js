const fs = require('fs');
const path = require('path');

// Source: assets/images/ (root level)
// Destination: chockys-glamour/public/uploads/

const rootDir = path.join(__dirname, '..', '..');
const assetsDir = path.join(rootDir, 'assets', 'images');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

// Folders to copy
const folders = [
  'products/bags',
  'products/hair',
  'products/jewelry',
  'products/makeup',
  'products/perfumes',
  'products/skincare',
  'categories',
  'banners',
  'testimonials',
  'team',
  'hero',
  'blog',
  'backgrounds',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  Created directory: ${dir}`);
  }
}

function copyFiles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.log(`  WARNING: Source directory not found: ${srcDir}`);
    return 0;
  }

  const files = fs.readdirSync(srcDir).filter(f => {
    const stat = fs.statSync(path.join(srcDir, f));
    return stat.isFile();
  });

  let copied = 0;
  for (const file of files) {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      copied++;
    }
  }
  return copied;
}

console.log('=== Copying assets to uploads directory ===');
console.log(`Assets source: ${assetsDir}`);
console.log(`Uploads dest:  ${uploadsDir}`);
console.log('');

let totalCopied = 0;

for (const folder of folders) {
  const srcDir = path.join(assetsDir, folder);
  const destDir = path.join(uploadsDir, folder);
  
  ensureDir(destDir);
  const count = copyFiles(srcDir, destDir);
  totalCopied += count;
  console.log(`  ${folder}: ${count} files copied`);
}

// Also copy the logo
const logoSrc = path.join(assetsDir, 'logo');
const logoDest = path.join(uploadsDir, 'logo');
ensureDir(logoDest);
const logoCount = copyFiles(logoSrc, logoDest);
totalCopied += logoCount;
console.log(`  logo: ${logoCount} files copied`);

console.log('');
console.log(`Total files copied: ${totalCopied}`);
console.log('=== Done ===');

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'src/app/page.tsx',
  'src/app/about/page.tsx',
  'src/app/salon/page.tsx',
  'src/app/salon/booking/page.tsx',
  'src/app/shop/page.tsx',
  'src/app/blog/[id]/page.tsx',
];

console.log('Updating image paths from /images/ to /uploads/...\n');

let totalReplacements = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all /images/ paths with /uploads/
    content = content.replace(/['"]\/images\/(hero|categories|products|banners|testimonials|team)\//g, (match) => {
      return match.replace('/images/', '/uploads/');
    });
    
    // Count replacements
    const matches = originalContent.match(/['"]\/images\/(hero|categories|products|banners|testimonials|team)\//g);
    const count = matches ? matches.length : 0;
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file}: ${count} paths updated`);
      totalReplacements += count;
    } else {
      console.log(`⏭️  ${file}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Total: ${totalReplacements} image paths updated from /images/ to /uploads/`);

const fs = require('fs');
const path = require('path');

console.log('Verifying image paths in uploads folder...\n');

// Check if all required images exist
const requiredImages = {
  'categories': [
    'anna-keibalo-teFY4aA5dYA-unsplash.jpg',
    'element5-digital-ooPx1bxmTc4-unsplash.jpg',
    'iwaria-inc-DzMmp0uewcg-unsplash.jpg',
    'jeff-kweba-OfCqjqsWmIc-unsplash.jpg',
    'pexels-hert-33561789.jpg',
    'pexels-shattha-pilabut-38930-135620.jpg',
  ],
  'banners': [
    'pexels-cottonbro-3993134.jpg',
    'pexels-artbovich-7750115.jpg',
    'minh-dang-DsauO8w-Nag-unsplash.jpg',
  ],
  'products/makeup': [
    'pexels-828860-2536009.jpg',
    'pexels-shiny-diamond-3373734.jpg',
    'pexels-amazingsobia-5420689.jpg',
  ],
  'products/hair': [
    'pexels-venus-31818416.jpg',
    'pexels-rdne-6923351.jpg',
  ],
  'products/skincare': [
    'pexels-misolo-cosmetic-2588316-4841339.jpg',
    'pexels-828860-2587177.jpg',
  ],
  'products/bags': [
    'pexels-dhanno-22432991.jpg',
    'pexels-dhanno-22432992.jpg',
    'pexels-dhanno-22434757.jpg',
  ],
  'products/jewelry': [
    'pexels-castorlystock-3641059.jpg',
    'pexels-arif-13595436.jpg',
  ],
  'products/perfumes': [
    'pexels-valeriya-724635.jpg',
    'pexels-didsss-2508558.jpg',
  ],
  'testimonials': [
    'pexels-git-stephen-gitau-302905-1801235.jpg',
    'pexels-artbovich-7195799.jpg',
    'pexels-enginakyurt-3065209.jpg',
  ],
  'team': [
    'SnapInsta.to_623791606_18078416906580404_8628629081906127485_n.jpg',
    'SnapInsta.to_624543554_18078416900580404_729626818934809874_n.jpg',
    'SnapInsta.to_625048011_18078416870580404_5424531763907010008_n.jpg',
    'SnapInsta.to_625048531_18078416903580404_2925058900756321713_n.jpg',
  ],
};

let allExist = true;
let totalChecked = 0;

Object.keys(requiredImages).forEach(folder => {
  const files = requiredImages[folder];
  console.log(`\n📁 ${folder}:`);
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', 'public', 'uploads', folder, file);
    const exists = fs.existsSync(filePath);
    totalChecked++;
    
    if (exists) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ MISSING: ${file}`);
      allExist = false;
    }
  });
});

console.log(`\n${'='.repeat(60)}`);
if (allExist) {
  console.log(`✅ SUCCESS: All ${totalChecked} required images exist!`);
} else {
  console.log(`❌ FAILURE: Some required images are missing!`);
  process.exit(1);
}

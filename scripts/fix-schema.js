const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Remove all merge conflict markers
content = content.replace(/^<<<<<<< SEARCH\n/gm, '');
content = content.replace(/^=======\n/gm, '');
content = content.replace(/^>>>>>>> REPLACE\n/gm, '');
content = content.replace(/^=======$/gm, '');

// Remove duplicate ContentBlock models - keep only the last one
const contentBlockRegex = /model ContentBlock \{[\s\S]*?^\}/gm;
const matches = content.match(contentBlockRegex);

if (matches && matches.length > 1) {
  // Remove all but the last ContentBlock model
  for (let i = 0; i < matches.length - 1; i++) {
    content = content.replace(matches[i], '');
  }
}

// Clean up multiple empty lines
content = content.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Schema file cleaned successfully!');

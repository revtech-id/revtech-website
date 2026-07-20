const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/revan/.gemini/antigravity/scratch/revtech-website/apps/frontend/components');
let modifiedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace initial=\"hidden\"
  content = content.replace(/initial=\"hidden\"/g, '');
  // Replace whileInView=\"visible\"
  content = content.replace(/whileInView=\"visible\"/g, '');
  // Replace variants={fadeUpVariant}
  content = content.replace(/variants=\{fadeUpVariant\}/g, '');
  // Replace variants={staggerContainerVariant}
  content = content.replace(/variants=\{staggerContainerVariant\}/g, '');
  
  // Replace inline initial={{ opacity: 0... }} 
  content = content.replace(/initial=\{\{\s*opacity:\s*0[^}]*\}\}/g, '');
  // Replace inline whileInView={{ opacity: 1... }}
  content = content.replace(/whileInView=\{\{\s*opacity:\s*1[^}]*\}\}/g, '');
  
  // Replace viewport={{ ... }}
  content = content.replace(/viewport=\{\{[^}]*\}\}/g, '');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log('Updated', file);
  }
});
console.log('Total files updated:', modifiedFiles);

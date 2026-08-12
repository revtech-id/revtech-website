const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'apps/frontend');

// Helper to add imports
function addImport(content, iconName) {
  if (content.includes(`import { ${iconName}`)) return content;
  if (content.includes(`import {`) && content.includes(`} from "lucide-react"`)) {
    return content.replace(/(import\s*{[^}]*)(\s*}\s*from\s*["']lucide-react["'])/, `$1, ${iconName}$2`);
  } else {
    // add to top
    const importStr = `import { ${iconName} } from "lucide-react";\n`;
    if (content.includes(`"use client";`)) {
      return content.replace(`"use client";\n`, `"use client";\n${importStr}`);
    }
    return importStr + content;
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace arrow_forward
  const forwardRegex = /<span[^>]*className=["']([^"']*)material-symbols-outlined([^"']*)["'][^>]*>\s*arrow_forward\s*<\/span>/g;
  if (forwardRegex.test(content)) {
    content = content.replace(forwardRegex, (match, p1, p2) => {
      let cls = `${p1} ${p2}`.replace(/\s+/g, ' ').trim();
      cls = cls.replace(/text-\[\d+px\]/g, '').trim(); // remove fixed text sizes as ArrowRight uses size prop or we can just keep them.
      return `<ArrowRight className="${cls}" size={16} />`;
    });
    content = addImport(content, 'ArrowRight');
    changed = true;
  }

  // Replace arrow_back
  const backRegex = /<span[^>]*className=["']([^"']*)material-symbols-outlined([^"']*)["'][^>]*>\s*arrow_back\s*<\/span>/g;
  if (backRegex.test(content)) {
    content = content.replace(backRegex, (match, p1, p2) => {
      let cls = `${p1} ${p2}`.replace(/\s+/g, ' ').trim();
      cls = cls.replace(/text-\[\d+px\]/g, '').trim(); 
      return `<ArrowLeft className="${cls}" size={16} />`;
    });
    content = addImport(content, 'ArrowLeft');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(directoryPath);

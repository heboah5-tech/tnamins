const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('localStorage')) return;

  // Track if we need to add imports
  let needsImport = false;

  // Replace get, set, remove
  if (content.includes('localStorage.getItem')) {
    content = content.replace(/localStorage\.getItem\((.*?)\)/g, 'getCookie($1)');
    needsImport = true;
  }
  if (content.includes('localStorage.setItem')) {
    content = content.replace(/localStorage\.setItem\((.*?), (.*?)\)/g, 'setCookie($1, $2)');
    needsImport = true;
  }
  if (content.includes('localStorage.removeItem')) {
    content = content.replace(/localStorage\.removeItem\((.*?)\)/g, 'eraseCookie($1)');
    needsImport = true;
  }

  // Edge cases where typeof localStorage !== "undefined" is used
  if (content.includes('typeof localStorage !== "undefined"')) {
    content = content.replace(/typeof localStorage !== "undefined"/g, 'typeof document !== "undefined"');
  } else if (content.includes("typeof localStorage === \"undefined\"")) {
    content = content.replace(/typeof localStorage === "undefined"/g, 'typeof document === "undefined"');
  }

  if (needsImport) {
    // Figure out relative path to lib/cookies.ts
    const depth = filePath.split('/').length - 1; // root is 0 since we run from /
    // actually, let's use aliases if configured, or just path.relative
    // Wait, tsconfig.json has "@/*": ["./*"] so we can just use '@/lib/cookies' everywhere!
    const importStatement = "import { getCookie, setCookie, eraseCookie } from '@/lib/cookies';\n";
    
    // Add import after the last import statement, or at the top
    const importMatches = [...content.matchAll(/^import .*;?$/gm)];
    if (importMatches.length > 0) {
      const lastMatch = importMatches[importMatches.length - 1];
      const insertPos = lastMatch.index + lastMatch[0].length;
      content = content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
    } else {
      // Check for "use client";
      if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
        const lines = content.split('\n');
        lines.splice(1, 0, importStatement);
        content = lines.join('\n');
      } else {
        content = importStatement + content;
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Updated', filePath);
}

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
      callback(filePath);
    } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.next') {
      walkSync(filePath, callback);
    }
  });
}

walkSync('.', processFile);


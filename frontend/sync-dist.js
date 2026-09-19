const fs = require('fs');
const path = require('path');

const browserDir = path.join(__dirname, 'dist', 'banking-current-affairs-frontend', 'browser');
const targetDir = path.join(__dirname, 'dist', 'banking-current-affairs-frontend');

if (fs.existsSync(browserDir)) {
  fs.readdirSync(browserDir).forEach(file => {
    const srcFile = path.join(browserDir, file);
    const destFile = path.join(targetDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
  console.log('[Postbuild] Successfully synced browser assets to root dist directory.');
}

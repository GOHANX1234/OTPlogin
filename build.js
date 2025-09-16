// build.js - Custom build script to ensure proper directory structure for Render deployment
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Run the standard build commands
console.log('Building the client...');
exec('vite build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error building client: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Client build stderr: ${stderr}`);
  }
  console.log(stdout);
  
  console.log('Building the server...');
  exec('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error building server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Server build stderr: ${stderr}`);
    }
    console.log(stdout);
    
    // If we're here, both builds succeeded
    console.log('Creating proper directory structure for Render...');
    
    // Create a public directory inside dist if it doesn't exist
    const publicDir = path.join('dist', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Check if we have output in dist/assets
    const assetsDir = path.join('dist', 'assets');
    if (fs.existsSync(assetsDir)) {
      // Copy all files from dist/assets to dist/public/assets
      const publicAssetsDir = path.join(publicDir, 'assets');
      if (!fs.existsSync(publicAssetsDir)) {
        fs.mkdirSync(publicAssetsDir, { recursive: true });
      }
      
      const assetFiles = fs.readdirSync(assetsDir);
      assetFiles.forEach(file => {
        const srcPath = path.join(assetsDir, file);
        const destPath = path.join(publicAssetsDir, file);
        fs.copyFileSync(srcPath, destPath);
      });
      
      console.log(`Copied ${assetFiles.length} assets to dist/public/assets`);
    }
    
    // Copy index.html to dist/public
    const indexHtml = path.join('dist', 'index.html');
    if (fs.existsSync(indexHtml)) {
      fs.copyFileSync(indexHtml, path.join(publicDir, 'index.html'));
      console.log('Copied index.html to dist/public');
    } else {
      console.error('Could not find dist/index.html to copy');
    }
    
    console.log('Build completed successfully and prepared for Render deployment');
  });
});
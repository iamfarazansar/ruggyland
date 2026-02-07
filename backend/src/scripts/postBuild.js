const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy pnpm-lock.yaml
fs.copyFileSync(
  path.join(process.cwd(), 'pnpm-lock.yaml'),
  path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml')
);

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Patch admin favicon
const adminDir = path.join(MEDUSA_SERVER_PATH, 'public', 'admin');
const faviconSrc = path.join(process.cwd(), 'src', 'admin', 'public', 'ruggyland-admin-favi.ico');
if (fs.existsSync(faviconSrc) && fs.existsSync(adminDir)) {
  fs.copyFileSync(faviconSrc, path.join(adminDir, 'ruggyland-admin-favi.ico'));
  const indexPath = path.join(adminDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace(
      /<link rel="icon" href="data:," data-placeholder-favicon\s*\/>/,
      '<link rel="icon" type="image/x-icon" href="/app/ruggyland-admin-favi.ico" />'
    );
    fs.writeFileSync(indexPath, html);
    console.log('Admin favicon patched successfully.');
  }
}

// Patch admin login page branding
const assetsDir = path.join(adminDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const filePath = path.join(assetsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Welcome to Medusa')) {
      content = content.replace('title:"Welcome to Medusa"', 'title:"Welcome to RuggyLand"');
      content = content.replace('hint:"Sign in to access the account area"', 'hint:"Sign in to access the admin panel"');
      fs.writeFileSync(filePath, content);
      console.log('Admin login branding patched successfully.');
      break;
    }
  }
}

// Install dependencies
console.log('Installing dependencies in .medusa/server...');
execSync('pnpm i --prod --frozen-lockfile', { 
  cwd: MEDUSA_SERVER_PATH,
  stdio: 'inherit'
});

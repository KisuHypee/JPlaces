const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command) {
  console.log(`\n> Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// 1. Get version from package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const versionSlug = version.replace(/\./g, '-').split('-').slice(0, 2).join('-'); // e.g. 1.1.0 -> 1-1

console.log(`\n🚀 Starting release process for v${version} (${versionSlug})...\n`);

// 2. Build web assets
run('npm run build');

// 3. Sync Capacitor
run('npx cap sync');

// 4. Build Android APK
console.log('\n📦 Building Android APK...');
// Using cmd /c for Windows compatibility with nested commands
run('cmd /c "cd android && gradlew assembleDebug"');

// 5. Create releases folder if not exists
if (!fs.existsSync('releases')) {
  fs.mkdirSync('releases');
}

// 6. Rename and move APK
const sourceApk = 'android/app/build/outputs/apk/debug/app-debug.apk';
const destApk = `releases/jplaces-stable-${versionSlug}.apk`;

if (fs.existsSync(sourceApk)) {
  console.log(`\n✅ APK generated. Moving to ${destApk}...`);
  fs.copyFileSync(sourceApk, destApk);
  // We keep copy instead of move to avoid gradle issues on next build if it expects the file
} else {
  console.error('\n❌ Could not find generated APK at ' + sourceApk);
  process.exit(1);
}

// 7. Git commit and push
console.log('\n📂 Committing changes and pushing to GitHub...');
run('git add .');

const commitMsg = process.argv[2] || `Build: v${version}`;
run(`git commit -m "${commitMsg}" --allow-empty`);
run('git push origin main');

console.log(`\n✨ Release v${version} successfully pushed to GitHub! ✨`);

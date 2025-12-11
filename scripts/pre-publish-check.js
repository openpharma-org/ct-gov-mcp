#!/usr/bin/env node

/**
 * Pre-publish validation script
 * Performs comprehensive checks before npm publish
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

console.log('🔍 Starting pre-publish validation...\n');

let errors = [];
let warnings = [];

// Helper functions
function exec(command, { silent = false } = {}) {
  try {
    const result = execSync(command, { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return result;
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function checkFile(filePath, description) {
  const fullPath = join(projectRoot, filePath);
  if (!existsSync(fullPath)) {
    errors.push(`Missing ${description}: ${filePath}`);
    return false;
  }
  return true;
}

function checkPackageJson() {
  console.log('📦 Validating package.json...');
  
  const packagePath = join(projectRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  // Required fields
  const required = ['name', 'version', 'description', 'main', 'license'];
  for (const field of required) {
    if (!pkg[field]) {
      errors.push(`package.json missing required field: ${field}`);
    }
  }
  
  // Check main file exists
  if (pkg.main && !existsSync(join(projectRoot, pkg.main))) {
    errors.push(`Main file doesn't exist: ${pkg.main}`);
  }
  
  // Check bin file exists
  if (pkg.bin) {
    Object.entries(pkg.bin).forEach(([name, path]) => {
      if (!existsSync(join(projectRoot, path))) {
        errors.push(`Binary file doesn't exist: ${path} (${name})`);
      }
    });
  }
  
  // Check files field
  if (!pkg.files || !Array.isArray(pkg.files)) {
    warnings.push('package.json should have a "files" field to control what gets published');
  }
  
  // Check engines
  if (!pkg.engines || !pkg.engines.node) {
    warnings.push('Consider adding "engines.node" to specify supported Node.js versions');
  }
  
  // Check keywords
  if (!pkg.keywords || pkg.keywords.length === 0) {
    warnings.push('Add keywords to help users discover your package');
  }
  
  console.log('✅ package.json validation complete\n');
  return pkg;
}

function checkEssentialFiles() {
  console.log('📄 Checking essential files...');
  
  checkFile('README.md', 'README file');
  checkFile('LICENSE', 'License file');
  checkFile('dist/index.js', 'Built main file');
  checkFile('.env.example', 'Environment example');
  
  console.log('✅ Essential files check complete\n');
}

function checkBuildOutput() {
  console.log('🔨 Validating build output...');
  
  try {
    exec('npm run clean');
    exec('npm run build');
    
    // Check that build produces expected files
    if (!existsSync(join(projectRoot, 'dist'))) {
      errors.push('Build did not produce dist/ directory');
    }
    
    console.log('✅ Build validation complete\n');
  } catch (error) {
    errors.push(`Build failed: ${error.message}`);
  }
}

function checkTests() {
  console.log('🧪 Running tests...');
  
  try {
    exec('npm test');
    console.log('✅ All tests passed\n');
  } catch (error) {
    errors.push(`Tests failed: ${error.message}`);
  }
}

function checkLinting() {
  console.log('🔍 Running linting...');
  
  try {
    exec('npm run lint');
    exec('npm run type-check');
    console.log('✅ Linting passed\n');
  } catch (error) {
    errors.push(`Linting failed: ${error.message}`);
  }
}

function checkSecurity() {
  console.log('🛡️  Running security audit...');
  
  try {
    exec('npm audit --audit-level moderate');
    console.log('✅ Security audit passed\n');
  } catch (error) {
    warnings.push(`Security issues found: ${error.message}`);
  }
}

function checkDependencies() {
  console.log('📋 Checking dependencies...');
  
  try {
    const outdated = exec('npm outdated --json', { silent: true });
    if (outdated.trim()) {
      const packages = JSON.parse(outdated);
      const outdatedList = Object.keys(packages);
      if (outdatedList.length > 0) {
        warnings.push(`Outdated dependencies: ${outdatedList.join(', ')}`);
      }
    }
    console.log('✅ Dependencies check complete\n');
  } catch (error) {
    // npm outdated returns exit code 1 when packages are outdated
    // This is expected behavior, so we only warn if we can't parse the output
    try {
      const errorOutput = error.stdout || '';
      if (errorOutput.trim()) {
        const packages = JSON.parse(errorOutput);
        const outdatedList = Object.keys(packages);
        if (outdatedList.length > 0) {
          warnings.push(`Outdated dependencies: ${outdatedList.join(', ')}`);
        }
      }
    } catch (parseError) {
      warnings.push('Could not check dependency status. Run "npm outdated" to check manually.');
    }
    console.log('✅ Dependencies check complete\n');
  }
}

function checkPackageSize() {
  console.log('📏 Checking package size...');
  
  try {
    const packOutput = exec('npm pack --dry-run', { silent: true });
    const sizeMatch = packOutput.match(/package size:\s*([0-9.]+\s*[kKmMgG]?B)/);
    
    if (sizeMatch) {
      const size = sizeMatch[1];
      console.log(`📦 Package size: ${size}`);
      
      // Parse size and warn if too large
      const sizeNum = parseFloat(size);
      const unit = size.match(/[kKmMgG]?B$/)?.[0] || 'B';
      
      if (unit === 'MB' && sizeNum > 10) {
        warnings.push(`Package is quite large (${size}). Consider excluding unnecessary files.`);
      }
    }
    
    console.log('✅ Package size check complete\n');
  } catch (error) {
    warnings.push(`Could not check package size: ${error.message}`);
  }
}

function checkGitStatus() {
  console.log('📝 Checking git status...');
  
  try {
    const status = exec('git status --porcelain', { silent: true });
    if (status.trim()) {
      warnings.push('You have uncommitted changes. Consider committing before publishing.');
    }
    
    const branch = exec('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
    if (branch !== 'main' && branch !== 'master') {
      warnings.push(`You're on branch '${branch}'. Consider publishing from main/master.`);
    }
    
    console.log('✅ Git status check complete\n');
  } catch (error) {
    warnings.push('Could not check git status. Make sure you\'re in a git repository.');
  }
}

// Run all checks
async function runAllChecks() {
  const pkg = checkPackageJson();
  checkEssentialFiles();
  checkBuildOutput();
  checkTests();
  checkLinting();
  checkSecurity();
  checkDependencies();
  checkPackageSize();
  checkGitStatus();
  
  // Summary
  console.log('=' .repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('=' .repeat(50));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 All checks passed! Package is ready for publishing.');
    return true;
  }
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (must fix before publishing):');
    errors.forEach(error => console.log(`  • ${error}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (recommended to fix):');
    warnings.forEach(warning => console.log(`  • ${warning}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Package is NOT ready for publishing. Please fix the errors above.');
    return false;
  } else {
    console.log('✅ Package is ready for publishing, but consider addressing warnings.');
    return true;
  }
}

// Run checks if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllChecks()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation script failed:', error.message);
      process.exit(1);
    });
}

export { runAllChecks }; 
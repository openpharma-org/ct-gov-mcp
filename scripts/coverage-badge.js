#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const coverageFile = 'coverage/coverage-final.json';

if (!fs.existsSync(coverageFile)) {
  console.error('Coverage file not found. Run `npm run test:coverage` first.');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

// Calculate total coverage
let totalStatements = 0;
let coveredStatements = 0;
let totalBranches = 0;
let coveredBranches = 0;
let totalFunctions = 0;
let coveredFunctions = 0;
let totalLines = 0;
let coveredLines = 0;

Object.values(coverage).forEach(file => {
  totalStatements += file.s ? Object.keys(file.s).length : 0;
  coveredStatements += file.s ? Object.values(file.s).filter(count => count > 0).length : 0;
  
  totalBranches += file.b ? Object.values(file.b).flat().length : 0;
  coveredBranches += file.b ? Object.values(file.b).flat().filter(count => count > 0).length : 0;
  
  totalFunctions += file.f ? Object.keys(file.f).length : 0;
  coveredFunctions += file.f ? Object.values(file.f).filter(count => count > 0).length : 0;
  
  // Use statement count as proxy for line coverage when line data isn't available
  totalLines += file.statementMap ? Object.keys(file.statementMap).length : 0;
  coveredLines += file.s ? Object.values(file.s).filter(count => count > 0).length : 0;
});

const statementsCoverage = totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(1) : 0;
const branchesCoverage = totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(1) : 0;
const functionsCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(1) : 0;
const linesCoverage = totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(1) : 0;

// Generate shield.io badge URLs
const getBadgeColor = (percentage) => {
  if (percentage >= 80) return 'brightgreen';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 40) return 'orange';
  return 'red';
};

const badges = {
  statements: `https://img.shields.io/badge/statements-${statementsCoverage}%25-${getBadgeColor(statementsCoverage)}`,
  branches: `https://img.shields.io/badge/branches-${branchesCoverage}%25-${getBadgeColor(branchesCoverage)}`,
  functions: `https://img.shields.io/badge/functions-${functionsCoverage}%25-${getBadgeColor(functionsCoverage)}`,
  lines: `https://img.shields.io/badge/lines-${linesCoverage}%25-${getBadgeColor(linesCoverage)}`
};

console.log('Coverage Badges:');
console.log('================');
Object.entries(badges).forEach(([type, url]) => {
  console.log(`${type}: ![${type}](${url})`);
});

console.log('\nCoverage Summary:');
console.log('=================');
console.log(`Statements: ${statementsCoverage}% (${coveredStatements}/${totalStatements})`);
console.log(`Branches: ${branchesCoverage}% (${coveredBranches}/${totalBranches})`);
console.log(`Functions: ${functionsCoverage}% (${coveredFunctions}/${totalFunctions})`);
console.log(`Lines: ${linesCoverage}% (${coveredLines}/${totalLines})`);

// Save to file for CI/CD
const badgeData = {
  schemaVersion: 1,
  label: 'coverage',
  message: `${statementsCoverage}%`,
  color: getBadgeColor(parseFloat(statementsCoverage))
};

fs.writeFileSync('coverage/badges.json', JSON.stringify({ badges, summary: { statementsCoverage, branchesCoverage, functionsCoverage, linesCoverage } }, null, 2));
console.log('\nBadge data saved to coverage/badges.json'); 
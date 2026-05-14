const fs = require('fs');
const path = require('path');

/**
 * Simple structure validation for skill projects
 * Pure Node.js - no Jest dependency
 */

function validateStructure() {
  const projectRoot = path.resolve(__dirname, '..');
  const results = [];

  // 1. Check skills directory
  const skillsDir = path.join(projectRoot, 'skills');
  if (!fs.existsSync(skillsDir)) {
    results.push({ test: 'has skills directory', passed: false, error: 'Missing skills directory' });
  } else {
    results.push({ test: 'has skills directory', passed: true });
  }

  // 2. Check using-aet skill
  const usingSkillPath = path.join(projectRoot, 'skills/using-aet/SKILL.md');
  if (!fs.existsSync(usingSkillPath)) {
    results.push({ test: 'has using-aet skill', passed: false, error: 'Missing using-aet/SKILL.md' });
  } else {
    try {
      const content = fs.readFileSync(usingSkillPath, 'utf8');
      const hasName = content.includes('name: using-aet');
      const hasDescription = content.includes('description: AET command router providing unified access to core AET functionality');

      if (!hasName || !hasDescription) {
        results.push({
          test: 'has using-aet skill',
          passed: false,
          error: 'SKILL.md missing required frontmatter'
        });
      } else {
        results.push({ test: 'has using-aet skill', passed: true });
      }
    } catch (err) {
      results.push({
        test: 'has using-aet skill',
        passed: false,
        error: `Error reading SKILL.md: ${err.message}`
      });
    }
  }

  // 3. Check platform directories
  const platforms = [
    { name: 'Claude Code', path: '.claude-plugin' },
    { name: 'Codex', path: '.codex' },
    { name: 'OpenCode', path: '.opencode' }
  ];

  platforms.forEach(platform => {
    const platformPath = path.join(projectRoot, platform.path);
    if (!fs.existsSync(platformPath)) {
      results.push({
        test: `has ${platform.name} configuration`,
        passed: false,
        error: `Missing ${platform.path} directory`
      });
    } else {
      results.push({
        test: `has ${platform.name} configuration`,
        passed: true
      });
    }
  });

  // 4. Check package.json
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    results.push({ test: 'has package.json', passed: false, error: 'Missing package.json' });
  } else {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasRequired = pkg.name && pkg.version && pkg.description;
      results.push({
        test: 'has package.json',
        passed: hasRequired,
        error: hasRequired ? undefined : 'package.json missing required fields'
      });
    } catch (err) {
      results.push({
        test: 'has package.json',
        passed: false,
        error: `Invalid JSON in package.json: ${err.message}`
      });
    }
  }

  // 5. Check lib directory
  const libDir = path.join(projectRoot, 'lib');
  if (!fs.existsSync(libDir)) {
    results.push({ test: 'has lib directory', passed: false, error: 'Missing lib directory' });
  } else {
    results.push({ test: 'has lib directory', passed: true });
  }

  return results;
}

// Run validation
const results = validateStructure();

// Display results
console.log(`=== AET Project Structure Validation ===\n`);

let allPassed = true;
results.forEach(result => {
  const status = result.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${result.test}`);
  if (!result.passed && result.error) {
    console.log(`   Error: ${result.error}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All structure tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some structure tests failed.');
  process.exit(1);
}

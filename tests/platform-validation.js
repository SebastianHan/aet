const fs = require('fs');
const path = require('path');

/**
 * Cross-platform validation for skill project structure
 * Works on Windows, macOS, and Linux
 */

function validateClaudeCode() {
  const pluginPath = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');
  const marketplacePath = path.join(__dirname, '..', '.claude-plugin', 'marketplace.json');

  if (!fs.existsSync(pluginPath)) {
    return { platform: 'Claude Code', valid: false, error: 'Missing plugin.json' };
  }

  if (!fs.existsSync(marketplacePath)) {
    return { platform: 'Claude Code', valid: false, error: 'Missing marketplace.json' };
  }

  const installPath = path.join(__dirname, '..', '.claude-plugin', 'INSTALL.md');
  if (!fs.existsSync(installPath)) {
    return { platform: 'Claude Code', valid: false, error: 'Missing INSTALL.md' };
  }

  try {
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));

    const errors = [];

    if (!plugin.name || plugin.name !== 'aet') {
      errors.push('plugin.json name mismatch');
    }

    if (!marketplace.plugins || !Array.isArray(marketplace.plugins)) {
      errors.push('marketplace.json missing plugins array');
    }

    // Check INSTALL.md content
    const installContent = fs.readFileSync(installPath, 'utf8');
    if (!installContent.includes('aet')) {
      errors.push('INSTALL.md missing project name');
    }

    if (errors.length > 0) {
      return { platform: 'Claude Code', valid: false, error: errors.join(', ') };
    }

    return { platform: 'Claude Code', valid: true };
  } catch (error) {
    return { platform: 'Claude Code', valid: false, error: `JSON parse error: ${error.message}` };
  }
}

function validateOpenCode() {
  const installPath = path.join(__dirname, '..', '.opencode', 'INSTALL.md');
  const pluginPath = path.join(__dirname, '..', '.opencode', 'plugins', 'aet.js');

  if (!fs.existsSync(installPath)) {
    return { platform: 'OpenCode', valid: false, error: 'Missing INSTALL.md' };
  }

  if (!fs.existsSync(pluginPath)) {
    return { platform: 'OpenCode', valid: false, error: 'Missing plugin file' };
  }

  try {
    const installContent = fs.readFileSync(installPath, 'utf8');
    if (!installContent.includes('aet')) {
      return { platform: 'OpenCode', valid: false, error: 'INSTALL.md missing project name' };
    }

    // Check plugin file has minimum content
    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    if (!pluginContent.includes('aetPlugin')) {
      return { platform: 'OpenCode', valid: false, error: 'Plugin missing export' };
    }

    return { platform: 'OpenCode', valid: true };
  } catch (error) {
    return { platform: 'OpenCode', valid: false, error: `Read error: ${error.message}` };
  }
}

function validateCodex() {
  const installPath = path.join(__dirname, '..', '.codex', 'INSTALL.md');
  const bootstrapScriptPath = path.join(__dirname, '..', '.codex', 'aet-codex');
  const bootstrapContentPath = path.join(__dirname, '..', '.codex', 'aet-bootstrap.md');

  if (!fs.existsSync(installPath)) {
    return { platform: 'Codex', valid: false, error: 'Missing INSTALL.md' };
  }

  if (!fs.existsSync(bootstrapScriptPath)) {
    return { platform: 'Codex', valid: false, error: 'Missing bootstrap script' };
  }

  if (!fs.existsSync(bootstrapContentPath)) {
    return { platform: 'Codex', valid: false, error: 'Missing bootstrap content' };
  }

  try {
    const installContent = fs.readFileSync(installPath, 'utf8');
    if (!installContent.includes('aet')) {
      return { platform: 'Codex', valid: false, error: 'INSTALL.md missing project name' };
    }

    // Check bootstrap script has shebang
    const scriptContent = fs.readFileSync(bootstrapScriptPath, 'utf8');
    if (!scriptContent.startsWith('#!/usr/bin/env node')) {
      return { platform: 'Codex', valid: false, error: 'Bootstrap script missing shebang' };
    }

    // Check bootstrap content has required markers
    const bootstrapContent = fs.readFileSync(bootstrapContentPath, 'utf8');
    if (!bootstrapContent.includes('<EXTREMELY_IMPORTANT>')) {
      return { platform: 'Codex', valid: false, error: 'Bootstrap content missing required markers' };
    }

    return { platform: 'Codex', valid: true };
  } catch (error) {
    return { platform: 'Codex', valid: false, error: `Read error: ${error.message}` };
  }
}

function runValidation() {
  console.log('Validating multi-platform project structure...\n');

  const results = [
    validateClaudeCode(),
    validateOpenCode(),
    validateCodex()
  ];

  let allValid = true;
  results.forEach(result => {
    const status = result.valid ? '✓' : '✗';
    console.log(`${status} ${result.platform}: ${result.valid ? 'Valid' : result.error}`);
    if (!result.valid) allValid = false;
  });

  console.log('\n' + (allValid ? 'All platform configurations are valid.' : 'Some platform configurations need attention.'));
  return allValid;
}

// Run validation if called directly
if (require.main === module) {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}

module.exports = {
  validateClaudeCode,
  validateOpenCode,
  validateCodex,
  runValidation
};

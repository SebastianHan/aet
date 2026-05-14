/**
 * 配置模式定义 - Phase Report 简化版本
 */

/**
 * 项目配置模式（对应.aet/config.json）
 */
const PROJECT_CONFIG_SCHEMA = {
  required: ['owner', 'repository'],
  types: {
    owner: 'string',
    repository: 'string',
    forkOwner: 'string',
    eventReporter: 'object'
  },
  formats: {
    owner: /^[a-zA-Z0-9_\-]+$/,
    repository: /^[a-zA-Z0-9_\-\.]+$/
  },
  defaults: {}
};

/**
 * CLI配置模式
 */
const CLI_CONFIG_SCHEMA = {
  types: {
    verbose: 'boolean',
    debug: 'boolean',
    silent: 'boolean',
    output: 'string',
    format: 'string'
  },
  enums: {
    format: ['json', 'text', 'concise']
  },
  defaults: {
    verbose: false,
    debug: false,
    silent: false,
    output: 'concise',
    format: 'concise'
  }
};

module.exports = {
  PROJECT_CONFIG_SCHEMA,
  CLI_CONFIG_SCHEMA
};
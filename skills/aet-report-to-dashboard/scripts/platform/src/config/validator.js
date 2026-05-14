/**
 * 配置验证器 - Phase Report 简化版本
 */

const { Validator } = require('../utils/validator');
const { ConfigValidationError } = require('../errors/config-errors');
const schemas = require('./schemas');

/**
 * 配置验证器
 */
class ConfigValidator {
  /**
   * 验证项目配置（.aet/config.json）
   * @param {Object} config - 待验证的配置
   * @returns {Object} 验证后的配置
   * @throws {ConfigValidationError}
   */
  static validateProjectConfig(config) {
    try {
      const validator = new Validator(schemas.PROJECT_CONFIG_SCHEMA);
      return validator.validate(config);
    } catch (error) {
      throw new ConfigValidationError([error.message]);
    }
  }

  /**
   * 验证CLI配置
   * @param {Object} config - 待验证的配置
   * @returns {Object} 验证后的配置
   * @throws {ConfigValidationError}
   */
  static validateCliConfig(config) {
    try {
      const validator = new Validator(schemas.CLI_CONFIG_SCHEMA);
      return validator.validate(config);
    } catch (error) {
      throw new ConfigValidationError([error.message]);
    }
  }

  /**
   * 检查配置是否完整
   * @param {Object} config - 待检查的配置
   * @returns {boolean}
   */
  static isConfigComplete(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const required = schemas.PROJECT_CONFIG_SCHEMA.required || [];
    return required.every(field => {
      const value = config[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

/**
 * 获取配置缺失字段
   * @param {Object} config - 待检查的配置
   * @returns {string[]}
   */
  static getMissingFields(config) {
    if (!config || typeof config !== 'object') {
      return schemas.PROJECT_CONFIG_SCHEMA.required || [];
    }

    const required = schemas.PROJECT_CONFIG_SCHEMA.required || [];
    return required.filter(field => {
      const value = config[field];
      return value === undefined || value === null || value === '';
    });
  }

  /**
   * 合并多个配置并验证
   * @param {Object} defaults - 默认配置
   * @param {...Object} configs - 待合并的配置
   * @returns {Object} 合并后的配置
   */
  static mergeAndValidateConfigs(defaults, ...configs) {
    let merged = { ...defaults };
    
    for (const config of configs) {
      if (config && typeof config === 'object') {
        merged = { ...merged, ...config };
      }
    }
    
    return merged;
  }
}

module.exports = ConfigValidator;
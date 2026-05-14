/**
 * AET Plugin for OpenCode
 *
 * Provides workflow-based agent execution with configurable steps.
 * Agents are loaded from the agents directory and configured via config.json.
 *
 * 状态管理使用 CheckpointManager，存储在项目 .aet/checkpoint/ 目录下
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { tool } from "@opencode-ai/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// Config Loading
// ============================================

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
  }

  reloadConfig(directory) {
    this.config = this.loadConfig(directory);
  }

  findGlobalConfigPath() {
    const homeDir = os.homedir();
    let globalConfigPath;
    if (process.platform === 'win32') {
      globalConfigPath = path.join(process.env.APPDATA || process.env.USERPROFILE || homeDir, '.aet', 'config.json');
    } else {
      globalConfigPath = path.join(homeDir, '.aet', 'config.json');
    }

    if (fs.existsSync(globalConfigPath)) {
      return { path: globalConfigPath, metadata: { strategy: 'global', priority: 10 } };
    }
    return { path: null, metadata: { strategy: 'global', priority: 10 } };
  }

  resolveEnvVar(value) {
    if (typeof value !== 'string') {
      return value;
    }
    const envVarPattern = /\$\{([^}]+)\}/g;
    let resolvedValue = value;
    let match;
    while ((match = envVarPattern.exec(value)) !== null) {
      const envVarName = match[1];
      const envVarValue = process.env[envVarName];
      if (envVarValue !== undefined) {
        resolvedValue = resolvedValue.replace(match[0], envVarValue);
      }
    }
    return resolvedValue;
  }

  resolveEnvVarsInObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.resolveEnvVar(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveEnvVarsInObject(item));
    }
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = this.resolveEnvVarsInObject(value);
    }
    return resolved;
  }

  loadGlobalConfig(configPath = null) {
    const globalPath = configPath || this.findGlobalConfigPath().path;
    if (!globalPath) {
      return { config: {}, error: null };
    }
    try {
      const content = fs.readFileSync(globalPath, 'utf-8');
      const parsed = JSON.parse(content);
      const resolvedConfig = this.resolveEnvVarsInObject(parsed);
      return { config: resolvedConfig, error: null };
    } catch (error) {
      console.error('[AET] Global config load error:', error.message);
      return { config: {}, error };
    }
  }

  findConfigPath(projectRoot) {
    const homeDir = os.homedir();
    const searchPaths = [
      path.join(projectRoot, '.aet', 'config.json'),
      path.join(process.cwd(), '.aet', 'config.json'),
      path.join(homeDir, '.aet', 'config.json'),
    ];
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  }

  mergeConfig(globalConfig, projectConfig) {
    if (!globalConfig || Object.keys(globalConfig).length === 0) {
      return projectConfig || {};
    }
    if (!projectConfig || Object.keys(projectConfig).length === 0) {
      return globalConfig;
    }
    const mergedConfig = {};
    mergedConfig.version = projectConfig.version || globalConfig.version || '1.0';
    mergedConfig.capability_scenarios = (projectConfig.capability_scenarios && Object.keys(projectConfig.capability_scenarios).length > 0)
      ? projectConfig.capability_scenarios
      : (globalConfig.capability_scenarios || {});
    mergedConfig.hooks = (projectConfig.hooks && Object.keys(projectConfig.hooks).length > 0)
      ? projectConfig.hooks
      : (globalConfig.hooks || {});
    mergedConfig.agents = (projectConfig.agents && Object.keys(projectConfig.agents).length > 0)
      ? projectConfig.agents
      : (globalConfig.agents || {});
    if (globalConfig.codePlatform || projectConfig.codePlatform) {
      mergedConfig.codePlatform = this.deepMerge(
        globalConfig.codePlatform || {},
        projectConfig.codePlatform || {}
      );
    }
    mergedConfig.configPath = projectConfig.configPath || globalConfig.configPath;
    return mergedConfig;
  }

  deepMerge(target, source) {
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], value);
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  loadConfig(directory) {
    const projectRoot = directory || process.cwd();
    const globalConfigResult = this.loadGlobalConfig();
    const globalConfig = globalConfigResult.config;
    const projectConfigPath = this.findConfigPath(projectRoot);
    let projectConfig = {};
    if (projectConfigPath) {
      try {
        const content = fs.readFileSync(projectConfigPath, 'utf-8');
        const parsed = JSON.parse(content);
        projectConfig = {
          version: parsed.version || '1.0',
          capability_scenarios: parsed.capability_scenarios || {},
          agents: parsed.agents || {},
          hooks: parsed.hooks || {},
          codePlatform: parsed.codePlatform || {},
          configPath: projectConfigPath,
        };
      } catch (error) {
        console.error('[AET] Project config load error:', error.message);
      }
    }
    const mergedConfig = this.mergeConfig(globalConfig, projectConfig);
    if (Object.keys(mergedConfig).length === 0 || !mergedConfig.capability_scenarios) {
      return {
        version: '1.0',
        capability_scenarios: {},
        agents: {},
        hooks: {},
        configPath: null,
      };
    }
    return mergedConfig;
  }

  getHooks() {
    return this.config.hooks;
  }

  getCapabilityScenarios() {
    return this.config.capability_scenarios;
  }

  getAgentConfig(agentName) {
    return this.config.agents[agentName] || null;
  }

  getAllAgents() {
    return this.config.agents;
  }

  getConfigPath() {
    return this.config.configPath;
  }
}

const configManager = new ConfigManager();

// ============================================
// CheckpointManager - Workflow Checkpoint 状态管理器
// ============================================
// 管理 WorkflowCheckpoint 的状态，存储在项目 .aet/checkpoint/ 目录下
// 支持同一阶段多次执行（executions 数组）

const CHECKPOINT_VERSION = '1.0';

class CheckpointManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.checkpointDir = path.join(projectRoot, '.aet', 'checkpoint');
    this.ensureCheckpointDir();
  }

  ensureCheckpointDir() {
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
    }
    const archiveDir = path.join(this.checkpointDir, 'archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
  }

  // ============ Index 管理 ============

  getIndexPath() {
    return path.join(this.checkpointDir, 'index.json');
  }

  loadIndex() {
    const filePath = this.getIndexPath();
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('[CheckpointManager] loadIndex error:', e.message);
    }
    return {
      version: CHECKPOINT_VERSION,
      lastUpdated: null,
      active: [],
      interrupted: [],
      recentCompleted: [],
    };
  }

  saveIndex(index) {
    const filePath = this.getIndexPath();
    index.lastUpdated = new Date().toISOString();
    try {
      fs.writeFileSync(filePath, JSON.stringify(index, null, 2), 'utf-8');
    } catch (e) {
      console.error('[CheckpointManager] saveIndex error:', e.message);
    }
  }

  // ============ Run 生命周期 ============

  generateCheckpointID() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `checkpoint_${timestamp}_${random}`;
  }

  generateExecutionID() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `exec_${timestamp}_${random}`;
  }

  getCheckpointPath(checkpointID) {
    return path.join(this.checkpointDir, `${checkpointID}.json`);
  }

  getArchiveCheckpointPath(checkpointID) {
    return path.join(this.checkpointDir, 'archive', `${checkpointID}.json`);
  }

  createCheckpoint(workflowName, description) {
    const checkpointID = this.generateCheckpointID();
    const now = new Date().toISOString();

    const checkpoint = {
      version: CHECKPOINT_VERSION,
      workflow: {
        checkpointID,
        name: workflowName,
        description,
        currentStage: null,
        status: 'in_progress',
      },
      executions: {},
      history: [
        { ts: now, event: 'workflow_started', workflow: workflowName }
      ],
      startedAt: now,
      updatedAt: now,
      interruptedAt: null,
      completedAt: null,
    };

    this.saveCheckpoint(checkpoint);

    const index = this.loadIndex();
    index.active.push({
      checkpointID,
      workflow: workflowName,
      description,
      stage: null,
      step: null,
      startedAt: now,
      updatedAt: now,
    });
    this.saveIndex(index);

    return checkpointID;
  }

  getCheckpoint(checkpointID) {
    const filePath = this.getCheckpointPath(checkpointID);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      }
      const archivePath = this.getArchiveCheckpointPath(checkpointID);
      if (fs.existsSync(archivePath)) {
        const content = fs.readFileSync(archivePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('[CheckpointManager] getCheckpoint error:', e.message);
    }
    return null;
  }

  saveCheckpoint(checkpoint) {
    const filePath = this.getCheckpointPath(checkpoint.workflow.checkpointID);
    checkpoint.updatedAt = new Date().toISOString();
    try {
      fs.writeFileSync(filePath, JSON.stringify(checkpoint, null, 2), 'utf-8');
    } catch (e) {
      console.error('[CheckpointManager] saveCheckpoint error:', e.message);
    }
  }

  updateCheckpoint(checkpointID, updates) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return null;
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'workflow' || key === 'executions' || key === 'feature') {
        checkpoint[key] = { ...checkpoint[key], ...value };
      } else {
        checkpoint[key] = value;
      }
    }
    this.saveCheckpoint(checkpoint);
    this.updateIndexEntry(checkpointID, checkpoint);
    return checkpoint;
  }

  updateIndexEntry(checkpointID, checkpoint) {
    const index = this.loadIndex();
    const activeIdx = index.active.findIndex(e => e.checkpointID === checkpointID);
    if (activeIdx >= 0) {
      index.active[activeIdx] = {
        checkpointID,
        workflow: checkpoint.workflow.name,
        description: checkpoint.workflow.description,
        stage: checkpoint.workflow.currentStage,
        step: this.getCurrentStepId(checkpoint),
        startedAt: checkpoint.startedAt,
        updatedAt: checkpoint.updatedAt,
      };
    }
    const interruptedIdx = index.interrupted.findIndex(e => e.checkpointID === checkpointID);
    if (interruptedIdx >= 0 && !checkpoint.interruptedAt) {
      index.interrupted.splice(interruptedIdx, 1);
      if (activeIdx < 0) {
        index.active.push({
          checkpointID,
          workflow: checkpoint.workflow.name,
          description: checkpoint.workflow.description,
          stage: checkpoint.workflow.currentStage,
          step: this.getCurrentStepId(checkpoint),
          startedAt: checkpoint.startedAt,
          updatedAt: checkpoint.updatedAt,
        });
      }
    }
    this.saveIndex(index);
  }

  getCurrentStepId(checkpoint) {
    const stage = checkpoint.workflow.currentStage;
    if (!stage) return null;
    const records = checkpoint.executions[stage]?.records;
    if (!records || records.length === 0) return null;
    const currentExec = records[records.length - 1];
    return currentExec?.currentStep || null;
  }

  completeCheckpoint(checkpointID) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return false;
    const now = new Date().toISOString();
    checkpoint.completedAt = now;
    checkpoint.workflow.status = 'completed';
    const archivePath = this.getArchiveCheckpointPath(checkpointID);
    try {
      fs.writeFileSync(archivePath, JSON.stringify(checkpoint, null, 2), 'utf-8');
      fs.unlinkSync(this.getCheckpointPath(checkpointID));
    } catch (e) {
      console.error('[CheckpointManager] completeCheckpoint archive error:', e.message);
    }
    const index = this.loadIndex();
    index.active = index.active.filter(e => e.checkpointID !== checkpointID);
    index.interrupted = index.interrupted.filter(e => e.checkpointID !== checkpointID);
    index.recentCompleted.unshift({
      checkpointID,
      workflow: checkpoint.workflow.name,
      description: checkpoint.workflow.description,
      completedAt: now,
    });
    if (index.recentCompleted.length > 10) {
      index.recentCompleted = index.recentCompleted.slice(0, 10);
    }
    this.saveIndex(index);
    return true;
  }

  interruptCheckpoint(checkpointID, resumeHint) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return false;
    const now = new Date().toISOString();
    checkpoint.interruptedAt = now;
    checkpoint.workflow.status = 'interrupted';
    // 同时标记当前 execution 为 interrupted（强制覆盖，即使已经是 completed）
    const currentStage = checkpoint.workflow.currentStage;
    if (currentStage && checkpoint.executions[currentStage]) {
      const execution = this.getCurrentExecution(checkpoint, currentStage);
      if (execution) {
        execution.status = 'interrupted';
        execution.completedAt = now;
        execution.result = 'Interrupted by user';
        // 同时标记当前 step 为 interrupted
        if (execution.currentStep && execution.steps[execution.currentStep]) {
          execution.steps[execution.currentStep] = {
            ...execution.steps[execution.currentStep],
            status: 'interrupted',
            completedAt: now,
          };
        }
      }
    }
    checkpoint.history.push({
      ts: now,
      event: 'workflow_interrupted',
      hint: resumeHint,
    });
    this.saveCheckpoint(checkpoint);
    const index = this.loadIndex();
    index.active = index.active.filter(e => e.checkpointID !== checkpointID);
    const interruptedEntry = {
      checkpointID,
      workflow: checkpoint.workflow.name,
      description: checkpoint.workflow.description,
      stage: checkpoint.workflow.currentStage,
      interruptedAt: now,
      resumeHint,
    };
    const existingIdx = index.interrupted.findIndex(e => e.checkpointID === checkpointID);
    if (existingIdx >= 0) {
      index.interrupted[existingIdx] = interruptedEntry;
    } else {
      index.interrupted.push(interruptedEntry);
    }
    this.saveIndex(index);
    return true;
  }

  // ============ Execution 管理 ============

  startExecution(checkpointID, stage, sessionID, agentId, context = null) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return null;
    const now = new Date().toISOString();
    const executionId = this.generateExecutionID();
    if (!checkpoint.executions[stage]) {
      checkpoint.executions[stage] = { records: [] };
    }
    const execution = {
      executionId,
      sessionID,
      agentId,
      status: 'in_progress',
      startedAt: now,
      completedAt: null,
      result: null,
      context: context,  // handover context，用于没有 step_workflow 的 agent
      currentStep: null,
      steps: {},
    };
    checkpoint.executions[stage].records.push(execution);
    checkpoint.workflow.currentStage = stage;
    checkpoint.history.push({
      ts: now,
      event: 'execution_started',
      stage,
      executionId,
      sessionID,
    });
    this.saveCheckpoint(checkpoint);
    this.updateIndexEntry(checkpointID, checkpoint);
    return execution;
  }

  getCurrentExecution(checkpoint, stage) {
    if (!checkpoint || !checkpoint.executions[stage]) return null;
    const records = checkpoint.executions[stage].records;
    if (records.length === 0) return null;
    return records[records.length - 1];
  }

  completeExecution(checkpointID, stage, result) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return false;
    const execution = this.getCurrentExecution(checkpoint, stage);
    if (!execution) return false;
    const now = new Date().toISOString();
    execution.status = 'completed';
    execution.completedAt = now;
    execution.result = result;
    // 同时标记当前 step 为 completed
    if (execution.currentStep && execution.steps[execution.currentStep]) {
      execution.steps[execution.currentStep] = {
        ...execution.steps[execution.currentStep],
        status: 'completed',
        completedAt: now,
      };
    }
    checkpoint.history.push({
      ts: now,
      event: 'execution_completed',
      stage,
      executionId: execution.executionId,
      result,
    });
    this.saveCheckpoint(checkpoint);
    return true;
  }

  // ============ Step 管理 ============

  initSteps(checkpointID, stage, stepConfigs, initialContext = null) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return false;
    const execution = this.getCurrentExecution(checkpoint, stage);
    if (!execution) return false;
    for (const step of stepConfigs) {
      const stepId = step.step_id || step.name;
      execution.steps[stepId] = {
        status: 'pending',
        startedAt: null,
        completedAt: null,
        result: null,
        context: null,
      };
    }
    if (stepConfigs.length > 0) {
      const firstStepId = stepConfigs[0].step_id || stepConfigs[0].name;
      execution.steps[firstStepId] = {
        status: 'pending',  // 初始为 pending，chat.message hook 注入后变为 in_progress
        startedAt: null,
        completedAt: null,
        result: null,
        context: null,  // 非 resume 时，context 通过 executeStageHandover 的 prompt 发送，不保存到 step
      };
      execution.currentStep = firstStepId;
      // 不记录 step_started 事件，等 chat.message hook 注入后再记录
    }
    this.saveCheckpoint(checkpoint);
    this.updateIndexEntry(checkpointID, checkpoint);
    return true;
  }

  getCurrentStep(checkpointID, stage) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return null;
    const execution = this.getCurrentExecution(checkpoint, stage);
    if (!execution || !execution.currentStep) return null;
    return {
      stepId: execution.currentStep,
      ...execution.steps[execution.currentStep],
    };
  }

  advanceStep(checkpointID, stage, stepId, stepResult) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return false;
    const execution = this.getCurrentExecution(checkpoint, stage);
    if (!execution) return false;
    const now = new Date().toISOString();
    if (execution.currentStep) {
      execution.steps[execution.currentStep] = {
        ...execution.steps[execution.currentStep],
        status: 'completed',
        completedAt: now,
        result: stepResult,
      };
      checkpoint.history.push({
        ts: now,
        event: 'step_completed',
        stage,
        executionId: execution.executionId,
        step: execution.currentStep,
      });
    }
    execution.currentStep = stepId;
    if (stepId) {
      execution.steps[stepId] = {
        ...execution.steps[stepId],
        status: 'in_progress',
        startedAt: now,
        context: stepResult,  // 把上一个 step 的 result 作为新 step 的 context（用于 resume）
      };
      checkpoint.history.push({
        ts: now,
        event: 'step_started',
        stage,
        executionId: execution.executionId,
        step: stepId,
      });
    }
    this.saveCheckpoint(checkpoint);
    this.updateIndexEntry(checkpointID, checkpoint);
    return true;
  }

  completeAllSteps(checkpointID, stage) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return false;
    const execution = this.getCurrentExecution(checkpoint, stage);
    if (!execution) return false;
    execution.currentStep = null;
    checkpoint.history.push({
      ts: new Date().toISOString(),
      event: 'all_steps_completed',
      stage,
      executionId: execution.executionId,
    });
    this.saveCheckpoint(checkpoint);
    return true;
  }

  // ============ 状态查询 ============

  getActiveCheckpoints() {
    const index = this.loadIndex();
    return index.active;
  }

  getInterruptedCheckpoints() {
    const index = this.loadIndex();
    return index.interrupted;
  }

  findCheckpointBySessionID(sessionID) {
    const index = this.loadIndex();
    const allCheckpoints = [...index.active, ...index.interrupted];
    for (const entry of allCheckpoints) {
      const checkpoint = this.getCheckpoint(entry.checkpointID);
      if (checkpoint) {
        for (const stageRecords of Object.values(checkpoint.executions)) {
          for (const record of stageRecords.records) {
            if (record.sessionID === sessionID) {
              return entry.checkpointID;
            }
          }
        }
      }
    }
    return null;
  }

  findAgentBySessionID(sessionID) {
    const index = this.loadIndex();
    const allCheckpoints = [...index.active, ...index.interrupted];
    for (const entry of allCheckpoints) {
      const checkpoint = this.getCheckpoint(entry.checkpointID);
      if (checkpoint) {
        for (const stageRecords of Object.values(checkpoint.executions)) {
          for (const record of stageRecords.records) {
            if (record.sessionID === sessionID) {
              return record.agentId;
            }
          }
        }
      }
    }
    return null;
  }

  getResumableCheckpoints() {
    const index = this.loadIndex();
    return [...index.active, ...index.interrupted];
  }

  getResumePrompt(checkpointID, stage = null, step = null) {
    const checkpoint = this.getCheckpoint(checkpointID);
    if (!checkpoint) return null;
    const currentStage = stage || checkpoint.workflow.currentStage;
    const execution = this.getCurrentExecution(checkpoint, currentStage);
    const currentStep = step || execution?.currentStep;
    let prompt = `## Resume Workflow Checkpoint\n\n`;
    prompt += `**Checkpoint ID**: ${checkpointID}\n`;
    prompt += `**Workflow**: ${checkpoint.workflow.name}\n`;
    prompt += `**Description**: ${checkpoint.workflow.description}\n`;
    prompt += `\n**Current Stage**: ${currentStage}\n`;
    prompt += `**Agent**: ${execution?.agentId || 'unknown'}\n`;
    // Step 信息由 chat.message hook 统一注入，这里显示 context
    if (currentStep) {
      // 优先显示 step context（来自上一个 step 的 result），如果没有则显示 execution context
      const currentStepState = execution?.steps?.[currentStep];
      const contextToShow = currentStepState?.context || execution?.context;
      if (contextToShow) {
        prompt += `\n### Context:\n${typeof contextToShow === 'string' ? contextToShow : JSON.stringify(contextToShow, null, 2)}\n`;
      }
    } else {
      // 没有 step 时，显示 execution context
      if (execution?.context) {
        prompt += `\n### Context:\n${typeof execution.context === 'string' ? execution.context : JSON.stringify(execution.context, null, 2)}\n`;
      }
    }
    if (checkpoint.interruptedAt) {
      const index = this.loadIndex();
      const entry = index.interrupted.find(e => e.checkpointID === checkpointID);
      if (entry?.resumeHint) {
        prompt += `\n### Resume Hint:\n${entry.resumeHint}\n`;
      }
    }
    prompt += `\nPlease continue from where the workflow was interrupted.\n`;
    return prompt;
  }
}

// CheckpointManager 实例（延迟初始化，因为需要 projectRoot）
let checkpointManager = null;

// ============================================
// Agent Loading
// ============================================

function getAgentsDir() {
  return path.join(os.homedir(), '.config', 'opencode', 'aet', 'agents');
}

const agentHandoverAgents = new Set();

function buildAgentHandoverParam(agentId) {
  if (!agentHandoverAgents.has(agentId)) {
    return {};
  }
  return { tools: { agent_handover: true } };
}

// ============================================
// Workflow Engine (适配 CheckpointManager)
// ============================================

const SessionCheckpointState = {
  RUNNING: 'running',
  PENDING_IDLE: 'pending_idle',
  INTERRUPTED: 'interrupted',
  COMPLETED: 'completed',
};

// 当前活跃的 checkpointID（内存缓存，方便快速访问）
let currentCheckpointID = null;

class WorkflowEngine {
  constructor(cfgManager) {
    this.configManager = cfgManager;
  }

  getWorkflowConfig(workflowName) {
    const scenarios = this.configManager.getCapabilityScenarios();
    return scenarios[workflowName] || null;
  }

  getWorkflowStages(workflowName) {
    const workflow = this.getWorkflowConfig(workflowName);
    if (!workflow) return [];
    return workflow.agent_workflow || [];
  }

  getStageNames(workflowName) {
    const stages = this.getWorkflowStages(workflowName);
    return stages.map(s => s.stage_id || s.agent_id);
  }

  getStageByIndex(workflowName, index) {
    const stages = this.getWorkflowStages(workflowName);
    return stages[index] || null;
  }

  getHookConfig(hookName) {
    const hooks = this.configManager.getHooks();
    return hooks[hookName] || null;
  }

  startWorkflow(workflowName, description) {
    const workflow = this.getWorkflowConfig(workflowName);
    if (!workflow) {
      return {
        success: false,
        error: `Capability scenario "${workflowName}" not found. Available: ${Object.keys(this.configManager.getCapabilityScenarios()).join(', ')}`,
      };
    }

    const stages = this.getWorkflowStages(workflowName);
    if (stages.length === 0) {
      return { success: false, error: 'Capability scenario has no stages' };
    }

    // 使用 CheckpointManager 创建 checkpoint
    currentCheckpointID = checkpointManager.createCheckpoint(workflowName, description);

    return {
      success: true,
      checkpointID: currentCheckpointID,
      workflow: workflowName,
      workflowInfo: { name: workflow.name, description: workflow.description },
      firstStage: stages[0],
      message: `Capability scenario "${workflowName}" started`,
    };
  }

  getStatus() {
    if (!currentCheckpointID || !checkpointManager) {
      return { active: false };
    }
    const checkpoint = checkpointManager.getCheckpoint(currentCheckpointID);
    if (!checkpoint) {
      return { active: false };
    }
    return {
      active: true,
      checkpointID: currentCheckpointID,
      workflow: checkpoint.workflow.name,
      currentStage: checkpoint.workflow.currentStage,
      status: checkpoint.workflow.status,
    };
  }
}

const workflowEngine = new WorkflowEngine(configManager);

// ============================================
// Session Run State Machine（单次执行生命周期）
// ============================================

const sessionCheckpoints = new Map();
let sessionCheckpointCounter = 0;
const IDLE_SETTLE_MS = 300;

// 确保 workflow 状态为 in_progress（用于中断后恢复）
// 同时重置 execution 和 step 的 interrupted 状态
function ensureCheckpointRunning(checkpointID) {
  if (!checkpointID || !checkpointManager) return;
  const checkpoint = checkpointManager.getCheckpoint(checkpointID);
  if (checkpoint && checkpoint.workflow.status === 'interrupted') {
    checkpoint.workflow.status = 'in_progress';
    checkpoint.interruptedAt = null;

    // 重置当前 execution 的 interrupted 状态
    const currentStage = checkpoint.workflow.currentStage;
    if (currentStage && checkpoint.executions[currentStage]) {
      const execution = checkpointManager.getCurrentExecution(checkpoint, currentStage);
      if (execution && execution.status === 'interrupted') {
        execution.status = 'in_progress';
        execution.completedAt = null;
        execution.result = null;

        // 重置当前 step 的 interrupted 状态
        if (execution.currentStep && execution.steps[execution.currentStep]) {
          const stepState = execution.steps[execution.currentStep];
          if (stepState.status === 'interrupted') {
            stepState.status = 'pending';
            stepState.completedAt = null;
          }
        }
      }
    }

    checkpoint.history.push({
      ts: new Date().toISOString(),
      event: 'workflow_resumed',
    });
    checkpointManager.saveCheckpoint(checkpoint);

    // 更新 index
    const index = checkpointManager.loadIndex();
    index.active = index.active.filter(e => e.checkpointID !== checkpointID);
    index.interrupted = index.interrupted.filter(e => e.checkpointID !== checkpointID);
    index.active.push({
      checkpointID,
      workflow: checkpoint.workflow.name,
      description: checkpoint.workflow.description,
      stage: checkpoint.workflow.currentStage,
      step: checkpointManager.getCurrentStepId(checkpoint),
      startedAt: checkpoint.startedAt,
      updatedAt: checkpoint.updatedAt,
    });
    checkpointManager.saveIndex(index);
  }
}

function startSessionCheckpoint(sessionID) {
  const checkpointID = ++sessionCheckpointCounter;
  sessionCheckpoints.set(sessionID, {
    checkpointID,
    state: SessionCheckpointState.RUNNING,
    startedAt: Date.now(),
  });
  return checkpointID;
}

function getCurrentSessionCheckpoint(sessionID) {
  return sessionCheckpoints.get(sessionID);
}

function markSessionCheckpointInterrupted(sessionID) {
  const sessionCheckpoint = sessionCheckpoints.get(sessionID);
  if (sessionCheckpoint && (sessionCheckpoint.state === SessionCheckpointState.RUNNING || sessionCheckpoint.state === SessionCheckpointState.PENDING_IDLE)) {
    sessionCheckpoint.state = SessionCheckpointState.INTERRUPTED;
  }
}

function closeSessionCheckpoint(sessionID) {
  sessionCheckpoints.delete(sessionID);
}

async function shouldSkipAfterHook(sessionID, expectedCheckpointID) {
  const currentSessionCheckpoint = getCurrentSessionCheckpoint(sessionID);
  if (!currentSessionCheckpoint || currentSessionCheckpoint.checkpointID !== expectedCheckpointID || currentSessionCheckpoint.state === SessionCheckpointState.INTERRUPTED) {
    return true;
  }
  try {
    const msgs = await pluginClient.session.messages({ path: { id: sessionID } });
    const msgsData = msgs.data || [];
    const lastMsg = msgsData[msgsData.length - 1];
    return lastMsg?.info?.error?.name === 'MessageAbortedError';
  } catch (e) {
    return false;
  }
}

// ============================================
// Store client reference
// ============================================

let pluginClient = null;
let pluginDirectory = null;
let rootSessionID = null;

// ============================================
// Hook Handling
// ============================================

async function triggerAfterHook(sessionID, stage, checkpointID) {
  if (!stage || !stage.after) {
    return;
  }

  if (stage.after === 'auto') {
    // 自动推进到下一阶段
    const workflowName = checkpointManager.getCheckpoint(checkpointID)?.workflow.name;
    const stages = workflowEngine.getWorkflowStages(workflowName);
    const currentIdx = stages.findIndex(s => (s.stage_id || s.agent_id) === stage.stage_id || stage.agent_id);
    const nextStage = stages[currentIdx + 1];
    if (nextStage) {
      await executeStageHandover(nextStage, null, checkpointID);
    }
    return;
  }

  const hookConfig = workflowEngine.getHookConfig(stage.after);
  if (hookConfig && hookConfig.options && hookConfig.options.length > 0) {
    const description = hookConfig.description || 'Please confirm';
    const optionsText = hookConfig.options.map(opt => `- ${opt.label}`).join('\n');
    const template = hookConfig.promptTemplate || 'Question: "{description}"\n{options}';
    let userPrompt = template.replace('{description}', description).replace('{options}', optionsText);
    if (stage.after === 'confirm') {
      userPrompt += '\n\n**If user approves, please call agent_handover to advance to the next stage.**';
    }
    startSessionCheckpoint(sessionID);
    try {
      await pluginClient.session.prompt({
        path: { id: sessionID },
        body: {
          agent: stage.agent_id,
          noReply: false,
          parts: [{ type: 'text', text: userPrompt }],
          ...buildAgentHandoverParam(stage.agent_id),
        },
      });
    } catch (err) {
      console.error('[AET] After hook error:', err.message);
    }
  }
}

async function triggerStepAfterHook(sessionID, agentId, agentConfig, checkpointID, stage) {
  const currentStepInfo = checkpointManager.getCurrentStep(checkpointID, stage);
  if (!currentStepInfo) {
    return;
  }

  const stepConfig = agentConfig.step_workflow?.find(s => (s.step_id || s.name) === currentStepInfo.stepId);
  if (!stepConfig || !stepConfig.after) {
    return;
  }

  if (stepConfig.after === 'auto') {
    await advanceToNextStep(sessionID, agentId, agentConfig, checkpointID, stage, null);
    return;
  }

  const hookConfig = workflowEngine.getHookConfig(stepConfig.after);
  if (hookConfig && hookConfig.options && hookConfig.options.length > 0) {
    const description = hookConfig.description || 'Confirm before proceeding to next step';
    const optionsText = hookConfig.options.map(opt => `- ${opt.label}`).join('\n');
    const template = hookConfig.promptTemplate || 'Question: "{description}"\n{options}';
    let userPrompt = template.replace('{description}', description).replace('{options}', optionsText);
    userPrompt += `\n\nCurrent Step: **${stepConfig.name}**`;
    if (stepConfig.after === 'confirm') {
      userPrompt += '\n\n**If user approves, please call step_handover to advance to the next step.**';
    }
    startSessionCheckpoint(sessionID);
    try {
      await pluginClient.session.prompt({
        path: { id: sessionID },
        body: {
          agent: agentId,
          noReply: false,
          parts: [{ type: 'text', text: userPrompt }],
        },
      });
    } catch (err) {
      console.error('[AET] Step after hook error:', err.message);
    }
  }
}

async function advanceToNextStep(sessionID, agentId, agentConfig, checkpointID, stage, context) {
  if (!checkpointManager || !checkpointID) {
    return;
  }

  const currentStepInfo = checkpointManager.getCurrentStep(checkpointID, stage);
  if (!currentStepInfo) {
    return;
  }

  const stepConfigs = agentConfig.step_workflow || [];
  const currentIdx = stepConfigs.findIndex(s => (s.step_id || s.name) === currentStepInfo.stepId);
  const nextStepConfig = stepConfigs[currentIdx + 1];

  if (!nextStepConfig) {
    // 所有步骤完成
    checkpointManager.completeAllSteps(checkpointID, stage);
    return;
  }

  const nextStepId = nextStepConfig.step_id || nextStepConfig.name;

  // 推进到下一步
  checkpointManager.advanceStep(checkpointID, stage, nextStepId, context);

  // 检查 before hook
  if (!nextStepConfig.before || nextStepConfig.before === 'auto') {
    sendStepPrompt(sessionID, agentId, checkpointID, stage, nextStepConfig);
    return;
  }

  const hookConfig = workflowEngine.getHookConfig(nextStepConfig.before);
  if (hookConfig && hookConfig.options && hookConfig.options.length > 0) {
    const description = hookConfig.description || 'Confirm before starting next step';
    const optionsText = hookConfig.options.map(opt => `- ${opt.label}`).join('\n');
    const template = hookConfig.promptTemplate || 'Question: "{description}"\n{options}';
    let userPrompt = template.replace('{description}', description).replace('{options}', optionsText);
    userPrompt += `\n\n即将执行的 Step: **${nextStepConfig.name}**`;
    if (nextStepConfig.before === 'confirm') {
      userPrompt += '\n\n**If user approves, please call step_handover to continue.**';
    }
    startSessionCheckpoint(sessionID);
    try {
      await pluginClient.session.prompt({
        path: { id: sessionID },
        body: {
          agent: agentId,
          noReply: false,
          parts: [{ type: 'text', text: userPrompt }],
        },
      });
    } catch (err) {
      console.error('[AET] Step before hook error:', err.message);
    }
    return;
  }

  sendStepPrompt(sessionID, agentId, checkpointID, stage, nextStepConfig);
}

async function sendStepPrompt(sessionID, agentId, checkpointID, stage, stepConfig) {
  if (!checkpointManager || !checkpointID) return;

  let promptText = `## Please continue executing this step:\n`;
  promptText += `Step name:\n${stepConfig.name}\n`;
  promptText += `Task:\n${stepConfig.description}`;

  startSessionCheckpoint(sessionID);
  try {
    await pluginClient.session.prompt({
      path: { id: sessionID },
      body: {
        agent: agentId,
        noReply: false,
        parts: [{ type: 'text', text: promptText }],
      },
    });
  } catch (err) {
    console.error('[AET] Send step prompt error:', err.message);
  }
}

async function settleIdleRun(sessionID, expectedCheckpointID, stage, workflowRunID) {
  await new Promise(resolve => setTimeout(resolve, IDLE_SETTLE_MS));

  const currentSessionCheckpoint = getCurrentSessionCheckpoint(sessionID);
  if (!currentSessionCheckpoint || currentSessionCheckpoint.checkpointID !== expectedCheckpointID || currentSessionCheckpoint.state !== SessionCheckpointState.PENDING_IDLE) {
    return;
  }

  if (await shouldSkipAfterHook(sessionID, expectedCheckpointID)) {
    closeSessionCheckpoint(sessionID);
    return;
  }

  currentSessionCheckpoint.state = SessionCheckpointState.COMPLETED;
  closeSessionCheckpoint(sessionID);
  await triggerAfterHook(sessionID, stage, workflowRunID);
}

async function settleStepIdleRun(sessionID, expectedCheckpointID, agentId, agentConfig, workflowRunID, stage) {
  await new Promise(resolve => setTimeout(resolve, IDLE_SETTLE_MS));

  const currentSessionCheckpoint = getCurrentSessionCheckpoint(sessionID);
  if (!currentSessionCheckpoint || currentSessionCheckpoint.checkpointID !== expectedCheckpointID || currentSessionCheckpoint.state !== SessionCheckpointState.PENDING_IDLE) {
    return;
  }

  if (await shouldSkipAfterHook(sessionID, expectedCheckpointID)) {
    closeSessionCheckpoint(sessionID);
    return;
  }

  currentSessionCheckpoint.state = SessionCheckpointState.COMPLETED;
  closeSessionCheckpoint(sessionID);
  await triggerStepAfterHook(sessionID, agentId, agentConfig, workflowRunID, stage);
}

function resolveSessionAgent(sessionID, fallbackAgent = null) {
  if (!checkpointManager || !sessionID) {
    return fallbackAgent;
  }
  const agentId = checkpointManager.findAgentBySessionID(sessionID);
  return agentId || fallbackAgent;
}

// ============================================
// Stage Handover
// ============================================

async function executeStageHandover(stage, context, checkpointID, promptForAgent = null) {
  // promptForAgent: 发送给 agent 的 prompt（resume 时用 resumePrompt）
  // context: 保存到 execution 的 context（保持原始值，不应被 resumePrompt 覆盖）
  // 如果没有 promptForAgent，用 context 作为 prompt
  const actualPrompt = promptForAgent || context || `Please continue working on ${stage.agent_id}.`;

  if (!pluginClient || !pluginDirectory) {
    return;
  }

  try {
    const createResult = await pluginClient.session.create({
      body: { title: `${stage.agent_id} - ${stage.agent_id.toUpperCase().replace('-AGENT', '')} Stage` },
      query: { directory: pluginDirectory },
    });
    const newSessionID = createResult.data?.id;

    if (newSessionID) {
      if (!rootSessionID) {
        rootSessionID = newSessionID;
      }

      try {
        await pluginClient.tui.publish({
          body: {
            type: 'tui.session.select',
            properties: { sessionID: newSessionID },
          },
        });
      } catch (tuiErr) {
        // Ignore TUI errors
      }

      // 在 CheckpointManager 中记录 execution（resume 和非 resume 都创建新 execution）
      const stageName = stage.stage_id || stage.agent_id;

      // 获取当前阶段的 execution（用于 resume 同阶段的情况）
      const checkpoint = checkpointManager.getCheckpoint(checkpointID);
      const currentStageExecution = checkpointManager.getCurrentExecution(checkpoint, checkpoint.workflow.currentStage);
      const currentStageSteps = currentStageExecution?.steps || null;
      const currentStageCurrentStep = currentStageExecution?.currentStep || null;

      // 获取目标阶段的 execution（用于 resume 目标阶段的情况）
      const targetStageExecution = checkpointManager.getCurrentExecution(checkpoint, stageName);
      const targetStageSteps = targetStageExecution?.steps || null;
      const targetStageCurrentStep = targetStageExecution?.currentStep || null;

      // 确定 context：优先用传入的 context（agent_handover 传递），其次用目标阶段的 context
      const executionContext = context || targetStageExecution?.context || currentStageExecution?.context;

      // 确定 steps：如果是同一个阶段（resume），用当前阶段的 steps；如果是新阶段，用目标阶段的 steps（如果有）
      const isSameStage = checkpoint.workflow.currentStage === stageName;
      const previousSteps = isSameStage ? currentStageSteps : targetStageSteps;
      const previousCurrentStep = isSameStage ? currentStageCurrentStep : targetStageCurrentStep;

      // 创建新 execution（保留之前的 context）
      checkpointManager.startExecution(checkpointID, stageName, newSessionID, stage.agent_id, executionContext);

      // 初始化 steps
      const agentConfig = configManager.getAgentConfig(stage.agent_id);
      if (agentConfig?.step_workflow && agentConfig.step_workflow.length > 0) {
        // 根据配置初始化所有 steps
        checkpointManager.initSteps(checkpointID, stageName, agentConfig.step_workflow, null);

        // Resume 时，恢复之前的 steps 状态
        if (previousSteps && Object.keys(previousSteps).length > 0) {
          const newExecution = checkpointManager.getCurrentExecution(checkpointManager.getCheckpoint(checkpointID), stageName);
          if (newExecution) {
            // 合并之前的 steps 状态（保留 completed/pending 状态和 context）
            for (const [stepId, stepState] of Object.entries(previousSteps)) {
              if (newExecution.steps[stepId]) {
                newExecution.steps[stepId] = {
                  ...newExecution.steps[stepId],
                  ...stepState,
                };
              }
            }
            // 设置 currentStep
            newExecution.currentStep = previousCurrentStep;
            // 重置当前 step 的 status 为 pending，让 chat.message hook 能正确注入
            if (previousCurrentStep && newExecution.steps[previousCurrentStep]) {
              newExecution.steps[previousCurrentStep] = {
                ...newExecution.steps[previousCurrentStep],
                status: 'pending',
                startedAt: null,
              };
            }
            checkpointManager.saveCheckpoint(checkpointManager.getCheckpoint(checkpointID));
          }
        }
      }

      // 检查 stage.before hook
      if (stage.before) {
        const hookConfig = workflowEngine.getHookConfig(stage.before);
        if (hookConfig && hookConfig.options && hookConfig.options.length > 0) {
          const description = hookConfig.description || 'Please confirm';
          const optionsText = hookConfig.options.map(opt => `- ${opt.label}`).join('\n');
          const template = hookConfig.promptTemplate || 'Question: "{description}"\n{options}';
          let userPrompt = template.replace('{description}', description).replace('{options}', optionsText);
          if (context) {
            userPrompt += `\n\nTask context:\n${context}`;
          }
          if (stage.before === 'confirm') {
            userPrompt += '\n\nIf user approves, please call agent_handover to begin this stage.';
          }

          startSessionCheckpoint(newSessionID);
          await pluginClient.session.prompt({
            path: { id: newSessionID },
            body: {
              agent: stage.agent_id,
              noReply: false,
              parts: [{ type: 'text', text: userPrompt }],
            },
          });
          return;
        }
      }

      // 直接执行，发送 prompt 给 agent
      startSessionCheckpoint(newSessionID);
      await pluginClient.session.prompt({
        path: { id: newSessionID },
        body: {
          agent: stage.agent_id,
          noReply: false,
          parts: [{ type: 'text', text: actualPrompt }],
        },
      });
    }
  } catch (e) {
    console.error('[AET] executeStageHandover error:', e.message);
  }
}

// ============================================
// AET Plugin Export
// ============================================

export const aetPlugin = async ({ client, directory }) => {
  pluginClient = client;
  pluginDirectory = directory;

  // 初始化 CheckpointManager
  checkpointManager = new CheckpointManager(directory);

  return {
    config: async (config) => {
      configManager.reloadConfig(pluginDirectory);

      const agents = {};
      const agentsDir = getAgentsDir();

      if (fs.existsSync(agentsDir)) {
        for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            const indexPath = path.join(agentsDir, entry.name, 'index.js');
            if (fs.existsSync(indexPath)) {
              try {
                const mod = await import(`file://${indexPath}`);
                for (const [key, value] of Object.entries(mod)) {
                  if (key.endsWith('Definition') && value?.name) {
                    agents[value.name] = value;
                  }
                }
              } catch (e) {
                console.error(`[AET] Agent load error: ${entry.name}`, e.message);
              }
            }
          }
        }
      }

      const mappedAgents = {};
      agentHandoverAgents.clear();

      for (const [agentId, agentConfig] of Object.entries(configManager.getAllAgents())) {
        if (typeof agentConfig !== 'object' || agentConfig === null || !agentConfig.name) {
          continue;
        }

        const agentImplName = agentConfig.name;
        const agentImpl = agents[agentImplName];

        if (!agentImpl) {
          continue;
        }

        let prompt = agentImpl.prompt;

        const finalPermissions = {
          question: 'allow',
          ...(agentImpl.permission || {}),
        };

        if (finalPermissions.agent_handover === 'allow') {
          agentHandoverAgents.add(agentId);
          finalPermissions.agent_handover = 'deny';
        }

        mappedAgents[agentId] = {
          name: agentId,
          description: agentImpl.description,
          mode: agentImpl.mode || 'primary',
          prompt,
          permission: finalPermissions,
          ...(agentImpl.hidden !== undefined && { hidden: agentImpl.hidden }),
          ...(agentImpl.color && { color: agentImpl.color }),
        };
      }

      config.agent = {
        ...(config.agent || {}),
        ...mappedAgents,
      };
    },

    "chat.message": async (input, output) => {
      if (input?.sessionID) {
        const sessionID = input.sessionID;
        const sessionAgent = input.agent || null;

        // 获取 workflow 当前阶段的 agent，有就设置，没有就不设置
        let workflowAgent = null;
        if (checkpointManager && currentCheckpointID) {
          const checkpoint = checkpointManager.getCheckpoint(currentCheckpointID);
          if (checkpoint && checkpoint.workflow.status === 'in_progress') {
            const currentStage = checkpoint.workflow.currentStage;
            const execution = checkpointManager.getCurrentExecution(checkpoint, currentStage);
            workflowAgent = execution?.agentId;
          }
        }

        if (workflowAgent && output?.message) {
          output.message.agent = workflowAgent;
        }

        // 正常处理消息
        closeSessionCheckpoint(sessionID);
        startSessionCheckpoint(sessionID);

        // 检查是否从中断恢复
        let targetCheckpointID = currentCheckpointID;
        if (!targetCheckpointID && checkpointManager) {
          targetCheckpointID = checkpointManager.findCheckpointBySessionID(sessionID);
          if (targetCheckpointID) {
            currentCheckpointID = targetCheckpointID;
          }
        }
        if (targetCheckpointID) {
          ensureCheckpointRunning(targetCheckpointID);
        }

        // 使用路由后的 agent
        const finalAgent = output?.message?.agent || sessionAgent;

        try {
          const msgs = await pluginClient.session.messages({ path: { id: sessionID } });
          const msgCount = msgs.data?.length || 0;

          // 如果是第一条消息且有 step_workflow，注入当前 step 信息
          if (msgCount <= 1 && finalAgent && targetCheckpointID) {
            const agentConfig = configManager.getAgentConfig(finalAgent);
            if (agentConfig?.step_workflow && agentConfig.step_workflow.length > 0) {
              const checkpoint = checkpointManager.getCheckpoint(targetCheckpointID);
              const currentStage = checkpoint?.workflow?.currentStage;
              const execution = checkpointManager.getCurrentExecution(checkpoint, currentStage);
              const currentStepId = execution?.currentStep;
              const currentStepState = currentStepId ? execution?.steps[currentStepId] : null;

              // 只有 step status 为 pending 时才注入（避免多进程重复注入）
              if (currentStepState && currentStepState.status === 'pending') {
                const currentStepConfig = agentConfig.step_workflow.find(s => (s.step_id || s.name) === currentStepId);
                if (currentStepConfig) {
                  const stepInfo = `\n\n## Please continue executing this step:\nStep name:\n${currentStepConfig.name}\nTask:\n${currentStepConfig.description}`;

                  // Append to message content
                  if (output?.parts && Array.isArray(output.parts)) {
                    for (const part of output.parts) {
                      if (part.type === 'text') {
                        part.text += stepInfo;
                        break;
                      }
                    }
                  }

                  // 更新 step status 为 in_progress（持久化到文件，避免多进程重复注入）
                  execution.steps[currentStepId] = {
                    ...execution.steps[currentStepId],
                    status: 'in_progress',
                    startedAt: new Date().toISOString(),
                  };
                  checkpoint.history.push({
                    ts: new Date().toISOString(),
                    event: 'step_started',
                    stage: currentStage,
                    executionId: execution.executionId,
                    step: currentStepId,
                  });
                  checkpointManager.saveCheckpoint(checkpoint);
                }
              }
            } else {
              // Agent 没有 step_workflow，注入 execution.context（如果存在）
              const checkpoint = checkpointManager.getCheckpoint(targetCheckpointID);
              const currentStage = checkpoint?.workflow?.currentStage;
              const execution = checkpointManager.getCurrentExecution(checkpoint, currentStage);

              if (execution?.context) {
                const contextInfo = `\n\n## Context from previous stage:\n${execution.context}`;

                // Append to message content
                if (output?.parts && Array.isArray(output.parts)) {
                  for (const part of output.parts) {
                    if (part.type === 'text') {
                      part.text += contextInfo;
                      break;
                    }
                  }
                }
                // 不清空 context，保留用于 resume
              }
            }
          }
        } catch (err) {
          console.error('[AET] chat.message error:', err.message);
        }
      }
    },

    event: async ({ event }) => {
      if (event.type === 'message.updated') {
        const { sessionID, info } = event.properties;
        if (info?.role === 'assistant' && info?.error?.name === 'MessageAbortedError') {
          markSessionCheckpointInterrupted(sessionID);
          // 同时标记 workflow checkpoint 为中断
          if (currentCheckpointID && checkpointManager) {
            checkpointManager.interruptCheckpoint(currentCheckpointID, 'User aborted execution');
          }
        }
        return;
      }

      else if (event.type === 'session.status') {
        const { sessionID, status } = event.properties;
        const sessionAgent = resolveSessionAgent(sessionID, null);
        const sessionCheckpoint = getCurrentSessionCheckpoint(sessionID);

        if (status.type === 'idle') {
          if (sessionCheckpoint?.state === SessionCheckpointState.INTERRUPTED) {
            closeSessionCheckpoint(sessionID);
            return;
          }

          // 检查 workflow 是否被中断（文件持久化状态，跨进程有效）
          if (currentCheckpointID && checkpointManager) {
            const checkpoint = checkpointManager.getCheckpoint(currentCheckpointID);
            if (checkpoint?.workflow?.status === 'interrupted') {
              closeSessionCheckpoint(sessionID);
              return;
            }
            // 检查当前 execution 是否被中断
            const execution = checkpointManager.getCurrentExecution(checkpoint, checkpoint.workflow.currentStage);
            if (execution?.status === 'interrupted') {
              closeSessionCheckpoint(sessionID);
              return;
            }
          }

          // 检查是否在 workflow 中执行
          if (currentCheckpointID && checkpointManager) {
            const checkpoint = checkpointManager.getCheckpoint(currentCheckpointID);
            if (checkpoint && checkpoint.workflow.currentStage) {
              const execution = checkpointManager.getCurrentExecution(checkpoint, checkpoint.workflow.currentStage);
              if (execution && execution.sessionID === sessionID) {
                const agentConfig = configManager.getAgentConfig(sessionAgent);
                const hasSteps = agentConfig?.step_workflow && agentConfig.step_workflow.length > 0;
                const currentStepInfo = checkpointManager.getCurrentStep(currentCheckpointID, checkpoint.workflow.currentStage);

                // 检查是否还有更多步骤
                const hasMoreSteps = currentStepInfo && agentConfig.step_workflow.findIndex(s => (s.step_id || s.name) === currentStepInfo.stepId) < agentConfig.step_workflow.length - 1;

                if (sessionCheckpoint?.state === SessionCheckpointState.RUNNING) {
                  sessionCheckpoint.state = SessionCheckpointState.PENDING_IDLE;
                  const expectedCheckpointID = sessionCheckpoint.checkpointID;
                  if (hasSteps && hasMoreSteps) {
                    void settleStepIdleRun(sessionID, expectedCheckpointID, sessionAgent, agentConfig, currentCheckpointID, checkpoint.workflow.currentStage);
                  } else {
                    // 阶段完成
                    checkpointManager.completeExecution(currentCheckpointID, checkpoint.workflow.currentStage, 'Stage completed');
                    // 获取完整的 stage 配置
                    const stages = workflowEngine.getWorkflowStages(checkpoint.workflow.name);
                    const fullStageConfig = stages.find(s => (s.stage_id || s.agent_id) === checkpoint.workflow.currentStage);
                    void settleIdleRun(sessionID, expectedCheckpointID, fullStageConfig || { agent_id: sessionAgent, stage_id: checkpoint.workflow.currentStage }, currentCheckpointID);
                  }
                  return;
                }

                if (sessionCheckpoint?.state === SessionCheckpointState.PENDING_IDLE) {
                  const expectedCheckpointID = sessionCheckpoint.checkpointID;
                  if (await shouldSkipAfterHook(sessionID, expectedCheckpointID)) {
                    closeSessionCheckpoint(sessionID);
                    return;
                  }
                  sessionCheckpoint.state = SessionCheckpointState.COMPLETED;
                  closeSessionCheckpoint(sessionID);
                  if (hasSteps && hasMoreSteps) {
                    await triggerStepAfterHook(sessionID, sessionAgent, agentConfig, currentCheckpointID, checkpoint.workflow.currentStage);
                  } else {
                    // 获取完整的 stage 配置
                    const stages = workflowEngine.getWorkflowStages(checkpoint.workflow.name);
                    const fullStageConfig = stages.find(s => (s.stage_id || s.agent_id) === checkpoint.workflow.currentStage);
                    const currentIdx = stages.findIndex(s => (s.stage_id || s.agent_id) === checkpoint.workflow.currentStage);
                    const nextStage = stages[currentIdx + 1];
                    if (!nextStage) {
                      // 最后阶段，直接完成 workflow 并归档
                      checkpointManager.completeCheckpoint(currentCheckpointID);
                      currentCheckpointID = null;
                    } else {
                      await triggerAfterHook(sessionID, fullStageConfig || { agent_id: sessionAgent, stage_id: checkpoint.workflow.currentStage }, currentCheckpointID);
                    }
                  }
                }
                return;
              }
            }
          }

          // 不在 workflow 中，单独 agent 执行
          const agentConfig = configManager.getAgentConfig(sessionAgent);
          if (agentConfig?.step_workflow && agentConfig.step_workflow.length > 0) {
            // TODO: 处理单独 agent 的 step workflow
          }

          closeSessionCheckpoint(sessionID);
        }
        else if (status.type === 'busy') {
          if (sessionCheckpoint?.state === SessionCheckpointState.PENDING_IDLE) {
            sessionCheckpoint.state = SessionCheckpointState.RUNNING;
          }
        }
      }
    },

    // Workflow and status tools
    tool: {
      workflow_list: tool({
        description: 'List all available capability scenarios',
        args: {},
        async execute(args, context) {
          const scenarios = configManager.getCapabilityScenarios();

          let lines = [
            '',
            '┌─────────────────────────────────────────────────────────────────────────────────────┐',
            '│                        Available Capability Scenarios                               │',
            '├─────────────────────────────────────────────────────────────────────────────────────┤',
          ];

          for (const [name, workflow] of Object.entries(scenarios)) {
            const desc = workflow.description || '';
            const agentWorkflow = workflow.agent_workflow || [];
            const agents_list = agentWorkflow.map(s => s.agent_id).join(' → ');
            lines.push(`│  ${name.padEnd(12)} │ ${desc.padEnd(40)} │ ${agents_list.padEnd(25)} │`);
          }

          lines.push('└─────────────────────────────────────────────────────────────────────────────────────┘');
          lines.push('');
          lines.push('Use workflow_start({ name: "..." }) to start a capability scenario');
          lines.push('');

          return lines.join('\n');
        },
      }),

      checkpoint_list_active: tool({
        description: '查询当前正在执行和可恢复的任务状态',
        args: {},
        async execute(args, context) {
          if (!checkpointManager) {
            return JSON.stringify({ error: 'CheckpointManager not initialized' }, null, 2);
          }
          return JSON.stringify(checkpointManager.loadIndex(), null, 2);
        },
      }),

      workflow_start: tool({
        description: 'Start a capability scenario. Example: workflow_start({ name: "full", description: "Implement a user login feature" })',
        args: {
          name: tool.schema.string().min(1).describe('Required. Capability scenario name'),
          description: tool.schema.string().min(1).describe('Required. Task description for the first stage agent. Can include newlines.'),
        },
        async execute(args, context) {
          const { name, description: desc } = args;
          if (!name || name.trim().length === 0) {
            return JSON.stringify({ success: false, error: 'name is required' }, null, 2);
          }
          if (!desc || desc.trim().length === 0) {
            return JSON.stringify({ success: false, error: 'description is required' }, null, 2);
          }

          const result = workflowEngine.startWorkflow(name, desc);

          if (result.success) {
            const stages = workflowEngine.getWorkflowStages(name);
            const firstStage = stages[0];
            if (firstStage) {
              await executeStageHandover(firstStage, desc, result.checkpointID);
            }
          }

          return JSON.stringify(result, null, 2);
        },
      }),

      checkpoint_resume: tool({
        description: '恢复指定的 workflow checkpoint',
        args: {
          checkpointID: tool.schema.string().optional().describe('要恢复的 checkpoint ID'),
          stage: tool.schema.string().optional().describe('恢复到指定阶段（可选）'),
          step: tool.schema.string().optional().describe('恢复到指定步骤（可选）'),
        },
        async execute(args, context) {
          if (!checkpointManager) {
            return JSON.stringify({ success: false, error: 'CheckpointManager not initialized' }, null, 2);
          }

          // 如果没有指定 checkpointID，尝试从 interrupted 列表中找最新的
          let targetCheckpointID = args.checkpointID;
          if (!targetCheckpointID) {
            const index = checkpointManager.loadIndex();
            if (index.interrupted.length > 0) {
              targetCheckpointID = index.interrupted[0].checkpointID;
            } else if (index.active.length > 0) {
              targetCheckpointID = index.active[0].checkpointID;
            }
          }

          if (!targetCheckpointID) {
            return JSON.stringify({ success: false, error: 'No checkpoint to resume' }, null, 2);
          }

          const checkpoint = checkpointManager.getCheckpoint(targetCheckpointID);
          if (!checkpoint) {
            return JSON.stringify({ success: false, error: `Checkpoint ${targetCheckpointID} not found` }, null, 2);
          }

          if (checkpoint.workflow.status === 'completed') {
            return JSON.stringify({ success: false, error: 'Checkpoint already completed' }, null, 2);
          }

          // 设置为当前 checkpoint
          currentCheckpointID = targetCheckpointID;

          // 清除 interrupted 状态
          checkpointManager.updateCheckpoint(targetCheckpointID, {
            interruptedAt: null,
            workflow: { status: 'in_progress' },
          });

          // 生成恢复 prompt
          const resumePrompt = checkpointManager.getResumePrompt(targetCheckpointID, args.stage, args.step);
          const targetStage = args.stage || checkpoint.workflow.currentStage;
          const execution = checkpointManager.getCurrentExecution(checkpoint, targetStage);

          // 获取原始 context（从之前的 execution），而不是用 resumePrompt
          const originalContext = execution?.context;

          if (execution) {
            // 恢复到已有的 execution，创建新 session
            await executeStageHandover(
              { agent_id: execution.agentId, stage_id: targetStage },
              originalContext,  // 用原始 context，而不是 resumePrompt
              targetCheckpointID,
              resumePrompt  // resumePrompt 作为单独的参数传递（用于发送给 agent）
            );
          } else {
            // 重新启动该阶段
            const stages = workflowEngine.getWorkflowStages(checkpoint.workflow.name);
            const stageConfig = stages.find(s => (s.stage_id || s.agent_id) === targetStage);
            if (stageConfig) {
              await executeStageHandover(stageConfig, originalContext, targetCheckpointID, resumePrompt);
            }
          }

          return JSON.stringify({
            success: true,
            checkpointID: targetCheckpointID,
            stage: targetStage,
            step: args.step || checkpointManager.getCurrentStepId(checkpoint),
          }, null, 2);
        },
      }),

      agent_handover: tool({
        description: 'Advance to the next agent stage. Example: agent_handover({ context: "Summary: completed design.\nNext: implement the feature based on design." })',
        args: {
          context: tool.schema.string().min(1).describe('Required. Summary of current stage + task for next stage.'),
        },
        async execute(args, context) {
          const { context: ctx } = args;
          if (!ctx || ctx.trim().length === 0) {
            return JSON.stringify({
              success: false,
              error: 'context is required. Please provide: 1) Summary of current stage work. 2) Task for next stage.'
            }, null, 2);
          }

          if (!currentCheckpointID || !checkpointManager) {
            return JSON.stringify({ success: false, error: 'No active workflow' }, null, 2);
          }

          // 如果是从中断恢复，清除中断状态
          ensureCheckpointRunning(currentCheckpointID);

          const checkpoint = checkpointManager.getCheckpoint(currentCheckpointID);
          if (!checkpoint) {
            return JSON.stringify({ success: false, error: 'No active checkpoint' }, null, 2);
          }

          // 标记当前阶段完成
          if (checkpoint.workflow.currentStage) {
            checkpointManager.completeExecution(currentCheckpointID, checkpoint.workflow.currentStage, ctx);
          }

          // 获取下一阶段
          const stages = workflowEngine.getWorkflowStages(checkpoint.workflow.name);
          const currentIdx = stages.findIndex(s => (s.stage_id || s.agent_id) === checkpoint.workflow.currentStage);
          const nextStage = stages[currentIdx + 1];

          if (!nextStage) {
            // Workflow 完成
            checkpointManager.completeCheckpoint(currentCheckpointID);
            currentCheckpointID = null;
            return JSON.stringify({ success: true, done: true, message: 'Workflow completed' }, null, 2);
          }

          await executeStageHandover(nextStage, ctx, currentCheckpointID);

          return JSON.stringify({ success: true, stage: nextStage.agent_id }, null, 2);
        },
      }),

      step_handover: tool({
        description: 'Hand over to the next step within the current agent. Example: step_handover({ context: "Completed platform analysis. Found 3 key requirements." })',
        args: {
          context: tool.schema.string().min(1).describe('Required. Summary of current step work to pass to the next step.'),
        },
        async execute(args, context) {
          const { context: ctx } = args;
          if (!ctx || ctx.trim().length === 0) {
            return JSON.stringify({
              success: false,
              error: 'context is required. Please provide a summary of the current step work.'
            }, null, 2);
          }

          if (!currentCheckpointID || !checkpointManager) {
            return JSON.stringify({ success: false, error: 'No active workflow' }, null, 2);
          }

          // 如果是从中断恢复，清除中断状态
          ensureCheckpointRunning(currentCheckpointID);

          const sessionID = context.sessionID;
          const sessionAgent = resolveSessionAgent(sessionID, null);

          const checkpoint = checkpointManager.getCheckpoint(currentCheckpointID);
          if (!checkpoint || !checkpoint.workflow.currentStage) {
            return JSON.stringify({ success: false, error: 'No active stage' }, null, 2);
          }

          const agentConfig = configManager.getAgentConfig(sessionAgent);
          if (!agentConfig?.step_workflow || agentConfig.step_workflow.length === 0) {
            return JSON.stringify({ success: false, error: 'Current agent has no steps configured' }, null, 2);
          }

          let handoverContext = {};
          try {
            handoverContext = JSON.parse(ctx);
          } catch {
            handoverContext = { summary: ctx };
          }

          await advanceToNextStep(sessionID, sessionAgent, agentConfig, currentCheckpointID, checkpoint.workflow.currentStage, handoverContext);

          const currentStepInfo = checkpointManager.getCurrentStep(currentCheckpointID, checkpoint.workflow.currentStage);
          if (!currentStepInfo) {
            return JSON.stringify({
              success: true,
              done: true,
              message: 'All steps completed'
            }, null, 2);
          }

          return JSON.stringify({ success: true }, null, 2);
        },
      }),
    },
  };
};
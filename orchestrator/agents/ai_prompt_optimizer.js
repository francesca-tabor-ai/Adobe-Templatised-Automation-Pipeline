/**
 * AI Prompt Optimizer Agent: takes generated background images and user prompts,
 * sends them to Gemini's multimodal API (image + text), and produces enhanced
 * cinematic, production-level video prompts.
 *
 * This agent runs AFTER ai_background_generation. It reads each generated background
 * image, analyzes it visually alongside the original prompt, and outputs an enhanced
 * video-ready prompt suitable for tools like Veo, Runway, or After Effects workflows.
 *
 * Follows standard CGVIP agent contract.
 */

var path = require('path');
var fs = require('fs');
var { AIClient } = require('./common/ai_client');
var { CostTracker } = require('./common/ai_cost_tracker');
var { buildPrompt } = require('./common/ai_prompt_builder');
var { parseJsonResponse } = require('./common/ai_response_parser');

var REPO_ROOT = path.resolve(__dirname, '../..');
var OPTIMIZER_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/prompt_optimization.json');
var BRAND_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/brand_style_guide.json');

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return {}; }
}

/**
 * Resolve the file path for a background image ID.
 */
function resolveBackgroundPath(bgId) {
  var aiGenDir = path.join(REPO_ROOT, 'assets/ai_generated');
  // Try PNG first, then JPG
  var pngPath = path.join(aiGenDir, bgId + '.png');
  if (fs.existsSync(pngPath)) return pngPath;
  var jpgPath = path.join(aiGenDir, bgId + '.jpg');
  if (fs.existsSync(jpgPath)) return jpgPath;
  // Try original assets
  var assetsDir = path.join(REPO_ROOT, 'assets');
  pngPath = path.join(assetsDir, bgId + '.png');
  if (fs.existsSync(pngPath)) return pngPath;
  jpgPath = path.join(assetsDir, bgId + '.jpg');
  if (fs.existsSync(jpgPath)) return jpgPath;
  return null;
}

/**
 * Derive aspect ratio string from channel name.
 */
function getAspectRatio(channel) {
  if (!channel) return '16:9';
  if (channel.indexOf('1_1') !== -1 || channel.indexOf('1x1') !== -1) return '1:1';
  if (channel.indexOf('9_16') !== -1 || channel.indexOf('9x16') !== -1) return '9:16';
  if (channel.indexOf('16_9') !== -1 || channel.indexOf('16x9') !== -1) return '16:9';
  if (channel.indexOf('a4') !== -1 || channel.indexOf('print') !== -1) return '3:4';
  return '16:9';
}

/**
 * @param {Object} payload - { records, generatedAssets?, brief? }
 * @param {Object} context - { runId, app, config, aiProvider?, aiBudgetLimit? }
 * @returns {Promise<Object>} Standard AgentResult
 */
async function run(payload, context) {
  context = context || {};
  var reasoningLog = [];
  var errors = [];
  var records = payload.records || [];
  var optimizerConfig = loadJSON(OPTIMIZER_CONFIG_PATH);
  var brandConfig = loadJSON(BRAND_CONFIG_PATH);
  var brief = payload.brief || {};

  if (!optimizerConfig.enabled) {
    reasoningLog.push('AI prompt optimization is disabled in config.');
    return { success: true, approvalState: 'pass', reasoningLog: reasoningLog, errors: [], outputPayload: { records: records } };
  }

  var runId = context.runId || ('aiopt_' + Date.now());
  var budgetLimit = (context.aiBudgetLimit != null) ? context.aiBudgetLimit : (optimizerConfig.budgetLimitPerRunUsd || 5);
  var costTracker = new CostTracker(budgetLimit, runId);
  var providerName = context.aiProvider || optimizerConfig.provider || 'google_gemini';
  var client = new AIClient(providerName);

  if (client.isDryRun()) {
    reasoningLog.push('DRY RUN: No API key set for ' + providerName + '. Using mock enhanced prompts.');
  }

  var optimizedRecords = [];
  var optimizedPrompts = [];

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var bgId = record.background_image_id;
    var imagePath = bgId ? resolveBackgroundPath(bgId) : null;
    var originalPrompt = record.background_prompt || record.headline || 'Product advertisement';

    // Build the optimization prompt
    var promptVars = {
      originalPrompt: originalPrompt,
      channel: record.channel || 'social_16_9',
      aspectRatio: getAspectRatio(record.channel),
      brandName: brandConfig.brandName || 'Brand',
      tone: brief.tone || 'premium, cinematic'
    };
    var prompt = buildPrompt(optimizerConfig.promptTemplate || '', promptVars);

    try {
      costTracker.checkBudget();

      var response;
      if (imagePath) {
        // Multimodal: send image + text to Gemini
        response = await client.generateMultimodal({
          prompt: prompt,
          imagePath: imagePath,
          model: optimizerConfig.model,
          temperature: optimizerConfig.temperature || 0.8,
          maxTokens: optimizerConfig.maxTokensPerRequest || 3000,
          responseFormat: 'json',
          costEstimate: optimizerConfig.costPerRequestUsd || 0.002
        });
      } else {
        // Text-only fallback if no image available
        response = await client.generateText({
          prompt: prompt,
          model: optimizerConfig.model,
          temperature: optimizerConfig.temperature || 0.8,
          maxTokens: optimizerConfig.maxTokensPerRequest || 3000,
          responseFormat: 'json',
          costEstimate: optimizerConfig.costPerRequestUsd || 0.002
        });
      }

      costTracker.record('ai_prompt_optimizer', record.variant_id, response.cost, optimizerConfig.model, 'optimize_prompt');

      var parsed;
      try {
        parsed = parseJsonResponse(response.text);
      } catch (parseErr) {
        // If JSON parsing fails, use the raw text as the video prompt
        parsed = { video_prompt: response.text };
      }

      // Build updated record
      var updatedRecord = {};
      var keys = Object.keys(record);
      for (var ki = 0; ki < keys.length; ki++) updatedRecord[keys[ki]] = record[keys[ki]];

      updatedRecord.video_prompt = parsed.video_prompt || response.text;
      updatedRecord.video_camera_movement = parsed.camera_movement || null;
      updatedRecord.video_lighting = parsed.lighting || null;
      updatedRecord.video_color_grade = parsed.color_grade || null;
      updatedRecord.video_duration_seconds = parsed.duration_seconds || null;
      updatedRecord.video_style_reference = parsed.style_reference || null;
      updatedRecord.prompt_optimized = true;

      optimizedRecords.push(updatedRecord);
      optimizedPrompts.push({
        variant_id: record.variant_id,
        original_prompt: originalPrompt,
        video_prompt: updatedRecord.video_prompt,
        camera_movement: updatedRecord.video_camera_movement,
        lighting: updatedRecord.video_lighting,
        color_grade: updatedRecord.video_color_grade,
        duration_seconds: updatedRecord.video_duration_seconds,
        style_reference: updatedRecord.video_style_reference,
        had_image: !!imagePath,
        model: optimizerConfig.model,
        cost_usd: response.cost
      });

      var promptPreview = (updatedRecord.video_prompt || '').substring(0, 80);
      reasoningLog.push(record.variant_id + ': optimized' + (imagePath ? ' (with image)' : ' (text-only)') + ' -> "' + promptPreview + '..."');
    } catch (err) {
      errors.push('[' + record.variant_id + '] prompt optimization: ' + err.message);
      reasoningLog.push(record.variant_id + ': optimization failed - ' + err.message);
      optimizedRecords.push(record);
    }
  }

  // Write approval queue
  var approvalDir = path.join(REPO_ROOT, 'data/approval/ai_review');
  if (!fs.existsSync(approvalDir)) fs.mkdirSync(approvalDir, { recursive: true });
  var approvalFile = path.join(approvalDir, runId + '_prompts.json');
  fs.writeFileSync(approvalFile, JSON.stringify({
    runId: runId,
    agentId: 'ai_prompt_optimizer',
    generatedAt: new Date().toISOString(),
    status: 'pending_review',
    itemCount: optimizedPrompts.length,
    items: optimizedPrompts
  }, null, 2), 'utf8');

  // Write cost report
  var aiOutputDir = path.join(REPO_ROOT, 'output/ai');
  costTracker.writeReport(aiOutputDir);

  reasoningLog.push('Total: ' + optimizedPrompts.length + ' prompts optimized. Cost: $' + costTracker.getTotal().toFixed(4));
  reasoningLog.push('Approval queue: ' + approvalFile);

  return {
    success: true,
    approvalState: 'warning',
    reasoningLog: reasoningLog,
    errors: errors,
    outputPayload: {
      records: optimizedRecords,
      optimizedPrompts: optimizedPrompts,
      approvalFile: approvalFile,
      aiTotalCostUsd: costTracker.getTotal()
    }
  };
}

module.exports = { run: run };

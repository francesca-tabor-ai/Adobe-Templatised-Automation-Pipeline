/**
 * AI Background Generation Agent: generates background image variations using
 * Google Imagen API (or other providers). Constructs prompts from brand style guide
 * and channel context. Saves generated images to assets/ai_generated/.
 * Follows standard CGVIP agent contract.
 */

var path = require('path');
var fs = require('fs');
var { AIClient } = require('./common/ai_client');
var { CostTracker } = require('./common/ai_cost_tracker');
var { buildPrompt } = require('./common/ai_prompt_builder');

var REPO_ROOT = path.resolve(__dirname, '../..');
var IMAGE_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/image_generation.json');
var BRAND_CONFIG_PATH = path.join(REPO_ROOT, 'config/ai/brand_style_guide.json');
var CHANNELS_PATH = path.join(REPO_ROOT, 'config/channels.json');

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) { return {}; }
}

/**
 * Resolve image dimensions for a given channel.
 */
function getResolution(imageConfig, channelsConfig, channel) {
  // Check channel-specific override in image config
  if (imageConfig.resolutionByChannel && imageConfig.resolutionByChannel[channel]) {
    return imageConfig.resolutionByChannel[channel];
  }
  // Check channels.json
  if (channelsConfig.channels && channelsConfig.channels[channel]) {
    var ch = channelsConfig.channels[channel];
    return { width: ch.width, height: ch.height };
  }
  // Default
  return imageConfig.defaultResolution || { width: 1920, height: 1080 };
}

/**
 * @param {Object} payload - { records, brandStyleGuide? }
 * @param {Object} context - { runId, app, config, aiProvider?, aiBudgetLimit? }
 * @returns {Promise<Object>} Standard AgentResult
 */
async function run(payload, context) {
  context = context || {};
  var reasoningLog = [];
  var errors = [];
  var records = payload.records || [];
  var imageConfig = loadJSON(IMAGE_CONFIG_PATH);
  var brandConfig = payload.brandStyleGuide || loadJSON(BRAND_CONFIG_PATH);
  var channelsConfig = loadJSON(CHANNELS_PATH);

  if (!imageConfig.enabled) {
    reasoningLog.push('AI background generation is disabled in config.');
    return { success: true, approvalState: 'pass', reasoningLog: reasoningLog, errors: [], outputPayload: { records: records } };
  }

  var runId = context.runId || ('aibg_' + Date.now());
  var budgetLimit = (context.aiBudgetLimit != null) ? context.aiBudgetLimit : (imageConfig.budgetLimitPerRunUsd || 10);
  var costTracker = new CostTracker(budgetLimit, runId);
  var providerName = context.aiProvider || imageConfig.provider || 'google_gemini';
  var client = new AIClient(providerName);

  if (client.isDryRun()) {
    reasoningLog.push('DRY RUN: No API key set for ' + providerName + '. Using mock placeholder images.');
  }

  var outputDir = path.join(REPO_ROOT, imageConfig.outputDir || 'assets/ai_generated');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  var generatedAssets = [];
  var updatedRecords = [];

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var channel = record.channel || 'social_1_1';
    var resolution = getResolution(imageConfig, channelsConfig, channel);
    var timestamp = Date.now();
    var newBgId = 'bg_ai_' + (record.variant_id || 'v' + i) + '_' + timestamp;
    var outputPath = path.join(outputDir, newBgId + '.' + (imageConfig.outputFormat || 'png'));

    // Build prompt from brand style guide template
    var promptTemplate = brandConfig.backgroundPromptTemplate || 'Professional background for {{channel}} advertisement. Style: {{styleKeywords}}.';
    var promptVars = {
      photographyStyle: brandConfig.photographyStyle || '',
      channel: channel,
      colorPalette: brandConfig.colorPalette || {},
      styleKeywords: (brandConfig.styleKeywords || []).join(', '),
      productContext: record.headline || 'product advertisement',
      avoidKeywords: (brandConfig.avoidKeywords || []).join(', '),
      negativePromptDefaults: imageConfig.negativePromptDefaults || ''
    };
    var prompt = buildPrompt(promptTemplate, promptVars);

    // Add custom background prompt from record if present
    if (record.background_prompt) {
      prompt = record.background_prompt + '. ' + prompt;
    }

    try {
      costTracker.checkBudget();
      var result = await client.generateImage({
        prompt: prompt,
        model: imageConfig.model,
        width: resolution.width,
        height: resolution.height,
        negativePrompt: imageConfig.negativePromptDefaults,
        outputPath: outputPath,
        safetyFilterLevel: imageConfig.safetyFilterLevel,
        costEstimate: imageConfig.costPerImageUsd || 0.04
      });

      costTracker.record('ai_background_generation', record.variant_id, result.cost, imageConfig.model, 'generate_background');

      generatedAssets.push({
        variant_id: record.variant_id,
        original_background_id: record.background_image_id,
        generated_background_id: newBgId,
        prompt_used: prompt,
        file_path: result.filePath || outputPath,
        model: imageConfig.model,
        cost_usd: result.cost
      });

      // Update record with new background ID
      var updatedRecord = {};
      var keys = Object.keys(record);
      for (var ki = 0; ki < keys.length; ki++) updatedRecord[keys[ki]] = record[keys[ki]];
      updatedRecord.background_image_id = newBgId;
      updatedRecord.background_prompt = prompt;
      updatedRecord.ai_generation_run_id = runId;
      updatedRecords.push(updatedRecord);

      reasoningLog.push(record.variant_id + ': generated background ' + newBgId + ' (' + resolution.width + 'x' + resolution.height + ')');
    } catch (err) {
      errors.push('[' + record.variant_id + '] background: ' + err.message);
      reasoningLog.push(record.variant_id + ': background generation failed - ' + err.message);
      // Keep original record unchanged
      updatedRecords.push(record);
    }
  }

  // Write approval queue
  var approvalDir = path.join(REPO_ROOT, 'data/approval/ai_review');
  if (!fs.existsSync(approvalDir)) fs.mkdirSync(approvalDir, { recursive: true });
  var approvalFile = path.join(approvalDir, runId + '_backgrounds.json');
  fs.writeFileSync(approvalFile, JSON.stringify({
    runId: runId,
    agentId: 'ai_background_generation',
    generatedAt: new Date().toISOString(),
    status: 'pending_review',
    itemCount: generatedAssets.length,
    items: generatedAssets
  }, null, 2), 'utf8');

  // Write cost report
  var aiOutputDir = path.join(REPO_ROOT, 'output/ai');
  costTracker.writeReport(aiOutputDir);

  reasoningLog.push('Total: ' + generatedAssets.length + ' backgrounds generated. Cost: $' + costTracker.getTotal().toFixed(4));
  reasoningLog.push('Approval queue: ' + approvalFile);

  return {
    success: true,
    approvalState: 'warning',
    reasoningLog: reasoningLog,
    errors: errors,
    outputPayload: {
      records: updatedRecords,
      generatedAssets: generatedAssets,
      approvalFile: approvalFile,
      aiTotalCostUsd: costTracker.getTotal()
    }
  };
}

module.exports = { run: run };

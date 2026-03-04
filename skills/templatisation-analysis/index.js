/**
 * Templatisation Analysis skill: reverse engineers creative assets, classifies elements, logs ambiguities.
 * Stories: A1, A2, A3
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-analysis',
  name: 'Creative Analysis',
  phase: 1,
  description: 'Analyses original creative files to produce position measurements, colour samples, layer map, and element classification',
  dependsOn: ['templatisation-workspace'],
  gates: []
};

/**
 * @param {Object} payload - { projectConfig, workspaceDir? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'analysis');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const layers = (projectConfig.assets && projectConfig.assets.layers) || [];
  const classificationRules = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'element-classification.json'), 'utf8'));

  // A1 — Reverse engineer: produce position measurements, colour samples, layer map
  const layerMap = [];
  const positionMeasurements = [];
  const colourSamples = [];

  for (const layer of layers) {
    const layerEntry = {
      name: layer.name,
      type: layer.type || 'unknown',
      visible: layer.visible !== false,
      bounds: layer.bounds || null
    };
    layerMap.push(layerEntry);

    if (layer.bounds) {
      positionMeasurements.push({
        layer: layer.name,
        x: layer.bounds.x || 0,
        y: layer.bounds.y || 0,
        width: layer.bounds.width || 0,
        height: layer.bounds.height || 0
      });
    }

    if (layer.colour || layer.color) {
      colourSamples.push({
        layer: layer.name,
        colour: layer.colour || layer.color
      });
    }
  }

  const layerMapPath = path.join(outputDir, 'layer-map.json');
  fs.writeFileSync(layerMapPath, JSON.stringify(layerMap, null, 2), 'utf8');
  artifacts[layerMapPath] = 'Layer map';
  reasoningLog.push(`Layer map generated with ${layerMap.length} layers`);

  const positionsPath = path.join(outputDir, 'position-measurements.json');
  fs.writeFileSync(positionsPath, JSON.stringify(positionMeasurements, null, 2), 'utf8');
  artifacts[positionsPath] = 'Position measurements';

  const coloursPath = path.join(outputDir, 'colour-samples.json');
  fs.writeFileSync(coloursPath, JSON.stringify(colourSamples, null, 2), 'utf8');
  artifacts[coloursPath] = 'Colour samples';

  // A2 — Classify sacred vs flexible elements
  const classification = { sacred: [], flexible: [], sku: [], unclassified: [] };
  const ambiguities = [];

  for (const layer of layerMap) {
    const nameLower = layer.name.toLowerCase();
    let classified = false;

    // Check sacred patterns
    for (const pattern of classificationRules.sacred.patterns) {
      if (nameLower.includes(pattern)) {
        classification.sacred.push({ name: layer.name, matchedPattern: pattern });
        classified = true;
        break;
      }
    }
    // Check sacred prefixes
    if (!classified) {
      for (const prefix of classificationRules.sacred.layerPrefixes) {
        if (layer.name.startsWith(prefix)) {
          classification.sacred.push({ name: layer.name, matchedPrefix: prefix });
          classified = true;
          break;
        }
      }
    }

    // Check SKU patterns
    if (!classified) {
      for (const pattern of classificationRules.sku.patterns) {
        if (nameLower.includes(pattern)) {
          classification.sku.push({ name: layer.name, matchedPattern: pattern });
          classified = true;
          break;
        }
      }
    }
    if (!classified) {
      for (const prefix of classificationRules.sku.layerPrefixes) {
        if (layer.name.startsWith(prefix)) {
          classification.sku.push({ name: layer.name, matchedPrefix: prefix });
          classified = true;
          break;
        }
      }
    }

    // Check flexible patterns
    if (!classified) {
      for (const pattern of classificationRules.flexible.patterns) {
        if (nameLower.includes(pattern)) {
          classification.flexible.push({ name: layer.name, matchedPattern: pattern });
          classified = true;
          break;
        }
      }
    }
    if (!classified) {
      for (const prefix of classificationRules.flexible.layerPrefixes) {
        if (layer.name.startsWith(prefix)) {
          classification.flexible.push({ name: layer.name, matchedPrefix: prefix });
          classified = true;
          break;
        }
      }
    }

    // A3 — Log ambiguity if unclassified
    if (!classified) {
      classification.unclassified.push({ name: layer.name });
      ambiguities.push({
        elementId: layer.name,
        description: `Layer "${layer.name}" could not be auto-classified as sacred, flexible, or SKU`,
        suggestedClassification: null,
        confidence: 0,
        requiresManualReview: true
      });
    }
  }

  const classificationPath = path.join(outputDir, 'element-classification-result.json');
  fs.writeFileSync(classificationPath, JSON.stringify(classification, null, 2), 'utf8');
  artifacts[classificationPath] = 'Element classification result';
  reasoningLog.push(`Classified: ${classification.sacred.length} sacred, ${classification.flexible.length} flexible, ${classification.sku.length} SKU, ${classification.unclassified.length} unclassified`);

  // A3 — Write ambiguity log
  const ambiguityLogPath = path.join(outputDir, 'ambiguity-log.json');
  fs.writeFileSync(ambiguityLogPath, JSON.stringify({ entries: ambiguities }, null, 2), 'utf8');
  artifacts[ambiguityLogPath] = 'Ambiguity log';
  if (ambiguities.length > 0) {
    reasoningLog.push(`${ambiguities.length} ambiguities logged for manual review`);
  }

  return {
    success: true,
    approvalState: ambiguities.length > 0 ? 'warning' : 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      analysisDir: outputDir,
      layerMap,
      classification,
      ambiguities,
      positionMeasurements,
      colourSamples
    },
    artifacts
  };
}

module.exports = { run, meta };

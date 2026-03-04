/**
 * Templatisation Multi-SKU skill: defines SKU architecture, format-SKU matrix, and smart object substitution map.
 * Stories: S1, S2
 * Conditional: activated when project.skuCount > 1
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-multisku',
  name: 'Multi-SKU Variants',
  phase: 3,
  description: 'Defines SKU swap architecture, format-SKU matrix, and smart object substitution map',
  dependsOn: ['templatisation-guardrails'],
  gates: [
    { field: 'project.skuCount', operator: 'greaterThan', value: 1 }
  ]
};

/**
 * @param {Object} payload - { projectConfig, framework? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'multisku');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const skuRules = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'sku-variant-rules.json'), 'utf8'));
  const skuCount = (projectConfig.project && projectConfig.project.skuCount) || 1;
  const formats = projectConfig.formats || [];
  const framework = payload.framework || { sku: { elements: [] } };

  // S2 — Define SKU architecture
  const skuArchitecture = {
    decision: skuCount <= 5 ? 'single_template_multi_smart_object' : 'multi_template_sku_groups',
    description: skuCount <= 5
      ? 'Single master template with Smart Object layers per SKU — all products swap within one PSD'
      : 'Multiple template groups to handle large SKU sets efficiently',
    skuCount
  };

  const archPath = path.join(outputDir, 'sku-architecture-decision.json');
  fs.writeFileSync(archPath, JSON.stringify(skuArchitecture, null, 2), 'utf8');
  artifacts[archPath] = 'SKU architecture decision';
  reasoningLog.push(`SKU architecture: ${skuArchitecture.decision} for ${skuCount} SKUs`);

  // Format-SKU matrix
  const formatSkuMatrix = formats.map(format => {
    const applicableSkus = [];
    for (let i = 1; i <= skuCount; i++) {
      const skuId = `sku_${String(i).padStart(3, '0')}`;
      if (format.skuApplicability === 'all' || format.skuApplicability === skuId) {
        applicableSkus.push(skuId);
      }
    }
    return {
      formatId: format.id,
      formatName: format.name,
      applicableSkus,
      variantCount: applicableSkus.length
    };
  });

  const matrixPath = path.join(outputDir, 'format-sku-matrix.json');
  fs.writeFileSync(matrixPath, JSON.stringify(formatSkuMatrix, null, 2), 'utf8');
  artifacts[matrixPath] = 'Format-SKU matrix';
  const totalVariants = formatSkuMatrix.reduce((sum, f) => sum + f.variantCount, 0);
  reasoningLog.push(`Format-SKU matrix: ${formatSkuMatrix.length} formats × ${skuCount} SKUs = ${totalVariants} variants`);

  // Smart object substitution map
  const skuElements = framework.sku ? framework.sku.elements : [];
  const substitutionMap = skuElements.map(element => ({
    layerName: element.suggestedLayerName || element.name,
    smartObjectType: 'linked',
    substitutionPattern: skuRules.smartObjectMapping['SKU_PRODUCT'] || '{{sku.imageId}}',
    namingPattern: (skuRules.variantNaming || '{{base}}_SKU{{skuIndex}}')
  }));

  const subMapPath = path.join(outputDir, 'smart-object-substitution-map.json');
  fs.writeFileSync(subMapPath, JSON.stringify(substitutionMap, null, 2), 'utf8');
  artifacts[subMapPath] = 'Smart object substitution map';
  reasoningLog.push(`${substitutionMap.length} SKU layers mapped for smart object substitution`);

  // Decision owner map
  const decisionOwnerMap = {
    skuArchitecture: 'production_owner',
    formatApplicability: 'creative_owner',
    skuImageApproval: 'brand_guardian'
  };

  const ownerPath = path.join(outputDir, 'decision-owner-map.json');
  fs.writeFileSync(ownerPath, JSON.stringify(decisionOwnerMap, null, 2), 'utf8');
  artifacts[ownerPath] = 'Decision owner map';

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      multiskuDir: outputDir,
      skuArchitecture,
      formatSkuMatrix,
      substitutionMap,
      decisionOwnerMap
    },
    artifacts
  };
}

module.exports = { run, meta };

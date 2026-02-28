/**
 * Entry: JSON-driven Smart Object substitution + export. Run from Photoshop.
 * Reads JSON, optionally filters by approved, substitutes layers, exports per variant.
 */

(function () {
  #include '../lib/utils.jsx'
  #include 'smart_object_batch.jsx'

  var jsonPath, templatePath, outputFolder, approvedOnly;
  if (typeof $.fileName !== 'undefined') {
    var scriptFolder = new File($.fileName).parent;
    var repoRoot = scriptFolder.parent.parent;
    jsonPath = repoRoot.fsName + '/data/sample/variants.json';
    templatePath = repoRoot.fsName + '/templates/photoshop/master.psd';
    outputFolder = repoRoot.fsName + '/output/photoshop';
    approvedOnly = false;
  }

  var args = [];
  if (typeof arguments !== 'undefined' && arguments.length >= 3) {
    args = [].slice.call(arguments);
  }
  if (args[0]) jsonPath = args[0];
  if (args[1]) templatePath = args[1];
  if (args[2]) outputFolder = args[2];
  if (args[3] !== undefined) approvedOnly = !!args[3];

  var jsonFile = new File(jsonPath);
  if (!jsonFile.exists) {
    alert('JSON not found: ' + jsonPath);
    return;
  }

  var variants = parseJSON(readFile(jsonFile));
  if (!(variants instanceof Array)) variants = [variants];
  if (approvedOnly) {
    variants = variants.filter(function (v) { return parseBool(v.approved); });
  }
  if (variants.length === 0) {
    alert('No variants to process (or none approved).');
    return;
  }

  var templateFile = new File(templatePath);
  if (!templateFile.exists) {
    alert('Template not found: ' + templatePath);
    return;
  }

  var outDir = new File(outputFolder);
  if (!outDir.exists) outDir.create();

  var manifest = [];
  var assetBasePath = (typeof $ !== 'undefined' && $.fileName) ? new File($.fileName).parent.parent.parent.fsName + '/assets' : '';

  function resolveAsset(id, map) {
    if (map && map[id]) return map[id];
    if (assetBasePath && id) return assetBasePath + '/' + id + '.jpg';
    return null;
  }

  for (var i = 0; i < variants.length; i++) {
    var rec = variants[i];
    var vid = (rec.variant_id || 'variant_' + (i + 1)).replace(/[^a-zA-Z0-9_-]/g, '_');
    var errors = [];
    var paths = [];
    try {
      app.open(templateFile);
      var doc = app.activeDocument;

      var productPath = resolveAsset(rec.product_image_id, {});
      var bgPath = resolveAsset(rec.background_image_id, {});

      if (productPath) {
        var productLayer = findLayerByName(doc, 'PRODUCT_SMART') || findLayerByName(doc, 'product');
        if (productLayer && isSmartObject(productLayer)) {
          app.activeDocument.activeLayer = productLayer;
          if (!replaceSmartObjectContents(productPath)) errors.push('Missing product image: ' + rec.product_image_id);
        }
      }
      if (bgPath) {
        var bgLayer = findLayerByName(doc, 'BACKGROUND_SMART') || findLayerByName(doc, 'background');
        if (bgLayer && isSmartObject(bgLayer)) {
          app.activeDocument.activeLayer = bgLayer;
          if (!replaceSmartObjectContents(bgPath)) errors.push('Missing background: ' + rec.background_image_id);
        }
      }

      var headlineLayer = findLayerByName(doc, 'HEADLINE_TEXT') || findLayerByName(doc, 'headline');
      if (headlineLayer) setTextLayerContent(headlineLayer, rec.headline || '');
      var ctaLayer = findLayerByName(doc, 'CTA_TEXT') || findLayerByName(doc, 'cta');
      if (ctaLayer) setTextLayerContent(ctaLayer, rec.cta || '');
      var disclaimerLayer = findLayerByName(doc, 'DISCLAIMER_TEXT') || findLayerByName(doc, 'disclaimer');
      if (disclaimerLayer) setTextLayerContent(disclaimerLayer, rec.legal_disclaimer_id || '');

      var outPath = outputFolder + '/' + vid + '.png';
      exportAsPNG(doc, outPath);
      paths.push(outPath);
      doc.close(SaveOptions.DONOTSAVECHANGES);
      manifest.push({
        variant_id: rec.variant_id,
        status: errors.length ? 'warning' : 'ok',
        path: outPath,
        paths: paths,
        errors: errors
      });
    } catch (e) {
      manifest.push({
        variant_id: rec.variant_id,
        status: 'fail',
        path: '',
        paths: [],
        errors: [e.message]
      });
      try { if (app.documents.length) app.activeDocument.close(SaveOptions.DONOTSAVECHANGES); } catch (e2) {}
    }
  }

  var manifestPath = outputFolder + '/manifest.json';
  writeFile(manifestPath, stringifyJSON(manifest));
  if (typeof alert !== 'undefined') {
    alert('Done. Processed ' + manifest.length + ' variant(s). Manifest: ' + manifestPath);
  }
})();

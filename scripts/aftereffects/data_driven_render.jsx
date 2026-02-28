/**
 * After Effects: set comp text from record, choose comp by aspect ratio, apply render settings.
 * Uses comp's text layers by name (HEADLINE, CTA, DISCLAIMER) or Essential Graphics if available.
 */

/**
 * Find a layer in comp by name (case-insensitive).
 * @param {CompItem} comp
 * @param {string} namePart
 * @returns {AVLayer|null}
 */
function findLayerByName(comp, namePart) {
  var search = (namePart || '').toLowerCase();
  for (var i = 1; i <= comp.numLayers; i++) {
    var layer = comp.layer(i);
    if ((layer.name || '').toLowerCase().indexOf(search) >= 0) return layer;
  }
  return null;
}

/**
 * Set text layer source text.
 * @param {AVLayer} layer
 * @param {string} text
 */
function setLayerSourceText(layer, text) {
  try {
    var prop = layer.property('ADBE Text Properties');
    if (!prop) prop = layer.property('Source Text');
    if (prop) {
      var doc = prop.value;
      if (doc && typeof doc.text !== 'undefined') {
        doc.text = text || '';
        prop.setValue(doc);
      } else {
        prop.setValue(new TextDocument(text || ''));
      }
    }
  } catch (e) {
    try {
      layer.property('Source Text').setValue(new TextDocument(text || ''));
    } catch (e2) {}
  }
}

/**
 * Apply variant record to comp: set headline, CTA, disclaimer text layers.
 * @param {CompItem} comp
 * @param {Object} record
 */
function applyRecordToComp(comp, record) {
  var headlineLayer = findLayerByName(comp, 'HEADLINE') || findLayerByName(comp, 'headline');
  if (headlineLayer) setLayerSourceText(headlineLayer, record.headline || '');
  var ctaLayer = findLayerByName(comp, 'CTA') || findLayerByName(comp, 'cta');
  if (ctaLayer) setLayerSourceText(ctaLayer, record.cta || '');
  var disclaimerLayer = findLayerByName(comp, 'DISCLAIMER') || findLayerByName(comp, 'disclaimer');
  if (disclaimerLayer) setLayerSourceText(disclaimerLayer, record.legal_disclaimer_id || '');
}

/**
 * Get comp by name or by aspect ratio (e.g. "16:9" -> "Comp_16x9").
 * @param {Project} project
 * @param {string} compNameOrRatio
 * @param {Object} [channelMap] - e.g. { "16:9": "Comp_16x9" }
 * @returns {CompItem|null}
 */
function getCompForRender(project, compNameOrRatio, channelMap) {
  var name = compNameOrRatio;
  if (channelMap && channelMap[compNameOrRatio]) name = channelMap[compNameOrRatio];
  for (var i = 1; i <= project.numItems; i++) {
    var item = project.item(i);
    if (item instanceof CompItem && item.name === name) return item;
  }
  if (project.numItems > 0 && project.item(1) instanceof CompItem) return project.item(1);
  return null;
}

/**
 * Add comp to render queue and set output file.
 * @param {CompItem} comp
 * @param {File|string} outputFile
 * @param {string} [templateName] - e.g. "H.264"
 */
function queueCompForRender(comp, outputFile, templateName) {
  var f = outputFile instanceof File ? outputFile : new File(outputFile);
  if (f.parent && !f.parent.exists) f.parent.create();
  var rq = app.project.renderQueue.items.add(comp);
  var om = rq.outputModule(1);
  om.file = f;
  if (templateName) {
    try { om.applyTemplate(templateName); } catch (e) {}
  }
  return rq;
}

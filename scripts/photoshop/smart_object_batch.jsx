/**
 * Helpers: replace Smart Object by path, set text layer content, export.
 * Photoshop ExtendScript. Uses placedLayerReplaceContents for Smart Objects.
 */

/**
 * Replace the contents of the active layer (must be a Smart Object) with the image at filePath.
 * @param {string|File} filePath
 * @returns {boolean} success
 */
function replaceSmartObjectContents(filePath) {
  var f = filePath instanceof File ? filePath : new File(filePath);
  if (!f.exists) return false;
  try {
    var desc = new ActionDescriptor();
    desc.putPath(charIDToTypeID('null'), f);
    executeAction(stringIDToTypeID('placedLayerReplaceContents'), desc, DialogModes.NO);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Find a layer by name (case-insensitive, searches recursively in groups).
 * @param {Document} doc
 * @param {string} name
 * @returns {Layer|null}
 */
function findLayerByName(doc, name) {
  var search = (name || '').toLowerCase();
  function scan(layers) {
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if ((layer.name || '').toLowerCase().indexOf(search) >= 0) return layer;
      if (layer.typename === 'LayerSet') {
        var found = scan(layer.layers);
        if (found) return found;
      }
    }
    return null;
  }
  return scan(doc.layers);
}

/**
 * Set text layer content. Layer must be a text layer.
 * @param {Layer} layer
 * @param {string} text
 */
function setTextLayerContent(layer, text) {
  if (!layer || layer.kind !== LayerKind.TEXT) return;
  layer.textItem.contents = text || '';
}

/**
 * Check if layer is a Smart Object.
 * @param {Layer} layer
 * @returns {boolean}
 */
function isSmartObject(layer) {
  if (!layer) return false;
  try {
    return layer.kind === LayerKind.SMARTOBJECT;
  } catch (e) {
    return false;
  }
}

/**
 * Export document as PNG to path.
 * @param {Document} doc
 * @param {string|File} outputPath
 */
function exportAsPNG(doc, outputPath) {
  var f = outputPath instanceof File ? outputPath : new File(outputPath);
  if (f.parent && !f.parent.exists) f.parent.create();
  var opts = new PNGSaveOptions();
  opts.compression = 6;
  doc.saveAs(f, opts, true, Extension.LOWERCASE);
}

/**
 * Export document as JPEG to path.
 * @param {Document} doc
 * @param {string|File} outputPath
 * @param {number} [quality=12] 1-12
 */
function exportAsJPEG(doc, outputPath, quality) {
  var f = outputPath instanceof File ? outputPath : new File(outputPath);
  if (f.parent && !f.parent.exists) f.parent.create();
  var opts = new JPEGSaveOptions();
  opts.quality = quality || 12;
  doc.saveAs(f, opts, true, Extension.LOWERCASE);
}

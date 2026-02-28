/**
 * Entry: load data feed (CSV or JSON), set EG/text per record, queue render, write manifest. Run from After Effects.
 */

(function () {
  #include '../lib/utils.jsx'
  #include 'data_driven_render.jsx'

  var projectPath, dataPath, outputFolder, approvedOnly;
  if (typeof $.fileName !== 'undefined') {
    var scriptFolder = new File($.fileName).parent;
    var repoRoot = scriptFolder.parent.parent;
    projectPath = repoRoot.fsName + '/templates/aftereffects/master.aep';
    dataPath = repoRoot.fsName + '/data/sample/variants.json';
    outputFolder = repoRoot.fsName + '/output/aftereffects';
    approvedOnly = false;
  }

  var args = [];
  if (typeof arguments !== 'undefined' && arguments.length >= 3) {
    args = [].slice.call(arguments);
  }
  if (args[0]) projectPath = args[0];
  if (args[1]) dataPath = args[1];
  if (args[2]) outputFolder = args[2];
  if (args[3] !== undefined) approvedOnly = !!args[3];

  var dataFile = new File(dataPath);
  if (!dataFile.exists) {
    alert('Data file not found: ' + dataPath);
    return;
  }

  var records = [];
  var ext = (dataFile.name || '').toLowerCase();
  if (ext.indexOf('.json') >= 0) {
    records = parseJSON(readFile(dataFile));
    if (!(records instanceof Array)) records = [records];
  } else {
    records = parseCSV(readFile(dataFile));
  }
  if (approvedOnly) {
    records = records.filter(function (r) { return parseBool(r.approved); });
  }
  if (records.length === 0) {
    alert('No records to render (or none approved).');
    return;
  }

  var projectFile = new File(projectPath);
  if (!projectFile.exists) {
    alert('Project not found: ' + projectPath);
    return;
  }

  var outDir = new File(outputFolder);
  if (!outDir.exists) outDir.create();

  var channelMap = { '16:9': 'Comp_16x9', '1:1': 'Comp_1x1', '9:16': 'Comp_9x16' };
  var renderTemplate = 'H.264';
  var manifest = [];

  try {
    app.open(projectFile);
    var project = app.project;
    app.project.renderQueue.items.removeAll();

    var baseComp = getCompForRender(project, '16:9', channelMap);
    if (!baseComp) baseComp = getCompForRender(project, '1:1', channelMap);
    if (!baseComp && project.numItems > 0) {
      for (var k = 1; k <= project.numItems; k++) {
        if (project.item(k) instanceof CompItem) { baseComp = project.item(k); break; }
      }
    }
    if (!baseComp) {
      manifest.push({ variant_id: 'run', status: 'fail', errors: ['No composition found in project'] });
    } else {
      for (var i = 0; i < records.length; i++) {
        var rec = records[i];
        var vid = (rec.variant_id || 'variant_' + (i + 1)).replace(/[^a-zA-Z0-9_-]/g, '_');
        var ratio = rec.aspect_ratio || '16:9';
        var comp = getCompForRender(project, ratio, channelMap) || baseComp;
        var compToUse = comp.duplicate('_render_' + vid);
        applyRecordToComp(compToUse, rec);
        var outPath = outputFolder + '/' + vid + '.mp4';
        try {
          queueCompForRender(compToUse, outPath, renderTemplate);
          manifest.push({ variant_id: rec.variant_id, status: 'ok', path: outPath, errors: [] });
        } catch (e) {
          manifest.push({ variant_id: rec.variant_id, status: 'fail', path: outPath, errors: [e.message] });
        }
      }
      app.project.renderQueue.render();
    }
  } catch (e) {
    manifest.push({ variant_id: 'run', status: 'fail', errors: [e.message] });
  }

  var manifestPath = outputFolder + '/manifest.json';
  writeFile(manifestPath, stringifyJSON(manifest));
  if (typeof alert !== 'undefined') {
    alert('Done. Rendered ' + manifest.length + ' variant(s). Manifest: ' + manifestPath);
  }
})();

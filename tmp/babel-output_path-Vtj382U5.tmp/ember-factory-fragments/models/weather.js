define('ember-factory-fragments/models/weather', ['exports', 'ember-data', 'model-fragments'], function (exports, _emberData, _modelFragments) {
  exports['default'] = _modelFragments['default'].Fragment.extend({
    temperature: _emberData['default'].attr('number'),
    description: _emberData['default'].attr('string')
  });
});
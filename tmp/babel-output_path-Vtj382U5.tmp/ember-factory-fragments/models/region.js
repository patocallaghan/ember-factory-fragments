define('ember-factory-fragments/models/region', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr('string'),
    capital: _emberData['default'].belongsTo('city')
  });
});
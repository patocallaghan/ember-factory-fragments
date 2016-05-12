define('ember-factory-fragments/models/country', ['exports', 'ember-data', 'model-fragments'], function (exports, _emberData, _modelFragments) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr(),
    cities: _emberData['default'].hasMany('city'),
    weather: _modelFragments['default'].fragment('weather'),
    // states: DS.hasMany('state'),
    regions: _emberData['default'].hasMany('region')
  });
});
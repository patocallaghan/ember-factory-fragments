define('ember-factory-fragments/tests/factories/country', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('country', {
    'default': {
      name: 'America',
      cities: _emberDataFactoryGuy['default'].hasMany('city', 3),
      weather: _emberDataFactoryGuy['default'].belongsTo('weather'),
      regions: _emberDataFactoryGuy['default'].hasMany('region', 1)
    },
    european: {
      name: 'Ireland'
    }
  });
});
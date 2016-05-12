define('ember-factory-fragments/tests/factories/weather', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('weather', {
    'default': {
      temperature: 20,
      description: 'Sunny'
    }
  });
});
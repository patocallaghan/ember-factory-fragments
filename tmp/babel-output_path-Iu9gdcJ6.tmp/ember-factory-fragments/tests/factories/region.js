define('ember-factory-fragments/tests/factories/region', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('region', {
    'default': {
      name: 'east',
      capital: _emberDataFactoryGuy['default'].belongsTo('city')
    }
  });
});
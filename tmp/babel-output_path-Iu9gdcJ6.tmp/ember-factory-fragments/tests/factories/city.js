define('ember-factory-fragments/tests/factories/city', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('city', {
    'default': {
      name: 'New York'
    },
    maine: {
      name: 'Maine'
    }
  });
});
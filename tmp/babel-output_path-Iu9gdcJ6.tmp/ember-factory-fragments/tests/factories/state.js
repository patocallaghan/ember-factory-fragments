define('ember-factory-fragments/tests/factories/state', ['exports', 'ember-data-factory-guy'], function (exports, _emberDataFactoryGuy) {

  _emberDataFactoryGuy['default'].define('state', {
    'default': {
      id: 'state.new_jersey',
      name: 'New Jersey'
    },
    nebraska: {
      id: 'state.nebraska',
      name: 'Nebraska'
    },
    delaware: {
      id: 'state.delaware',
      name: 'Delaware'
    }
  });
});
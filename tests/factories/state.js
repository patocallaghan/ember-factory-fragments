import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('state', {
  default: {
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

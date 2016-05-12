import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('region', {
  default: {
    name: 'east',
    capital: FactoryGuy.belongsTo('city')
  }
});


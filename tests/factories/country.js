import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('country', {
  default: {
    name: 'America',
    cities: FactoryGuy.hasMany('city', 3),
    weather: FactoryGuy.belongsTo('weather'),
    regions: FactoryGuy.hasMany('region', 1)
  },
  european: {
    name: 'Ireland'
  }
});
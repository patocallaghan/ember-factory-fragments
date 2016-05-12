import DS from 'ember-data';
import MF from 'model-fragments';

export default DS.Model.extend({
  name: DS.attr(),
  cities: DS.hasMany('city'),
  weather: MF.fragment('weather'),
  // states: DS.hasMany('state'),
  regions: DS.hasMany('region')
});
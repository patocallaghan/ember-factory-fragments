import Em from 'ember';

export default Em.Route.extend({
  model() {
    let pushData = { countries: [
      {
        id: 353,
        name: 'Ireland',
        cities: [
          { id: 1, name: 'Dublin' },
          { id: 2, name: 'Cork' },
          { id: 3, name: 'Galway' }
        ],
        weather: { temperature: 13, description: 'Cloudy' }
      }
    ]};
    this.store.pushPayload('country', pushData);
    return this.store.peekRecord('country', 353);
  }
});
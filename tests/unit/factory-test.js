import { test, moduleForModel } from 'ember-qunit';
import { make, manualSetup } from 'ember-data-factory-guy';

moduleForModel('country', 'Unit | Model | country', {
  needs: ['model:city', 'model:weather'],
  beforeEach() {
    manualSetup(this.container);
  }
});

test('Creates a country', () => {
  let country = make('country');
  ok(country);
});

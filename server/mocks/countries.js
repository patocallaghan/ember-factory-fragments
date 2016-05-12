/*jshint node:true*/
/* 
  states: [{
      id: 'state.new_jersey',
      name: 'New Jersey'
    },
    {
      id: 'state.maine',
      name: 'Maine'
    },
    {
      id: 'state.virginia',
      name: 'Virginia'
    }
  ],
 * */
var country = {
  id: 1,
  name: 'America',
  cities: [
    { id: 1, name: 'New York' },
    { id: 2, name: 'Albany' },
    { id: 3, name: 'Boston' }
  ],
  weather: { temperature: 13, description: 'Cloudy' },
  regions: [
    {
      id: 1,
      name: 'east',
      capital_id: 2
    }
  ]
};

module.exports = function(app) {
  var express = require('express');
  var countriesRouter = express.Router();

  countriesRouter.get('/', function(req, res) {
    res.send( [ country ] );
  });

  countriesRouter.post('/', function(req, res) {
    console.log('post');
    res.status(201).end();
  });

  countriesRouter.get('/:id', function(req, res) {
    res.send( country );
  });

  countriesRouter.put('/:id', function(req, res) {
    res.send( country );
  });

  countriesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  app.use('/countries', countriesRouter);
};

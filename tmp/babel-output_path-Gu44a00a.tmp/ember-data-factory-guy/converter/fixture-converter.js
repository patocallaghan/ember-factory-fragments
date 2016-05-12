define('ember-data-factory-guy/converter/fixture-converter', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _default = (function () {
    function _default(store) {
      var transformKeys = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      _classCallCheck(this, _default);

      this.transformKeys = transformKeys;
      this.store = store;
      this.listType = false;
      this.noTransformFn = function (x) {
        return x;
      };
      this.defaultValueTransformFn = this.noTransformFn;
    }

    _createClass(_default, [{
      key: 'addPrimaryKey',
      value: function addPrimaryKey(modelName, data, fixture) {
        var primaryKey = this.store.serializerFor(modelName).get('primaryKey');
        data.id = fixture.id;
        if (primaryKey !== 'id') {
          data[primaryKey] = fixture.id;
        }
      }
    }, {
      key: 'transformRelationshipKey',
      value: function transformRelationshipKey(relationship) {
        var transformFn = this.getTransformKeyFunction(relationship.type, 'Relationship');
        return transformFn(relationship.key, relationship.kind);
      }
    }, {
      key: 'getRelationshipType',
      value: function getRelationshipType(relationship, fixture) {
        var isPolymorphic = relationship.options.polymorphic;
        return isPolymorphic ? this.polymorphicTypeTransformFn(fixture.type) : relationship.type;
      }
    }, {
      key: 'getTransformKeyFunction',
      value: function getTransformKeyFunction(modelName, type) {
        if (!this.transformKeys) {
          return this.noTransformFn;
        }
        var serializer = this.store.serializerFor(modelName);
        return serializer['keyFor' + type] || this.defaultKeyTransformFn;
      }
    }, {
      key: 'getTransformValueFunction',
      value: function getTransformValueFunction(type) {
        if (!this.transformKeys || type && type.match('-mf')) {
          return this.noTransformFn;
        }
        if (!type) {
          return this.defaultValueTransformFn;
        }
        var container = _ember['default'].getOwner ? _ember['default'].getOwner(this.store) : this.store.container;
        return container.lookup('transform:' + type).serialize;
      }
    }, {
      key: 'extractAttributes',
      value: function extractAttributes(modelName, fixture) {
        var _this = this;

        var attributes = {};
        var transformKeyFunction = this.getTransformKeyFunction(modelName, 'Attribute');

        this.store.modelFor(modelName).eachAttribute(function (attribute, meta) {
          var attributeKey = transformKeyFunction(attribute);
          var transformValueFunction = _this.getTransformValueFunction(meta.type);

          if (fixture.hasOwnProperty(attribute)) {
            attributes[attributeKey] = transformValueFunction(fixture[attribute]);
          } else if (fixture.hasOwnProperty(attributeKey)) {
            attributes[attributeKey] = transformValueFunction(fixture[attributeKey]);
          }
        });
        return attributes;
      }

      /**
       Extract relationships and descend into those looking for others
        @param {String} modelName
       @param {Object} fixture
       @returns {{}}
       */
    }, {
      key: 'extractRelationships',
      value: function extractRelationships(modelName, fixture) {
        var _this2 = this;

        var relationships = {};

        this.store.modelFor(modelName).eachRelationship(function (key, relationship) {
          if (fixture.hasOwnProperty(key)) {
            if (relationship.kind === 'belongsTo') {
              _this2.extractBelongsTo(fixture, relationship, modelName, relationships);
            } else if (relationship.kind === 'hasMany') {
              _this2.extractHasMany(fixture, relationship, modelName, relationships);
            }
          }
        });

        return relationships;
      }

      /**
       Extract belongTo relationships
        @param fixture
       @param relationship
       @param relationships
       */
    }, {
      key: 'extractBelongsTo',
      value: function extractBelongsTo(fixture, relationship, parentModelName, relationships) {
        var belongsToRecord = fixture[relationship.key];

        var relationshipKey = this.transformRelationshipKey(relationship);
        var isEmbedded = this.isEmbeddedRelationship(parentModelName, relationshipKey);

        var data = this.extractSingleRecord(belongsToRecord, relationship, isEmbedded);

        relationships[relationshipKey] = this.assignRelationship(data);
      }

      // Borrowed from ember data
      // checks config for attrs option to embedded (always)
    }, {
      key: 'isEmbeddedRelationship',
      value: function isEmbeddedRelationship(modelName, attr) {
        var serializer = this.store.serializerFor(modelName);
        var option = this.attrsOption(serializer, attr);
        return option && (option.embedded === 'always' || option.deserialize === 'records');
      }
    }, {
      key: 'attrsOption',
      value: function attrsOption(serializer, attr) {
        var attrs = serializer.get('attrs');
        return attrs && (attrs[_ember['default'].String.camelize(attr)] || attrs[attr]);
      }
    }, {
      key: 'extractHasMany',
      value: function extractHasMany(fixture, relationship, parentModelName, relationships) {
        var _this3 = this;

        var hasManyRecords = fixture[relationship.key];

        var relationshipKey = this.transformRelationshipKey(relationship);
        var isEmbedded = this.isEmbeddedRelationship(parentModelName, relationshipKey);

        if (hasManyRecords.isProxy) {
          return this.addListProxyData(hasManyRecords, relationship, relationships, isEmbedded);
        }

        if (_ember['default'].typeOf(hasManyRecords) !== 'array') {
          return;
        }

        var records = hasManyRecords.map(function (hasManyRecord) {
          return _this3.extractSingleRecord(hasManyRecord, relationship, isEmbedded);
        });

        relationships[relationshipKey] = this.assignRelationship(records);
      }
    }, {
      key: 'extractSingleRecord',
      value: function extractSingleRecord(record, relationship, isEmbedded) {
        var data = undefined;
        switch (_ember['default'].typeOf(record)) {

          case 'object':
            if (record.isProxy) {
              data = this.addProxyData(record, relationship, isEmbedded);
            } else {
              data = this.addData(record, relationship, isEmbedded);
            }
            break;

          case 'instance':
            data = this.normalizeAssociation(record, relationship);
            break;

          case 'number':
          case 'string':
            _ember['default'].assert('Polymorphic relationships cannot be specified by id you\n          need to supply an object with id and type', !relationship.options.polymorphic);
            record = { id: record, type: relationship.type };
            data = this.normalizeAssociation(record, relationship);
        }

        return data;
      }
    }, {
      key: 'assignRelationship',
      value: function assignRelationship(object) {
        return object;
      }
    }, {
      key: 'addData',
      value: function addData(embeddedFixture, relationship, isEmbedded) {
        var relationshipType = this.getRelationshipType(relationship, embeddedFixture);
        // find possibly more embedded fixtures
        var data = this.convertSingle(relationshipType, embeddedFixture);
        if (isEmbedded) {
          return data;
        }
        this.addToIncluded(data, relationshipType);
        return this.normalizeAssociation(data, relationship);
      }

      // proxy data is data that was build with FactoryGuy.build method
    }, {
      key: 'addProxyData',
      value: function addProxyData(jsonProxy, relationship, isEmbedded) {
        var data = jsonProxy.getModelPayload();
        var relationshipType = this.getRelationshipType(relationship, data);
        if (isEmbedded) {
          this.addToIncludedFromProxy(jsonProxy);
          return data;
        }
        this.addToIncluded(data, relationshipType);
        this.addToIncludedFromProxy(jsonProxy);
        return this.normalizeAssociation(data, relationship);
      }

      // listProxy data is data that was build with FactoryGuy.buildList method
    }, {
      key: 'addListProxyData',
      value: function addListProxyData(jsonProxy, relationship, relationships, isEmbedded) {
        var _this4 = this;

        var relationshipKey = this.transformRelationshipKey(relationship);

        var records = jsonProxy.getModelPayload().map(function (data) {
          if (isEmbedded) {
            return data;
          }
          var relationshipType = _this4.getRelationshipType(relationship, data);
          _this4.addToIncluded(data, relationshipType);
          return _this4.normalizeAssociation(data, relationship);
        });

        this.addToIncludedFromProxy(jsonProxy);

        relationships[relationshipKey] = this.assignRelationship(records);
      }
    }]);

    return _default;
  })();

  exports['default'] = _default;
});
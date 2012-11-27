(function() {

    var em = {};

    // global on the server, window in the browser
    var root = this;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = em;
    }
    else {
        root.em = em;
    }


	var nextEntityId = 1;
	var entityNames = [];
	var components = [];
	var entityObjs = [];


	em.newEntity = function(entityName) {
		entityId = nextEntityId++;

		entityNames[entityName] = entityId;
		entityObjs[entityId] = {id:entityId, name:entityName};
		return entityId;
	}

	em.addEntity = function(entityId, entityName) {
		entityNames[entityName] = entityId;
		entityObjs[entityId] = {id:entityId, name:entityName};
		return entityId;
	}

	em.removeEntity = function(entityId) {
		delete entityObjs[entityId];
		for(index in components) {
			components[index][entityId] = undefined;
			delete components[index][entityId];
		}
	}

	em.addComponent = function(entityId, componentName, component) {
		if( typeof entityObjs[entityId] !== "undefined" && componentName.length > 0 ) {
			entityObjs[entityId][componentName] = component;
			
			if( !components[componentName] )
				components[componentName] = [];
			components[componentName][entityId] = entityObjs[entityId][componentName];

			return true;
		}
		
		return false
	}

	em.removeComponent = function(entityId, componentName) {
		if( typeof components[componentName] !== "undefined" &&
			typeof components[componentName][entityId] !== "undefined" ) {
			delete components[componentName][entityId];
			return true;
		}

		return false;
	}

	em.getEntity = function(entity) {
		if( typeof entityObjs[entity] !== "undefined" ) {
			return entityObjs[entity];
		}

		return this.getEntityByName(entity);
	}

	em.getEntityByName = function(entityName) {
		if( typeof entityNames[entityName] !== "undefined" &&
			typeof entityObjs[entityNames[entityName]] !== "undefined" ) {

			return entityObjs[entityNames[entityName]];
		}

		return false;
	}

	em.getEntities = function(componentName) {
		if( typeof components[componentName] !== "undefined" ) {
			return components[componentName];
		}

		return [];
	}

	em.forEach = function(componentName, callback) {
		if( typeof components[componentName] === "undefined" )
			return;

		for( var index in components[componentName] ) {
			callback(index, components[componentName][index]);
		}
	}

	em.getFirstEntity = function(componentName) {
		if( typeof components[componentName] !== "undefined" ) {
			for(entityId in components[componentName]) {
				return entityObjs[entityId];
			}
		}

		return false;
	}

	em.getComponent = function(entityId, componentName) {
		return entityObjs[entityId][componentName];
	}

	em.call = function(funcName) {
		var entities = this.getEntities(funcName);
		for(entityId in entities) {
			var entityObj = entities[entityId];
			var args = [];
			if( arguments.length > 1 ) {
				var args = Array.prototype.slice.call(arguments);
				args = args.slice(1);
			}
			entityObj[funcName].apply(entityObj, args);
		}
	}

})();

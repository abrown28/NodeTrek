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


	// need a way to reuse ids
	var nextEntityId = 1;
	var deletedIds = [];

	// used to get components by component name
	var components = [];

	// used to get components by entity id
	var entityObjs = {};


	// create and remove entities
	em.newEntity = function() {
		var entityId = deletedIds.pop();

		if( typeof entityId === 'undefined' )
			entityId = nextEntityId++;

		entityObjs[entityId] = {'entityId': entityId};

		return entityId;
	}

	em.removeEntity = function(entityId) {
		if( typeof entityObjs[entityId] === 'undefined' )
			return;

		// save id for reuse
		deletedIds.push(entityId);

		for(var name in components) {
			em.removeComponent(entityId, name);
		}

		delete entityObjs[entityId];
	}

	// add and remove components
	em.addComponent = function(entityId, componentName, component) {
		if( typeof entityObjs[entityId] !== "undefined" && componentName.length > 0 ) {
			entityObjs[entityId][componentName] = component;
			
			if( !components[componentName] )
				components[componentName] = [];

			components[componentName].push(entityId);

			return true;
		}
		
		return false
	}

	em.removeComponent = function(entityId, componentName) {
		if( typeof components[componentName] !== "undefined" ) {
			delete entityObjs[entityId][componentName];
			for(var index in components[componentName]) {
				if(  components[componentName][index] == entityId )
					components[componentName].splice(index, 1);
			}
			return true;
		}

		return false;
	}

	em.getEntityIdsByComponent = function(componentName) {
		if( typeof components[componentName] === "undefined" )
			return [];
		return components[componentName];
	}



	// loop over entities by component name
	em.forEach = function(componentName, callback) {
		if( typeof components[componentName] === "undefined" )
			return false;
console.log(components);
		for( var index in components[componentName] ) {
			var entityId = components[componentName][index];
console.log(index);
console.log(entityId);
			if( callback(entityId, entityObjs[entityId][componentName]) === false ) {
				return false;
			}
		}
		return true;
	}


	em.forEachParallel = function(componentName, callback) {
        if( typeof components[componentName] === "undefined" )
            return false;

        for( var index in components[componentName] ) {
			em.nextTick(function() {
				var entityId = components[componentName][index];
				return function() {
					callback(entityId, entityObjs[entityId][componentName]);
				};
			}());
        }
        return true;
	}

	em.call = function(componentName) {
		var args = [];
		if( arguments.length > 1 ) {
			var args = Array.prototype.slice.call(arguments);
			args = args.slice(1);
		}

		var ret = {};
		em.forEach(componentName, function(entityId, component) {
			if( isFunction(component) ) {
				ret[entityId] = component.apply(entityObjs[entityId], args);	
			}
		});
		return ret;
	}

    em.callParallel = function(componentName, callback) {
		callback = callback || function () {};
        var args = [];
        if( arguments.length > 1 ) {
            var args = Array.prototype.slice.call(arguments);
            args = args.slice(1);
        }

		var completed = 0;
		var ret = {}
		var complete = function(entityId, data) {
			ret[entityId] = data;
			completed += 1;
			if( completed === components[componentName].length )
			{
				callback(ret);
			}
		};

        for( var index in components[componentName] ) {

            em.nextTick(function() {
                var entityId = components[componentName][index];
                return function() {
                    //callback(entityId, entityObjs[entityId][componentName]);
					var ret = entityObjs[entityId][componentName].apply(entityObjs[entityId], args);
					complete(entityId, ret);
                };
            }());
        }
    }

	if (typeof process === 'undefined' || !(process.nextTick)) {
		em.nextTick = function (fn) {
			setTimeout(fn, 0);
		};
	}
	else {
		em.nextTick = process.nextTick;
	}


	function isFunction(obj) {
		return !!(obj && obj.constructor && obj.call && obj.apply);
	}

})();

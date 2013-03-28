
define(function () {
	// We need some stuff from the controlling context so we
	// wait with `ready` until we have everything.
	var parentContext = Q.defer();
	// Called from controlling context to boot this context.
	window.__devcomp_sub_context__init = function(context) {
		parentContext.resolve(context);
		return parentContext.promise;
	}
	// After we get context we eliminate the promise for subsequent calls.
	parentContext.promise.then(function(context) {
		parentContext = context;
	});
	// Return the public API.
	var api = {
		initTool: function(tool, options) {
			if (typeof tool.init !== "function") {
				throw new Error("`tool.init` must be a function");
			}
			return Q.when(parentContext.promise, function(parentContext) {
				return tool.init(api, {
					API: {
						Q: Q,
						NODE: (options.nodeRequire && {
							require: options.nodeRequire,
							process: process
						}) || parentContext.API.NODE,
						GUI: parentContext.API.GUI
					}
				});
			}).fail(function(err) {
				console.error("ERROR while initializing devcomp tool. See below.");
				console.error(err.stack);
			});
		}
	};
	return api;
});

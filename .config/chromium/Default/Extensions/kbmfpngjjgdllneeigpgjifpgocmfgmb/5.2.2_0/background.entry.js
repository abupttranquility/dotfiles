/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _common = __webpack_require__(1);
	
	var _messaging = __webpack_require__(3);
	
	var _cssOff = __webpack_require__(4);
	
	var _cssOff2 = _interopRequireDefault(_cssOff);
	
	var _cssOffSmall = __webpack_require__(5);
	
	var _cssOffSmall2 = _interopRequireDefault(_cssOffSmall);
	
	var _cssOn = __webpack_require__(6);
	
	var _cssOn2 = _interopRequireDefault(_cssOn);
	
	var _cssOnSmall = __webpack_require__(7);
	
	var _cssOnSmall2 = _interopRequireDefault(_cssOnSmall);
	
	var _helpers = __webpack_require__(8);
	
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	
	function _asyncToGenerator(fn) {
		return function () {
			var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
				function step(key, arg) {
					try {
						var info = gen[key](arg);var value = info.value;
					} catch (error) {
						reject(error);return;
					}if (info.done) {
						resolve(value);
					} else {
						return Promise.resolve(value).then(function (value) {
							step("next", value);
						}, function (err) {
							step("throw", err);
						});
					}
				}return step("next");
			});
		};
	}
	
	function _objectWithoutProperties(obj, keys) {
		var target = {};for (var i in obj) {
			if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];
		}return target;
	} /*
	  
	  	RES is released under the GPL. However, I do ask a favor (obviously I don't/can't require it, I ask out of courtesy):
	  
	  	Because RES auto updates and is hosted from a central server, I humbly request that if you intend to distribute your own
	  	modified Reddit Enhancement Suite, you name it something else and make it very clear to your users that it's your own
	  	branch and isn't related to mine.
	  
	  	RES is updated very frequently, and I get lots of tech support questions/requests from people on outdated versions. If
	  	you're distributing RES via your own means, those recipients won't always be on the latest and greatest, which makes
	  	it harder for me to debug things and understand (at least with browsers that auto-update) whether or not people are on
	  	a current version of RES.
	  
	  	I can't legally hold you to any of this - I'm just asking out of courtesy.
	  
	  	Thanks, I appreciate your consideration.  Without further ado, the all-important GPL Statement:
	  
	  	This program is free software: you can redistribute it and/or modify
	  	it under the terms of the GNU General Public License as published by
	  	the Free Software Foundation, either version 3 of the License, or
	  	(at your option) any later version.
	  
	  	This program is distributed in the hope that it will be useful,
	  	but WITHOUT ANY WARRANTY; without even the implied warranty of
	  	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	  	GNU General Public License for more details.
	  
	  	You should have received a copy of the GNU General Public License
	  	along with this program.  If not, see <http://www.gnu.org/licenses/>.
	  
	  */
	
	/* eslint-env webextensions */
	
	var _sendMessage = (0, _helpers.apiToPromise)(chrome.tabs.sendMessage);
	
	var _createMessageHandler = (0, _messaging.createMessageHandler)((type, _ref, _ref2) => {
		var transaction = _ref.transaction,
		    isResponse = _ref.isResponse,
		    obj = _objectWithoutProperties(_ref, ['transaction', 'isResponse']);
	
		var sendResponse = _ref2.sendResponse,
		    tabId = _ref2.tabId;
	
		if (isResponse) {
			sendResponse(obj);
		} else {
			_sendMessage(tabId, Object.assign({}, obj, { type })).then(obj => {
				_handleMessage(type, Object.assign({}, obj, { transaction, isResponse: true }));
			});
		}
	}),
	    _handleMessage = _createMessageHandler._handleMessage,
	    sendMessage = _createMessageHandler.sendMessage,
	    addListener = _createMessageHandler.addListener;
	
	chrome.runtime.onMessage.addListener((_ref3, sender, sendResponse) => {
		var type = _ref3.type,
		    obj = _objectWithoutProperties(_ref3, ['type']);
	
		return _handleMessage(type, obj, Object.assign({}, sender.tab, { sendResponse }));
	});
	
	// Listeners
	
	(0, _common.addCommonBackgroundListeners)(addListener);
	
	addListener('ajax', (() => {
		var _ref4 = _asyncToGenerator(function* (_ref5) {
			var method = _ref5.method,
			    url = _ref5.url,
			    headers = _ref5.headers,
			    data = _ref5.data,
			    credentials = _ref5.credentials;
	
			var request = new XMLHttpRequest();
	
			var load = Promise.race([new Promise(function (resolve) {
				return request.onload = resolve;
			}), new Promise(function (resolve) {
				return request.onerror = resolve;
			}).then(function () {
				throw new Error(`XHR error - url: ${ url }`);
			})]);
	
			request.open(method, url, true);
	
			for (var name in headers) {
				request.setRequestHeader(name, headers[name]);
			}
	
			if (credentials) {
				request.withCredentials = true;
			}
	
			request.send(data);
	
			yield load;
	
			// Only store `status`, `responseText` and `responseURL` fields
			return {
				status: request.status,
				responseText: request.responseText,
				responseURL: request.responseURL
			};
		});
	
		return function (_x) {
			return _ref4.apply(this, arguments);
		};
	})());
	
	addListener('permissions', _ref6 => {
		var operation = _ref6.operation,
		    permissions = _ref6.permissions,
		    origins = _ref6.origins;
	
		switch (operation) {
			case 'contains':
				return (0, _helpers.apiToPromise)(chrome.permissions.contains)({ permissions, origins });
			case 'request':
				return (0, _helpers.apiToPromise)(chrome.permissions.request)({ permissions, origins });
			case 'remove':
				return (0, _helpers.apiToPromise)(chrome.permissions.remove)({ permissions, origins });
			default:
				throw new Error(`Invalid permissions operation: ${ operation }`);
		}
	});
	
	_asyncToGenerator(function* () {
		var _set = (0, _helpers.apiToPromise)(function (items, callback) {
			return chrome.storage.local.set(items, callback);
		});
		var set = function (key, value) {
			return _set({ [key]: value });
		};
	
		var MIGRATED_TO_CHROME_STORAGE = 'MIGRATED_TO_CHROME_STORAGE';
	
		if (localStorage.getItem(MIGRATED_TO_CHROME_STORAGE) !== MIGRATED_TO_CHROME_STORAGE) {
			yield Promise.all(Object.keys(localStorage).map((() => {
				var _ref8 = _asyncToGenerator(function* (key) {
					try {
						yield set(key, JSON.parse(localStorage.getItem(key)));
						console.log(key);
					} catch (e) {
						yield set(key, localStorage.getItem(key));
						console.warn(key);
					}
				});
	
				return function (_x2) {
					return _ref8.apply(this, arguments);
				};
			})()));
			localStorage.setItem(MIGRATED_TO_CHROME_STORAGE, MIGRATED_TO_CHROME_STORAGE);
		}
	})();
	
	addListener('deleteCookies', cookies => cookies.forEach(_ref9 => {
		var url = _ref9.url,
		    name = _ref9.name;
		return chrome.cookies.remove({ url, name });
	}));
	
	addListener('openNewTabs', (_ref10, _ref11) => {
		var urls = _ref10.urls,
		    focusIndex = _ref10.focusIndex;
		var tabId = _ref11.id,
		    currentIndex = _ref11.index;
	
		urls.forEach((url, i) => chrome.tabs.create({
			url,
			selected: i === focusIndex,
			index: ++currentIndex,
			openerTabId: tabId
		}));
	});
	
	addListener('addURLToHistory', url => {
		chrome.history.addUrl({ url });
	});
	
	addListener('isURLVisited', (() => {
		var _ref12 = _asyncToGenerator(function* (url) {
			return (yield (0, _helpers.apiToPromise)(chrome.history.getVisits)({ url })).length > 0;
		});
	
		return function (_x3) {
			return _ref12.apply(this, arguments);
		};
	})());
	
	chrome.pageAction.onClicked.addListener(_ref13 => {
		var tabId = _ref13.id;
		return sendMessage('pageActionClick', undefined, { tabId });
	});
	
	addListener('pageAction', (_ref14, _ref15) => {
		var operation = _ref14.operation,
		    state = _ref14.state;
		var tabId = _ref15.id;
	
		switch (operation) {
			case 'show':
				chrome.pageAction.show(tabId);
				chrome.pageAction.setIcon({
					tabId,
					path: {
						19: state ? _cssOnSmall2.default : _cssOffSmall2.default,
						38: state ? _cssOn2.default : _cssOff2.default
					}
				});
				break;
			case 'hide':
			case 'destroy':
				chrome.pageAction.hide(tabId);
				break;
			default:
				throw new Error(`Invalid pageAction operation: ${ operation }`);
		}
	});
	
	addListener('multicast', (() => {
		var _ref16 = _asyncToGenerator(function* (request, _ref17) {
			var tabId = _ref17.id,
			    incognito = _ref17.incognito;
			return Promise.all((yield (0, _helpers.apiToPromise)(chrome.tabs.query)({ url: '*://*.reddit.com/*', status: 'complete' })).filter(function (tab) {
				return tab.id !== tabId && tab.incognito === incognito;
			}).map(function (_ref18) {
				var tabId = _ref18.id;
				return sendMessage('multicast', request, { tabId });
			}));
		});
	
		return function (_x4, _x5) {
			return _ref16.apply(this, arguments);
		};
	})());

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.addCommonBackgroundListeners = addCommonBackgroundListeners;
	
	var _Cache = __webpack_require__(2);
	
	var _Cache2 = _interopRequireDefault(_Cache);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function addCommonBackgroundListeners(addListener) {
		var session = new Map();
	
		addListener('session', (_ref) => {
			var _ref2 = _slicedToArray(_ref, 3),
			    operation = _ref2[0],
			    key = _ref2[1],
			    value = _ref2[2];
	
			switch (operation) {
				case 'get':
					return session.get(key);
				case 'set':
					session.set(key, value);
					break;
				case 'delete':
					return session.delete(key);
				case 'has':
					return session.has(key);
				case 'clear':
					return session.clear();
				default:
					throw new Error(`Invalid session operation: ${ operation }`);
			}
		});
	
		var cache = new _Cache2.default();
	
		addListener('XHRCache', (_ref3) => {
			var _ref4 = _slicedToArray(_ref3, 3),
			    operation = _ref4[0],
			    key = _ref4[1],
			    value = _ref4[2];
	
			switch (operation) {
				case 'set':
					return cache.set(key, value);
				case 'check':
					return cache.get(key, value);
				case 'delete':
					return cache.delete(key);
				case 'clear':
					return cache.clear();
				default:
					throw new Error(`Invalid XHRCache operation: ${ operation }`);
			}
		});
	
		var waiting = new Map();
	
		addListener('authFlow', (_ref5) => {
			var operation = _ref5.operation,
			    id = _ref5.id,
			    token = _ref5.token;
	
			switch (operation) {
				case 'start':
					if (waiting.has(id)) {
						throw new Error(`Auth handler for id: ${ id } already exists.`);
					}
					return new Promise((resolve, reject) => waiting.set(id, { resolve, reject }));
				case 'complete':
					{
						var handler = waiting.get(id);
						if (!handler) {
							console.error(`No auth handler for id: ${ id } (sent token: ${ token }).`);
							return false;
						}
						waiting.delete(id);
						handler.resolve(token);
						return true;
					}
				case 'cancel':
					{
						var _handler = waiting.get(id);
						if (!_handler) {
							console.error(`No auth handler for id: ${ id } (attempted cancellation).`);
							return false;
						}
						waiting.delete(id);
						_handler.reject(new Error('Auth flow cancelled.'));
						return true;
					}
				default:
					throw new Error(`Invalid authFlow operation: ${ operation }`);
			}
		});
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	class Cache extends Map {
	
		constructor() {
			var capacity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 500;
	
			super();
			this.capacity = capacity;
		}
	
		get(key) {
			var maxAge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
	
			var now = Date.now();
			var entry = super.get(key);
			if (entry && now - entry.createTime < maxAge) {
				entry.hitTime = now;
				return entry.value;
			}
		}
	
		set(key, value) {
			var now = Date.now();
			super.set(key, { value, createTime: now, hitTime: now });
	
			if (this.size > this.capacity) {
				// evict least-recently used (hit)
				Array.from(this.entries()).sort((_ref, _ref2) => {
					var _ref4 = _slicedToArray(_ref, 2),
					    a = _ref4[1];
	
					var _ref3 = _slicedToArray(_ref2, 2),
					    b = _ref3[1];
	
					return b.hitTime - a.hitTime;
				}).slice(this.capacity / 2 | 0).forEach((_ref5) => {
					var _ref6 = _slicedToArray(_ref5, 1),
					    key = _ref6[0];
	
					return this.delete(key);
				});
			}
		}
	}
	exports.default = Cache;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.createMessageHandler = createMessageHandler;
	function isPromise(maybePromise) {
		return maybePromise && typeof maybePromise === 'object' && typeof maybePromise.then === 'function';
	}
	
	function createMessageHandler(_sendMessage) {
		var _onListenerError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : e => console.error(e);
	
		var listeners = new Map();
		var interceptors = new Map();
		var waiting = new Map();
		var transaction = 0;
	
		function addListener(type, callback) {
			if (listeners.has(type)) {
				throw new Error(`Listener for "${ type }" already exists.`);
			}
			listeners.set(type, callback);
		}
	
		function addInterceptor(type, callback) {
			if (interceptors.has(type)) {
				throw new Error(`Interceptor for "${ type }" already exists.`);
			}
			interceptors.set(type, callback);
		}
	
		function sendMessage(type, data, context) {
			var interceptor = interceptors.get(type);
			if (interceptor) {
				try {
					var response = interceptor(data, context);
					if (isPromise(response) /*:: && response instanceof Promise */) {
							return response.catch(e => Promise.reject(new Error(`Error in "${ type }" interceptor: ${ e.message || e }`)));
						}
					return Promise.resolve(response);
				} catch (e) {
					return Promise.reject(new Error(`Error in "${ type }" interceptor: ${ e.message || e }`));
				}
			}
	
			++transaction;
	
			_sendMessage(type, { data, transaction }, context);
	
			return new Promise((resolve, reject) => waiting.set(transaction, { resolve, reject }));
		}
	
		function sendSynchronous(type, data, context) {
			var interceptor = interceptors.get(type);
			if (!interceptor) {
				throw new Error(`Unrecognised interceptor type: ${ type }`);
			}
	
			try {
				return interceptor(data, context);
			} catch (e) {
				throw new Error(`Error in "${ type }" interceptor: ${ e.message || e }`);
			}
		}
	
		function _handleMessage(type, _ref, context) {
			var data = _ref.data,
			    transaction = _ref.transaction,
			    error = _ref.error,
			    isResponse = _ref.isResponse;
	
			if (isResponse) {
				var handler = waiting.get(transaction);
				if (!handler) {
					throw new Error(`No "${ type }" response handler (transaction ${ transaction }) - this should never happen.`);
				}
				waiting.delete(transaction);
	
				if (error) {
					handler.reject(new Error(`Error in target's "${ type }" handler: ${ error }`));
				} else {
					handler.resolve(data);
				}
	
				return false;
			}
	
			function sendResponse(_ref2) {
				var data = _ref2.data,
				    error = _ref2.error;
	
				_sendMessage(type, { data, transaction, error, isResponse: true }, context);
			}
	
			var listener = listeners.get(type);
			if (!listener) {
				sendResponse({ error: `Unrecognised message type: ${ type }` });
				return false;
			}
	
			var response = void 0;
	
			try {
				response = listener(data, context);
			} catch (e) {
				sendResponse({ error: e.message || e });
				_onListenerError(e);
				return false;
			}
	
			if (isPromise(response) /*:: && response instanceof Promise */) {
					response.then(data => sendResponse({ data }), e => {
						sendResponse({ error: e.message || e });
						_onListenerError(e);
					});
					// true = response will be handled asynchronously (needed for Chrome)
					return true;
				}
	
			sendResponse({ data: response });
	
			return false;
		}
	
		return {
			_handleMessage,
			sendMessage,
			sendSynchronous,
			addListener,
			addInterceptor
		};
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "css-off.png";

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "css-off-small.png";

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "css-on.png";

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "css-on-small.png";

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.apiToPromise = apiToPromise;
	/* eslint-env webextensions */
	
	function apiToPromise(func) {
		return function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}
	
			return new Promise((resolve, reject) => func(...args, function () {
				for (var _len2 = arguments.length, results = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					results[_key2] = arguments[_key2];
				}
	
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(results.length > 1 ? results : results[0]);
				}
			}));
		};
	}

/***/ }
/******/ ]);
//# sourceMappingURL=background.entry.js.map
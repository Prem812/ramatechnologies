/*!
 * imagesLoaded PACKAGED v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
(function (global, factory) {
    if (typeof define == "function" && define.amd) {
        define("ev-emitter/ev-emitter", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        global.EvEmitter = factory();
    }
})(typeof window != "undefined" ? window : this, function () {
    function EvEmitter() {}
    var proto = EvEmitter.prototype;
    proto.on = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        var events = (this._events = this._events || {});
        var listeners = (events[eventName] = events[eventName] || []);
        if (listeners.indexOf(listener) == -1) {
            listeners.push(listener);
        }
        return this;
    };
    proto.once = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        this.on(eventName, listener);
        var onceEvents = (this._onceEvents = this._onceEvents || {});
        var onceListeners = (onceEvents[eventName] =
            onceEvents[eventName] || {});
        onceListeners[listener] = !0;
        return this;
    };
    proto.off = function (eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
            listeners.splice(index, 1);
        }
        return this;
    };
    proto.emitEvent = function (eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        listeners = listeners.slice(0);
        args = args || [];
        var onceListeners = this._onceEvents && this._onceEvents[eventName];
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            var isOnce = onceListeners && onceListeners[listener];
            if (isOnce) {
                this.off(eventName, listener);
                delete onceListeners[listener];
            }
            listener.apply(this, args);
        }
        return this;
    };
    proto.allOff = function () {
        delete this._events;
        delete this._onceEvents;
    };
    return EvEmitter;
});
/*!
 * imagesLoaded v4.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
(function (window, factory) {
    "use strict";
    if (typeof define == "function" && define.amd) {
        define(["ev-emitter/ev-emitter"], function (EvEmitter) {
            return factory(window, EvEmitter);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(window, require("ev-emitter"));
    } else {
        window.imagesLoaded = factory(window, window.EvEmitter);
    }
})(
    typeof window !== "undefined" ? window : this,
    function factory(window, EvEmitter) {
        var $ = window.jQuery;
        var console = window.console;
        function extend(a, b) {
            for (var prop in b) {
                a[prop] = b[prop];
            }
            return a;
        }
        var arraySlice = Array.prototype.slice;
        function makeArray(obj) {
            if (Array.isArray(obj)) {
                return obj;
            }
            var isArrayLike =
                typeof obj == "object" && typeof obj.length == "number";
            if (isArrayLike) {
                return arraySlice.call(obj);
            }
            return [obj];
        }
        function ImagesLoaded(elem, options, onAlways) {
            if (!(this instanceof ImagesLoaded)) {
                return new ImagesLoaded(elem, options, onAlways);
            }
            var queryElem = elem;
            if (typeof elem == "string") {
                queryElem = document.querySelectorAll(elem);
            }
            if (!queryElem) {
                console.error(
                    "Bad element for imagesLoaded " + (queryElem || elem)
                );
                return;
            }
            this.elements = makeArray(queryElem);
            this.options = extend({}, this.options);
            if (typeof options == "function") {
                onAlways = options;
            } else {
                extend(this.options, options);
            }
            if (onAlways) {
                this.on("always", onAlways);
            }
            this.getImages();
            if ($) {
                this.jqDeferred = new $.Deferred();
            }
            setTimeout(this.check.bind(this));
        }
        ImagesLoaded.prototype = Object.create(EvEmitter.prototype);
        ImagesLoaded.prototype.options = {};
        ImagesLoaded.prototype.getImages = function () {
            this.images = [];
            this.elements.forEach(this.addElementImages, this);
        };
        ImagesLoaded.prototype.addElementImages = function (elem) {
            if (elem.nodeName == "IMG") {
                this.addImage(elem);
            }
            if (this.options.background === !0) {
                this.addElementBackgroundImages(elem);
            }
            var nodeType = elem.nodeType;
            if (!nodeType || !elementNodeTypes[nodeType]) {
                return;
            }
            var childImgs = elem.querySelectorAll("img");
            for (var i = 0; i < childImgs.length; i++) {
                var img = childImgs[i];
                this.addImage(img);
            }
            if (typeof this.options.background == "string") {
                var children = elem.querySelectorAll(this.options.background);
                for (i = 0; i < children.length; i++) {
                    var child = children[i];
                    this.addElementBackgroundImages(child);
                }
            }
        };
        var elementNodeTypes = { 1: !0, 9: !0, 11: !0 };
        ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
            var style = getComputedStyle(elem);
            if (!style) {
                return;
            }
            var reURL = /url\((['"])?(.*?)\1\)/gi;
            var matches = reURL.exec(style.backgroundImage);
            while (matches !== null) {
                var url = matches && matches[2];
                if (url) {
                    this.addBackground(url, elem);
                }
                matches = reURL.exec(style.backgroundImage);
            }
        };
        ImagesLoaded.prototype.addImage = function (img) {
            var loadingImage = new LoadingImage(img);
            this.images.push(loadingImage);
        };
        ImagesLoaded.prototype.addBackground = function (url, elem) {
            var background = new Background(url, elem);
            this.images.push(background);
        };
        ImagesLoaded.prototype.check = function () {
            var _this = this;
            this.progressedCount = 0;
            this.hasAnyBroken = !1;
            if (!this.images.length) {
                this.complete();
                return;
            }
            function onProgress(image, elem, message) {
                setTimeout(function () {
                    _this.progress(image, elem, message);
                });
            }
            this.images.forEach(function (loadingImage) {
                loadingImage.once("progress", onProgress);
                loadingImage.check();
            });
        };
        ImagesLoaded.prototype.progress = function (image, elem, message) {
            this.progressedCount++;
            this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
            this.emitEvent("progress", [this, image, elem]);
            if (this.jqDeferred && this.jqDeferred.notify) {
                this.jqDeferred.notify(this, image);
            }
            if (this.progressedCount == this.images.length) {
                this.complete();
            }
            if (this.options.debug && console) {
                console.log("progress: " + message, image, elem);
            }
        };
        ImagesLoaded.prototype.complete = function () {
            var eventName = this.hasAnyBroken ? "fail" : "done";
            this.isComplete = !0;
            this.emitEvent(eventName, [this]);
            this.emitEvent("always", [this]);
            if (this.jqDeferred) {
                var jqMethod = this.hasAnyBroken ? "reject" : "resolve";
                this.jqDeferred[jqMethod](this);
            }
        };
        function LoadingImage(img) {
            this.img = img;
        }
        LoadingImage.prototype = Object.create(EvEmitter.prototype);
        LoadingImage.prototype.check = function () {
            var isComplete = this.getIsImageComplete();
            if (isComplete) {
                this.confirm(this.img.naturalWidth !== 0, "naturalWidth");
                return;
            }
            this.proxyImage = new Image();
            this.proxyImage.addEventListener("load", this);
            this.proxyImage.addEventListener("error", this);
            this.img.addEventListener("load", this);
            this.img.addEventListener("error", this);
            this.proxyImage.src = this.img.src;
        };
        LoadingImage.prototype.getIsImageComplete = function () {
            return this.img.complete && this.img.naturalWidth;
        };
        LoadingImage.prototype.confirm = function (isLoaded, message) {
            this.isLoaded = isLoaded;
            this.emitEvent("progress", [this, this.img, message]);
        };
        LoadingImage.prototype.handleEvent = function (event) {
            var method = "on" + event.type;
            if (this[method]) {
                this[method](event);
            }
        };
        LoadingImage.prototype.onload = function () {
            this.confirm(!0, "onload");
            this.unbindEvents();
        };
        LoadingImage.prototype.onerror = function () {
            this.confirm(!1, "onerror");
            this.unbindEvents();
        };
        LoadingImage.prototype.unbindEvents = function () {
            this.proxyImage.removeEventListener("load", this);
            this.proxyImage.removeEventListener("error", this);
            this.img.removeEventListener("load", this);
            this.img.removeEventListener("error", this);
        };
        function Background(url, element) {
            this.url = url;
            this.element = element;
            this.img = new Image();
        }
        Background.prototype = Object.create(LoadingImage.prototype);
        Background.prototype.check = function () {
            this.img.addEventListener("load", this);
            this.img.addEventListener("error", this);
            this.img.src = this.url;
            var isComplete = this.getIsImageComplete();
            if (isComplete) {
                this.confirm(this.img.naturalWidth !== 0, "naturalWidth");
                this.unbindEvents();
            }
        };
        Background.prototype.unbindEvents = function () {
            this.img.removeEventListener("load", this);
            this.img.removeEventListener("error", this);
        };
        Background.prototype.confirm = function (isLoaded, message) {
            this.isLoaded = isLoaded;
            this.emitEvent("progress", [this, this.element, message]);
        };
        ImagesLoaded.makeJQueryPlugin = function (jQuery) {
            jQuery = jQuery || window.jQuery;
            if (!jQuery) {
                return;
            }
            $ = jQuery;
            $.fn.imagesLoaded = function (options, callback) {
                var instance = new ImagesLoaded(this, options, callback);
                return instance.jqDeferred.promise($(this));
            };
        };
        ImagesLoaded.makeJQueryPlugin();
        return ImagesLoaded;
    }
);
/*!
 * Isotope PACKAGED v3.0.6
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("jquery-bridget/jquery-bridget", ["jquery"], function (jQuery) {
            return factory(window, jQuery);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(window, require("jquery"));
    } else {
        window.jQueryBridget = factory(window, window.jQuery);
    }
})(window, function factory(window, jQuery) {
    "use strict";
    var arraySlice = Array.prototype.slice;
    var console = window.console;
    var logError =
        typeof console == "undefined"
            ? function () {}
            : function (message) {
                  console.error(message);
              };
    function jQueryBridget(namespace, PluginClass, $) {
        $ = $ || jQuery || window.jQuery;
        if (!$) {
            return;
        }
        if (!PluginClass.prototype.option) {
            PluginClass.prototype.option = function (opts) {
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(!0, this.options, opts);
            };
        }
        $.fn[namespace] = function (arg0) {
            if (typeof arg0 == "string") {
                var args = arraySlice.call(arguments, 1);
                return methodCall(this, arg0, args);
            }
            plainCall(this, arg0);
            return this;
        };
        function methodCall($elems, methodName, args) {
            var returnValue;
            var pluginMethodStr = "$()." + namespace + '("' + methodName + '")';
            $elems.each(function (i, elem) {
                var instance = $.data(elem, namespace);
                if (!instance) {
                    logError(
                        namespace +
                            " not initialized. Cannot call methods, i.e. " +
                            pluginMethodStr
                    );
                    return;
                }
                var method = instance[methodName];
                if (!method || methodName.charAt(0) == "_") {
                    logError(pluginMethodStr + " is not a valid method");
                    return;
                }
                var value = method.apply(instance, args);
                returnValue = returnValue === undefined ? value : returnValue;
            });
            return returnValue !== undefined ? returnValue : $elems;
        }
        function plainCall($elems, options) {
            $elems.each(function (i, elem) {
                var instance = $.data(elem, namespace);
                if (instance) {
                    instance.option(options);
                    instance._init();
                } else {
                    instance = new PluginClass(elem, options);
                    $.data(elem, namespace, instance);
                }
            });
        }
        updateJQuery($);
    }
    function updateJQuery($) {
        if (!$ || ($ && $.bridget)) {
            return;
        }
        $.bridget = jQueryBridget;
    }
    updateJQuery(jQuery || window.jQuery);
    return jQueryBridget;
});
(function (global, factory) {
    if (typeof define == "function" && define.amd) {
        define("ev-emitter/ev-emitter", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        global.EvEmitter = factory();
    }
})(typeof window != "undefined" ? window : this, function () {
    function EvEmitter() {}
    var proto = EvEmitter.prototype;
    proto.on = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        var events = (this._events = this._events || {});
        var listeners = (events[eventName] = events[eventName] || []);
        if (listeners.indexOf(listener) == -1) {
            listeners.push(listener);
        }
        return this;
    };
    proto.once = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        this.on(eventName, listener);
        var onceEvents = (this._onceEvents = this._onceEvents || {});
        var onceListeners = (onceEvents[eventName] =
            onceEvents[eventName] || {});
        onceListeners[listener] = !0;
        return this;
    };
    proto.off = function (eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
            listeners.splice(index, 1);
        }
        return this;
    };
    proto.emitEvent = function (eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        listeners = listeners.slice(0);
        args = args || [];
        var onceListeners = this._onceEvents && this._onceEvents[eventName];
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            var isOnce = onceListeners && onceListeners[listener];
            if (isOnce) {
                this.off(eventName, listener);
                delete onceListeners[listener];
            }
            listener.apply(this, args);
        }
        return this;
    };
    proto.allOff = function () {
        delete this._events;
        delete this._onceEvents;
    };
    return EvEmitter;
});
/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("get-size/get-size", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        window.getSize = factory();
    }
})(window, function factory() {
    "use strict";
    function getStyleSize(value) {
        var num = parseFloat(value);
        var isValid = value.indexOf("%") == -1 && !isNaN(num);
        return isValid && num;
    }
    function noop() {}
    var logError =
        typeof console == "undefined"
            ? noop
            : function (message) {
                  console.error(message);
              };
    var measurements = [
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "marginLeft",
        "marginRight",
        "marginTop",
        "marginBottom",
        "borderLeftWidth",
        "borderRightWidth",
        "borderTopWidth",
        "borderBottomWidth",
    ];
    var measurementsLength = measurements.length;
    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0,
        };
        for (var i = 0; i < measurementsLength; i++) {
            var measurement = measurements[i];
            size[measurement] = 0;
        }
        return size;
    }
    function getStyle(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
            logError(
                "Style returned " +
                    style +
                    ". Are you running this code in a hidden iframe on Firefox? " +
                    "See https://bit.ly/getsizebug1"
            );
        }
        return style;
    }
    var isSetup = !1;
    var isBoxSizeOuter;
    function setup() {
        if (isSetup) {
            return;
        }
        isSetup = !0;
        var div = document.createElement("div");
        div.style.width = "200px";
        div.style.padding = "1px 2px 3px 4px";
        div.style.borderStyle = "solid";
        div.style.borderWidth = "1px 2px 3px 4px";
        div.style.boxSizing = "border-box";
        var body = document.body || document.documentElement;
        body.appendChild(div);
        var style = getStyle(div);
        isBoxSizeOuter = Math.round(getStyleSize(style.width)) == 200;
        getSize.isBoxSizeOuter = isBoxSizeOuter;
        body.removeChild(div);
    }
    function getSize(elem) {
        setup();
        if (typeof elem == "string") {
            elem = document.querySelector(elem);
        }
        if (!elem || typeof elem != "object" || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem);
        if (style.display == "none") {
            return getZeroSize();
        }
        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;
        var isBorderBox = (size.isBorderBox = style.boxSizing == "border-box");
        for (var i = 0; i < measurementsLength; i++) {
            var measurement = measurements[i];
            var value = style[measurement];
            var num = parseFloat(value);
            size[measurement] = !isNaN(num) ? num : 0;
        }
        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;
        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
        var styleWidth = getStyleSize(style.width);
        if (styleWidth !== !1) {
            size.width =
                styleWidth +
                (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
        }
        var styleHeight = getStyleSize(style.height);
        if (styleHeight !== !1) {
            size.height =
                styleHeight +
                (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
        }
        size.innerWidth = size.width - (paddingWidth + borderWidth);
        size.innerHeight = size.height - (paddingHeight + borderHeight);
        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;
        return size;
    }
    return getSize;
});
(function (window, factory) {
    "use strict";
    if (typeof define == "function" && define.amd) {
        define("desandro-matches-selector/matches-selector", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        window.matchesSelector = factory();
    }
})(window, function factory() {
    "use strict";
    var matchesMethod = (function () {
        var ElemProto = window.Element.prototype;
        if (ElemProto.matches) {
            return "matches";
        }
        if (ElemProto.matchesSelector) {
            return "matchesSelector";
        }
        var prefixes = ["webkit", "moz", "ms", "o"];
        for (var i = 0; i < prefixes.length; i++) {
            var prefix = prefixes[i];
            var method = prefix + "MatchesSelector";
            if (ElemProto[method]) {
                return method;
            }
        }
    })();
    return function matchesSelector(elem, selector) {
        return elem[matchesMethod](selector);
    };
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("fizzy-ui-utils/utils", [
            "desandro-matches-selector/matches-selector",
        ], function (matchesSelector) {
            return factory(window, matchesSelector);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(window, require("desandro-matches-selector"));
    } else {
        window.fizzyUIUtils = factory(window, window.matchesSelector);
    }
})(window, function factory(window, matchesSelector) {
    var utils = {};
    utils.extend = function (a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    };
    utils.modulo = function (num, div) {
        return ((num % div) + div) % div;
    };
    var arraySlice = Array.prototype.slice;
    utils.makeArray = function (obj) {
        if (Array.isArray(obj)) {
            return obj;
        }
        if (obj === null || obj === undefined) {
            return [];
        }
        var isArrayLike =
            typeof obj == "object" && typeof obj.length == "number";
        if (isArrayLike) {
            return arraySlice.call(obj);
        }
        return [obj];
    };
    utils.removeFrom = function (ary, obj) {
        var index = ary.indexOf(obj);
        if (index != -1) {
            ary.splice(index, 1);
        }
    };
    utils.getParent = function (elem, selector) {
        while (elem.parentNode && elem != document.body) {
            elem = elem.parentNode;
            if (matchesSelector(elem, selector)) {
                return elem;
            }
        }
    };
    utils.getQueryElement = function (elem) {
        if (typeof elem == "string") {
            return document.querySelector(elem);
        }
        return elem;
    };
    utils.handleEvent = function (event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    utils.filterFindElements = function (elems, selector) {
        elems = utils.makeArray(elems);
        var ffElems = [];
        elems.forEach(function (elem) {
            if (!(elem instanceof HTMLElement)) {
                return;
            }
            if (!selector) {
                ffElems.push(elem);
                return;
            }
            if (matchesSelector(elem, selector)) {
                ffElems.push(elem);
            }
            var childElems = elem.querySelectorAll(selector);
            for (var i = 0; i < childElems.length; i++) {
                ffElems.push(childElems[i]);
            }
        });
        return ffElems;
    };
    utils.debounceMethod = function (_class, methodName, threshold) {
        threshold = threshold || 100;
        var method = _class.prototype[methodName];
        var timeoutName = methodName + "Timeout";
        _class.prototype[methodName] = function () {
            var timeout = this[timeoutName];
            clearTimeout(timeout);
            var args = arguments;
            var _this = this;
            this[timeoutName] = setTimeout(function () {
                method.apply(_this, args);
                delete _this[timeoutName];
            }, threshold);
        };
    };
    utils.docReady = function (callback) {
        var readyState = document.readyState;
        if (readyState == "complete" || readyState == "interactive") {
            setTimeout(callback);
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    };
    utils.toDashed = function (str) {
        return str
            .replace(/(.)([A-Z])/g, function (match, $1, $2) {
                return $1 + "-" + $2;
            })
            .toLowerCase();
    };
    var console = window.console;
    utils.htmlInit = function (WidgetClass, namespace) {
        utils.docReady(function () {
            var dashedNamespace = utils.toDashed(namespace);
            var dataAttr = "data-" + dashedNamespace;
            var dataAttrElems = document.querySelectorAll("[" + dataAttr + "]");
            var jsDashElems = document.querySelectorAll(
                ".js-" + dashedNamespace
            );
            var elems = utils
                .makeArray(dataAttrElems)
                .concat(utils.makeArray(jsDashElems));
            var dataOptionsAttr = dataAttr + "-options";
            var jQuery = window.jQuery;
            elems.forEach(function (elem) {
                var attr =
                    elem.getAttribute(dataAttr) ||
                    elem.getAttribute(dataOptionsAttr);
                var options;
                try {
                    options = attr && JSON.parse(attr);
                } catch (error) {
                    if (console) {
                        console.error(
                            "Error parsing " +
                                dataAttr +
                                " on " +
                                elem.className +
                                ": " +
                                error
                        );
                    }
                    return;
                }
                var instance = new WidgetClass(elem, options);
                if (jQuery) {
                    jQuery.data(elem, namespace, instance);
                }
            });
        });
    };
    return utils;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("outlayer/item", [
            "ev-emitter/ev-emitter",
            "get-size/get-size",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("ev-emitter"), require("get-size"));
    } else {
        window.Outlayer = {};
        window.Outlayer.Item = factory(window.EvEmitter, window.getSize);
    }
})(window, function factory(EvEmitter, getSize) {
    "use strict";
    function isEmptyObj(obj) {
        for (var prop in obj) {
            return !1;
        }
        prop = null;
        return !0;
    }
    var docElemStyle = document.documentElement.style;
    var transitionProperty =
        typeof docElemStyle.transition == "string"
            ? "transition"
            : "WebkitTransition";
    var transformProperty =
        typeof docElemStyle.transform == "string"
            ? "transform"
            : "WebkitTransform";
    var transitionEndEvent = {
        WebkitTransition: "webkitTransitionEnd",
        transition: "transitionend",
    }[transitionProperty];
    var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + "Duration",
        transitionProperty: transitionProperty + "Property",
        transitionDelay: transitionProperty + "Delay",
    };
    function Item(element, layout) {
        if (!element) {
            return;
        }
        this.element = element;
        this.layout = layout;
        this.position = { x: 0, y: 0 };
        this._create();
    }
    var proto = (Item.prototype = Object.create(EvEmitter.prototype));
    proto.constructor = Item;
    proto._create = function () {
        this._transn = { ingProperties: {}, clean: {}, onEnd: {} };
        this.css({ position: "absolute" });
    };
    proto.handleEvent = function (event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    proto.getSize = function () {
        this.size = getSize(this.element);
    };
    proto.css = function (style) {
        var elemStyle = this.element.style;
        for (var prop in style) {
            var supportedProp = vendorProperties[prop] || prop;
            elemStyle[supportedProp] = style[prop];
        }
    };
    proto.getPosition = function () {
        var style = getComputedStyle(this.element);
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xValue = style[isOriginLeft ? "left" : "right"];
        var yValue = style[isOriginTop ? "top" : "bottom"];
        var x = parseFloat(xValue);
        var y = parseFloat(yValue);
        var layoutSize = this.layout.size;
        if (xValue.indexOf("%") != -1) {
            x = (x / 100) * layoutSize.width;
        }
        if (yValue.indexOf("%") != -1) {
            y = (y / 100) * layoutSize.height;
        }
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
        this.position.x = x;
        this.position.y = y;
    };
    proto.layoutPosition = function () {
        var layoutSize = this.layout.size;
        var style = {};
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xPadding = isOriginLeft ? "paddingLeft" : "paddingRight";
        var xProperty = isOriginLeft ? "left" : "right";
        var xResetProperty = isOriginLeft ? "right" : "left";
        var x = this.position.x + layoutSize[xPadding];
        style[xProperty] = this.getXValue(x);
        style[xResetProperty] = "";
        var yPadding = isOriginTop ? "paddingTop" : "paddingBottom";
        var yProperty = isOriginTop ? "top" : "bottom";
        var yResetProperty = isOriginTop ? "bottom" : "top";
        var y = this.position.y + layoutSize[yPadding];
        style[yProperty] = this.getYValue(y);
        style[yResetProperty] = "";
        this.css(style);
        this.emitEvent("layout", [this]);
    };
    proto.getXValue = function (x) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && !isHorizontal
            ? (x / this.layout.size.width) * 100 + "%"
            : x + "px";
    };
    proto.getYValue = function (y) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && isHorizontal
            ? (y / this.layout.size.height) * 100 + "%"
            : y + "px";
    };
    proto._transitionTo = function (x, y) {
        this.getPosition();
        var curX = this.position.x;
        var curY = this.position.y;
        var didNotMove = x == this.position.x && y == this.position.y;
        this.setPosition(x, y);
        if (didNotMove && !this.isTransitioning) {
            this.layoutPosition();
            return;
        }
        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);
        this.transition({
            to: transitionStyle,
            onTransitionEnd: { transform: this.layoutPosition },
            isCleaning: !0,
        });
    };
    proto.getTranslate = function (x, y) {
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return "translate3d(" + x + "px, " + y + "px, 0)";
    };
    proto.goTo = function (x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
    };
    proto.moveTo = proto._transitionTo;
    proto.setPosition = function (x, y) {
        this.position.x = parseFloat(x);
        this.position.y = parseFloat(y);
    };
    proto._nonTransition = function (args) {
        this.css(args.to);
        if (args.isCleaning) {
            this._removeStyles(args.to);
        }
        for (var prop in args.onTransitionEnd) {
            args.onTransitionEnd[prop].call(this);
        }
    };
    proto.transition = function (args) {
        if (!parseFloat(this.layout.options.transitionDuration)) {
            this._nonTransition(args);
            return;
        }
        var _transition = this._transn;
        for (var prop in args.onTransitionEnd) {
            _transition.onEnd[prop] = args.onTransitionEnd[prop];
        }
        for (prop in args.to) {
            _transition.ingProperties[prop] = !0;
            if (args.isCleaning) {
                _transition.clean[prop] = !0;
            }
        }
        if (args.from) {
            this.css(args.from);
            var h = this.element.offsetHeight;
            h = null;
        }
        this.enableTransition(args.to);
        this.css(args.to);
        this.isTransitioning = !0;
    };
    function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function ($1) {
            return "-" + $1.toLowerCase();
        });
    }
    var transitionProps = "opacity," + toDashedAll(transformProperty);
    proto.enableTransition = function () {
        if (this.isTransitioning) {
            return;
        }
        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == "number" ? duration + "ms" : duration;
        this.css({
            transitionProperty: transitionProps,
            transitionDuration: duration,
            transitionDelay: this.staggerDelay || 0,
        });
        this.element.addEventListener(transitionEndEvent, this, !1);
    };
    proto.onwebkitTransitionEnd = function (event) {
        this.ontransitionend(event);
    };
    proto.onotransitionend = function (event) {
        this.ontransitionend(event);
    };
    var dashedVendorProperties = { "-webkit-transform": "transform" };
    proto.ontransitionend = function (event) {
        if (event.target !== this.element) {
            return;
        }
        var _transition = this._transn;
        var propertyName =
            dashedVendorProperties[event.propertyName] || event.propertyName;
        delete _transition.ingProperties[propertyName];
        if (isEmptyObj(_transition.ingProperties)) {
            this.disableTransition();
        }
        if (propertyName in _transition.clean) {
            this.element.style[event.propertyName] = "";
            delete _transition.clean[propertyName];
        }
        if (propertyName in _transition.onEnd) {
            var onTransitionEnd = _transition.onEnd[propertyName];
            onTransitionEnd.call(this);
            delete _transition.onEnd[propertyName];
        }
        this.emitEvent("transitionEnd", [this]);
    };
    proto.disableTransition = function () {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, !1);
        this.isTransitioning = !1;
    };
    proto._removeStyles = function (style) {
        var cleanStyle = {};
        for (var prop in style) {
            cleanStyle[prop] = "";
        }
        this.css(cleanStyle);
    };
    var cleanTransitionStyle = {
        transitionProperty: "",
        transitionDuration: "",
        transitionDelay: "",
    };
    proto.removeTransitionStyles = function () {
        this.css(cleanTransitionStyle);
    };
    proto.stagger = function (delay) {
        delay = isNaN(delay) ? 0 : delay;
        this.staggerDelay = delay + "ms";
    };
    proto.removeElem = function () {
        this.element.parentNode.removeChild(this.element);
        this.css({ display: "" });
        this.emitEvent("remove", [this]);
    };
    proto.remove = function () {
        if (
            !transitionProperty ||
            !parseFloat(this.layout.options.transitionDuration)
        ) {
            this.removeElem();
            return;
        }
        this.once("transitionEnd", function () {
            this.removeElem();
        });
        this.hide();
    };
    proto.reveal = function () {
        delete this.isHidden;
        this.css({ display: "" });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty =
            this.getHideRevealTransitionEndProperty("visibleStyle");
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;
        this.transition({
            from: options.hiddenStyle,
            to: options.visibleStyle,
            isCleaning: !0,
            onTransitionEnd: onTransitionEnd,
        });
    };
    proto.onRevealTransitionEnd = function () {
        if (!this.isHidden) {
            this.emitEvent("reveal");
        }
    };
    proto.getHideRevealTransitionEndProperty = function (styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        if (optionStyle.opacity) {
            return "opacity";
        }
        for (var prop in optionStyle) {
            return prop;
        }
    };
    proto.hide = function () {
        this.isHidden = !0;
        this.css({ display: "" });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty =
            this.getHideRevealTransitionEndProperty("hiddenStyle");
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;
        this.transition({
            from: options.visibleStyle,
            to: options.hiddenStyle,
            isCleaning: !0,
            onTransitionEnd: onTransitionEnd,
        });
    };
    proto.onHideTransitionEnd = function () {
        if (this.isHidden) {
            this.css({ display: "none" });
            this.emitEvent("hide");
        }
    };
    proto.destroy = function () {
        this.css({
            position: "",
            left: "",
            right: "",
            top: "",
            bottom: "",
            transition: "",
            transform: "",
        });
    };
    return Item;
});
/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */
(function (window, factory) {
    "use strict";
    if (typeof define == "function" && define.amd) {
        define("outlayer/outlayer", [
            "ev-emitter/ev-emitter",
            "get-size/get-size",
            "fizzy-ui-utils/utils",
            "./item",
        ], function (EvEmitter, getSize, utils, Item) {
            return factory(window, EvEmitter, getSize, utils, Item);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            window,
            require("ev-emitter"),
            require("get-size"),
            require("fizzy-ui-utils"),
            require("./item")
        );
    } else {
        window.Outlayer = factory(
            window,
            window.EvEmitter,
            window.getSize,
            window.fizzyUIUtils,
            window.Outlayer.Item
        );
    }
})(window, function factory(window, EvEmitter, getSize, utils, Item) {
    "use strict";
    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function () {};
    var GUID = 0;
    var instances = {};
    function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
            if (console) {
                console.error(
                    "Bad element for " +
                        this.constructor.namespace +
                        ": " +
                        (queryElement || element)
                );
            }
            return;
        }
        this.element = queryElement;
        if (jQuery) {
            this.$element = jQuery(this.element);
        }
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);
        var id = ++GUID;
        this.element.outlayerGUID = id;
        instances[id] = this;
        this._create();
        var isInitLayout = this._getOption("initLayout");
        if (isInitLayout) {
            this.layout();
        }
    }
    Outlayer.namespace = "outlayer";
    Outlayer.Item = Item;
    Outlayer.defaults = {
        containerStyle: { position: "relative" },
        initLayout: !0,
        originLeft: !0,
        originTop: !0,
        resize: !0,
        resizeContainer: !0,
        transitionDuration: "0.4s",
        hiddenStyle: { opacity: 0, transform: "scale(0.001)" },
        visibleStyle: { opacity: 1, transform: "scale(1)" },
    };
    var proto = Outlayer.prototype;
    utils.extend(proto, EvEmitter.prototype);
    proto.option = function (opts) {
        utils.extend(this.options, opts);
    };
    proto._getOption = function (option) {
        var oldOption = this.constructor.compatOptions[option];
        return oldOption && this.options[oldOption] !== undefined
            ? this.options[oldOption]
            : this.options[option];
    };
    Outlayer.compatOptions = {
        initLayout: "isInitLayout",
        horizontal: "isHorizontal",
        layoutInstant: "isLayoutInstant",
        originLeft: "isOriginLeft",
        originTop: "isOriginTop",
        resize: "isResizeBound",
        resizeContainer: "isResizingContainer",
    };
    proto._create = function () {
        this.reloadItems();
        this.stamps = [];
        this.stamp(this.options.stamp);
        utils.extend(this.element.style, this.options.containerStyle);
        var canBindResize = this._getOption("resize");
        if (canBindResize) {
            this.bindResize();
        }
    };
    proto.reloadItems = function () {
        this.items = this._itemize(this.element.children);
    };
    proto._itemize = function (elems) {
        var itemElems = this._filterFindItemElements(elems);
        var Item = this.constructor.Item;
        var items = [];
        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            var item = new Item(elem, this);
            items.push(item);
        }
        return items;
    };
    proto._filterFindItemElements = function (elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
    };
    proto.getItemElements = function () {
        return this.items.map(function (item) {
            return item.element;
        });
    };
    proto.layout = function () {
        this._resetLayout();
        this._manageStamps();
        var layoutInstant = this._getOption("layoutInstant");
        var isInstant =
            layoutInstant !== undefined ? layoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);
        this._isLayoutInited = !0;
    };
    proto._init = proto.layout;
    proto._resetLayout = function () {
        this.getSize();
    };
    proto.getSize = function () {
        this.size = getSize(this.element);
    };
    proto._getMeasurement = function (measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
            this[measurement] = 0;
        } else {
            if (typeof option == "string") {
                elem = this.element.querySelector(option);
            } else if (option instanceof HTMLElement) {
                elem = option;
            }
            this[measurement] = elem ? getSize(elem)[size] : option;
        }
    };
    proto.layoutItems = function (items, isInstant) {
        items = this._getItemsForLayout(items);
        this._layoutItems(items, isInstant);
        this._postLayout();
    };
    proto._getItemsForLayout = function (items) {
        return items.filter(function (item) {
            return !item.isIgnored;
        });
    };
    proto._layoutItems = function (items, isInstant) {
        this._emitCompleteOnItems("layout", items);
        if (!items || !items.length) {
            return;
        }
        var queue = [];
        items.forEach(function (item) {
            var position = this._getItemLayoutPosition(item);
            position.item = item;
            position.isInstant = isInstant || item.isLayoutInstant;
            queue.push(position);
        }, this);
        this._processLayoutQueue(queue);
    };
    proto._getItemLayoutPosition = function () {
        return { x: 0, y: 0 };
    };
    proto._processLayoutQueue = function (queue) {
        this.updateStagger();
        queue.forEach(function (obj, i) {
            this._positionItem(obj.item, obj.x, obj.y, obj.isInstant, i);
        }, this);
    };
    proto.updateStagger = function () {
        var stagger = this.options.stagger;
        if (stagger === null || stagger === undefined) {
            this.stagger = 0;
            return;
        }
        this.stagger = getMilliseconds(stagger);
        return this.stagger;
    };
    proto._positionItem = function (item, x, y, isInstant, i) {
        if (isInstant) {
            item.goTo(x, y);
        } else {
            item.stagger(i * this.stagger);
            item.moveTo(x, y);
        }
    };
    proto._postLayout = function () {
        this.resizeContainer();
    };
    proto.resizeContainer = function () {
        var isResizingContainer = this._getOption("resizeContainer");
        if (!isResizingContainer) {
            return;
        }
        var size = this._getContainerSize();
        if (size) {
            this._setContainerMeasure(size.width, !0);
            this._setContainerMeasure(size.height, !1);
        }
    };
    proto._getContainerSize = noop;
    proto._setContainerMeasure = function (measure, isWidth) {
        if (measure === undefined) {
            return;
        }
        var elemSize = this.size;
        if (elemSize.isBorderBox) {
            measure += isWidth
                ? elemSize.paddingLeft +
                  elemSize.paddingRight +
                  elemSize.borderLeftWidth +
                  elemSize.borderRightWidth
                : elemSize.paddingBottom +
                  elemSize.paddingTop +
                  elemSize.borderTopWidth +
                  elemSize.borderBottomWidth;
        }
        measure = Math.max(measure, 0);
        this.element.style[isWidth ? "width" : "height"] = measure + "px";
    };
    proto._emitCompleteOnItems = function (eventName, items) {
        var _this = this;
        function onComplete() {
            _this.dispatchEvent(eventName + "Complete", null, [items]);
        }
        var count = items.length;
        if (!items || !count) {
            onComplete();
            return;
        }
        var doneCount = 0;
        function tick() {
            doneCount++;
            if (doneCount == count) {
                onComplete();
            }
        }
        items.forEach(function (item) {
            item.once(eventName, tick);
        });
    };
    proto.dispatchEvent = function (type, event, args) {
        var emitArgs = event ? [event].concat(args) : args;
        this.emitEvent(type, emitArgs);
        if (jQuery) {
            this.$element = this.$element || jQuery(this.element);
            if (event) {
                var $event = jQuery.Event(event);
                $event.type = type;
                this.$element.trigger($event, args);
            } else {
                this.$element.trigger(type, args);
            }
        }
    };
    proto.ignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
            item.isIgnored = !0;
        }
    };
    proto.unignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
            delete item.isIgnored;
        }
    };
    proto.stamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        this.stamps = this.stamps.concat(elems);
        elems.forEach(this.ignore, this);
    };
    proto.unstamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        elems.forEach(function (elem) {
            utils.removeFrom(this.stamps, elem);
            this.unignore(elem);
        }, this);
    };
    proto._find = function (elems) {
        if (!elems) {
            return;
        }
        if (typeof elems == "string") {
            elems = this.element.querySelectorAll(elems);
        }
        elems = utils.makeArray(elems);
        return elems;
    };
    proto._manageStamps = function () {
        if (!this.stamps || !this.stamps.length) {
            return;
        }
        this._getBoundingRect();
        this.stamps.forEach(this._manageStamp, this);
    };
    proto._getBoundingRect = function () {
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
            left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
            top: boundingRect.top + size.paddingTop + size.borderTopWidth,
            right:
                boundingRect.right -
                (size.paddingRight + size.borderRightWidth),
            bottom:
                boundingRect.bottom -
                (size.paddingBottom + size.borderBottomWidth),
        };
    };
    proto._manageStamp = noop;
    proto._getElementOffset = function (elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
            left: boundingRect.left - thisRect.left - size.marginLeft,
            top: boundingRect.top - thisRect.top - size.marginTop,
            right: thisRect.right - boundingRect.right - size.marginRight,
            bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom,
        };
        return offset;
    };
    proto.handleEvent = utils.handleEvent;
    proto.bindResize = function () {
        window.addEventListener("resize", this);
        this.isResizeBound = !0;
    };
    proto.unbindResize = function () {
        window.removeEventListener("resize", this);
        this.isResizeBound = !1;
    };
    proto.onresize = function () {
        this.resize();
    };
    utils.debounceMethod(Outlayer, "onresize", 100);
    proto.resize = function () {
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        this.layout();
    };
    proto.needsResizeLayout = function () {
        var size = getSize(this.element);
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
    };
    proto.addItems = function (elems) {
        var items = this._itemize(elems);
        if (items.length) {
            this.items = this.items.concat(items);
        }
        return items;
    };
    proto.appended = function (elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        this.layoutItems(items, !0);
        this.reveal(items);
    };
    proto.prepended = function (elems) {
        var items = this._itemize(elems);
        if (!items.length) {
            return;
        }
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        this._resetLayout();
        this._manageStamps();
        this.layoutItems(items, !0);
        this.reveal(items);
        this.layoutItems(previousItems);
    };
    proto.reveal = function (items) {
        this._emitCompleteOnItems("reveal", items);
        if (!items || !items.length) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
            item.stagger(i * stagger);
            item.reveal();
        });
    };
    proto.hide = function (items) {
        this._emitCompleteOnItems("hide", items);
        if (!items || !items.length) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
            item.stagger(i * stagger);
            item.hide();
        });
    };
    proto.revealItemElements = function (elems) {
        var items = this.getItems(elems);
        this.reveal(items);
    };
    proto.hideItemElements = function (elems) {
        var items = this.getItems(elems);
        this.hide(items);
    };
    proto.getItem = function (elem) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.element == elem) {
                return item;
            }
        }
    };
    proto.getItems = function (elems) {
        elems = utils.makeArray(elems);
        var items = [];
        elems.forEach(function (elem) {
            var item = this.getItem(elem);
            if (item) {
                items.push(item);
            }
        }, this);
        return items;
    };
    proto.remove = function (elems) {
        var removeItems = this.getItems(elems);
        this._emitCompleteOnItems("remove", removeItems);
        if (!removeItems || !removeItems.length) {
            return;
        }
        removeItems.forEach(function (item) {
            item.remove();
            utils.removeFrom(this.items, item);
        }, this);
    };
    proto.destroy = function () {
        var style = this.element.style;
        style.height = "";
        style.position = "";
        style.width = "";
        this.items.forEach(function (item) {
            item.destroy();
        });
        this.unbindResize();
        var id = this.element.outlayerGUID;
        delete instances[id];
        delete this.element.outlayerGUID;
        if (jQuery) {
            jQuery.removeData(this.element, this.constructor.namespace);
        }
    };
    Outlayer.data = function (elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
    };
    Outlayer.create = function (namespace, options) {
        var Layout = subclass(Outlayer);
        Layout.defaults = utils.extend({}, Outlayer.defaults);
        utils.extend(Layout.defaults, options);
        Layout.compatOptions = utils.extend({}, Outlayer.compatOptions);
        Layout.namespace = namespace;
        Layout.data = Outlayer.data;
        Layout.Item = subclass(Item);
        utils.htmlInit(Layout, namespace);
        if (jQuery && jQuery.bridget) {
            jQuery.bridget(namespace, Layout);
        }
        return Layout;
    };
    function subclass(Parent) {
        function SubClass() {
            Parent.apply(this, arguments);
        }
        SubClass.prototype = Object.create(Parent.prototype);
        SubClass.prototype.constructor = SubClass;
        return SubClass;
    }
    var msUnits = { ms: 1, s: 1000 };
    function getMilliseconds(time) {
        if (typeof time == "number") {
            return time;
        }
        var matches = time.match(/(^\d*\.?\d*)(\w*)/);
        var num = matches && matches[1];
        var unit = matches && matches[2];
        if (!num.length) {
            return 0;
        }
        num = parseFloat(num);
        var mult = msUnits[unit] || 1;
        return num * mult;
    }
    Outlayer.Item = Item;
    return Outlayer;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("isotope-layout/js/item", ["outlayer/outlayer"], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("outlayer"));
    } else {
        window.Isotope = window.Isotope || {};
        window.Isotope.Item = factory(window.Outlayer);
    }
})(window, function factory(Outlayer) {
    "use strict";
    function Item() {
        Outlayer.Item.apply(this, arguments);
    }
    var proto = (Item.prototype = Object.create(Outlayer.Item.prototype));
    var _create = proto._create;
    proto._create = function () {
        this.id = this.layout.itemGUID++;
        _create.call(this);
        this.sortData = {};
    };
    proto.updateSortData = function () {
        if (this.isIgnored) {
            return;
        }
        this.sortData.id = this.id;
        this.sortData["original-order"] = this.id;
        this.sortData.random = Math.random();
        var getSortData = this.layout.options.getSortData;
        var sorters = this.layout._sorters;
        for (var key in getSortData) {
            var sorter = sorters[key];
            this.sortData[key] = sorter(this.element, this);
        }
    };
    var _destroy = proto.destroy;
    proto.destroy = function () {
        _destroy.apply(this, arguments);
        this.css({ display: "" });
    };
    return Item;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("isotope-layout/js/layout-mode", [
            "get-size/get-size",
            "outlayer/outlayer",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("get-size"), require("outlayer"));
    } else {
        window.Isotope = window.Isotope || {};
        window.Isotope.LayoutMode = factory(window.getSize, window.Outlayer);
    }
})(window, function factory(getSize, Outlayer) {
    "use strict";
    function LayoutMode(isotope) {
        this.isotope = isotope;
        if (isotope) {
            this.options = isotope.options[this.namespace];
            this.element = isotope.element;
            this.items = isotope.filteredItems;
            this.size = isotope.size;
        }
    }
    var proto = LayoutMode.prototype;
    var facadeMethods = [
        "_resetLayout",
        "_getItemLayoutPosition",
        "_manageStamp",
        "_getContainerSize",
        "_getElementOffset",
        "needsResizeLayout",
        "_getOption",
    ];
    facadeMethods.forEach(function (methodName) {
        proto[methodName] = function () {
            return Outlayer.prototype[methodName].apply(
                this.isotope,
                arguments
            );
        };
    });
    proto.needsVerticalResizeLayout = function () {
        var size = getSize(this.isotope.element);
        var hasSizes = this.isotope.size && size;
        return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
    };
    proto._getMeasurement = function () {
        this.isotope._getMeasurement.apply(this, arguments);
    };
    proto.getColumnWidth = function () {
        this.getSegmentSize("column", "Width");
    };
    proto.getRowHeight = function () {
        this.getSegmentSize("row", "Height");
    };
    proto.getSegmentSize = function (segment, size) {
        var segmentName = segment + size;
        var outerSize = "outer" + size;
        this._getMeasurement(segmentName, outerSize);
        if (this[segmentName]) {
            return;
        }
        var firstItemSize = this.getFirstItemSize();
        this[segmentName] =
            (firstItemSize && firstItemSize[outerSize]) ||
            this.isotope.size["inner" + size];
    };
    proto.getFirstItemSize = function () {
        var firstItem = this.isotope.filteredItems[0];
        return firstItem && firstItem.element && getSize(firstItem.element);
    };
    proto.layout = function () {
        this.isotope.layout.apply(this.isotope, arguments);
    };
    proto.getSize = function () {
        this.isotope.getSize();
        this.size = this.isotope.size;
    };
    LayoutMode.modes = {};
    LayoutMode.create = function (namespace, options) {
        function Mode() {
            LayoutMode.apply(this, arguments);
        }
        Mode.prototype = Object.create(proto);
        Mode.prototype.constructor = Mode;
        if (options) {
            Mode.options = options;
        }
        Mode.prototype.namespace = namespace;
        LayoutMode.modes[namespace] = Mode;
        return Mode;
    };
    return LayoutMode;
});
/*!
 * Masonry v4.2.1
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("masonry-layout/masonry", [
            "outlayer/outlayer",
            "get-size/get-size",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("outlayer"), require("get-size"));
    } else {
        window.Masonry = factory(window.Outlayer, window.getSize);
    }
})(window, function factory(Outlayer, getSize) {
    var Masonry = Outlayer.create("masonry");
    Masonry.compatOptions.fitWidth = "isFitWidth";
    var proto = Masonry.prototype;
    proto._resetLayout = function () {
        this.getSize();
        this._getMeasurement("columnWidth", "outerWidth");
        this._getMeasurement("gutter", "outerWidth");
        this.measureColumns();
        this.colYs = [];
        for (var i = 0; i < this.cols; i++) {
            this.colYs.push(0);
        }
        this.maxY = 0;
        this.horizontalColIndex = 0;
    };
    proto.measureColumns = function () {
        this.getContainerWidth();
        if (!this.columnWidth) {
            var firstItem = this.items[0];
            var firstItemElem = firstItem && firstItem.element;
            this.columnWidth =
                (firstItemElem && getSize(firstItemElem).outerWidth) ||
                this.containerWidth;
        }
        var columnWidth = (this.columnWidth += this.gutter);
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        var excess = columnWidth - (containerWidth % columnWidth);
        var mathMethod = excess && excess < 1 ? "round" : "floor";
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
    };
    proto.getContainerWidth = function () {
        var isFitWidth = this._getOption("fitWidth");
        var container = isFitWidth ? this.element.parentNode : this.element;
        var size = getSize(container);
        this.containerWidth = size && size.innerWidth;
    };
    proto._getItemLayoutPosition = function (item) {
        item.getSize();
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? "round" : "ceil";
        var colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols);
        var colPosMethod = this.options.horizontalOrder
            ? "_getHorizontalColPosition"
            : "_getTopColPosition";
        var colPosition = this[colPosMethod](colSpan, item);
        var position = {
            x: this.columnWidth * colPosition.col,
            y: colPosition.y,
        };
        var setHeight = colPosition.y + item.size.outerHeight;
        var setMax = colSpan + colPosition.col;
        for (var i = colPosition.col; i < setMax; i++) {
            this.colYs[i] = setHeight;
        }
        return position;
    };
    proto._getTopColPosition = function (colSpan) {
        var colGroup = this._getTopColGroup(colSpan);
        var minimumY = Math.min.apply(Math, colGroup);
        return { col: colGroup.indexOf(minimumY), y: minimumY };
    };
    proto._getTopColGroup = function (colSpan) {
        if (colSpan < 2) {
            return this.colYs;
        }
        var colGroup = [];
        var groupCount = this.cols + 1 - colSpan;
        for (var i = 0; i < groupCount; i++) {
            colGroup[i] = this._getColGroupY(i, colSpan);
        }
        return colGroup;
    };
    proto._getColGroupY = function (col, colSpan) {
        if (colSpan < 2) {
            return this.colYs[col];
        }
        var groupColYs = this.colYs.slice(col, col + colSpan);
        return Math.max.apply(Math, groupColYs);
    };
    proto._getHorizontalColPosition = function (colSpan, item) {
        var col = this.horizontalColIndex % this.cols;
        var isOver = colSpan > 1 && col + colSpan > this.cols;
        col = isOver ? 0 : col;
        var hasSize = item.size.outerWidth && item.size.outerHeight;
        this.horizontalColIndex = hasSize
            ? col + colSpan
            : this.horizontalColIndex;
        return { col: col, y: this._getColGroupY(col, colSpan) };
    };
    proto._manageStamp = function (stamp) {
        var stampSize = getSize(stamp);
        var offset = this._getElementOffset(stamp);
        var isOriginLeft = this._getOption("originLeft");
        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth);
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol);
        var isOriginTop = this._getOption("originTop");
        var stampMaxY =
            (isOriginTop ? offset.top : offset.bottom) + stampSize.outerHeight;
        for (var i = firstCol; i <= lastCol; i++) {
            this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
    };
    proto._getContainerSize = function () {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = { height: this.maxY };
        if (this._getOption("fitWidth")) {
            size.width = this._getContainerFitWidth();
        }
        return size;
    };
    proto._getContainerFitWidth = function () {
        var unusedCols = 0;
        var i = this.cols;
        while (--i) {
            if (this.colYs[i] !== 0) {
                break;
            }
            unusedCols++;
        }
        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
    };
    proto.needsResizeLayout = function () {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
    };
    return Masonry;
});
/*!
 * Masonry layout mode
 * sub-classes Masonry
 * https://masonry.desandro.com
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("isotope-layout/js/layout-modes/masonry", [
            "../layout-mode",
            "masonry-layout/masonry",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            require("../layout-mode"),
            require("masonry-layout")
        );
    } else {
        factory(window.Isotope.LayoutMode, window.Masonry);
    }
})(window, function factory(LayoutMode, Masonry) {
    "use strict";
    var MasonryMode = LayoutMode.create("masonry");
    var proto = MasonryMode.prototype;
    var keepModeMethods = {
        _getElementOffset: !0,
        layout: !0,
        _getMeasurement: !0,
    };
    for (var method in Masonry.prototype) {
        if (!keepModeMethods[method]) {
            proto[method] = Masonry.prototype[method];
        }
    }
    var measureColumns = proto.measureColumns;
    proto.measureColumns = function () {
        this.items = this.isotope.filteredItems;
        measureColumns.call(this);
    };
    var _getOption = proto._getOption;
    proto._getOption = function (option) {
        if (option == "fitWidth") {
            return this.options.isFitWidth !== undefined
                ? this.options.isFitWidth
                : this.options.fitWidth;
        }
        return _getOption.apply(this.isotope, arguments);
    };
    return MasonryMode;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("isotope-layout/js/layout-modes/fit-rows", [
            "../layout-mode",
        ], factory);
    } else if (typeof exports == "object") {
        module.exports = factory(require("../layout-mode"));
    } else {
        factory(window.Isotope.LayoutMode);
    }
})(window, function factory(LayoutMode) {
    "use strict";
    var FitRows = LayoutMode.create("fitRows");
    var proto = FitRows.prototype;
    proto._resetLayout = function () {
        this.x = 0;
        this.y = 0;
        this.maxY = 0;
        this._getMeasurement("gutter", "outerWidth");
    };
    proto._getItemLayoutPosition = function (item) {
        item.getSize();
        var itemWidth = item.size.outerWidth + this.gutter;
        var containerWidth = this.isotope.size.innerWidth + this.gutter;
        if (this.x !== 0 && itemWidth + this.x > containerWidth) {
            this.x = 0;
            this.y = this.maxY;
        }
        var position = { x: this.x, y: this.y };
        this.maxY = Math.max(this.maxY, this.y + item.size.outerHeight);
        this.x += itemWidth;
        return position;
    };
    proto._getContainerSize = function () {
        return { height: this.maxY };
    };
    return FitRows;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("isotope-layout/js/layout-modes/vertical", [
            "../layout-mode",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("../layout-mode"));
    } else {
        factory(window.Isotope.LayoutMode);
    }
})(window, function factory(LayoutMode) {
    "use strict";
    var Vertical = LayoutMode.create("vertical", { horizontalAlignment: 0 });
    var proto = Vertical.prototype;
    proto._resetLayout = function () {
        this.y = 0;
    };
    proto._getItemLayoutPosition = function (item) {
        item.getSize();
        var x =
            (this.isotope.size.innerWidth - item.size.outerWidth) *
            this.options.horizontalAlignment;
        var y = this.y;
        this.y += item.size.outerHeight;
        return { x: x, y: y };
    };
    proto._getContainerSize = function () {
        return { height: this.y };
    };
    return Vertical;
});
/*!
 * Isotope v3.0.6
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define([
            "outlayer/outlayer",
            "get-size/get-size",
            "desandro-matches-selector/matches-selector",
            "fizzy-ui-utils/utils",
            "isotope-layout/js/item",
            "isotope-layout/js/layout-mode",
            "isotope-layout/js/layout-modes/masonry",
            "isotope-layout/js/layout-modes/fit-rows",
            "isotope-layout/js/layout-modes/vertical",
        ], function (
            Outlayer,
            getSize,
            matchesSelector,
            utils,
            Item,
            LayoutMode
        ) {
            return factory(
                window,
                Outlayer,
                getSize,
                matchesSelector,
                utils,
                Item,
                LayoutMode
            );
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            window,
            require("outlayer"),
            require("get-size"),
            require("desandro-matches-selector"),
            require("fizzy-ui-utils"),
            require("isotope-layout/js/item"),
            require("isotope-layout/js/layout-mode"),
            require("isotope-layout/js/layout-modes/masonry"),
            require("isotope-layout/js/layout-modes/fit-rows"),
            require("isotope-layout/js/layout-modes/vertical")
        );
    } else {
        window.Isotope = factory(
            window,
            window.Outlayer,
            window.getSize,
            window.matchesSelector,
            window.fizzyUIUtils,
            window.Isotope.Item,
            window.Isotope.LayoutMode
        );
    }
})(
    window,
    function factory(
        window,
        Outlayer,
        getSize,
        matchesSelector,
        utils,
        Item,
        LayoutMode
    ) {
        var jQuery = window.jQuery;
        var trim = String.prototype.trim
            ? function (str) {
                  return str.trim();
              }
            : function (str) {
                  return str.replace(/^\s+|\s+$/g, "");
              };
        var Isotope = Outlayer.create("isotope", {
            layoutMode: "masonry",
            isJQueryFiltering: !0,
            sortAscending: !0,
        });
        Isotope.Item = Item;
        Isotope.LayoutMode = LayoutMode;
        var proto = Isotope.prototype;
        proto._create = function () {
            this.itemGUID = 0;
            this._sorters = {};
            this._getSorters();
            Outlayer.prototype._create.call(this);
            this.modes = {};
            this.filteredItems = this.items;
            this.sortHistory = ["original-order"];
            for (var name in LayoutMode.modes) {
                this._initLayoutMode(name);
            }
        };
        proto.reloadItems = function () {
            this.itemGUID = 0;
            Outlayer.prototype.reloadItems.call(this);
        };
        proto._itemize = function () {
            var items = Outlayer.prototype._itemize.apply(this, arguments);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                item.id = this.itemGUID++;
            }
            this._updateItemsSortData(items);
            return items;
        };
        proto._initLayoutMode = function (name) {
            var Mode = LayoutMode.modes[name];
            var initialOpts = this.options[name] || {};
            this.options[name] = Mode.options
                ? utils.extend(Mode.options, initialOpts)
                : initialOpts;
            this.modes[name] = new Mode(this);
        };
        proto.layout = function () {
            if (!this._isLayoutInited && this._getOption("initLayout")) {
                this.arrange();
                return;
            }
            this._layout();
        };
        proto._layout = function () {
            var isInstant = this._getIsInstant();
            this._resetLayout();
            this._manageStamps();
            this.layoutItems(this.filteredItems, isInstant);
            this._isLayoutInited = !0;
        };
        proto.arrange = function (opts) {
            this.option(opts);
            this._getIsInstant();
            var filtered = this._filter(this.items);
            this.filteredItems = filtered.matches;
            this._bindArrangeComplete();
            if (this._isInstant) {
                this._noTransition(this._hideReveal, [filtered]);
            } else {
                this._hideReveal(filtered);
            }
            this._sort();
            this._layout();
        };
        proto._init = proto.arrange;
        proto._hideReveal = function (filtered) {
            this.reveal(filtered.needReveal);
            this.hide(filtered.needHide);
        };
        proto._getIsInstant = function () {
            var isLayoutInstant = this._getOption("layoutInstant");
            var isInstant =
                isLayoutInstant !== undefined
                    ? isLayoutInstant
                    : !this._isLayoutInited;
            this._isInstant = isInstant;
            return isInstant;
        };
        proto._bindArrangeComplete = function () {
            var isLayoutComplete, isHideComplete, isRevealComplete;
            var _this = this;
            function arrangeParallelCallback() {
                if (isLayoutComplete && isHideComplete && isRevealComplete) {
                    _this.dispatchEvent("arrangeComplete", null, [
                        _this.filteredItems,
                    ]);
                }
            }
            this.once("layoutComplete", function () {
                isLayoutComplete = !0;
                arrangeParallelCallback();
            });
            this.once("hideComplete", function () {
                isHideComplete = !0;
                arrangeParallelCallback();
            });
            this.once("revealComplete", function () {
                isRevealComplete = !0;
                arrangeParallelCallback();
            });
        };
        proto._filter = function (items) {
            var filter = this.options.filter;
            filter = filter || "*";
            var matches = [];
            var hiddenMatched = [];
            var visibleUnmatched = [];
            var test = this._getFilterTest(filter);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.isIgnored) {
                    continue;
                }
                var isMatched = test(item);
                if (isMatched) {
                    matches.push(item);
                }
                if (isMatched && item.isHidden) {
                    hiddenMatched.push(item);
                } else if (!isMatched && !item.isHidden) {
                    visibleUnmatched.push(item);
                }
            }
            return {
                matches: matches,
                needReveal: hiddenMatched,
                needHide: visibleUnmatched,
            };
        };
        proto._getFilterTest = function (filter) {
            if (jQuery && this.options.isJQueryFiltering) {
                return function (item) {
                    return jQuery(item.element).is(filter);
                };
            }
            if (typeof filter == "function") {
                return function (item) {
                    return filter(item.element);
                };
            }
            return function (item) {
                return matchesSelector(item.element, filter);
            };
        };
        proto.updateSortData = function (elems) {
            var items;
            if (elems) {
                elems = utils.makeArray(elems);
                items = this.getItems(elems);
            } else {
                items = this.items;
            }
            this._getSorters();
            this._updateItemsSortData(items);
        };
        proto._getSorters = function () {
            var getSortData = this.options.getSortData;
            for (var key in getSortData) {
                var sorter = getSortData[key];
                this._sorters[key] = mungeSorter(sorter);
            }
        };
        proto._updateItemsSortData = function (items) {
            var len = items && items.length;
            for (var i = 0; len && i < len; i++) {
                var item = items[i];
                item.updateSortData();
            }
        };
        var mungeSorter = (function () {
            function mungeSorter(sorter) {
                if (typeof sorter != "string") {
                    return sorter;
                }
                var args = trim(sorter).split(" ");
                var query = args[0];
                var attrMatch = query.match(/^\[(.+)\]$/);
                var attr = attrMatch && attrMatch[1];
                var getValue = getValueGetter(attr, query);
                var parser = Isotope.sortDataParsers[args[1]];
                sorter = parser
                    ? function (elem) {
                          return elem && parser(getValue(elem));
                      }
                    : function (elem) {
                          return elem && getValue(elem);
                      };
                return sorter;
            }
            function getValueGetter(attr, query) {
                if (attr) {
                    return function getAttribute(elem) {
                        return elem.getAttribute(attr);
                    };
                }
                return function getChildText(elem) {
                    var child = elem.querySelector(query);
                    return child && child.textContent;
                };
            }
            return mungeSorter;
        })();
        Isotope.sortDataParsers = {
            parseInt: function (val) {
                return parseInt(val, 10);
            },
            parseFloat: function (val) {
                return parseFloat(val);
            },
        };
        proto._sort = function () {
            if (!this.options.sortBy) {
                return;
            }
            var sortBys = utils.makeArray(this.options.sortBy);
            if (!this._getIsSameSortBy(sortBys)) {
                this.sortHistory = sortBys.concat(this.sortHistory);
            }
            var itemSorter = getItemSorter(
                this.sortHistory,
                this.options.sortAscending
            );
            this.filteredItems.sort(itemSorter);
        };
        proto._getIsSameSortBy = function (sortBys) {
            for (var i = 0; i < sortBys.length; i++) {
                if (sortBys[i] != this.sortHistory[i]) {
                    return !1;
                }
            }
            return !0;
        };
        function getItemSorter(sortBys, sortAsc) {
            return function sorter(itemA, itemB) {
                for (var i = 0; i < sortBys.length; i++) {
                    var sortBy = sortBys[i];
                    var a = itemA.sortData[sortBy];
                    var b = itemB.sortData[sortBy];
                    if (a > b || a < b) {
                        var isAscending =
                            sortAsc[sortBy] !== undefined
                                ? sortAsc[sortBy]
                                : sortAsc;
                        var direction = isAscending ? 1 : -1;
                        return (a > b ? 1 : -1) * direction;
                    }
                }
                return 0;
            };
        }
        proto._mode = function () {
            var layoutMode = this.options.layoutMode;
            var mode = this.modes[layoutMode];
            if (!mode) {
                throw new Error("No layout mode: " + layoutMode);
            }
            mode.options = this.options[layoutMode];
            return mode;
        };
        proto._resetLayout = function () {
            Outlayer.prototype._resetLayout.call(this);
            this._mode()._resetLayout();
        };
        proto._getItemLayoutPosition = function (item) {
            return this._mode()._getItemLayoutPosition(item);
        };
        proto._manageStamp = function (stamp) {
            this._mode()._manageStamp(stamp);
        };
        proto._getContainerSize = function () {
            return this._mode()._getContainerSize();
        };
        proto.needsResizeLayout = function () {
            return this._mode().needsResizeLayout();
        };
        proto.appended = function (elems) {
            var items = this.addItems(elems);
            if (!items.length) {
                return;
            }
            var filteredItems = this._filterRevealAdded(items);
            this.filteredItems = this.filteredItems.concat(filteredItems);
        };
        proto.prepended = function (elems) {
            var items = this._itemize(elems);
            if (!items.length) {
                return;
            }
            this._resetLayout();
            this._manageStamps();
            var filteredItems = this._filterRevealAdded(items);
            this.layoutItems(this.filteredItems);
            this.filteredItems = filteredItems.concat(this.filteredItems);
            this.items = items.concat(this.items);
        };
        proto._filterRevealAdded = function (items) {
            var filtered = this._filter(items);
            this.hide(filtered.needHide);
            this.reveal(filtered.matches);
            this.layoutItems(filtered.matches, !0);
            return filtered.matches;
        };
        proto.insert = function (elems) {
            var items = this.addItems(elems);
            if (!items.length) {
                return;
            }
            var i, item;
            var len = items.length;
            for (i = 0; i < len; i++) {
                item = items[i];
                this.element.appendChild(item.element);
            }
            var filteredInsertItems = this._filter(items).matches;
            for (i = 0; i < len; i++) {
                items[i].isLayoutInstant = !0;
            }
            this.arrange();
            for (i = 0; i < len; i++) {
                delete items[i].isLayoutInstant;
            }
            this.reveal(filteredInsertItems);
        };
        var _remove = proto.remove;
        proto.remove = function (elems) {
            elems = utils.makeArray(elems);
            var removeItems = this.getItems(elems);
            _remove.call(this, elems);
            var len = removeItems && removeItems.length;
            for (var i = 0; len && i < len; i++) {
                var item = removeItems[i];
                utils.removeFrom(this.filteredItems, item);
            }
        };
        proto.shuffle = function () {
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
                item.sortData.random = Math.random();
            }
            this.options.sortBy = "random";
            this._sort();
            this._layout();
        };
        proto._noTransition = function (fn, args) {
            var transitionDuration = this.options.transitionDuration;
            this.options.transitionDuration = 0;
            var returnValue = fn.apply(this, args);
            this.options.transitionDuration = transitionDuration;
            return returnValue;
        };
        proto.getFilteredItemElements = function () {
            return this.filteredItems.map(function (item) {
                return item.element;
            });
        };
        return Isotope;
    }
);
/*!
 * Packery layout mode PACKAGED v2.0.1
 * sub-classes Packery
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/rect", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        window.Packery = window.Packery || {};
        window.Packery.Rect = factory();
    }
})(window, function factory() {
    function Rect(props) {
        for (var prop in Rect.defaults) {
            this[prop] = Rect.defaults[prop];
        }
        for (prop in props) {
            this[prop] = props[prop];
        }
    }
    Rect.defaults = { x: 0, y: 0, width: 0, height: 0 };
    var proto = Rect.prototype;
    proto.contains = function (rect) {
        var otherWidth = rect.width || 0;
        var otherHeight = rect.height || 0;
        return (
            this.x <= rect.x &&
            this.y <= rect.y &&
            this.x + this.width >= rect.x + otherWidth &&
            this.y + this.height >= rect.y + otherHeight
        );
    };
    proto.overlaps = function (rect) {
        var thisRight = this.x + this.width;
        var thisBottom = this.y + this.height;
        var rectRight = rect.x + rect.width;
        var rectBottom = rect.y + rect.height;
        return (
            this.x < rectRight &&
            thisRight > rect.x &&
            this.y < rectBottom &&
            thisBottom > rect.y
        );
    };
    proto.getMaximalFreeRects = function (rect) {
        if (!this.overlaps(rect)) {
            return !1;
        }
        var freeRects = [];
        var freeRect;
        var thisRight = this.x + this.width;
        var thisBottom = this.y + this.height;
        var rectRight = rect.x + rect.width;
        var rectBottom = rect.y + rect.height;
        if (this.y < rect.y) {
            freeRect = new Rect({
                x: this.x,
                y: this.y,
                width: this.width,
                height: rect.y - this.y,
            });
            freeRects.push(freeRect);
        }
        if (thisRight > rectRight) {
            freeRect = new Rect({
                x: rectRight,
                y: this.y,
                width: thisRight - rectRight,
                height: this.height,
            });
            freeRects.push(freeRect);
        }
        if (thisBottom > rectBottom) {
            freeRect = new Rect({
                x: this.x,
                y: rectBottom,
                width: this.width,
                height: thisBottom - rectBottom,
            });
            freeRects.push(freeRect);
        }
        if (this.x < rect.x) {
            freeRect = new Rect({
                x: this.x,
                y: this.y,
                width: rect.x - this.x,
                height: this.height,
            });
            freeRects.push(freeRect);
        }
        return freeRects;
    };
    proto.canFit = function (rect) {
        return this.width >= rect.width && this.height >= rect.height;
    };
    return Rect;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/packer", ["./rect"], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("./rect"));
    } else {
        var Packery = (window.Packery = window.Packery || {});
        Packery.Packer = factory(Packery.Rect);
    }
})(window, function factory(Rect) {
    function Packer(width, height, sortDirection) {
        this.width = width || 0;
        this.height = height || 0;
        this.sortDirection = sortDirection || "downwardLeftToRight";
        this.reset();
    }
    var proto = Packer.prototype;
    proto.reset = function () {
        this.spaces = [];
        var initialSpace = new Rect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
        });
        this.spaces.push(initialSpace);
        this.sorter =
            sorters[this.sortDirection] || sorters.downwardLeftToRight;
    };
    proto.pack = function (rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            if (space.canFit(rect)) {
                this.placeInSpace(rect, space);
                break;
            }
        }
    };
    proto.columnPack = function (rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var canFitInSpaceColumn =
                space.x <= rect.x &&
                space.x + space.width >= rect.x + rect.width &&
                space.height >= rect.height - 0.01;
            if (canFitInSpaceColumn) {
                rect.y = space.y;
                this.placed(rect);
                break;
            }
        }
    };
    proto.rowPack = function (rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var canFitInSpaceRow =
                space.y <= rect.y &&
                space.y + space.height >= rect.y + rect.height &&
                space.width >= rect.width - 0.01;
            if (canFitInSpaceRow) {
                rect.x = space.x;
                this.placed(rect);
                break;
            }
        }
    };
    proto.placeInSpace = function (rect, space) {
        rect.x = space.x;
        rect.y = space.y;
        this.placed(rect);
    };
    proto.placed = function (rect) {
        var revisedSpaces = [];
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var newSpaces = space.getMaximalFreeRects(rect);
            if (newSpaces) {
                revisedSpaces.push.apply(revisedSpaces, newSpaces);
            } else {
                revisedSpaces.push(space);
            }
        }
        this.spaces = revisedSpaces;
        this.mergeSortSpaces();
    };
    proto.mergeSortSpaces = function () {
        Packer.mergeRects(this.spaces);
        this.spaces.sort(this.sorter);
    };
    proto.addSpace = function (rect) {
        this.spaces.push(rect);
        this.mergeSortSpaces();
    };
    Packer.mergeRects = function (rects) {
        var i = 0;
        var rect = rects[i];
        rectLoop: while (rect) {
            var j = 0;
            var compareRect = rects[i + j];
            while (compareRect) {
                if (compareRect == rect) {
                    j++;
                } else if (compareRect.contains(rect)) {
                    rects.splice(i, 1);
                    rect = rects[i];
                    continue rectLoop;
                } else if (rect.contains(compareRect)) {
                    rects.splice(i + j, 1);
                } else {
                    j++;
                }
                compareRect = rects[i + j];
            }
            i++;
            rect = rects[i];
        }
        return rects;
    };
    var sorters = {
        downwardLeftToRight: function (a, b) {
            return a.y - b.y || a.x - b.x;
        },
        rightwardTopToBottom: function (a, b) {
            return a.x - b.x || a.y - b.y;
        },
    };
    return Packer;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/item", ["outlayer/outlayer", "./rect"], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("outlayer"), require("./rect"));
    } else {
        window.Packery.Item = factory(window.Outlayer, window.Packery.Rect);
    }
})(window, function factory(Outlayer, Rect) {
    var docElemStyle = document.documentElement.style;
    var transformProperty =
        typeof docElemStyle.transform == "string"
            ? "transform"
            : "WebkitTransform";
    var Item = function PackeryItem() {
        Outlayer.Item.apply(this, arguments);
    };
    var proto = (Item.prototype = Object.create(Outlayer.Item.prototype));
    var __create = proto._create;
    proto._create = function () {
        __create.call(this);
        this.rect = new Rect();
    };
    var _moveTo = proto.moveTo;
    proto.moveTo = function (x, y) {
        var dx = Math.abs(this.position.x - x);
        var dy = Math.abs(this.position.y - y);
        var canHackGoTo =
            this.layout.dragItemCount &&
            !this.isPlacing &&
            !this.isTransitioning &&
            dx < 1 &&
            dy < 1;
        if (canHackGoTo) {
            this.goTo(x, y);
            return;
        }
        _moveTo.apply(this, arguments);
    };
    proto.enablePlacing = function () {
        this.removeTransitionStyles();
        if (this.isTransitioning && transformProperty) {
            this.element.style[transformProperty] = "none";
        }
        this.isTransitioning = !1;
        this.getSize();
        this.layout._setRectSize(this.element, this.rect);
        this.isPlacing = !0;
    };
    proto.disablePlacing = function () {
        this.isPlacing = !1;
    };
    proto.removeElem = function () {
        this.element.parentNode.removeChild(this.element);
        this.layout.packer.addSpace(this.rect);
        this.emitEvent("remove", [this]);
    };
    proto.showDropPlaceholder = function () {
        var dropPlaceholder = this.dropPlaceholder;
        if (!dropPlaceholder) {
            dropPlaceholder = this.dropPlaceholder =
                document.createElement("div");
            dropPlaceholder.className = "packery-drop-placeholder";
            dropPlaceholder.style.position = "absolute";
        }
        dropPlaceholder.style.width = this.size.width + "px";
        dropPlaceholder.style.height = this.size.height + "px";
        this.positionDropPlaceholder();
        this.layout.element.appendChild(dropPlaceholder);
    };
    proto.positionDropPlaceholder = function () {
        this.dropPlaceholder.style[transformProperty] =
            "translate(" + this.rect.x + "px, " + this.rect.y + "px)";
    };
    proto.hideDropPlaceholder = function () {
        this.layout.element.removeChild(this.dropPlaceholder);
    };
    return Item;
});
/*!
 * Packery v2.0.0
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2016 Metafizzy
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/packery", [
            "get-size/get-size",
            "outlayer/outlayer",
            "./rect",
            "./packer",
            "./item",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            require("get-size"),
            require("outlayer"),
            require("./rect"),
            require("./packer"),
            require("./item")
        );
    } else {
        window.Packery = factory(
            window.getSize,
            window.Outlayer,
            window.Packery.Rect,
            window.Packery.Packer,
            window.Packery.Item
        );
    }
})(window, function factory(getSize, Outlayer, Rect, Packer, Item) {
    Rect.prototype.canFit = function (rect) {
        return this.width >= rect.width - 1 && this.height >= rect.height - 1;
    };
    var Packery = Outlayer.create("packery");
    Packery.Item = Item;
    var proto = Packery.prototype;
    proto._create = function () {
        Outlayer.prototype._create.call(this);
        this.packer = new Packer();
        this.shiftPacker = new Packer();
        this.isEnabled = !0;
        this.dragItemCount = 0;
        var _this = this;
        this.handleDraggabilly = {
            dragStart: function () {
                _this.itemDragStart(this.element);
            },
            dragMove: function () {
                _this.itemDragMove(
                    this.element,
                    this.position.x,
                    this.position.y
                );
            },
            dragEnd: function () {
                _this.itemDragEnd(this.element);
            },
        };
        this.handleUIDraggable = {
            start: function handleUIDraggableStart(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragStart(event.currentTarget);
            },
            drag: function handleUIDraggableDrag(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragMove(
                    event.currentTarget,
                    ui.position.left,
                    ui.position.top
                );
            },
            stop: function handleUIDraggableStop(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragEnd(event.currentTarget);
            },
        };
    };
    proto._resetLayout = function () {
        this.getSize();
        this._getMeasurements();
        var width, height, sortDirection;
        if (this._getOption("horizontal")) {
            width = Infinity;
            height = this.size.innerHeight + this.gutter;
            sortDirection = "rightwardTopToBottom";
        } else {
            width = this.size.innerWidth + this.gutter;
            height = Infinity;
            sortDirection = "downwardLeftToRight";
        }
        this.packer.width = this.shiftPacker.width = width;
        this.packer.height = this.shiftPacker.height = height;
        this.packer.sortDirection = this.shiftPacker.sortDirection =
            sortDirection;
        this.packer.reset();
        this.maxY = 0;
        this.maxX = 0;
    };
    proto._getMeasurements = function () {
        this._getMeasurement("columnWidth", "width");
        this._getMeasurement("rowHeight", "height");
        this._getMeasurement("gutter", "width");
    };
    proto._getItemLayoutPosition = function (item) {
        this._setRectSize(item.element, item.rect);
        if (this.isShifting || this.dragItemCount > 0) {
            var packMethod = this._getPackMethod();
            this.packer[packMethod](item.rect);
        } else {
            this.packer.pack(item.rect);
        }
        this._setMaxXY(item.rect);
        return item.rect;
    };
    proto.shiftLayout = function () {
        this.isShifting = !0;
        this.layout();
        delete this.isShifting;
    };
    proto._getPackMethod = function () {
        return this._getOption("horizontal") ? "rowPack" : "columnPack";
    };
    proto._setMaxXY = function (rect) {
        this.maxX = Math.max(rect.x + rect.width, this.maxX);
        this.maxY = Math.max(rect.y + rect.height, this.maxY);
    };
    proto._setRectSize = function (elem, rect) {
        var size = getSize(elem);
        var w = size.outerWidth;
        var h = size.outerHeight;
        if (w || h) {
            w = this._applyGridGutter(w, this.columnWidth);
            h = this._applyGridGutter(h, this.rowHeight);
        }
        rect.width = Math.min(w, this.packer.width);
        rect.height = Math.min(h, this.packer.height);
    };
    proto._applyGridGutter = function (measurement, gridSize) {
        if (!gridSize) {
            return measurement + this.gutter;
        }
        gridSize += this.gutter;
        var remainder = measurement % gridSize;
        var mathMethod = remainder && remainder < 1 ? "round" : "ceil";
        measurement = Math[mathMethod](measurement / gridSize) * gridSize;
        return measurement;
    };
    proto._getContainerSize = function () {
        if (this._getOption("horizontal")) {
            return { width: this.maxX - this.gutter };
        } else {
            return { height: this.maxY - this.gutter };
        }
    };
    proto._manageStamp = function (elem) {
        var item = this.getItem(elem);
        var rect;
        if (item && item.isPlacing) {
            rect = item.rect;
        } else {
            var offset = this._getElementOffset(elem);
            rect = new Rect({
                x: this._getOption("originLeft") ? offset.left : offset.right,
                y: this._getOption("originTop") ? offset.top : offset.bottom,
            });
        }
        this._setRectSize(elem, rect);
        this.packer.placed(rect);
        this._setMaxXY(rect);
    };
    function verticalSorter(a, b) {
        return a.position.y - b.position.y || a.position.x - b.position.x;
    }
    function horizontalSorter(a, b) {
        return a.position.x - b.position.x || a.position.y - b.position.y;
    }
    proto.sortItemsByPosition = function () {
        var sorter = this._getOption("horizontal")
            ? horizontalSorter
            : verticalSorter;
        this.items.sort(sorter);
    };
    proto.fit = function (elem, x, y) {
        var item = this.getItem(elem);
        if (!item) {
            return;
        }
        this.stamp(item.element);
        item.enablePlacing();
        this.updateShiftTargets(item);
        x = x === undefined ? item.rect.x : x;
        y = y === undefined ? item.rect.y : y;
        this.shift(item, x, y);
        this._bindFitEvents(item);
        item.moveTo(item.rect.x, item.rect.y);
        this.shiftLayout();
        this.unstamp(item.element);
        this.sortItemsByPosition();
        item.disablePlacing();
    };
    proto._bindFitEvents = function (item) {
        var _this = this;
        var ticks = 0;
        function onLayout() {
            ticks++;
            if (ticks != 2) {
                return;
            }
            _this.dispatchEvent("fitComplete", null, [item]);
        }
        item.once("layout", onLayout);
        this.once("layoutComplete", onLayout);
    };
    proto.resize = function () {
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        if (this.options.shiftPercentResize) {
            this.resizeShiftPercentLayout();
        } else {
            this.layout();
        }
    };
    proto.needsResizeLayout = function () {
        var size = getSize(this.element);
        var innerSize = this._getOption("horizontal")
            ? "innerHeight"
            : "innerWidth";
        return size[innerSize] != this.size[innerSize];
    };
    proto.resizeShiftPercentLayout = function () {
        var items = this._getItemsForLayout(this.items);
        var isHorizontal = this._getOption("horizontal");
        var coord = isHorizontal ? "y" : "x";
        var measure = isHorizontal ? "height" : "width";
        var segmentName = isHorizontal ? "rowHeight" : "columnWidth";
        var innerSize = isHorizontal ? "innerHeight" : "innerWidth";
        var previousSegment = this[segmentName];
        previousSegment = previousSegment && previousSegment + this.gutter;
        if (previousSegment) {
            this._getMeasurements();
            var currentSegment = this[segmentName] + this.gutter;
            items.forEach(function (item) {
                var seg = Math.round(item.rect[coord] / previousSegment);
                item.rect[coord] = seg * currentSegment;
            });
        } else {
            var currentSize = getSize(this.element)[innerSize] + this.gutter;
            var previousSize = this.packer[measure];
            items.forEach(function (item) {
                item.rect[coord] =
                    (item.rect[coord] / previousSize) * currentSize;
            });
        }
        this.shiftLayout();
    };
    proto.itemDragStart = function (elem) {
        if (!this.isEnabled) {
            return;
        }
        this.stamp(elem);
        var item = this.getItem(elem);
        if (!item) {
            return;
        }
        item.enablePlacing();
        item.showDropPlaceholder();
        this.dragItemCount++;
        this.updateShiftTargets(item);
    };
    proto.updateShiftTargets = function (dropItem) {
        this.shiftPacker.reset();
        this._getBoundingRect();
        var isOriginLeft = this._getOption("originLeft");
        var isOriginTop = this._getOption("originTop");
        this.stamps.forEach(function (stamp) {
            var item = this.getItem(stamp);
            if (item && item.isPlacing) {
                return;
            }
            var offset = this._getElementOffset(stamp);
            var rect = new Rect({
                x: isOriginLeft ? offset.left : offset.right,
                y: isOriginTop ? offset.top : offset.bottom,
            });
            this._setRectSize(stamp, rect);
            this.shiftPacker.placed(rect);
        }, this);
        var isHorizontal = this._getOption("horizontal");
        var segmentName = isHorizontal ? "rowHeight" : "columnWidth";
        var measure = isHorizontal ? "height" : "width";
        this.shiftTargetKeys = [];
        this.shiftTargets = [];
        var boundsSize;
        var segment = this[segmentName];
        segment = segment && segment + this.gutter;
        if (segment) {
            var segmentSpan = Math.ceil(dropItem.rect[measure] / segment);
            var segs = Math.floor(
                (this.shiftPacker[measure] + this.gutter) / segment
            );
            boundsSize = (segs - segmentSpan) * segment;
            for (var i = 0; i < segs; i++) {
                this._addShiftTarget(i * segment, 0, boundsSize);
            }
        } else {
            boundsSize =
                this.shiftPacker[measure] +
                this.gutter -
                dropItem.rect[measure];
            this._addShiftTarget(0, 0, boundsSize);
        }
        var items = this._getItemsForLayout(this.items);
        var packMethod = this._getPackMethod();
        items.forEach(function (item) {
            var rect = item.rect;
            this._setRectSize(item.element, rect);
            this.shiftPacker[packMethod](rect);
            this._addShiftTarget(rect.x, rect.y, boundsSize);
            var cornerX = isHorizontal ? rect.x + rect.width : rect.x;
            var cornerY = isHorizontal ? rect.y : rect.y + rect.height;
            this._addShiftTarget(cornerX, cornerY, boundsSize);
            if (segment) {
                var segSpan = Math.round(rect[measure] / segment);
                for (var i = 1; i < segSpan; i++) {
                    var segX = isHorizontal ? cornerX : rect.x + segment * i;
                    var segY = isHorizontal ? rect.y + segment * i : cornerY;
                    this._addShiftTarget(segX, segY, boundsSize);
                }
            }
        }, this);
    };
    proto._addShiftTarget = function (x, y, boundsSize) {
        var checkCoord = this._getOption("horizontal") ? y : x;
        if (checkCoord !== 0 && checkCoord > boundsSize) {
            return;
        }
        var key = x + "," + y;
        var hasKey = this.shiftTargetKeys.indexOf(key) != -1;
        if (hasKey) {
            return;
        }
        this.shiftTargetKeys.push(key);
        this.shiftTargets.push({ x: x, y: y });
    };
    proto.shift = function (item, x, y) {
        var shiftPosition;
        var minDistance = Infinity;
        var position = { x: x, y: y };
        this.shiftTargets.forEach(function (target) {
            var distance = getDistance(target, position);
            if (distance < minDistance) {
                shiftPosition = target;
                minDistance = distance;
            }
        });
        item.rect.x = shiftPosition.x;
        item.rect.y = shiftPosition.y;
    };
    function getDistance(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    var DRAG_THROTTLE_TIME = 120;
    proto.itemDragMove = function (elem, x, y) {
        var item = this.isEnabled && this.getItem(elem);
        if (!item) {
            return;
        }
        x -= this.size.paddingLeft;
        y -= this.size.paddingTop;
        var _this = this;
        function onDrag() {
            _this.shift(item, x, y);
            item.positionDropPlaceholder();
            _this.layout();
        }
        var now = new Date();
        if (
            this._itemDragTime &&
            now - this._itemDragTime < DRAG_THROTTLE_TIME
        ) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = setTimeout(onDrag, DRAG_THROTTLE_TIME);
        } else {
            onDrag();
            this._itemDragTime = now;
        }
    };
    proto.itemDragEnd = function (elem) {
        var item = this.isEnabled && this.getItem(elem);
        if (!item) {
            return;
        }
        clearTimeout(this.dragTimeout);
        item.element.classList.add("is-positioning-post-drag");
        var completeCount = 0;
        var _this = this;
        function onDragEndLayoutComplete() {
            completeCount++;
            if (completeCount != 2) {
                return;
            }
            item.element.classList.remove("is-positioning-post-drag");
            item.hideDropPlaceholder();
            _this.dispatchEvent("dragItemPositioned", null, [item]);
        }
        item.once("layout", onDragEndLayoutComplete);
        this.once("layoutComplete", onDragEndLayoutComplete);
        item.moveTo(item.rect.x, item.rect.y);
        this.layout();
        this.dragItemCount = Math.max(0, this.dragItemCount - 1);
        this.sortItemsByPosition();
        item.disablePlacing();
        this.unstamp(item.element);
    };
    proto.bindDraggabillyEvents = function (draggie) {
        this._bindDraggabillyEvents(draggie, "on");
    };
    proto.unbindDraggabillyEvents = function (draggie) {
        this._bindDraggabillyEvents(draggie, "off");
    };
    proto._bindDraggabillyEvents = function (draggie, method) {
        var handlers = this.handleDraggabilly;
        draggie[method]("dragStart", handlers.dragStart);
        draggie[method]("dragMove", handlers.dragMove);
        draggie[method]("dragEnd", handlers.dragEnd);
    };
    proto.bindUIDraggableEvents = function ($elems) {
        this._bindUIDraggableEvents($elems, "on");
    };
    proto.unbindUIDraggableEvents = function ($elems) {
        this._bindUIDraggableEvents($elems, "off");
    };
    proto._bindUIDraggableEvents = function ($elems, method) {
        var handlers = this.handleUIDraggable;
        $elems[method]("dragstart", handlers.start)
            [method]("drag", handlers.drag)
            [method]("dragstop", handlers.stop);
    };
    var _destroy = proto.destroy;
    proto.destroy = function () {
        _destroy.apply(this, arguments);
        this.isEnabled = !1;
    };
    Packery.Rect = Rect;
    Packery.Packer = Packer;
    return Packery;
});
/*!
 * Packery layout mode v2.0.1
 * sub-classes Packery
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define([
            "isotope-layout/js/layout-mode",
            "packery/js/packery",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            require("isotope-layout/js/layout-mode"),
            require("packery")
        );
    } else {
        factory(window.Isotope.LayoutMode, window.Packery);
    }
})(window, function factor(LayoutMode, Packery) {
    var PackeryMode = LayoutMode.create("packery");
    var proto = PackeryMode.prototype;
    var keepModeMethods = { _getElementOffset: !0, _getMeasurement: !0 };
    for (var method in Packery.prototype) {
        if (!keepModeMethods[method]) {
            proto[method] = Packery.prototype[method];
        }
    }
    var _resetLayout = proto._resetLayout;
    proto._resetLayout = function () {
        this.packer = this.packer || new Packery.Packer();
        this.shiftPacker = this.shiftPacker || new Packery.Packer();
        _resetLayout.apply(this, arguments);
    };
    var _getItemLayoutPosition = proto._getItemLayoutPosition;
    proto._getItemLayoutPosition = function (item) {
        item.rect = item.rect || new Packery.Rect();
        return _getItemLayoutPosition.call(this, item);
    };
    var _needsResizeLayout = proto.needsResizeLayout;
    proto.needsResizeLayout = function () {
        if (this._getOption("horizontal")) {
            return this.needsVerticalResizeLayout();
        } else {
            return _needsResizeLayout.call(this);
        }
    };
    var _getOption = proto._getOption;
    proto._getOption = function (option) {
        if (option == "horizontal") {
            return this.options.isHorizontal !== undefined
                ? this.options.isHorizontal
                : this.options.horizontal;
        }
        return _getOption.apply(this.isotope, arguments);
    };
    return PackeryMode;
});
/*!
 * Packery PACKAGED v2.1.2
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2013-2018 Metafizzy
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("jquery-bridget/jquery-bridget", ["jquery"], function (jQuery) {
            return factory(window, jQuery);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(window, require("jquery"));
    } else {
        window.jQueryBridget = factory(window, window.jQuery);
    }
})(window, function factory(window, jQuery) {
    "use strict";
    var arraySlice = Array.prototype.slice;
    var console = window.console;
    var logError =
        typeof console == "undefined"
            ? function () {}
            : function (message) {
                  console.error(message);
              };
    function jQueryBridget(namespace, PluginClass, $) {
        $ = $ || jQuery || window.jQuery;
        if (!$) {
            return;
        }
        if (!PluginClass.prototype.option) {
            PluginClass.prototype.option = function (opts) {
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(!0, this.options, opts);
            };
        }
        $.fn[namespace] = function (arg0) {
            if (typeof arg0 == "string") {
                var args = arraySlice.call(arguments, 1);
                return methodCall(this, arg0, args);
            }
            plainCall(this, arg0);
            return this;
        };
        function methodCall($elems, methodName, args) {
            var returnValue;
            var pluginMethodStr = "$()." + namespace + '("' + methodName + '")';
            $elems.each(function (i, elem) {
                var instance = $.data(elem, namespace);
                if (!instance) {
                    logError(
                        namespace +
                            " not initialized. Cannot call methods, i.e. " +
                            pluginMethodStr
                    );
                    return;
                }
                var method = instance[methodName];
                if (!method || methodName.charAt(0) == "_") {
                    logError(pluginMethodStr + " is not a valid method");
                    return;
                }
                var value = method.apply(instance, args);
                returnValue = returnValue === undefined ? value : returnValue;
            });
            return returnValue !== undefined ? returnValue : $elems;
        }
        function plainCall($elems, options) {
            $elems.each(function (i, elem) {
                var instance = $.data(elem, namespace);
                if (instance) {
                    instance.option(options);
                    instance._init();
                } else {
                    instance = new PluginClass(elem, options);
                    $.data(elem, namespace, instance);
                }
            });
        }
        updateJQuery($);
    }
    function updateJQuery($) {
        if (!$ || ($ && $.bridget)) {
            return;
        }
        $.bridget = jQueryBridget;
    }
    updateJQuery(jQuery || window.jQuery);
    return jQueryBridget;
});
/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("get-size/get-size", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        window.getSize = factory();
    }
})(window, function factory() {
    "use strict";
    function getStyleSize(value) {
        var num = parseFloat(value);
        var isValid = value.indexOf("%") == -1 && !isNaN(num);
        return isValid && num;
    }
    function noop() {}
    var logError =
        typeof console == "undefined"
            ? noop
            : function (message) {
                  console.error(message);
              };
    var measurements = [
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "marginLeft",
        "marginRight",
        "marginTop",
        "marginBottom",
        "borderLeftWidth",
        "borderRightWidth",
        "borderTopWidth",
        "borderBottomWidth",
    ];
    var measurementsLength = measurements.length;
    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0,
        };
        for (var i = 0; i < measurementsLength; i++) {
            var measurement = measurements[i];
            size[measurement] = 0;
        }
        return size;
    }
    function getStyle(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
            logError(
                "Style returned " +
                    style +
                    ". Are you running this code in a hidden iframe on Firefox? " +
                    "See https://bit.ly/getsizebug1"
            );
        }
        return style;
    }
    var isSetup = !1;
    var isBoxSizeOuter;
    function setup() {
        if (isSetup) {
            return;
        }
        isSetup = !0;
        var div = document.createElement("div");
        div.style.width = "200px";
        div.style.padding = "1px 2px 3px 4px";
        div.style.borderStyle = "solid";
        div.style.borderWidth = "1px 2px 3px 4px";
        div.style.boxSizing = "border-box";
        var body = document.body || document.documentElement;
        body.appendChild(div);
        var style = getStyle(div);
        isBoxSizeOuter = Math.round(getStyleSize(style.width)) == 200;
        getSize.isBoxSizeOuter = isBoxSizeOuter;
        body.removeChild(div);
    }
    function getSize(elem) {
        setup();
        if (typeof elem == "string") {
            elem = document.querySelector(elem);
        }
        if (!elem || typeof elem != "object" || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem);
        if (style.display == "none") {
            return getZeroSize();
        }
        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;
        var isBorderBox = (size.isBorderBox = style.boxSizing == "border-box");
        for (var i = 0; i < measurementsLength; i++) {
            var measurement = measurements[i];
            var value = style[measurement];
            var num = parseFloat(value);
            size[measurement] = !isNaN(num) ? num : 0;
        }
        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;
        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
        var styleWidth = getStyleSize(style.width);
        if (styleWidth !== !1) {
            size.width =
                styleWidth +
                (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
        }
        var styleHeight = getStyleSize(style.height);
        if (styleHeight !== !1) {
            size.height =
                styleHeight +
                (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
        }
        size.innerWidth = size.width - (paddingWidth + borderWidth);
        size.innerHeight = size.height - (paddingHeight + borderHeight);
        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;
        return size;
    }
    return getSize;
});
(function (global, factory) {
    if (typeof define == "function" && define.amd) {
        define("ev-emitter/ev-emitter", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        global.EvEmitter = factory();
    }
})(typeof window != "undefined" ? window : this, function () {
    function EvEmitter() {}
    var proto = EvEmitter.prototype;
    proto.on = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        var events = (this._events = this._events || {});
        var listeners = (events[eventName] = events[eventName] || []);
        if (listeners.indexOf(listener) == -1) {
            listeners.push(listener);
        }
        return this;
    };
    proto.once = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        this.on(eventName, listener);
        var onceEvents = (this._onceEvents = this._onceEvents || {});
        var onceListeners = (onceEvents[eventName] =
            onceEvents[eventName] || {});
        onceListeners[listener] = !0;
        return this;
    };
    proto.off = function (eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
            listeners.splice(index, 1);
        }
        return this;
    };
    proto.emitEvent = function (eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        listeners = listeners.slice(0);
        args = args || [];
        var onceListeners = this._onceEvents && this._onceEvents[eventName];
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            var isOnce = onceListeners && onceListeners[listener];
            if (isOnce) {
                this.off(eventName, listener);
                delete onceListeners[listener];
            }
            listener.apply(this, args);
        }
        return this;
    };
    proto.allOff = function () {
        delete this._events;
        delete this._onceEvents;
    };
    return EvEmitter;
});
(function (window, factory) {
    "use strict";
    if (typeof define == "function" && define.amd) {
        define("desandro-matches-selector/matches-selector", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        window.matchesSelector = factory();
    }
})(window, function factory() {
    "use strict";
    var matchesMethod = (function () {
        var ElemProto = window.Element.prototype;
        if (ElemProto.matches) {
            return "matches";
        }
        if (ElemProto.matchesSelector) {
            return "matchesSelector";
        }
        var prefixes = ["webkit", "moz", "ms", "o"];
        for (var i = 0; i < prefixes.length; i++) {
            var prefix = prefixes[i];
            var method = prefix + "MatchesSelector";
            if (ElemProto[method]) {
                return method;
            }
        }
    })();
    return function matchesSelector(elem, selector) {
        return elem[matchesMethod](selector);
    };
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("fizzy-ui-utils/utils", [
            "desandro-matches-selector/matches-selector",
        ], function (matchesSelector) {
            return factory(window, matchesSelector);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(window, require("desandro-matches-selector"));
    } else {
        window.fizzyUIUtils = factory(window, window.matchesSelector);
    }
})(window, function factory(window, matchesSelector) {
    var utils = {};
    utils.extend = function (a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    };
    utils.modulo = function (num, div) {
        return ((num % div) + div) % div;
    };
    var arraySlice = Array.prototype.slice;
    utils.makeArray = function (obj) {
        if (Array.isArray(obj)) {
            return obj;
        }
        if (obj === null || obj === undefined) {
            return [];
        }
        var isArrayLike =
            typeof obj == "object" && typeof obj.length == "number";
        if (isArrayLike) {
            return arraySlice.call(obj);
        }
        return [obj];
    };
    utils.removeFrom = function (ary, obj) {
        var index = ary.indexOf(obj);
        if (index != -1) {
            ary.splice(index, 1);
        }
    };
    utils.getParent = function (elem, selector) {
        while (elem.parentNode && elem != document.body) {
            elem = elem.parentNode;
            if (matchesSelector(elem, selector)) {
                return elem;
            }
        }
    };
    utils.getQueryElement = function (elem) {
        if (typeof elem == "string") {
            return document.querySelector(elem);
        }
        return elem;
    };
    utils.handleEvent = function (event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    utils.filterFindElements = function (elems, selector) {
        elems = utils.makeArray(elems);
        var ffElems = [];
        elems.forEach(function (elem) {
            if (!(elem instanceof HTMLElement)) {
                return;
            }
            if (!selector) {
                ffElems.push(elem);
                return;
            }
            if (matchesSelector(elem, selector)) {
                ffElems.push(elem);
            }
            var childElems = elem.querySelectorAll(selector);
            for (var i = 0; i < childElems.length; i++) {
                ffElems.push(childElems[i]);
            }
        });
        return ffElems;
    };
    utils.debounceMethod = function (_class, methodName, threshold) {
        threshold = threshold || 100;
        var method = _class.prototype[methodName];
        var timeoutName = methodName + "Timeout";
        _class.prototype[methodName] = function () {
            var timeout = this[timeoutName];
            clearTimeout(timeout);
            var args = arguments;
            var _this = this;
            this[timeoutName] = setTimeout(function () {
                method.apply(_this, args);
                delete _this[timeoutName];
            }, threshold);
        };
    };
    utils.docReady = function (callback) {
        var readyState = document.readyState;
        if (readyState == "complete" || readyState == "interactive") {
            setTimeout(callback);
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    };
    utils.toDashed = function (str) {
        return str
            .replace(/(.)([A-Z])/g, function (match, $1, $2) {
                return $1 + "-" + $2;
            })
            .toLowerCase();
    };
    var console = window.console;
    utils.htmlInit = function (WidgetClass, namespace) {
        utils.docReady(function () {
            var dashedNamespace = utils.toDashed(namespace);
            var dataAttr = "data-" + dashedNamespace;
            var dataAttrElems = document.querySelectorAll("[" + dataAttr + "]");
            var jsDashElems = document.querySelectorAll(
                ".js-" + dashedNamespace
            );
            var elems = utils
                .makeArray(dataAttrElems)
                .concat(utils.makeArray(jsDashElems));
            var dataOptionsAttr = dataAttr + "-options";
            var jQuery = window.jQuery;
            elems.forEach(function (elem) {
                var attr =
                    elem.getAttribute(dataAttr) ||
                    elem.getAttribute(dataOptionsAttr);
                var options;
                try {
                    options = attr && JSON.parse(attr);
                } catch (error) {
                    if (console) {
                        console.error(
                            "Error parsing " +
                                dataAttr +
                                " on " +
                                elem.className +
                                ": " +
                                error
                        );
                    }
                    return;
                }
                var instance = new WidgetClass(elem, options);
                if (jQuery) {
                    jQuery.data(elem, namespace, instance);
                }
            });
        });
    };
    return utils;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("outlayer/item", [
            "ev-emitter/ev-emitter",
            "get-size/get-size",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("ev-emitter"), require("get-size"));
    } else {
        window.Outlayer = {};
        window.Outlayer.Item = factory(window.EvEmitter, window.getSize);
    }
})(window, function factory(EvEmitter, getSize) {
    "use strict";
    function isEmptyObj(obj) {
        for (var prop in obj) {
            return !1;
        }
        prop = null;
        return !0;
    }
    var docElemStyle = document.documentElement.style;
    var transitionProperty =
        typeof docElemStyle.transition == "string"
            ? "transition"
            : "WebkitTransition";
    var transformProperty =
        typeof docElemStyle.transform == "string"
            ? "transform"
            : "WebkitTransform";
    var transitionEndEvent = {
        WebkitTransition: "webkitTransitionEnd",
        transition: "transitionend",
    }[transitionProperty];
    var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + "Duration",
        transitionProperty: transitionProperty + "Property",
        transitionDelay: transitionProperty + "Delay",
    };
    function Item(element, layout) {
        if (!element) {
            return;
        }
        this.element = element;
        this.layout = layout;
        this.position = { x: 0, y: 0 };
        this._create();
    }
    var proto = (Item.prototype = Object.create(EvEmitter.prototype));
    proto.constructor = Item;
    proto._create = function () {
        this._transn = { ingProperties: {}, clean: {}, onEnd: {} };
        this.css({ position: "absolute" });
    };
    proto.handleEvent = function (event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    proto.getSize = function () {
        this.size = getSize(this.element);
    };
    proto.css = function (style) {
        var elemStyle = this.element.style;
        for (var prop in style) {
            var supportedProp = vendorProperties[prop] || prop;
            elemStyle[supportedProp] = style[prop];
        }
    };
    proto.getPosition = function () {
        var style = getComputedStyle(this.element);
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xValue = style[isOriginLeft ? "left" : "right"];
        var yValue = style[isOriginTop ? "top" : "bottom"];
        var x = parseFloat(xValue);
        var y = parseFloat(yValue);
        var layoutSize = this.layout.size;
        if (xValue.indexOf("%") != -1) {
            x = (x / 100) * layoutSize.width;
        }
        if (yValue.indexOf("%") != -1) {
            y = (y / 100) * layoutSize.height;
        }
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
        this.position.x = x;
        this.position.y = y;
    };
    proto.layoutPosition = function () {
        var layoutSize = this.layout.size;
        var style = {};
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xPadding = isOriginLeft ? "paddingLeft" : "paddingRight";
        var xProperty = isOriginLeft ? "left" : "right";
        var xResetProperty = isOriginLeft ? "right" : "left";
        var x = this.position.x + layoutSize[xPadding];
        style[xProperty] = this.getXValue(x);
        style[xResetProperty] = "";
        var yPadding = isOriginTop ? "paddingTop" : "paddingBottom";
        var yProperty = isOriginTop ? "top" : "bottom";
        var yResetProperty = isOriginTop ? "bottom" : "top";
        var y = this.position.y + layoutSize[yPadding];
        style[yProperty] = this.getYValue(y);
        style[yResetProperty] = "";
        this.css(style);
        this.emitEvent("layout", [this]);
    };
    proto.getXValue = function (x) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && !isHorizontal
            ? (x / this.layout.size.width) * 100 + "%"
            : x + "px";
    };
    proto.getYValue = function (y) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && isHorizontal
            ? (y / this.layout.size.height) * 100 + "%"
            : y + "px";
    };
    proto._transitionTo = function (x, y) {
        this.getPosition();
        var curX = this.position.x;
        var curY = this.position.y;
        var didNotMove = x == this.position.x && y == this.position.y;
        this.setPosition(x, y);
        if (didNotMove && !this.isTransitioning) {
            this.layoutPosition();
            return;
        }
        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);
        this.transition({
            to: transitionStyle,
            onTransitionEnd: { transform: this.layoutPosition },
            isCleaning: !0,
        });
    };
    proto.getTranslate = function (x, y) {
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return "translate3d(" + x + "px, " + y + "px, 0)";
    };
    proto.goTo = function (x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
    };
    proto.moveTo = proto._transitionTo;
    proto.setPosition = function (x, y) {
        this.position.x = parseFloat(x);
        this.position.y = parseFloat(y);
    };
    proto._nonTransition = function (args) {
        this.css(args.to);
        if (args.isCleaning) {
            this._removeStyles(args.to);
        }
        for (var prop in args.onTransitionEnd) {
            args.onTransitionEnd[prop].call(this);
        }
    };
    proto.transition = function (args) {
        if (!parseFloat(this.layout.options.transitionDuration)) {
            this._nonTransition(args);
            return;
        }
        var _transition = this._transn;
        for (var prop in args.onTransitionEnd) {
            _transition.onEnd[prop] = args.onTransitionEnd[prop];
        }
        for (prop in args.to) {
            _transition.ingProperties[prop] = !0;
            if (args.isCleaning) {
                _transition.clean[prop] = !0;
            }
        }
        if (args.from) {
            this.css(args.from);
            var h = this.element.offsetHeight;
            h = null;
        }
        this.enableTransition(args.to);
        this.css(args.to);
        this.isTransitioning = !0;
    };
    function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function ($1) {
            return "-" + $1.toLowerCase();
        });
    }
    var transitionProps = "opacity," + toDashedAll(transformProperty);
    proto.enableTransition = function () {
        if (this.isTransitioning) {
            return;
        }
        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == "number" ? duration + "ms" : duration;
        this.css({
            transitionProperty: transitionProps,
            transitionDuration: duration,
            transitionDelay: this.staggerDelay || 0,
        });
        this.element.addEventListener(transitionEndEvent, this, !1);
    };
    proto.onwebkitTransitionEnd = function (event) {
        this.ontransitionend(event);
    };
    proto.onotransitionend = function (event) {
        this.ontransitionend(event);
    };
    var dashedVendorProperties = { "-webkit-transform": "transform" };
    proto.ontransitionend = function (event) {
        if (event.target !== this.element) {
            return;
        }
        var _transition = this._transn;
        var propertyName =
            dashedVendorProperties[event.propertyName] || event.propertyName;
        delete _transition.ingProperties[propertyName];
        if (isEmptyObj(_transition.ingProperties)) {
            this.disableTransition();
        }
        if (propertyName in _transition.clean) {
            this.element.style[event.propertyName] = "";
            delete _transition.clean[propertyName];
        }
        if (propertyName in _transition.onEnd) {
            var onTransitionEnd = _transition.onEnd[propertyName];
            onTransitionEnd.call(this);
            delete _transition.onEnd[propertyName];
        }
        this.emitEvent("transitionEnd", [this]);
    };
    proto.disableTransition = function () {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, !1);
        this.isTransitioning = !1;
    };
    proto._removeStyles = function (style) {
        var cleanStyle = {};
        for (var prop in style) {
            cleanStyle[prop] = "";
        }
        this.css(cleanStyle);
    };
    var cleanTransitionStyle = {
        transitionProperty: "",
        transitionDuration: "",
        transitionDelay: "",
    };
    proto.removeTransitionStyles = function () {
        this.css(cleanTransitionStyle);
    };
    proto.stagger = function (delay) {
        delay = isNaN(delay) ? 0 : delay;
        this.staggerDelay = delay + "ms";
    };
    proto.removeElem = function () {
        this.element.parentNode.removeChild(this.element);
        this.css({ display: "" });
        this.emitEvent("remove", [this]);
    };
    proto.remove = function () {
        if (
            !transitionProperty ||
            !parseFloat(this.layout.options.transitionDuration)
        ) {
            this.removeElem();
            return;
        }
        this.once("transitionEnd", function () {
            this.removeElem();
        });
        this.hide();
    };
    proto.reveal = function () {
        delete this.isHidden;
        this.css({ display: "" });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty =
            this.getHideRevealTransitionEndProperty("visibleStyle");
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;
        this.transition({
            from: options.hiddenStyle,
            to: options.visibleStyle,
            isCleaning: !0,
            onTransitionEnd: onTransitionEnd,
        });
    };
    proto.onRevealTransitionEnd = function () {
        if (!this.isHidden) {
            this.emitEvent("reveal");
        }
    };
    proto.getHideRevealTransitionEndProperty = function (styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        if (optionStyle.opacity) {
            return "opacity";
        }
        for (var prop in optionStyle) {
            return prop;
        }
    };
    proto.hide = function () {
        this.isHidden = !0;
        this.css({ display: "" });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty =
            this.getHideRevealTransitionEndProperty("hiddenStyle");
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;
        this.transition({
            from: options.visibleStyle,
            to: options.hiddenStyle,
            isCleaning: !0,
            onTransitionEnd: onTransitionEnd,
        });
    };
    proto.onHideTransitionEnd = function () {
        if (this.isHidden) {
            this.css({ display: "none" });
            this.emitEvent("hide");
        }
    };
    proto.destroy = function () {
        this.css({
            position: "",
            left: "",
            right: "",
            top: "",
            bottom: "",
            transition: "",
            transform: "",
        });
    };
    return Item;
});
/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */
(function (window, factory) {
    "use strict";
    if (typeof define == "function" && define.amd) {
        define("outlayer/outlayer", [
            "ev-emitter/ev-emitter",
            "get-size/get-size",
            "fizzy-ui-utils/utils",
            "./item",
        ], function (EvEmitter, getSize, utils, Item) {
            return factory(window, EvEmitter, getSize, utils, Item);
        });
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            window,
            require("ev-emitter"),
            require("get-size"),
            require("fizzy-ui-utils"),
            require("./item")
        );
    } else {
        window.Outlayer = factory(
            window,
            window.EvEmitter,
            window.getSize,
            window.fizzyUIUtils,
            window.Outlayer.Item
        );
    }
})(window, function factory(window, EvEmitter, getSize, utils, Item) {
    "use strict";
    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function () {};
    var GUID = 0;
    var instances = {};
    function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
            if (console) {
                console.error(
                    "Bad element for " +
                        this.constructor.namespace +
                        ": " +
                        (queryElement || element)
                );
            }
            return;
        }
        this.element = queryElement;
        if (jQuery) {
            this.$element = jQuery(this.element);
        }
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);
        var id = ++GUID;
        this.element.outlayerGUID = id;
        instances[id] = this;
        this._create();
        var isInitLayout = this._getOption("initLayout");
        if (isInitLayout) {
            this.layout();
        }
    }
    Outlayer.namespace = "outlayer";
    Outlayer.Item = Item;
    Outlayer.defaults = {
        containerStyle: { position: "relative" },
        initLayout: !0,
        originLeft: !0,
        originTop: !0,
        resize: !0,
        resizeContainer: !0,
        transitionDuration: "0.4s",
        hiddenStyle: { opacity: 0, transform: "scale(0.001)" },
        visibleStyle: { opacity: 1, transform: "scale(1)" },
    };
    var proto = Outlayer.prototype;
    utils.extend(proto, EvEmitter.prototype);
    proto.option = function (opts) {
        utils.extend(this.options, opts);
    };
    proto._getOption = function (option) {
        var oldOption = this.constructor.compatOptions[option];
        return oldOption && this.options[oldOption] !== undefined
            ? this.options[oldOption]
            : this.options[option];
    };
    Outlayer.compatOptions = {
        initLayout: "isInitLayout",
        horizontal: "isHorizontal",
        layoutInstant: "isLayoutInstant",
        originLeft: "isOriginLeft",
        originTop: "isOriginTop",
        resize: "isResizeBound",
        resizeContainer: "isResizingContainer",
    };
    proto._create = function () {
        this.reloadItems();
        this.stamps = [];
        this.stamp(this.options.stamp);
        utils.extend(this.element.style, this.options.containerStyle);
        var canBindResize = this._getOption("resize");
        if (canBindResize) {
            this.bindResize();
        }
    };
    proto.reloadItems = function () {
        this.items = this._itemize(this.element.children);
    };
    proto._itemize = function (elems) {
        var itemElems = this._filterFindItemElements(elems);
        var Item = this.constructor.Item;
        var items = [];
        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            var item = new Item(elem, this);
            items.push(item);
        }
        return items;
    };
    proto._filterFindItemElements = function (elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
    };
    proto.getItemElements = function () {
        return this.items.map(function (item) {
            return item.element;
        });
    };
    proto.layout = function () {
        this._resetLayout();
        this._manageStamps();
        var layoutInstant = this._getOption("layoutInstant");
        var isInstant =
            layoutInstant !== undefined ? layoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);
        this._isLayoutInited = !0;
    };
    proto._init = proto.layout;
    proto._resetLayout = function () {
        this.getSize();
    };
    proto.getSize = function () {
        this.size = getSize(this.element);
    };
    proto._getMeasurement = function (measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
            this[measurement] = 0;
        } else {
            if (typeof option == "string") {
                elem = this.element.querySelector(option);
            } else if (option instanceof HTMLElement) {
                elem = option;
            }
            this[measurement] = elem ? getSize(elem)[size] : option;
        }
    };
    proto.layoutItems = function (items, isInstant) {
        items = this._getItemsForLayout(items);
        this._layoutItems(items, isInstant);
        this._postLayout();
    };
    proto._getItemsForLayout = function (items) {
        return items.filter(function (item) {
            return !item.isIgnored;
        });
    };
    proto._layoutItems = function (items, isInstant) {
        this._emitCompleteOnItems("layout", items);
        if (!items || !items.length) {
            return;
        }
        var queue = [];
        items.forEach(function (item) {
            var position = this._getItemLayoutPosition(item);
            position.item = item;
            position.isInstant = isInstant || item.isLayoutInstant;
            queue.push(position);
        }, this);
        this._processLayoutQueue(queue);
    };
    proto._getItemLayoutPosition = function () {
        return { x: 0, y: 0 };
    };
    proto._processLayoutQueue = function (queue) {
        this.updateStagger();
        queue.forEach(function (obj, i) {
            this._positionItem(obj.item, obj.x, obj.y, obj.isInstant, i);
        }, this);
    };
    proto.updateStagger = function () {
        var stagger = this.options.stagger;
        if (stagger === null || stagger === undefined) {
            this.stagger = 0;
            return;
        }
        this.stagger = getMilliseconds(stagger);
        return this.stagger;
    };
    proto._positionItem = function (item, x, y, isInstant, i) {
        if (isInstant) {
            item.goTo(x, y);
        } else {
            item.stagger(i * this.stagger);
            item.moveTo(x, y);
        }
    };
    proto._postLayout = function () {
        this.resizeContainer();
    };
    proto.resizeContainer = function () {
        var isResizingContainer = this._getOption("resizeContainer");
        if (!isResizingContainer) {
            return;
        }
        var size = this._getContainerSize();
        if (size) {
            this._setContainerMeasure(size.width, !0);
            this._setContainerMeasure(size.height, !1);
        }
    };
    proto._getContainerSize = noop;
    proto._setContainerMeasure = function (measure, isWidth) {
        if (measure === undefined) {
            return;
        }
        var elemSize = this.size;
        if (elemSize.isBorderBox) {
            measure += isWidth
                ? elemSize.paddingLeft +
                  elemSize.paddingRight +
                  elemSize.borderLeftWidth +
                  elemSize.borderRightWidth
                : elemSize.paddingBottom +
                  elemSize.paddingTop +
                  elemSize.borderTopWidth +
                  elemSize.borderBottomWidth;
        }
        measure = Math.max(measure, 0);
        this.element.style[isWidth ? "width" : "height"] = measure + "px";
    };
    proto._emitCompleteOnItems = function (eventName, items) {
        var _this = this;
        function onComplete() {
            _this.dispatchEvent(eventName + "Complete", null, [items]);
        }
        var count = items.length;
        if (!items || !count) {
            onComplete();
            return;
        }
        var doneCount = 0;
        function tick() {
            doneCount++;
            if (doneCount == count) {
                onComplete();
            }
        }
        items.forEach(function (item) {
            item.once(eventName, tick);
        });
    };
    proto.dispatchEvent = function (type, event, args) {
        var emitArgs = event ? [event].concat(args) : args;
        this.emitEvent(type, emitArgs);
        if (jQuery) {
            this.$element = this.$element || jQuery(this.element);
            if (event) {
                var $event = jQuery.Event(event);
                $event.type = type;
                this.$element.trigger($event, args);
            } else {
                this.$element.trigger(type, args);
            }
        }
    };
    proto.ignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
            item.isIgnored = !0;
        }
    };
    proto.unignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
            delete item.isIgnored;
        }
    };
    proto.stamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        this.stamps = this.stamps.concat(elems);
        elems.forEach(this.ignore, this);
    };
    proto.unstamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        elems.forEach(function (elem) {
            utils.removeFrom(this.stamps, elem);
            this.unignore(elem);
        }, this);
    };
    proto._find = function (elems) {
        if (!elems) {
            return;
        }
        if (typeof elems == "string") {
            elems = this.element.querySelectorAll(elems);
        }
        elems = utils.makeArray(elems);
        return elems;
    };
    proto._manageStamps = function () {
        if (!this.stamps || !this.stamps.length) {
            return;
        }
        this._getBoundingRect();
        this.stamps.forEach(this._manageStamp, this);
    };
    proto._getBoundingRect = function () {
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
            left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
            top: boundingRect.top + size.paddingTop + size.borderTopWidth,
            right:
                boundingRect.right -
                (size.paddingRight + size.borderRightWidth),
            bottom:
                boundingRect.bottom -
                (size.paddingBottom + size.borderBottomWidth),
        };
    };
    proto._manageStamp = noop;
    proto._getElementOffset = function (elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
            left: boundingRect.left - thisRect.left - size.marginLeft,
            top: boundingRect.top - thisRect.top - size.marginTop,
            right: thisRect.right - boundingRect.right - size.marginRight,
            bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom,
        };
        return offset;
    };
    proto.handleEvent = utils.handleEvent;
    proto.bindResize = function () {
        window.addEventListener("resize", this);
        this.isResizeBound = !0;
    };
    proto.unbindResize = function () {
        window.removeEventListener("resize", this);
        this.isResizeBound = !1;
    };
    proto.onresize = function () {
        this.resize();
    };
    utils.debounceMethod(Outlayer, "onresize", 100);
    proto.resize = function () {
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        this.layout();
    };
    proto.needsResizeLayout = function () {
        var size = getSize(this.element);
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
    };
    proto.addItems = function (elems) {
        var items = this._itemize(elems);
        if (items.length) {
            this.items = this.items.concat(items);
        }
        return items;
    };
    proto.appended = function (elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        this.layoutItems(items, !0);
        this.reveal(items);
    };
    proto.prepended = function (elems) {
        var items = this._itemize(elems);
        if (!items.length) {
            return;
        }
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        this._resetLayout();
        this._manageStamps();
        this.layoutItems(items, !0);
        this.reveal(items);
        this.layoutItems(previousItems);
    };
    proto.reveal = function (items) {
        this._emitCompleteOnItems("reveal", items);
        if (!items || !items.length) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
            item.stagger(i * stagger);
            item.reveal();
        });
    };
    proto.hide = function (items) {
        this._emitCompleteOnItems("hide", items);
        if (!items || !items.length) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
            item.stagger(i * stagger);
            item.hide();
        });
    };
    proto.revealItemElements = function (elems) {
        var items = this.getItems(elems);
        this.reveal(items);
    };
    proto.hideItemElements = function (elems) {
        var items = this.getItems(elems);
        this.hide(items);
    };
    proto.getItem = function (elem) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.element == elem) {
                return item;
            }
        }
    };
    proto.getItems = function (elems) {
        elems = utils.makeArray(elems);
        var items = [];
        elems.forEach(function (elem) {
            var item = this.getItem(elem);
            if (item) {
                items.push(item);
            }
        }, this);
        return items;
    };
    proto.remove = function (elems) {
        var removeItems = this.getItems(elems);
        this._emitCompleteOnItems("remove", removeItems);
        if (!removeItems || !removeItems.length) {
            return;
        }
        removeItems.forEach(function (item) {
            item.remove();
            utils.removeFrom(this.items, item);
        }, this);
    };
    proto.destroy = function () {
        var style = this.element.style;
        style.height = "";
        style.position = "";
        style.width = "";
        this.items.forEach(function (item) {
            item.destroy();
        });
        this.unbindResize();
        var id = this.element.outlayerGUID;
        delete instances[id];
        delete this.element.outlayerGUID;
        if (jQuery) {
            jQuery.removeData(this.element, this.constructor.namespace);
        }
    };
    Outlayer.data = function (elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
    };
    Outlayer.create = function (namespace, options) {
        var Layout = subclass(Outlayer);
        Layout.defaults = utils.extend({}, Outlayer.defaults);
        utils.extend(Layout.defaults, options);
        Layout.compatOptions = utils.extend({}, Outlayer.compatOptions);
        Layout.namespace = namespace;
        Layout.data = Outlayer.data;
        Layout.Item = subclass(Item);
        utils.htmlInit(Layout, namespace);
        if (jQuery && jQuery.bridget) {
            jQuery.bridget(namespace, Layout);
        }
        return Layout;
    };
    function subclass(Parent) {
        function SubClass() {
            Parent.apply(this, arguments);
        }
        SubClass.prototype = Object.create(Parent.prototype);
        SubClass.prototype.constructor = SubClass;
        return SubClass;
    }
    var msUnits = { ms: 1, s: 1000 };
    function getMilliseconds(time) {
        if (typeof time == "number") {
            return time;
        }
        var matches = time.match(/(^\d*\.?\d*)(\w*)/);
        var num = matches && matches[1];
        var unit = matches && matches[2];
        if (!num.length) {
            return 0;
        }
        num = parseFloat(num);
        var mult = msUnits[unit] || 1;
        return num * mult;
    }
    Outlayer.Item = Item;
    return Outlayer;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/rect", factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory();
    } else {
        window.Packery = window.Packery || {};
        window.Packery.Rect = factory();
    }
})(window, function factory() {
    "use strict";
    function Rect(props) {
        for (var prop in Rect.defaults) {
            this[prop] = Rect.defaults[prop];
        }
        for (prop in props) {
            this[prop] = props[prop];
        }
    }
    Rect.defaults = { x: 0, y: 0, width: 0, height: 0 };
    var proto = Rect.prototype;
    proto.contains = function (rect) {
        var otherWidth = rect.width || 0;
        var otherHeight = rect.height || 0;
        return (
            this.x <= rect.x &&
            this.y <= rect.y &&
            this.x + this.width >= rect.x + otherWidth &&
            this.y + this.height >= rect.y + otherHeight
        );
    };
    proto.overlaps = function (rect) {
        var thisRight = this.x + this.width;
        var thisBottom = this.y + this.height;
        var rectRight = rect.x + rect.width;
        var rectBottom = rect.y + rect.height;
        return (
            this.x < rectRight &&
            thisRight > rect.x &&
            this.y < rectBottom &&
            thisBottom > rect.y
        );
    };
    proto.getMaximalFreeRects = function (rect) {
        if (!this.overlaps(rect)) {
            return !1;
        }
        var freeRects = [];
        var freeRect;
        var thisRight = this.x + this.width;
        var thisBottom = this.y + this.height;
        var rectRight = rect.x + rect.width;
        var rectBottom = rect.y + rect.height;
        if (this.y < rect.y) {
            freeRect = new Rect({
                x: this.x,
                y: this.y,
                width: this.width,
                height: rect.y - this.y,
            });
            freeRects.push(freeRect);
        }
        if (thisRight > rectRight) {
            freeRect = new Rect({
                x: rectRight,
                y: this.y,
                width: thisRight - rectRight,
                height: this.height,
            });
            freeRects.push(freeRect);
        }
        if (thisBottom > rectBottom) {
            freeRect = new Rect({
                x: this.x,
                y: rectBottom,
                width: this.width,
                height: thisBottom - rectBottom,
            });
            freeRects.push(freeRect);
        }
        if (this.x < rect.x) {
            freeRect = new Rect({
                x: this.x,
                y: this.y,
                width: rect.x - this.x,
                height: this.height,
            });
            freeRects.push(freeRect);
        }
        return freeRects;
    };
    proto.canFit = function (rect) {
        return this.width >= rect.width && this.height >= rect.height;
    };
    return Rect;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/packer", ["./rect"], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("./rect"));
    } else {
        var Packery = (window.Packery = window.Packery || {});
        Packery.Packer = factory(Packery.Rect);
    }
})(window, function factory(Rect) {
    "use strict";
    function Packer(width, height, sortDirection) {
        this.width = width || 0;
        this.height = height || 0;
        this.sortDirection = sortDirection || "downwardLeftToRight";
        this.reset();
    }
    var proto = Packer.prototype;
    proto.reset = function () {
        this.spaces = [];
        var initialSpace = new Rect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
        });
        this.spaces.push(initialSpace);
        this.sorter =
            sorters[this.sortDirection] || sorters.downwardLeftToRight;
    };
    proto.pack = function (rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            if (space.canFit(rect)) {
                this.placeInSpace(rect, space);
                break;
            }
        }
    };
    proto.columnPack = function (rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var canFitInSpaceColumn =
                space.x <= rect.x &&
                space.x + space.width >= rect.x + rect.width &&
                space.height >= rect.height - 0.01;
            if (canFitInSpaceColumn) {
                rect.y = space.y;
                this.placed(rect);
                break;
            }
        }
    };
    proto.rowPack = function (rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var canFitInSpaceRow =
                space.y <= rect.y &&
                space.y + space.height >= rect.y + rect.height &&
                space.width >= rect.width - 0.01;
            if (canFitInSpaceRow) {
                rect.x = space.x;
                this.placed(rect);
                break;
            }
        }
    };
    proto.placeInSpace = function (rect, space) {
        rect.x = space.x;
        rect.y = space.y;
        this.placed(rect);
    };
    proto.placed = function (rect) {
        var revisedSpaces = [];
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var newSpaces = space.getMaximalFreeRects(rect);
            if (newSpaces) {
                revisedSpaces.push.apply(revisedSpaces, newSpaces);
            } else {
                revisedSpaces.push(space);
            }
        }
        this.spaces = revisedSpaces;
        this.mergeSortSpaces();
    };
    proto.mergeSortSpaces = function () {
        Packer.mergeRects(this.spaces);
        this.spaces.sort(this.sorter);
    };
    proto.addSpace = function (rect) {
        this.spaces.push(rect);
        this.mergeSortSpaces();
    };
    Packer.mergeRects = function (rects) {
        var i = 0;
        var rect = rects[i];
        rectLoop: while (rect) {
            var j = 0;
            var compareRect = rects[i + j];
            while (compareRect) {
                if (compareRect == rect) {
                    j++;
                } else if (compareRect.contains(rect)) {
                    rects.splice(i, 1);
                    rect = rects[i];
                    continue rectLoop;
                } else if (rect.contains(compareRect)) {
                    rects.splice(i + j, 1);
                } else {
                    j++;
                }
                compareRect = rects[i + j];
            }
            i++;
            rect = rects[i];
        }
        return rects;
    };
    var sorters = {
        downwardLeftToRight: function (a, b) {
            return a.y - b.y || a.x - b.x;
        },
        rightwardTopToBottom: function (a, b) {
            return a.x - b.x || a.y - b.y;
        },
    };
    return Packer;
});
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define("packery/js/item", ["outlayer/outlayer", "./rect"], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(require("outlayer"), require("./rect"));
    } else {
        window.Packery.Item = factory(window.Outlayer, window.Packery.Rect);
    }
})(window, function factory(Outlayer, Rect) {
    "use strict";
    var docElemStyle = document.documentElement.style;
    var transformProperty =
        typeof docElemStyle.transform == "string"
            ? "transform"
            : "WebkitTransform";
    var Item = function PackeryItem() {
        Outlayer.Item.apply(this, arguments);
    };
    var proto = (Item.prototype = Object.create(Outlayer.Item.prototype));
    var __create = proto._create;
    proto._create = function () {
        __create.call(this);
        this.rect = new Rect();
    };
    var _moveTo = proto.moveTo;
    proto.moveTo = function (x, y) {
        var dx = Math.abs(this.position.x - x);
        var dy = Math.abs(this.position.y - y);
        var canHackGoTo =
            this.layout.dragItemCount &&
            !this.isPlacing &&
            !this.isTransitioning &&
            dx < 1 &&
            dy < 1;
        if (canHackGoTo) {
            this.goTo(x, y);
            return;
        }
        _moveTo.apply(this, arguments);
    };
    proto.enablePlacing = function () {
        this.removeTransitionStyles();
        if (this.isTransitioning && transformProperty) {
            this.element.style[transformProperty] = "none";
        }
        this.isTransitioning = !1;
        this.getSize();
        this.layout._setRectSize(this.element, this.rect);
        this.isPlacing = !0;
    };
    proto.disablePlacing = function () {
        this.isPlacing = !1;
    };
    proto.removeElem = function () {
        var parent = this.element.parentNode;
        if (parent) {
            parent.removeChild(this.element);
        }
        this.layout.packer.addSpace(this.rect);
        this.emitEvent("remove", [this]);
    };
    proto.showDropPlaceholder = function () {
        var dropPlaceholder = this.dropPlaceholder;
        if (!dropPlaceholder) {
            dropPlaceholder = this.dropPlaceholder =
                document.createElement("div");
            dropPlaceholder.className = "packery-drop-placeholder";
            dropPlaceholder.style.position = "absolute";
        }
        dropPlaceholder.style.width = this.size.width + "px";
        dropPlaceholder.style.height = this.size.height + "px";
        this.positionDropPlaceholder();
        this.layout.element.appendChild(dropPlaceholder);
    };
    proto.positionDropPlaceholder = function () {
        this.dropPlaceholder.style[transformProperty] =
            "translate(" + this.rect.x + "px, " + this.rect.y + "px)";
    };
    proto.hideDropPlaceholder = function () {
        var parent = this.dropPlaceholder.parentNode;
        if (parent) {
            parent.removeChild(this.dropPlaceholder);
        }
    };
    return Item;
});
/*!
 * Packery v2.1.2
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2013-2018 Metafizzy
 */
(function (window, factory) {
    if (typeof define == "function" && define.amd) {
        define([
            "get-size/get-size",
            "outlayer/outlayer",
            "packery/js/rect",
            "packery/js/packer",
            "packery/js/item",
        ], factory);
    } else if (typeof module == "object" && module.exports) {
        module.exports = factory(
            require("get-size"),
            require("outlayer"),
            require("./rect"),
            require("./packer"),
            require("./item")
        );
    } else {
        window.Packery = factory(
            window.getSize,
            window.Outlayer,
            window.Packery.Rect,
            window.Packery.Packer,
            window.Packery.Item
        );
    }
})(window, function factory(getSize, Outlayer, Rect, Packer, Item) {
    "use strict";
    Rect.prototype.canFit = function (rect) {
        return this.width >= rect.width - 1 && this.height >= rect.height - 1;
    };
    var Packery = Outlayer.create("packery");
    Packery.Item = Item;
    var proto = Packery.prototype;
    proto._create = function () {
        Outlayer.prototype._create.call(this);
        this.packer = new Packer();
        this.shiftPacker = new Packer();
        this.isEnabled = !0;
        this.dragItemCount = 0;
        var _this = this;
        this.handleDraggabilly = {
            dragStart: function () {
                _this.itemDragStart(this.element);
            },
            dragMove: function () {
                _this.itemDragMove(
                    this.element,
                    this.position.x,
                    this.position.y
                );
            },
            dragEnd: function () {
                _this.itemDragEnd(this.element);
            },
        };
        this.handleUIDraggable = {
            start: function handleUIDraggableStart(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragStart(event.currentTarget);
            },
            drag: function handleUIDraggableDrag(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragMove(
                    event.currentTarget,
                    ui.position.left,
                    ui.position.top
                );
            },
            stop: function handleUIDraggableStop(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragEnd(event.currentTarget);
            },
        };
    };
    proto._resetLayout = function () {
        this.getSize();
        this._getMeasurements();
        var width, height, sortDirection;
        if (this._getOption("horizontal")) {
            width = Infinity;
            height = this.size.innerHeight + this.gutter;
            sortDirection = "rightwardTopToBottom";
        } else {
            width = this.size.innerWidth + this.gutter;
            height = Infinity;
            sortDirection = "downwardLeftToRight";
        }
        this.packer.width = this.shiftPacker.width = width;
        this.packer.height = this.shiftPacker.height = height;
        this.packer.sortDirection = this.shiftPacker.sortDirection =
            sortDirection;
        this.packer.reset();
        this.maxY = 0;
        this.maxX = 0;
    };
    proto._getMeasurements = function () {
        this._getMeasurement("columnWidth", "width");
        this._getMeasurement("rowHeight", "height");
        this._getMeasurement("gutter", "width");
    };
    proto._getItemLayoutPosition = function (item) {
        this._setRectSize(item.element, item.rect);
        if (this.isShifting || this.dragItemCount > 0) {
            var packMethod = this._getPackMethod();
            this.packer[packMethod](item.rect);
        } else {
            this.packer.pack(item.rect);
        }
        this._setMaxXY(item.rect);
        return item.rect;
    };
    proto.shiftLayout = function () {
        this.isShifting = !0;
        this.layout();
        delete this.isShifting;
    };
    proto._getPackMethod = function () {
        return this._getOption("horizontal") ? "rowPack" : "columnPack";
    };
    proto._setMaxXY = function (rect) {
        this.maxX = Math.max(rect.x + rect.width, this.maxX);
        this.maxY = Math.max(rect.y + rect.height, this.maxY);
    };
    proto._setRectSize = function (elem, rect) {
        var size = getSize(elem);
        var w = size.outerWidth;
        var h = size.outerHeight;
        if (w || h) {
            w = this._applyGridGutter(w, this.columnWidth);
            h = this._applyGridGutter(h, this.rowHeight);
        }
        rect.width = Math.min(w, this.packer.width);
        rect.height = Math.min(h, this.packer.height);
    };
    proto._applyGridGutter = function (measurement, gridSize) {
        if (!gridSize) {
            return measurement + this.gutter;
        }
        gridSize += this.gutter;
        var remainder = measurement % gridSize;
        var mathMethod = remainder && remainder < 1 ? "round" : "ceil";
        measurement = Math[mathMethod](measurement / gridSize) * gridSize;
        return measurement;
    };
    proto._getContainerSize = function () {
        if (this._getOption("horizontal")) {
            return { width: this.maxX - this.gutter };
        } else {
            return { height: this.maxY - this.gutter };
        }
    };
    proto._manageStamp = function (elem) {
        var item = this.getItem(elem);
        var rect;
        if (item && item.isPlacing) {
            rect = item.rect;
        } else {
            var offset = this._getElementOffset(elem);
            rect = new Rect({
                x: this._getOption("originLeft") ? offset.left : offset.right,
                y: this._getOption("originTop") ? offset.top : offset.bottom,
            });
        }
        this._setRectSize(elem, rect);
        this.packer.placed(rect);
        this._setMaxXY(rect);
    };
    function verticalSorter(a, b) {
        return a.position.y - b.position.y || a.position.x - b.position.x;
    }
    function horizontalSorter(a, b) {
        return a.position.x - b.position.x || a.position.y - b.position.y;
    }
    proto.sortItemsByPosition = function () {
        var sorter = this._getOption("horizontal")
            ? horizontalSorter
            : verticalSorter;
        this.items.sort(sorter);
    };
    proto.fit = function (elem, x, y) {
        var item = this.getItem(elem);
        if (!item) {
            return;
        }
        this.stamp(item.element);
        item.enablePlacing();
        this.updateShiftTargets(item);
        x = x === undefined ? item.rect.x : x;
        y = y === undefined ? item.rect.y : y;
        this.shift(item, x, y);
        this._bindFitEvents(item);
        item.moveTo(item.rect.x, item.rect.y);
        this.shiftLayout();
        this.unstamp(item.element);
        this.sortItemsByPosition();
        item.disablePlacing();
    };
    proto._bindFitEvents = function (item) {
        var _this = this;
        var ticks = 0;
        function onLayout() {
            ticks++;
            if (ticks != 2) {
                return;
            }
            _this.dispatchEvent("fitComplete", null, [item]);
        }
        item.once("layout", onLayout);
        this.once("layoutComplete", onLayout);
    };
    proto.resize = function () {
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        if (this.options.shiftPercentResize) {
            this.resizeShiftPercentLayout();
        } else {
            this.layout();
        }
    };
    proto.needsResizeLayout = function () {
        var size = getSize(this.element);
        var innerSize = this._getOption("horizontal")
            ? "innerHeight"
            : "innerWidth";
        return size[innerSize] != this.size[innerSize];
    };
    proto.resizeShiftPercentLayout = function () {
        var items = this._getItemsForLayout(this.items);
        var isHorizontal = this._getOption("horizontal");
        var coord = isHorizontal ? "y" : "x";
        var measure = isHorizontal ? "height" : "width";
        var segmentName = isHorizontal ? "rowHeight" : "columnWidth";
        var innerSize = isHorizontal ? "innerHeight" : "innerWidth";
        var previousSegment = this[segmentName];
        previousSegment = previousSegment && previousSegment + this.gutter;
        if (previousSegment) {
            this._getMeasurements();
            var currentSegment = this[segmentName] + this.gutter;
            items.forEach(function (item) {
                var seg = Math.round(item.rect[coord] / previousSegment);
                item.rect[coord] = seg * currentSegment;
            });
        } else {
            var currentSize = getSize(this.element)[innerSize] + this.gutter;
            var previousSize = this.packer[measure];
            items.forEach(function (item) {
                item.rect[coord] =
                    (item.rect[coord] / previousSize) * currentSize;
            });
        }
        this.shiftLayout();
    };
    proto.itemDragStart = function (elem) {
        if (!this.isEnabled) {
            return;
        }
        this.stamp(elem);
        var item = this.getItem(elem);
        if (!item) {
            return;
        }
        item.enablePlacing();
        item.showDropPlaceholder();
        this.dragItemCount++;
        this.updateShiftTargets(item);
    };
    proto.updateShiftTargets = function (dropItem) {
        this.shiftPacker.reset();
        this._getBoundingRect();
        var isOriginLeft = this._getOption("originLeft");
        var isOriginTop = this._getOption("originTop");
        this.stamps.forEach(function (stamp) {
            var item = this.getItem(stamp);
            if (item && item.isPlacing) {
                return;
            }
            var offset = this._getElementOffset(stamp);
            var rect = new Rect({
                x: isOriginLeft ? offset.left : offset.right,
                y: isOriginTop ? offset.top : offset.bottom,
            });
            this._setRectSize(stamp, rect);
            this.shiftPacker.placed(rect);
        }, this);
        var isHorizontal = this._getOption("horizontal");
        var segmentName = isHorizontal ? "rowHeight" : "columnWidth";
        var measure = isHorizontal ? "height" : "width";
        this.shiftTargetKeys = [];
        this.shiftTargets = [];
        var boundsSize;
        var segment = this[segmentName];
        segment = segment && segment + this.gutter;
        if (segment) {
            var segmentSpan = Math.ceil(dropItem.rect[measure] / segment);
            var segs = Math.floor(
                (this.shiftPacker[measure] + this.gutter) / segment
            );
            boundsSize = (segs - segmentSpan) * segment;
            for (var i = 0; i < segs; i++) {
                var initialX = isHorizontal ? 0 : i * segment;
                var initialY = isHorizontal ? i * segment : 0;
                this._addShiftTarget(initialX, initialY, boundsSize);
            }
        } else {
            boundsSize =
                this.shiftPacker[measure] +
                this.gutter -
                dropItem.rect[measure];
            this._addShiftTarget(0, 0, boundsSize);
        }
        var items = this._getItemsForLayout(this.items);
        var packMethod = this._getPackMethod();
        items.forEach(function (item) {
            var rect = item.rect;
            this._setRectSize(item.element, rect);
            this.shiftPacker[packMethod](rect);
            this._addShiftTarget(rect.x, rect.y, boundsSize);
            var cornerX = isHorizontal ? rect.x + rect.width : rect.x;
            var cornerY = isHorizontal ? rect.y : rect.y + rect.height;
            this._addShiftTarget(cornerX, cornerY, boundsSize);
            if (segment) {
                var segSpan = Math.round(rect[measure] / segment);
                for (var i = 1; i < segSpan; i++) {
                    var segX = isHorizontal ? cornerX : rect.x + segment * i;
                    var segY = isHorizontal ? rect.y + segment * i : cornerY;
                    this._addShiftTarget(segX, segY, boundsSize);
                }
            }
        }, this);
    };
    proto._addShiftTarget = function (x, y, boundsSize) {
        var checkCoord = this._getOption("horizontal") ? y : x;
        if (checkCoord !== 0 && checkCoord > boundsSize) {
            return;
        }
        var key = x + "," + y;
        var hasKey = this.shiftTargetKeys.indexOf(key) != -1;
        if (hasKey) {
            return;
        }
        this.shiftTargetKeys.push(key);
        this.shiftTargets.push({ x: x, y: y });
    };
    proto.shift = function (item, x, y) {
        var shiftPosition;
        var minDistance = Infinity;
        var position = { x: x, y: y };
        this.shiftTargets.forEach(function (target) {
            var distance = getDistance(target, position);
            if (distance < minDistance) {
                shiftPosition = target;
                minDistance = distance;
            }
        });
        item.rect.x = shiftPosition.x;
        item.rect.y = shiftPosition.y;
    };
    function getDistance(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    var DRAG_THROTTLE_TIME = 120;
    proto.itemDragMove = function (elem, x, y) {
        var item = this.isEnabled && this.getItem(elem);
        if (!item) {
            return;
        }
        x -= this.size.paddingLeft;
        y -= this.size.paddingTop;
        var _this = this;
        function onDrag() {
            _this.shift(item, x, y);
            item.positionDropPlaceholder();
            _this.layout();
        }
        var now = new Date();
        var isThrottled =
            this._itemDragTime && now - this._itemDragTime < DRAG_THROTTLE_TIME;
        if (isThrottled) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = setTimeout(onDrag, DRAG_THROTTLE_TIME);
        } else {
            onDrag();
            this._itemDragTime = now;
        }
    };
    proto.itemDragEnd = function (elem) {
        var item = this.isEnabled && this.getItem(elem);
        if (!item) {
            return;
        }
        clearTimeout(this.dragTimeout);
        item.element.classList.add("is-positioning-post-drag");
        var completeCount = 0;
        var _this = this;
        function onDragEndLayoutComplete() {
            completeCount++;
            if (completeCount != 2) {
                return;
            }
            item.element.classList.remove("is-positioning-post-drag");
            item.hideDropPlaceholder();
            _this.dispatchEvent("dragItemPositioned", null, [item]);
        }
        item.once("layout", onDragEndLayoutComplete);
        this.once("layoutComplete", onDragEndLayoutComplete);
        item.moveTo(item.rect.x, item.rect.y);
        this.layout();
        this.dragItemCount = Math.max(0, this.dragItemCount - 1);
        this.sortItemsByPosition();
        item.disablePlacing();
        this.unstamp(item.element);
    };
    proto.bindDraggabillyEvents = function (draggie) {
        this._bindDraggabillyEvents(draggie, "on");
    };
    proto.unbindDraggabillyEvents = function (draggie) {
        this._bindDraggabillyEvents(draggie, "off");
    };
    proto._bindDraggabillyEvents = function (draggie, method) {
        var handlers = this.handleDraggabilly;
        draggie[method]("dragStart", handlers.dragStart);
        draggie[method]("dragMove", handlers.dragMove);
        draggie[method]("dragEnd", handlers.dragEnd);
    };
    proto.bindUIDraggableEvents = function ($elems) {
        this._bindUIDraggableEvents($elems, "on");
    };
    proto.unbindUIDraggableEvents = function ($elems) {
        this._bindUIDraggableEvents($elems, "off");
    };
    proto._bindUIDraggableEvents = function ($elems, method) {
        var handlers = this.handleUIDraggable;
        $elems[method]("dragstart", handlers.start)
            [method]("drag", handlers.drag)
            [method]("dragstop", handlers.stop);
    };
    var _destroy = proto.destroy;
    proto.destroy = function () {
        _destroy.apply(this, arguments);
        this.isEnabled = !1;
    };
    Packery.Rect = Rect;
    Packery.Packer = Packer;
    return Packery;
});
/*!
Waypoints - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
    "use strict";
    var keyCounter = 0;
    var allWaypoints = {};
    function Waypoint(options) {
        if (!options) {
            throw new Error("No options passed to Waypoint constructor");
        }
        if (!options.element) {
            throw new Error("No element option passed to Waypoint constructor");
        }
        if (!options.handler) {
            throw new Error("No handler option passed to Waypoint constructor");
        }
        this.key = "waypoint-" + keyCounter;
        this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options);
        this.element = this.options.element;
        this.adapter = new Waypoint.Adapter(this.element);
        this.callback = options.handler;
        this.axis = this.options.horizontal ? "horizontal" : "vertical";
        this.enabled = this.options.enabled;
        this.triggerPoint = null;
        this.group = Waypoint.Group.findOrCreate({
            name: this.options.group,
            axis: this.axis,
        });
        this.context = Waypoint.Context.findOrCreateByElement(
            this.options.context
        );
        if (Waypoint.offsetAliases[this.options.offset]) {
            this.options.offset = Waypoint.offsetAliases[this.options.offset];
        }
        this.group.add(this);
        this.context.add(this);
        allWaypoints[this.key] = this;
        keyCounter += 1;
    }
    Waypoint.prototype.queueTrigger = function (direction) {
        this.group.queueTrigger(this, direction);
    };
    Waypoint.prototype.trigger = function (args) {
        if (!this.enabled) {
            return;
        }
        if (this.callback) {
            this.callback.apply(this, args);
        }
    };
    Waypoint.prototype.destroy = function () {
        this.context.remove(this);
        this.group.remove(this);
        delete allWaypoints[this.key];
    };
    Waypoint.prototype.disable = function () {
        this.enabled = !1;
        return this;
    };
    Waypoint.prototype.enable = function () {
        this.context.refresh();
        this.enabled = !0;
        return this;
    };
    Waypoint.prototype.next = function () {
        return this.group.next(this);
    };
    Waypoint.prototype.previous = function () {
        return this.group.previous(this);
    };
    Waypoint.invokeAll = function (method) {
        var allWaypointsArray = [];
        for (var waypointKey in allWaypoints) {
            allWaypointsArray.push(allWaypoints[waypointKey]);
        }
        for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
            allWaypointsArray[i][method]();
        }
    };
    Waypoint.destroyAll = function () {
        Waypoint.invokeAll("destroy");
    };
    Waypoint.disableAll = function () {
        Waypoint.invokeAll("disable");
    };
    Waypoint.enableAll = function () {
        Waypoint.invokeAll("enable");
    };
    Waypoint.refreshAll = function () {
        Waypoint.Context.refreshAll();
    };
    Waypoint.viewportHeight = function () {
        return window.innerHeight || document.documentElement.clientHeight;
    };
    Waypoint.viewportWidth = function () {
        return document.documentElement.clientWidth;
    };
    Waypoint.adapters = [];
    Waypoint.defaults = {
        context: window,
        continuous: !0,
        enabled: !0,
        group: "default",
        horizontal: !1,
        offset: 0,
    };
    Waypoint.offsetAliases = {
        "bottom-in-view": function () {
            return this.context.innerHeight() - this.adapter.outerHeight();
        },
        "right-in-view": function () {
            return this.context.innerWidth() - this.adapter.outerWidth();
        },
    };
    window.Waypoint = Waypoint;
})();
(function () {
    "use strict";
    function requestAnimationFrameShim(callback) {
        window.setTimeout(callback, 1000 / 60);
    }
    var keyCounter = 0;
    var contexts = {};
    var Waypoint = window.Waypoint;
    var oldWindowLoad = window.onload;
    function Context(element) {
        this.element = element;
        this.Adapter = Waypoint.Adapter;
        this.adapter = new this.Adapter(element);
        this.key = "waypoint-context-" + keyCounter;
        this.didScroll = !1;
        this.didResize = !1;
        this.oldScroll = {
            x: this.adapter.scrollLeft(),
            y: this.adapter.scrollTop(),
        };
        this.waypoints = { vertical: {}, horizontal: {} };
        element.waypointContextKey = this.key;
        contexts[element.waypointContextKey] = this;
        keyCounter += 1;
        this.createThrottledScrollHandler();
        this.createThrottledResizeHandler();
    }
    Context.prototype.add = function (waypoint) {
        var axis = waypoint.options.horizontal ? "horizontal" : "vertical";
        this.waypoints[axis][waypoint.key] = waypoint;
        this.refresh();
    };
    Context.prototype.checkEmpty = function () {
        var horizontalEmpty = this.Adapter.isEmptyObject(
            this.waypoints.horizontal
        );
        var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical);
        if (horizontalEmpty && verticalEmpty) {
            this.adapter.off(".waypoints");
            delete contexts[this.key];
        }
    };
    Context.prototype.createThrottledResizeHandler = function () {
        var self = this;
        function resizeHandler() {
            self.handleResize();
            self.didResize = !1;
        }
        this.adapter.on("resize.waypoints", function () {
            if (!self.didResize) {
                self.didResize = !0;
                Waypoint.requestAnimationFrame(resizeHandler);
            }
        });
    };
    Context.prototype.createThrottledScrollHandler = function () {
        var self = this;
        function scrollHandler() {
            self.handleScroll();
            self.didScroll = !1;
        }
        this.adapter.on("scroll.waypoints", function () {
            if (!self.didScroll || Waypoint.isTouch) {
                self.didScroll = !0;
                Waypoint.requestAnimationFrame(scrollHandler);
            }
        });
    };
    Context.prototype.handleResize = function () {
        Waypoint.Context.refreshAll();
    };
    Context.prototype.handleScroll = function () {
        var triggeredGroups = {};
        var axes = {
            horizontal: {
                newScroll: this.adapter.scrollLeft(),
                oldScroll: this.oldScroll.x,
                forward: "right",
                backward: "left",
            },
            vertical: {
                newScroll: this.adapter.scrollTop(),
                oldScroll: this.oldScroll.y,
                forward: "down",
                backward: "up",
            },
        };
        for (var axisKey in axes) {
            var axis = axes[axisKey];
            var isForward = axis.newScroll > axis.oldScroll;
            var direction = isForward ? axis.forward : axis.backward;
            for (var waypointKey in this.waypoints[axisKey]) {
                var waypoint = this.waypoints[axisKey][waypointKey];
                var wasBeforeTriggerPoint =
                    axis.oldScroll < waypoint.triggerPoint;
                var nowAfterTriggerPoint =
                    axis.newScroll >= waypoint.triggerPoint;
                var crossedForward =
                    wasBeforeTriggerPoint && nowAfterTriggerPoint;
                var crossedBackward =
                    !wasBeforeTriggerPoint && !nowAfterTriggerPoint;
                if (crossedForward || crossedBackward) {
                    waypoint.queueTrigger(direction);
                    triggeredGroups[waypoint.group.id] = waypoint.group;
                }
            }
        }
        for (var groupKey in triggeredGroups) {
            triggeredGroups[groupKey].flushTriggers();
        }
        this.oldScroll = {
            x: axes.horizontal.newScroll,
            y: axes.vertical.newScroll,
        };
    };
    Context.prototype.innerHeight = function () {
        if (this.element == this.element.window) {
            return Waypoint.viewportHeight();
        }
        return this.adapter.innerHeight();
    };
    Context.prototype.remove = function (waypoint) {
        delete this.waypoints[waypoint.axis][waypoint.key];
        this.checkEmpty();
    };
    Context.prototype.innerWidth = function () {
        if (this.element == this.element.window) {
            return Waypoint.viewportWidth();
        }
        return this.adapter.innerWidth();
    };
    Context.prototype.destroy = function () {
        var allWaypoints = [];
        for (var axis in this.waypoints) {
            for (var waypointKey in this.waypoints[axis]) {
                allWaypoints.push(this.waypoints[axis][waypointKey]);
            }
        }
        for (var i = 0, end = allWaypoints.length; i < end; i++) {
            allWaypoints[i].destroy();
        }
    };
    Context.prototype.refresh = function () {
        var isWindow = this.element == this.element.window;
        var contextOffset = isWindow ? undefined : this.adapter.offset();
        var triggeredGroups = {};
        var axes;
        this.handleScroll();
        axes = {
            horizontal: {
                contextOffset: isWindow ? 0 : contextOffset.left,
                contextScroll: isWindow ? 0 : this.oldScroll.x,
                contextDimension: this.innerWidth(),
                oldScroll: this.oldScroll.x,
                forward: "right",
                backward: "left",
                offsetProp: "left",
            },
            vertical: {
                contextOffset: isWindow ? 0 : contextOffset.top,
                contextScroll: isWindow ? 0 : this.oldScroll.y,
                contextDimension: this.innerHeight(),
                oldScroll: this.oldScroll.y,
                forward: "down",
                backward: "up",
                offsetProp: "top",
            },
        };
        for (var axisKey in axes) {
            var axis = axes[axisKey];
            for (var waypointKey in this.waypoints[axisKey]) {
                var waypoint = this.waypoints[axisKey][waypointKey];
                var adjustment = waypoint.options.offset;
                var oldTriggerPoint = waypoint.triggerPoint;
                var elementOffset = 0;
                var freshWaypoint = oldTriggerPoint == null;
                var contextModifier, wasBeforeScroll, nowAfterScroll;
                var triggeredBackward, triggeredForward;
                if (waypoint.element !== waypoint.element.window) {
                    elementOffset = waypoint.adapter.offset()[axis.offsetProp];
                }
                if (typeof adjustment === "function") {
                    adjustment = adjustment.apply(waypoint);
                } else if (typeof adjustment === "string") {
                    adjustment = parseFloat(adjustment);
                    if (waypoint.options.offset.indexOf("%") > -1) {
                        adjustment = Math.ceil(
                            (axis.contextDimension * adjustment) / 100
                        );
                    }
                }
                contextModifier = axis.contextScroll - axis.contextOffset;
                waypoint.triggerPoint =
                    elementOffset + contextModifier - adjustment;
                wasBeforeScroll = oldTriggerPoint < axis.oldScroll;
                nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll;
                triggeredBackward = wasBeforeScroll && nowAfterScroll;
                triggeredForward = !wasBeforeScroll && !nowAfterScroll;
                if (!freshWaypoint && triggeredBackward) {
                    waypoint.queueTrigger(axis.backward);
                    triggeredGroups[waypoint.group.id] = waypoint.group;
                } else if (!freshWaypoint && triggeredForward) {
                    waypoint.queueTrigger(axis.forward);
                    triggeredGroups[waypoint.group.id] = waypoint.group;
                } else if (
                    freshWaypoint &&
                    axis.oldScroll >= waypoint.triggerPoint
                ) {
                    waypoint.queueTrigger(axis.forward);
                    triggeredGroups[waypoint.group.id] = waypoint.group;
                }
            }
        }
        Waypoint.requestAnimationFrame(function () {
            for (var groupKey in triggeredGroups) {
                triggeredGroups[groupKey].flushTriggers();
            }
        });
        return this;
    };
    Context.findOrCreateByElement = function (element) {
        return Context.findByElement(element) || new Context(element);
    };
    Context.refreshAll = function () {
        for (var contextId in contexts) {
            contexts[contextId].refresh();
        }
    };
    Context.findByElement = function (element) {
        return contexts[element.waypointContextKey];
    };
    window.onload = function () {
        if (oldWindowLoad) {
            oldWindowLoad();
        }
        Context.refreshAll();
    };
    Waypoint.requestAnimationFrame = function (callback) {
        var requestFn =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            requestAnimationFrameShim;
        requestFn.call(window, callback);
    };
    Waypoint.Context = Context;
})();
(function () {
    "use strict";
    function byTriggerPoint(a, b) {
        return a.triggerPoint - b.triggerPoint;
    }
    function byReverseTriggerPoint(a, b) {
        return b.triggerPoint - a.triggerPoint;
    }
    var groups = { vertical: {}, horizontal: {} };
    var Waypoint = window.Waypoint;
    function Group(options) {
        this.name = options.name;
        this.axis = options.axis;
        this.id = this.name + "-" + this.axis;
        this.waypoints = [];
        this.clearTriggerQueues();
        groups[this.axis][this.name] = this;
    }
    Group.prototype.add = function (waypoint) {
        this.waypoints.push(waypoint);
    };
    Group.prototype.clearTriggerQueues = function () {
        this.triggerQueues = { up: [], down: [], left: [], right: [] };
    };
    Group.prototype.flushTriggers = function () {
        for (var direction in this.triggerQueues) {
            var waypoints = this.triggerQueues[direction];
            var reverse = direction === "up" || direction === "left";
            waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint);
            for (var i = 0, end = waypoints.length; i < end; i += 1) {
                var waypoint = waypoints[i];
                if (waypoint.options.continuous || i === waypoints.length - 1) {
                    waypoint.trigger([direction]);
                }
            }
        }
        this.clearTriggerQueues();
    };
    Group.prototype.next = function (waypoint) {
        this.waypoints.sort(byTriggerPoint);
        var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
        var isLast = index === this.waypoints.length - 1;
        return isLast ? null : this.waypoints[index + 1];
    };
    Group.prototype.previous = function (waypoint) {
        this.waypoints.sort(byTriggerPoint);
        var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
        return index ? this.waypoints[index - 1] : null;
    };
    Group.prototype.queueTrigger = function (waypoint, direction) {
        this.triggerQueues[direction].push(waypoint);
    };
    Group.prototype.remove = function (waypoint) {
        var index = Waypoint.Adapter.inArray(waypoint, this.waypoints);
        if (index > -1) {
            this.waypoints.splice(index, 1);
        }
    };
    Group.prototype.first = function () {
        return this.waypoints[0];
    };
    Group.prototype.last = function () {
        return this.waypoints[this.waypoints.length - 1];
    };
    Group.findOrCreate = function (options) {
        return groups[options.axis][options.name] || new Group(options);
    };
    Waypoint.Group = Group;
})();
(function () {
    "use strict";
    var $ = window.jQuery;
    var Waypoint = window.Waypoint;
    function JQueryAdapter(element) {
        this.$element = $(element);
    }
    $.each(
        [
            "innerHeight",
            "innerWidth",
            "off",
            "offset",
            "on",
            "outerHeight",
            "outerWidth",
            "scrollLeft",
            "scrollTop",
        ],
        function (i, method) {
            JQueryAdapter.prototype[method] = function () {
                var args = Array.prototype.slice.call(arguments);
                return this.$element[method].apply(this.$element, args);
            };
        }
    );
    $.each(["extend", "inArray", "isEmptyObject"], function (i, method) {
        JQueryAdapter[method] = $[method];
    });
    Waypoint.adapters.push({ name: "jquery", Adapter: JQueryAdapter });
    Waypoint.Adapter = JQueryAdapter;
})();
(function () {
    "use strict";
    var Waypoint = window.Waypoint;
    function createExtension(framework) {
        return function () {
            var waypoints = [];
            var overrides = arguments[0];
            if (framework.isFunction(arguments[0])) {
                overrides = framework.extend({}, arguments[1]);
                overrides.handler = arguments[0];
            }
            this.each(function () {
                var options = framework.extend({}, overrides, {
                    element: this,
                });
                if (typeof options.context === "string") {
                    options.context = framework(this).closest(
                        options.context
                    )[0];
                }
                waypoints.push(new Waypoint(options));
            });
            return waypoints;
        };
    }
    if (window.jQuery) {
        window.jQuery.fn.waypoint = createExtension(window.jQuery);
    }
    if (window.Zepto) {
        window.Zepto.fn.waypoint = createExtension(window.Zepto);
    }
})();
/*!
Waypoints Inview Shortcut - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function () {
    "use strict";
    function noop() {}
    var Waypoint = window.Waypoint;
    function Inview(options) {
        this.options = Waypoint.Adapter.extend({}, Inview.defaults, options);
        this.axis = this.options.horizontal ? "horizontal" : "vertical";
        this.waypoints = [];
        this.element = this.options.element;
        this.createWaypoints();
    }
    Inview.prototype.createWaypoints = function () {
        var configs = {
            vertical: [
                { down: "enter", up: "exited", offset: "100%" },
                { down: "entered", up: "exit", offset: "bottom-in-view" },
                { down: "exit", up: "entered", offset: 0 },
                {
                    down: "exited",
                    up: "enter",
                    offset: function () {
                        return -this.adapter.outerHeight();
                    },
                },
            ],
            horizontal: [
                { right: "enter", left: "exited", offset: "100%" },
                { right: "entered", left: "exit", offset: "right-in-view" },
                { right: "exit", left: "entered", offset: 0 },
                {
                    right: "exited",
                    left: "enter",
                    offset: function () {
                        return -this.adapter.outerWidth();
                    },
                },
            ],
        };
        for (var i = 0, end = configs[this.axis].length; i < end; i++) {
            var config = configs[this.axis][i];
            this.createWaypoint(config);
        }
    };
    Inview.prototype.createWaypoint = function (config) {
        var self = this;
        this.waypoints.push(
            new Waypoint({
                context: this.options.context,
                element: this.options.element,
                enabled: this.options.enabled,
                handler: (function (config) {
                    return function (direction) {
                        self.options[config[direction]].call(self, direction);
                    };
                })(config),
                offset: config.offset,
                horizontal: this.options.horizontal,
            })
        );
    };
    Inview.prototype.destroy = function () {
        for (var i = 0, end = this.waypoints.length; i < end; i++) {
            this.waypoints[i].destroy();
        }
        this.waypoints = [];
    };
    Inview.prototype.disable = function () {
        for (var i = 0, end = this.waypoints.length; i < end; i++) {
            this.waypoints[i].disable();
        }
    };
    Inview.prototype.enable = function () {
        for (var i = 0, end = this.waypoints.length; i < end; i++) {
            this.waypoints[i].enable();
        }
    };
    Inview.defaults = {
        context: window,
        enabled: !0,
        enter: noop,
        entered: noop,
        exit: noop,
        exited: noop,
    };
    Waypoint.Inview = Inview;
})();
(function () {
    "use strict";
    var $;
    var Swiper = function (container, params) {
        if (!(this instanceof Swiper)) return new Swiper(container, params);
        var defaults = {
            direction: "horizontal",
            touchEventsTarget: "container",
            initialSlide: 0,
            speed: 300,
            autoplay: !1,
            autoplayDisableOnInteraction: !0,
            autoplayStopOnLast: !1,
            iOSEdgeSwipeDetection: !1,
            iOSEdgeSwipeThreshold: 20,
            freeMode: !1,
            freeModeMomentum: !0,
            freeModeMomentumRatio: 1,
            freeModeMomentumBounce: !0,
            freeModeMomentumBounceRatio: 1,
            freeModeMomentumVelocityRatio: 1,
            freeModeSticky: !1,
            freeModeMinimumVelocity: 0.02,
            autoHeight: !1,
            setWrapperSize: !1,
            virtualTranslate: !1,
            effect: "slide",
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: !0,
            },
            flip: { slideShadows: !0, limitRotation: !0 },
            cube: {
                slideShadows: !0,
                shadow: !0,
                shadowOffset: 20,
                shadowScale: 0.94,
            },
            fade: { crossFade: !1 },
            parallax: !1,
            zoom: !1,
            zoomMax: 3,
            zoomMin: 1,
            zoomToggle: !0,
            scrollbar: null,
            scrollbarHide: !0,
            scrollbarDraggable: !1,
            scrollbarSnapOnRelease: !1,
            keyboardControl: !1,
            mousewheelControl: !1,
            mousewheelReleaseOnEdges: !1,
            mousewheelInvert: !1,
            mousewheelForceToAxis: !1,
            mousewheelSensitivity: 1,
            mousewheelEventsTarged: "container",
            hashnav: !1,
            hashnavWatchState: !1,
            history: !1,
            replaceState: !1,
            breakpoints: undefined,
            spaceBetween: 0,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerColumnFill: "column",
            slidesPerGroup: 1,
            centeredSlides: !1,
            slidesOffsetBefore: 0,
            slidesOffsetAfter: 0,
            roundLengths: !1,
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: !0,
            shortSwipes: !0,
            longSwipes: !0,
            longSwipesRatio: 0.5,
            longSwipesMs: 300,
            followFinger: !0,
            onlyExternal: !1,
            threshold: 0,
            touchMoveStopPropagation: !0,
            touchReleaseOnEdges: !1,
            uniqueNavElements: !0,
            pagination: null,
            paginationElement: "span",
            paginationClickable: !1,
            paginationHide: !1,
            paginationBulletRender: null,
            paginationProgressRender: null,
            paginationFractionRender: null,
            paginationCustomRender: null,
            paginationType: "bullets",
            resistance: !0,
            resistanceRatio: 0.85,
            nextButton: null,
            prevButton: null,
            watchSlidesProgress: !1,
            watchSlidesVisibility: !1,
            grabCursor: !1,
            preventClicks: !0,
            preventClicksPropagation: !0,
            slideToClickedSlide: !1,
            lazyLoading: !1,
            lazyLoadingInPrevNext: !1,
            lazyLoadingInPrevNextAmount: 1,
            lazyLoadingOnTransitionStart: !1,
            preloadImages: !0,
            updateOnImagesReady: !0,
            loop: !1,
            loopAdditionalSlides: 0,
            loopedSlides: null,
            control: undefined,
            controlInverse: !1,
            controlBy: "slide",
            normalizeSlideIndex: !0,
            allowSwipeToPrev: !0,
            allowSwipeToNext: !0,
            swipeHandler: null,
            noSwiping: !0,
            noSwipingClass: "swiper-no-swiping",
            passiveListeners: !0,
            containerModifierClass: "swiper-container-",
            slideClass: "swiper-slide",
            slideActiveClass: "swiper-slide-active",
            slideDuplicateActiveClass: "swiper-slide-duplicate-active",
            slideVisibleClass: "swiper-slide-visible",
            slideDuplicateClass: "swiper-slide-duplicate",
            slideNextClass: "swiper-slide-next",
            slideDuplicateNextClass: "swiper-slide-duplicate-next",
            slidePrevClass: "swiper-slide-prev",
            slideDuplicatePrevClass: "swiper-slide-duplicate-prev",
            wrapperClass: "swiper-wrapper",
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
            buttonDisabledClass: "swiper-button-disabled",
            paginationCurrentClass: "swiper-pagination-current",
            paginationTotalClass: "swiper-pagination-total",
            paginationHiddenClass: "swiper-pagination-hidden",
            paginationProgressbarClass: "swiper-pagination-progressbar",
            paginationClickableClass: "swiper-pagination-clickable",
            paginationModifierClass: "swiper-pagination-",
            lazyLoadingClass: "swiper-lazy",
            lazyStatusLoadingClass: "swiper-lazy-loading",
            lazyStatusLoadedClass: "swiper-lazy-loaded",
            lazyPreloaderClass: "swiper-lazy-preloader",
            notificationClass: "swiper-notification",
            preloaderClass: "preloader",
            zoomContainerClass: "swiper-zoom-container",
            observer: !1,
            observeParents: !1,
            a11y: !1,
            prevSlideMessage: "Previous slide",
            nextSlideMessage: "Next slide",
            firstSlideMessage: "This is the first slide",
            lastSlideMessage: "This is the last slide",
            paginationBulletMessage: "Go to slide {{index}}",
            runCallbacksOnInit: !0,
        };
        var initialVirtualTranslate = params && params.virtualTranslate;
        params = params || {};
        var originalParams = {};
        for (var param in params) {
            if (
                typeof params[param] === "object" &&
                params[param] !== null &&
                !(
                    params[param].nodeType ||
                    params[param] === window ||
                    params[param] === document ||
                    (typeof Dom7 !== "undefined" &&
                        params[param] instanceof Dom7) ||
                    (typeof jQuery !== "undefined" &&
                        params[param] instanceof jQuery)
                )
            ) {
                originalParams[param] = {};
                for (var deepParam in params[param]) {
                    originalParams[param][deepParam] = params[param][deepParam];
                }
            } else {
                originalParams[param] = params[param];
            }
        }
        for (var def in defaults) {
            if (typeof params[def] === "undefined") {
                params[def] = defaults[def];
            } else if (typeof params[def] === "object") {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === "undefined") {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }
        var s = this;
        s.params = params;
        s.originalParams = originalParams;
        s.classNames = [];
        if (typeof $ !== "undefined" && typeof Dom7 !== "undefined") {
            $ = Dom7;
        }
        if (typeof $ === "undefined") {
            if (typeof Dom7 === "undefined") {
                $ = window.Dom7 || window.Zepto || window.jQuery;
            } else {
                $ = Dom7;
            }
            if (!$) return;
        }
        s.$ = $;
        s.currentBreakpoint = undefined;
        s.getActiveBreakpoint = function () {
            if (!s.params.breakpoints) return !1;
            var breakpoint = !1;
            var points = [],
                point;
            for (point in s.params.breakpoints) {
                if (s.params.breakpoints.hasOwnProperty(point)) {
                    points.push(point);
                }
            }
            points.sort(function (a, b) {
                return parseInt(a, 10) > parseInt(b, 10);
            });
            for (var i = 0; i < points.length; i++) {
                point = points[i];
                if (point >= window.innerWidth && !breakpoint) {
                    breakpoint = point;
                }
            }
            return breakpoint || "max";
        };
        s.setBreakpoint = function () {
            var breakpoint = s.getActiveBreakpoint();
            if (breakpoint && s.currentBreakpoint !== breakpoint) {
                var breakPointsParams =
                    breakpoint in s.params.breakpoints
                        ? s.params.breakpoints[breakpoint]
                        : s.originalParams;
                var needsReLoop =
                    s.params.loop &&
                    breakPointsParams.slidesPerView !== s.params.slidesPerView;
                for (var param in breakPointsParams) {
                    s.params[param] = breakPointsParams[param];
                }
                s.currentBreakpoint = breakpoint;
                if (needsReLoop && s.destroyLoop) {
                    s.reLoop(!0);
                }
            }
        };
        if (s.params.breakpoints) {
            s.setBreakpoint();
        }
        s.container = $(container);
        if (s.container.length === 0) return;
        if (s.container.length > 1) {
            var swipers = [];
            s.container.each(function () {
                var container = this;
                swipers.push(new Swiper(this, params));
            });
            return swipers;
        }
        s.container[0].swiper = s;
        s.container.data("swiper", s);
        s.classNames.push(s.params.containerModifierClass + s.params.direction);
        if (s.params.freeMode) {
            s.classNames.push(s.params.containerModifierClass + "free-mode");
        }
        if (!s.support.flexbox) {
            s.classNames.push(s.params.containerModifierClass + "no-flexbox");
            s.params.slidesPerColumn = 1;
        }
        if (s.params.autoHeight) {
            s.classNames.push(s.params.containerModifierClass + "autoheight");
        }
        if (s.params.parallax || s.params.watchSlidesVisibility) {
            s.params.watchSlidesProgress = !0;
        }
        if (s.params.touchReleaseOnEdges) {
            s.params.resistanceRatio = 0;
        }
        if (["cube", "coverflow", "flip"].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = !0;
                s.classNames.push(s.params.containerModifierClass + "3d");
            } else {
                s.params.effect = "slide";
            }
        }
        if (s.params.effect !== "slide") {
            s.classNames.push(
                s.params.containerModifierClass + s.params.effect
            );
        }
        if (s.params.effect === "cube") {
            s.params.resistanceRatio = 0;
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.centeredSlides = !1;
            s.params.spaceBetween = 0;
            s.params.virtualTranslate = !0;
        }
        if (s.params.effect === "fade" || s.params.effect === "flip") {
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.watchSlidesProgress = !0;
            s.params.spaceBetween = 0;
            if (typeof initialVirtualTranslate === "undefined") {
                s.params.virtualTranslate = !0;
            }
        }
        if (s.params.grabCursor && s.support.touch) {
            s.params.grabCursor = !1;
        }
        s.wrapper = s.container.children("." + s.params.wrapperClass);
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (
                s.params.uniqueNavElements &&
                typeof s.params.pagination === "string" &&
                s.paginationContainer.length > 1 &&
                s.container.find(s.params.pagination).length === 1
            ) {
                s.paginationContainer = s.container.find(s.params.pagination);
            }
            if (
                s.params.paginationType === "bullets" &&
                s.params.paginationClickable
            ) {
                s.paginationContainer.addClass(
                    s.params.paginationModifierClass + "clickable"
                );
            } else {
                s.params.paginationClickable = !1;
            }
            s.paginationContainer.addClass(
                s.params.paginationModifierClass + s.params.paginationType
            );
        }
        if (s.params.nextButton || s.params.prevButton) {
            if (s.params.nextButton) {
                s.nextButton = $(s.params.nextButton);
                if (
                    s.params.uniqueNavElements &&
                    typeof s.params.nextButton === "string" &&
                    s.nextButton.length > 1 &&
                    s.container.find(s.params.nextButton).length === 1
                ) {
                    s.nextButton = s.container.find(s.params.nextButton);
                }
            }
            if (s.params.prevButton) {
                s.prevButton = $(s.params.prevButton);
                if (
                    s.params.uniqueNavElements &&
                    typeof s.params.prevButton === "string" &&
                    s.prevButton.length > 1 &&
                    s.container.find(s.params.prevButton).length === 1
                ) {
                    s.prevButton = s.container.find(s.params.prevButton);
                }
            }
        }
        s.isHorizontal = function () {
            return s.params.direction === "horizontal";
        };
        s.rtl =
            s.isHorizontal() &&
            (s.container[0].dir.toLowerCase() === "rtl" ||
                s.container.css("direction") === "rtl");
        if (s.rtl) {
            s.classNames.push(s.params.containerModifierClass + "rtl");
        }
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css("display") === "-webkit-box";
        }
        if (s.params.slidesPerColumn > 1) {
            s.classNames.push(s.params.containerModifierClass + "multirow");
        }
        if (s.device.android) {
            s.classNames.push(s.params.containerModifierClass + "android");
        }
        s.container.addClass(s.classNames.join(" "));
        s.translate = 0;
        s.progress = 0;
        s.velocity = 0;
        s.lockSwipeToNext = function () {
            s.params.allowSwipeToNext = !1;
            if (s.params.allowSwipeToPrev === !1 && s.params.grabCursor) {
                s.unsetGrabCursor();
            }
        };
        s.lockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = !1;
            if (s.params.allowSwipeToNext === !1 && s.params.grabCursor) {
                s.unsetGrabCursor();
            }
        };
        s.lockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = !1;
            if (s.params.grabCursor) s.unsetGrabCursor();
        };
        s.unlockSwipeToNext = function () {
            s.params.allowSwipeToNext = !0;
            if (s.params.allowSwipeToPrev === !0 && s.params.grabCursor) {
                s.setGrabCursor();
            }
        };
        s.unlockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = !0;
            if (s.params.allowSwipeToNext === !0 && s.params.grabCursor) {
                s.setGrabCursor();
            }
        };
        s.unlockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = !0;
            if (s.params.grabCursor) s.setGrabCursor();
        };
        function round(a) {
            return Math.floor(a);
        }
        s.setGrabCursor = function (moving) {
            s.container[0].style.cursor = "move";
            s.container[0].style.cursor = moving
                ? "-webkit-grabbing"
                : "-webkit-grab";
            s.container[0].style.cursor = moving ? "-moz-grabbin" : "-moz-grab";
            s.container[0].style.cursor = moving ? "grabbing" : "grab";
        };
        s.unsetGrabCursor = function () {
            s.container[0].style.cursor = "";
        };
        if (s.params.grabCursor) {
            s.setGrabCursor();
        }
        s.imagesToLoad = [];
        s.imagesLoaded = 0;
        s.loadImage = function (
            imgElement,
            src,
            srcset,
            sizes,
            checkForComplete,
            callback
        ) {
            var image;
            function onReady() {
                if (callback) callback();
            }
            if (!imgElement.complete || !checkForComplete) {
                if (src) {
                    image = new window.Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    if (sizes) {
                        image.sizes = sizes;
                    }
                    if (srcset) {
                        image.srcset = srcset;
                    }
                    if (src) {
                        image.src = src;
                    }
                } else {
                    onReady();
                }
            } else {
                onReady();
            }
        };
        s.preloadImages = function () {
            s.imagesToLoad = s.container.find("img");
            function _onReady() {
                if (typeof s === "undefined" || s === null || !s) return;
                if (s.imagesLoaded !== undefined) s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    if (s.params.updateOnImagesReady) s.update();
                    s.emit("onImagesReady", s);
                }
            }
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                s.loadImage(
                    s.imagesToLoad[i],
                    s.imagesToLoad[i].currentSrc ||
                        s.imagesToLoad[i].getAttribute("src"),
                    s.imagesToLoad[i].srcset ||
                        s.imagesToLoad[i].getAttribute("srcset"),
                    s.imagesToLoad[i].sizes ||
                        s.imagesToLoad[i].getAttribute("sizes"),
                    !0,
                    _onReady
                );
            }
        };
        s.autoplayTimeoutId = undefined;
        s.autoplaying = !1;
        s.autoplayPaused = !1;
        function autoplay() {
            var autoplayDelay = s.params.autoplay;
            var activeSlide = s.slides.eq(s.activeIndex);
            if (activeSlide.attr("data-swiper-autoplay")) {
                autoplayDelay =
                    activeSlide.attr("data-swiper-autoplay") ||
                    s.params.autoplay;
            }
            s.autoplayTimeoutId = setTimeout(function () {
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                    s.emit("onAutoplay", s);
                } else {
                    if (!s.isEnd) {
                        s._slideNext();
                        s.emit("onAutoplay", s);
                    } else {
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                            s.emit("onAutoplay", s);
                        } else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, autoplayDelay);
        }
        s.startAutoplay = function () {
            if (typeof s.autoplayTimeoutId !== "undefined") return !1;
            if (!s.params.autoplay) return !1;
            if (s.autoplaying) return !1;
            s.autoplaying = !0;
            s.emit("onAutoplayStart", s);
            autoplay();
        };
        s.stopAutoplay = function (internal) {
            if (!s.autoplayTimeoutId) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = !1;
            s.autoplayTimeoutId = undefined;
            s.emit("onAutoplayStop", s);
        };
        s.pauseAutoplay = function (speed) {
            if (s.autoplayPaused) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = !0;
            if (speed === 0) {
                s.autoplayPaused = !1;
                autoplay();
            } else {
                s.wrapper.transitionEnd(function () {
                    if (!s) return;
                    s.autoplayPaused = !1;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    } else {
                        autoplay();
                    }
                });
            }
        };
        s.minTranslate = function () {
            return -s.snapGrid[0];
        };
        s.maxTranslate = function () {
            return -s.snapGrid[s.snapGrid.length - 1];
        };
        s.updateAutoHeight = function () {
            var activeSlides = [];
            var newHeight = 0;
            var i;
            if (
                s.params.slidesPerView !== "auto" &&
                s.params.slidesPerView > 1
            ) {
                for (i = 0; i < Math.ceil(s.params.slidesPerView); i++) {
                    var index = s.activeIndex + i;
                    if (index > s.slides.length) break;
                    activeSlides.push(s.slides.eq(index)[0]);
                }
            } else {
                activeSlides.push(s.slides.eq(s.activeIndex)[0]);
            }
            for (i = 0; i < activeSlides.length; i++) {
                if (typeof activeSlides[i] !== "undefined") {
                    var height = activeSlides[i].offsetHeight;
                    newHeight = height > newHeight ? height : newHeight;
                }
            }
            if (newHeight) s.wrapper.css("height", newHeight + "px");
        };
        s.updateContainerSize = function () {
            var width, height;
            if (typeof s.params.width !== "undefined") {
                width = s.params.width;
            } else {
                width = s.container[0].clientWidth;
            }
            if (typeof s.params.height !== "undefined") {
                height = s.params.height;
            } else {
                height = s.container[0].clientHeight;
            }
            if (
                (width === 0 && s.isHorizontal()) ||
                (height === 0 && !s.isHorizontal())
            ) {
                return;
            }
            width =
                width -
                parseInt(s.container.css("padding-left"), 10) -
                parseInt(s.container.css("padding-right"), 10);
            height =
                height -
                parseInt(s.container.css("padding-top"), 10) -
                parseInt(s.container.css("padding-bottom"), 10);
            s.width = width;
            s.height = height;
            s.size = s.isHorizontal() ? s.width : s.height;
        };
        s.updateSlidesSize = function () {
            s.slides = s.wrapper.children("." + s.params.slideClass);
            s.snapGrid = [];
            s.slidesGrid = [];
            s.slidesSizesGrid = [];
            var spaceBetween = s.params.spaceBetween,
                slidePosition = -s.params.slidesOffsetBefore,
                i,
                prevSlideSize = 0,
                index = 0;
            if (typeof s.size === "undefined") return;
            if (
                typeof spaceBetween === "string" &&
                spaceBetween.indexOf("%") >= 0
            ) {
                spaceBetween =
                    (parseFloat(spaceBetween.replace("%", "")) / 100) * s.size;
            }
            s.virtualSize = -spaceBetween;
            if (s.rtl) s.slides.css({ marginLeft: "", marginTop: "" });
            else s.slides.css({ marginRight: "", marginBottom: "" });
            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                if (
                    Math.floor(s.slides.length / s.params.slidesPerColumn) ===
                    s.slides.length / s.params.slidesPerColumn
                ) {
                    slidesNumberEvenToRows = s.slides.length;
                } else {
                    slidesNumberEvenToRows =
                        Math.ceil(s.slides.length / s.params.slidesPerColumn) *
                        s.params.slidesPerColumn;
                }
                if (
                    s.params.slidesPerView !== "auto" &&
                    s.params.slidesPerColumnFill === "row"
                ) {
                    slidesNumberEvenToRows = Math.max(
                        slidesNumberEvenToRows,
                        s.params.slidesPerView * s.params.slidesPerColumn
                    );
                }
            }
            var slideSize;
            var slidesPerColumn = s.params.slidesPerColumn;
            var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
            var numFullColumns =
                slidesPerRow -
                (s.params.slidesPerColumn * slidesPerRow - s.slides.length);
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    var newSlideOrderIndex;
                    var column, row;
                    if (s.params.slidesPerColumnFill === "column") {
                        column = Math.floor(i / slidesPerColumn);
                        row = i - column * slidesPerColumn;
                        if (
                            column > numFullColumns ||
                            (column === numFullColumns &&
                                row === slidesPerColumn - 1)
                        ) {
                            if (++row >= slidesPerColumn) {
                                row = 0;
                                column++;
                            }
                        }
                        newSlideOrderIndex =
                            column +
                            (row * slidesNumberEvenToRows) / slidesPerColumn;
                        slide.css({
                            "-webkit-box-ordinal-group": newSlideOrderIndex,
                            "-moz-box-ordinal-group": newSlideOrderIndex,
                            "-ms-flex-order": newSlideOrderIndex,
                            "-webkit-order": newSlideOrderIndex,
                            order: newSlideOrderIndex,
                        });
                    } else {
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;
                    }
                    slide
                        .css(
                            "margin-" + (s.isHorizontal() ? "top" : "left"),
                            row !== 0 &&
                                s.params.spaceBetween &&
                                s.params.spaceBetween + "px"
                        )
                        .attr("data-swiper-column", column)
                        .attr("data-swiper-row", row);
                }
                if (slide.css("display") === "none") continue;
                if (s.params.slidesPerView === "auto") {
                    slideSize = s.isHorizontal()
                        ? slide.outerWidth(!0)
                        : slide.outerHeight(!0);
                    if (s.params.roundLengths) slideSize = round(slideSize);
                } else {
                    slideSize =
                        (s.size - (s.params.slidesPerView - 1) * spaceBetween) /
                        s.params.slidesPerView;
                    if (s.params.roundLengths) slideSize = round(slideSize);
                    if (s.isHorizontal()) {
                        s.slides[i].style.width = slideSize + "px";
                    } else {
                        s.slides[i].style.height = slideSize + "px";
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);
                if (s.params.centeredSlides) {
                    slidePosition =
                        slidePosition +
                        slideSize / 2 +
                        prevSlideSize / 2 +
                        spaceBetween;
                    if (prevSlideSize === 0 && i !== 0)
                        slidePosition =
                            slidePosition - s.size / 2 - spaceBetween;
                    if (i === 0)
                        slidePosition =
                            slidePosition - s.size / 2 - spaceBetween;
                    if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
                    if (index % s.params.slidesPerGroup === 0)
                        s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                } else {
                    if (index % s.params.slidesPerGroup === 0)
                        s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }
                s.virtualSize += slideSize + spaceBetween;
                prevSlideSize = slideSize;
                index++;
            }
            s.virtualSize =
                Math.max(s.virtualSize, s.size) + s.params.slidesOffsetAfter;
            var newSlidesGrid;
            if (
                s.rtl &&
                s.wrongRTL &&
                (s.params.effect === "slide" || s.params.effect === "coverflow")
            ) {
                s.wrapper.css({
                    width: s.virtualSize + s.params.spaceBetween + "px",
                });
            }
            if (!s.support.flexbox || s.params.setWrapperSize) {
                if (s.isHorizontal())
                    s.wrapper.css({
                        width: s.virtualSize + s.params.spaceBetween + "px",
                    });
                else
                    s.wrapper.css({
                        height: s.virtualSize + s.params.spaceBetween + "px",
                    });
            }
            if (s.params.slidesPerColumn > 1) {
                s.virtualSize =
                    (slideSize + s.params.spaceBetween) *
                    slidesNumberEvenToRows;
                s.virtualSize =
                    Math.ceil(s.virtualSize / s.params.slidesPerColumn) -
                    s.params.spaceBetween;
                if (s.isHorizontal())
                    s.wrapper.css({
                        width: s.virtualSize + s.params.spaceBetween + "px",
                    });
                else
                    s.wrapper.css({
                        height: s.virtualSize + s.params.spaceBetween + "px",
                    });
                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualSize + s.snapGrid[0])
                            newSlidesGrid.push(s.snapGrid[i]);
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualSize - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                if (
                    Math.floor(s.virtualSize - s.size) -
                        Math.floor(s.snapGrid[s.snapGrid.length - 1]) >
                    1
                ) {
                    s.snapGrid.push(s.virtualSize - s.size);
                }
            }
            if (s.snapGrid.length === 0) s.snapGrid = [0];
            if (s.params.spaceBetween !== 0) {
                if (s.isHorizontal()) {
                    if (s.rtl)
                        s.slides.css({ marginLeft: spaceBetween + "px" });
                    else s.slides.css({ marginRight: spaceBetween + "px" });
                } else s.slides.css({ marginBottom: spaceBetween + "px" });
            }
            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        s.updateSlidesOffset = function () {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = s.isHorizontal()
                    ? s.slides[i].offsetLeft
                    : s.slides[i].offsetTop;
            }
        };
        s.currentSlidesPerView = function () {
            var spv = 1,
                i,
                j;
            if (s.params.centeredSlides) {
                var size = s.slides[s.activeIndex].swiperSlideSize;
                var breakLoop;
                for (i = s.activeIndex + 1; i < s.slides.length; i++) {
                    if (s.slides[i] && !breakLoop) {
                        size += s.slides[i].swiperSlideSize;
                        spv++;
                        if (size > s.size) breakLoop = !0;
                    }
                }
                for (j = s.activeIndex - 1; j >= 0; j--) {
                    if (s.slides[j] && !breakLoop) {
                        size += s.slides[j].swiperSlideSize;
                        spv++;
                        if (size > s.size) breakLoop = !0;
                    }
                }
            } else {
                for (i = s.activeIndex + 1; i < s.slides.length; i++) {
                    if (
                        s.slidesGrid[i] - s.slidesGrid[s.activeIndex] <
                        s.size
                    ) {
                        spv++;
                    }
                }
            }
            return spv;
        };
        s.updateSlidesProgress = function (translate) {
            if (typeof translate === "undefined") {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0) return;
            if (typeof s.slides[0].swiperSlideOffset === "undefined")
                s.updateSlidesOffset();
            var offsetCenter = -translate;
            if (s.rtl) offsetCenter = translate;
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                var slideProgress =
                    (offsetCenter +
                        (s.params.centeredSlides ? s.minTranslate() : 0) -
                        slide.swiperSlideOffset) /
                    (slide.swiperSlideSize + s.params.spaceBetween);
                if (s.params.watchSlidesVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible =
                        (slideBefore >= 0 && slideBefore < s.size) ||
                        (slideAfter > 0 && slideAfter <= s.size) ||
                        (slideBefore <= 0 && slideAfter >= s.size);
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        s.updateProgress = function (translate) {
            if (typeof translate === "undefined") {
                translate = s.translate || 0;
            }
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            var wasBeginning = s.isBeginning;
            var wasEnd = s.isEnd;
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = !0;
            } else {
                s.progress = (translate - s.minTranslate()) / translatesDiff;
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning && !wasBeginning) s.emit("onReachBeginning", s);
            if (s.isEnd && !wasEnd) s.emit("onReachEnd", s);
            if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
            s.emit("onProgress", s, s.progress);
        };
        s.updateActiveIndex = function () {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i++) {
                if (typeof s.slidesGrid[i + 1] !== "undefined") {
                    if (
                        translate >= s.slidesGrid[i] &&
                        translate <
                            s.slidesGrid[i + 1] -
                                (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2
                    ) {
                        newActiveIndex = i;
                    } else if (
                        translate >= s.slidesGrid[i] &&
                        translate < s.slidesGrid[i + 1]
                    ) {
                        newActiveIndex = i + 1;
                    }
                } else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            if (s.params.normalizeSlideIndex) {
                if (newActiveIndex < 0 || typeof newActiveIndex === "undefined")
                    newActiveIndex = 0;
            }
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length)
                snapIndex = s.snapGrid.length - 1;
            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
            s.updateRealIndex();
        };
        s.updateRealIndex = function () {
            s.realIndex = parseInt(
                s.slides.eq(s.activeIndex).attr("data-swiper-slide-index") ||
                    s.activeIndex,
                10
            );
        };
        s.updateClasses = function () {
            s.slides.removeClass(
                s.params.slideActiveClass +
                    " " +
                    s.params.slideNextClass +
                    " " +
                    s.params.slidePrevClass +
                    " " +
                    s.params.slideDuplicateActiveClass +
                    " " +
                    s.params.slideDuplicateNextClass +
                    " " +
                    s.params.slideDuplicatePrevClass
            );
            var activeSlide = s.slides.eq(s.activeIndex);
            activeSlide.addClass(s.params.slideActiveClass);
            if (params.loop) {
                if (activeSlide.hasClass(s.params.slideDuplicateClass)) {
                    s.wrapper
                        .children(
                            "." +
                                s.params.slideClass +
                                ":not(." +
                                s.params.slideDuplicateClass +
                                ')[data-swiper-slide-index="' +
                                s.realIndex +
                                '"]'
                        )
                        .addClass(s.params.slideDuplicateActiveClass);
                } else {
                    s.wrapper
                        .children(
                            "." +
                                s.params.slideClass +
                                "." +
                                s.params.slideDuplicateClass +
                                '[data-swiper-slide-index="' +
                                s.realIndex +
                                '"]'
                        )
                        .addClass(s.params.slideDuplicateActiveClass);
                }
            }
            var nextSlide = activeSlide
                .next("." + s.params.slideClass)
                .addClass(s.params.slideNextClass);
            if (s.params.loop && nextSlide.length === 0) {
                nextSlide = s.slides.eq(0);
                nextSlide.addClass(s.params.slideNextClass);
            }
            var prevSlide = activeSlide
                .prev("." + s.params.slideClass)
                .addClass(s.params.slidePrevClass);
            if (s.params.loop && prevSlide.length === 0) {
                prevSlide = s.slides.eq(-1);
                prevSlide.addClass(s.params.slidePrevClass);
            }
            if (params.loop) {
                if (nextSlide.hasClass(s.params.slideDuplicateClass)) {
                    s.wrapper
                        .children(
                            "." +
                                s.params.slideClass +
                                ":not(." +
                                s.params.slideDuplicateClass +
                                ')[data-swiper-slide-index="' +
                                nextSlide.attr("data-swiper-slide-index") +
                                '"]'
                        )
                        .addClass(s.params.slideDuplicateNextClass);
                } else {
                    s.wrapper
                        .children(
                            "." +
                                s.params.slideClass +
                                "." +
                                s.params.slideDuplicateClass +
                                '[data-swiper-slide-index="' +
                                nextSlide.attr("data-swiper-slide-index") +
                                '"]'
                        )
                        .addClass(s.params.slideDuplicateNextClass);
                }
                if (prevSlide.hasClass(s.params.slideDuplicateClass)) {
                    s.wrapper
                        .children(
                            "." +
                                s.params.slideClass +
                                ":not(." +
                                s.params.slideDuplicateClass +
                                ')[data-swiper-slide-index="' +
                                prevSlide.attr("data-swiper-slide-index") +
                                '"]'
                        )
                        .addClass(s.params.slideDuplicatePrevClass);
                } else {
                    s.wrapper
                        .children(
                            "." +
                                s.params.slideClass +
                                "." +
                                s.params.slideDuplicateClass +
                                '[data-swiper-slide-index="' +
                                prevSlide.attr("data-swiper-slide-index") +
                                '"]'
                        )
                        .addClass(s.params.slideDuplicatePrevClass);
                }
            }
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var current,
                    total = s.params.loop
                        ? Math.ceil(
                              (s.slides.length - s.loopedSlides * 2) /
                                  s.params.slidesPerGroup
                          )
                        : s.snapGrid.length;
                if (s.params.loop) {
                    current = Math.ceil(
                        (s.activeIndex - s.loopedSlides) /
                            s.params.slidesPerGroup
                    );
                    if (current > s.slides.length - 1 - s.loopedSlides * 2) {
                        current =
                            current - (s.slides.length - s.loopedSlides * 2);
                    }
                    if (current > total - 1) current = current - total;
                    if (current < 0 && s.params.paginationType !== "bullets")
                        current = total + current;
                } else {
                    if (typeof s.snapIndex !== "undefined") {
                        current = s.snapIndex;
                    } else {
                        current = s.activeIndex || 0;
                    }
                }
                if (
                    s.params.paginationType === "bullets" &&
                    s.bullets &&
                    s.bullets.length > 0
                ) {
                    s.bullets.removeClass(s.params.bulletActiveClass);
                    if (s.paginationContainer.length > 1) {
                        s.bullets.each(function () {
                            if ($(this).index() === current)
                                $(this).addClass(s.params.bulletActiveClass);
                        });
                    } else {
                        s.bullets
                            .eq(current)
                            .addClass(s.params.bulletActiveClass);
                    }
                }
                if (s.params.paginationType === "fraction") {
                    s.paginationContainer
                        .find("." + s.params.paginationCurrentClass)
                        .text(current + 1);
                    s.paginationContainer
                        .find("." + s.params.paginationTotalClass)
                        .text(total);
                }
                if (s.params.paginationType === "progress") {
                    var scale = (current + 1) / total,
                        scaleX = scale,
                        scaleY = 1;
                    if (!s.isHorizontal()) {
                        scaleY = scale;
                        scaleX = 1;
                    }
                    s.paginationContainer
                        .find("." + s.params.paginationProgressbarClass)
                        .transform(
                            "translate3d(0,0,0) scaleX(" +
                                scaleX +
                                ") scaleY(" +
                                scaleY +
                                ")"
                        )
                        .transition(s.params.speed);
                }
                if (
                    s.params.paginationType === "custom" &&
                    s.params.paginationCustomRender
                ) {
                    s.paginationContainer.html(
                        s.params.paginationCustomRender(s, current + 1, total)
                    );
                    s.emit("onPaginationRendered", s, s.paginationContainer[0]);
                }
            }
            if (!s.params.loop) {
                if (
                    s.params.prevButton &&
                    s.prevButton &&
                    s.prevButton.length > 0
                ) {
                    if (s.isBeginning) {
                        s.prevButton.addClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.disable(s.prevButton);
                    } else {
                        s.prevButton.removeClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.enable(s.prevButton);
                    }
                }
                if (
                    s.params.nextButton &&
                    s.nextButton &&
                    s.nextButton.length > 0
                ) {
                    if (s.isEnd) {
                        s.nextButton.addClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.disable(s.nextButton);
                    } else {
                        s.nextButton.removeClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y)
                            s.a11y.enable(s.nextButton);
                    }
                }
            }
        };
        s.updatePagination = function () {
            if (!s.params.pagination) return;
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var paginationHTML = "";
                if (s.params.paginationType === "bullets") {
                    var numberOfBullets = s.params.loop
                        ? Math.ceil(
                              (s.slides.length - s.loopedSlides * 2) /
                                  s.params.slidesPerGroup
                          )
                        : s.snapGrid.length;
                    for (var i = 0; i < numberOfBullets; i++) {
                        if (s.params.paginationBulletRender) {
                            paginationHTML += s.params.paginationBulletRender(
                                s,
                                i,
                                s.params.bulletClass
                            );
                        } else {
                            paginationHTML +=
                                "<" +
                                s.params.paginationElement +
                                ' class="' +
                                s.params.bulletClass +
                                '"></' +
                                s.params.paginationElement +
                                ">";
                        }
                    }
                    s.paginationContainer.html(paginationHTML);
                    s.bullets = s.paginationContainer.find(
                        "." + s.params.bulletClass
                    );
                    if (
                        s.params.paginationClickable &&
                        s.params.a11y &&
                        s.a11y
                    ) {
                        s.a11y.initPagination();
                    }
                }
                if (s.params.paginationType === "fraction") {
                    if (s.params.paginationFractionRender) {
                        paginationHTML = s.params.paginationFractionRender(
                            s,
                            s.params.paginationCurrentClass,
                            s.params.paginationTotalClass
                        );
                    } else {
                        paginationHTML =
                            '<span class="' +
                            s.params.paginationCurrentClass +
                            '"></span>' +
                            " / " +
                            '<span class="' +
                            s.params.paginationTotalClass +
                            '"></span>';
                    }
                    s.paginationContainer.html(paginationHTML);
                }
                if (s.params.paginationType === "progress") {
                    if (s.params.paginationProgressRender) {
                        paginationHTML = s.params.paginationProgressRender(
                            s,
                            s.params.paginationProgressbarClass
                        );
                    } else {
                        paginationHTML =
                            '<span class="' +
                            s.params.paginationProgressbarClass +
                            '"></span>';
                    }
                    s.paginationContainer.html(paginationHTML);
                }
                if (s.params.paginationType !== "custom") {
                    s.emit("onPaginationRendered", s, s.paginationContainer[0]);
                }
            }
        };
        s.update = function (updateTranslate) {
            if (!s) return;
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            var newTranslate;
            function forceSetTranslate() {
                var translate = s.rtl ? -s.translate : s.translate;
                newTranslate = Math.min(
                    Math.max(s.translate, s.maxTranslate()),
                    s.minTranslate()
                );
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated;
                if (s.controller && s.controller.spline) {
                    s.controller.spline = undefined;
                }
                if (s.params.freeMode) {
                    forceSetTranslate();
                    if (s.params.autoHeight) {
                        s.updateAutoHeight();
                    }
                } else {
                    if (
                        (s.params.slidesPerView === "auto" ||
                            s.params.slidesPerView > 1) &&
                        s.isEnd &&
                        !s.params.centeredSlides
                    ) {
                        translated = s.slideTo(s.slides.length - 1, 0, !1, !0);
                    } else {
                        translated = s.slideTo(s.activeIndex, 0, !1, !0);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }
            } else if (s.params.autoHeight) {
                s.updateAutoHeight();
            }
        };
        s.onResize = function (forceUpdatePagination) {
            if (s.params.onBeforeResize) s.params.onBeforeResize(s);
            if (s.params.breakpoints) {
                s.setBreakpoint();
            }
            var allowSwipeToPrev = s.params.allowSwipeToPrev;
            var allowSwipeToNext = s.params.allowSwipeToNext;
            s.params.allowSwipeToPrev = s.params.allowSwipeToNext = !0;
            s.updateContainerSize();
            s.updateSlidesSize();
            if (
                s.params.slidesPerView === "auto" ||
                s.params.freeMode ||
                forceUpdatePagination
            )
                s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.controller && s.controller.spline) {
                s.controller.spline = undefined;
            }
            var slideChangedBySlideTo = !1;
            if (s.params.freeMode) {
                var newTranslate = Math.min(
                    Math.max(s.translate, s.maxTranslate()),
                    s.minTranslate()
                );
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
                if (s.params.autoHeight) {
                    s.updateAutoHeight();
                }
            } else {
                s.updateClasses();
                if (
                    (s.params.slidesPerView === "auto" ||
                        s.params.slidesPerView > 1) &&
                    s.isEnd &&
                    !s.params.centeredSlides
                ) {
                    slideChangedBySlideTo = s.slideTo(
                        s.slides.length - 1,
                        0,
                        !1,
                        !0
                    );
                } else {
                    slideChangedBySlideTo = s.slideTo(s.activeIndex, 0, !1, !0);
                }
            }
            if (s.params.lazyLoading && !slideChangedBySlideTo && s.lazy) {
                s.lazy.load();
            }
            s.params.allowSwipeToPrev = allowSwipeToPrev;
            s.params.allowSwipeToNext = allowSwipeToNext;
            if (s.params.onAfterResize) s.params.onAfterResize(s);
        };
        s.touchEventsDesktop = {
            start: "mousedown",
            move: "mousemove",
            end: "mouseup",
        };
        if (window.navigator.pointerEnabled)
            s.touchEventsDesktop = {
                start: "pointerdown",
                move: "pointermove",
                end: "pointerup",
            };
        else if (window.navigator.msPointerEnabled)
            s.touchEventsDesktop = {
                start: "MSPointerDown",
                move: "MSPointerMove",
                end: "MSPointerUp",
            };
        s.touchEvents = {
            start:
                s.support.touch || !s.params.simulateTouch
                    ? "touchstart"
                    : s.touchEventsDesktop.start,
            move:
                s.support.touch || !s.params.simulateTouch
                    ? "touchmove"
                    : s.touchEventsDesktop.move,
            end:
                s.support.touch || !s.params.simulateTouch
                    ? "touchend"
                    : s.touchEventsDesktop.end,
        };
        if (
            window.navigator.pointerEnabled ||
            window.navigator.msPointerEnabled
        ) {
            (s.params.touchEventsTarget === "container"
                ? s.container
                : s.wrapper
            ).addClass("swiper-wp8-" + s.params.direction);
        }
        s.initEvents = function (detach) {
            var actionDom = detach ? "off" : "on";
            var action = detach ? "removeEventListener" : "addEventListener";
            var touchEventsTarget =
                s.params.touchEventsTarget === "container"
                    ? s.container[0]
                    : s.wrapper[0];
            var target = s.support.touch ? touchEventsTarget : document;
            var moveCapture = s.params.nested ? !0 : !1;
            if (s.browser.ie) {
                touchEventsTarget[action](
                    s.touchEvents.start,
                    s.onTouchStart,
                    !1
                );
                target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                target[action](s.touchEvents.end, s.onTouchEnd, !1);
            } else {
                if (s.support.touch) {
                    var passiveListener =
                        s.touchEvents.start === "touchstart" &&
                        s.support.passiveListener &&
                        s.params.passiveListeners
                            ? { passive: !0, capture: !1 }
                            : !1;
                    touchEventsTarget[action](
                        s.touchEvents.start,
                        s.onTouchStart,
                        passiveListener
                    );
                    touchEventsTarget[action](
                        s.touchEvents.move,
                        s.onTouchMove,
                        moveCapture
                    );
                    touchEventsTarget[action](
                        s.touchEvents.end,
                        s.onTouchEnd,
                        passiveListener
                    );
                }
                if (
                    (params.simulateTouch &&
                        !s.device.ios &&
                        !s.device.android) ||
                    (params.simulateTouch && !s.support.touch && s.device.ios)
                ) {
                    touchEventsTarget[action]("mousedown", s.onTouchStart, !1);
                    document[action]("mousemove", s.onTouchMove, moveCapture);
                    document[action]("mouseup", s.onTouchEnd, !1);
                }
            }
            window[action]("resize", s.onResize);
            if (
                s.params.nextButton &&
                s.nextButton &&
                s.nextButton.length > 0
            ) {
                s.nextButton[actionDom]("click", s.onClickNext);
                if (s.params.a11y && s.a11y)
                    s.nextButton[actionDom]("keydown", s.a11y.onEnterKey);
            }
            if (
                s.params.prevButton &&
                s.prevButton &&
                s.prevButton.length > 0
            ) {
                s.prevButton[actionDom]("click", s.onClickPrev);
                if (s.params.a11y && s.a11y)
                    s.prevButton[actionDom]("keydown", s.a11y.onEnterKey);
            }
            if (s.params.pagination && s.params.paginationClickable) {
                s.paginationContainer[actionDom](
                    "click",
                    "." + s.params.bulletClass,
                    s.onClickIndex
                );
                if (s.params.a11y && s.a11y)
                    s.paginationContainer[actionDom](
                        "keydown",
                        "." + s.params.bulletClass,
                        s.a11y.onEnterKey
                    );
            }
            if (s.params.preventClicks || s.params.preventClicksPropagation)
                touchEventsTarget[action]("click", s.preventClicks, !0);
        };
        s.attachEvents = function () {
            s.initEvents();
        };
        s.detachEvents = function () {
            s.initEvents(!0);
        };
        s.allowClick = !0;
        s.preventClicks = function (e) {
            if (!s.allowClick) {
                if (s.params.preventClicks) e.preventDefault();
                if (s.params.preventClicksPropagation && s.animating) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        };
        s.onClickNext = function (e) {
            e.preventDefault();
            if (s.isEnd && !s.params.loop) return;
            s.slideNext();
        };
        s.onClickPrev = function (e) {
            e.preventDefault();
            if (s.isBeginning && !s.params.loop) return;
            s.slidePrev();
        };
        s.onClickIndex = function (e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop) index = index + s.loopedSlides;
            s.slideTo(index);
        };
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === "string") {
                    el = el.parents(selector);
                } else if (selector.nodeType) {
                    var found;
                    el.parents().each(function (index, _el) {
                        if (_el === selector) found = selector;
                    });
                    if (!found) return undefined;
                    else return selector;
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function (e) {
            var slide = findElementInEvent(e, "." + s.params.slideClass);
            var slideFound = !1;
            if (slide) {
                for (var i = 0; i < s.slides.length; i++) {
                    if (s.slides[i] === slide) slideFound = !0;
                }
            }
            if (slide && slideFound) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            } else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (
                s.params.slideToClickedSlide &&
                s.clickedIndex !== undefined &&
                s.clickedIndex !== s.activeIndex
            ) {
                var slideToIndex = s.clickedIndex,
                    realIndex,
                    duplicatedSlides,
                    slidesPerView =
                        s.params.slidesPerView === "auto"
                            ? s.currentSlidesPerView()
                            : s.params.slidesPerView;
                if (s.params.loop) {
                    if (s.animating) return;
                    realIndex = parseInt(
                        $(s.clickedSlide).attr("data-swiper-slide-index"),
                        10
                    );
                    if (s.params.centeredSlides) {
                        if (
                            slideToIndex < s.loopedSlides - slidesPerView / 2 ||
                            slideToIndex >
                                s.slides.length -
                                    s.loopedSlides +
                                    slidesPerView / 2
                        ) {
                            s.fixLoop();
                            slideToIndex = s.wrapper
                                .children(
                                    "." +
                                        s.params.slideClass +
                                        '[data-swiper-slide-index="' +
                                        realIndex +
                                        '"]:not(.' +
                                        s.params.slideDuplicateClass +
                                        ")"
                                )
                                .eq(0)
                                .index();
                            setTimeout(function () {
                                s.slideTo(slideToIndex);
                            }, 0);
                        } else {
                            s.slideTo(slideToIndex);
                        }
                    } else {
                        if (slideToIndex > s.slides.length - slidesPerView) {
                            s.fixLoop();
                            slideToIndex = s.wrapper
                                .children(
                                    "." +
                                        s.params.slideClass +
                                        '[data-swiper-slide-index="' +
                                        realIndex +
                                        '"]:not(.' +
                                        s.params.slideDuplicateClass +
                                        ")"
                                )
                                .eq(0)
                                .index();
                            setTimeout(function () {
                                s.slideTo(slideToIndex);
                            }, 0);
                        } else {
                            s.slideTo(slideToIndex);
                        }
                    }
                } else {
                    s.slideTo(slideToIndex);
                }
            }
        };
        var isTouched,
            isMoved,
            allowTouchCallbacks,
            touchStartTime,
            isScrolling,
            currentTranslate,
            startTranslate,
            allowThresholdMove,
            formElements = "input, select, textarea, button, video",
            lastClickTime = Date.now(),
            clickTimeout,
            velocities = [],
            allowMomentumBounce;
        s.animating = !1;
        s.touches = { startX: 0, startY: 0, currentX: 0, currentY: 0, diff: 0 };
        var isTouchEvent, startMoving;
        s.onTouchStart = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            isTouchEvent = e.type === "touchstart";
            if (!isTouchEvent && "which" in e && e.which === 3) return;
            if (
                s.params.noSwiping &&
                findElementInEvent(e, "." + s.params.noSwipingClass)
            ) {
                s.allowClick = !0;
                return;
            }
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler)) return;
            }
            var startX = (s.touches.currentX =
                e.type === "touchstart" ? e.targetTouches[0].pageX : e.pageX);
            var startY = (s.touches.currentY =
                e.type === "touchstart" ? e.targetTouches[0].pageY : e.pageY);
            if (
                s.device.ios &&
                s.params.iOSEdgeSwipeDetection &&
                startX <= s.params.iOSEdgeSwipeThreshold
            ) {
                return;
            }
            isTouched = !0;
            isMoved = !1;
            allowTouchCallbacks = !0;
            isScrolling = undefined;
            startMoving = undefined;
            s.touches.startX = startX;
            s.touches.startY = startY;
            touchStartTime = Date.now();
            s.allowClick = !0;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            if (s.params.threshold > 0) allowThresholdMove = !1;
            if (e.type !== "touchstart") {
                var preventDefault = !0;
                if ($(e.target).is(formElements)) preventDefault = !1;
                if (
                    document.activeElement &&
                    $(document.activeElement).is(formElements)
                ) {
                    document.activeElement.blur();
                }
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            s.emit("onTouchStart", s, e);
        };
        s.onTouchMove = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (isTouchEvent && e.type === "mousemove") return;
            if (e.preventedByNestedSwiper) {
                s.touches.startX =
                    e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
                s.touches.startY =
                    e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
                return;
            }
            if (s.params.onlyExternal) {
                s.allowClick = !1;
                if (isTouched) {
                    s.touches.startX = s.touches.currentX =
                        e.type === "touchmove"
                            ? e.targetTouches[0].pageX
                            : e.pageX;
                    s.touches.startY = s.touches.currentY =
                        e.type === "touchmove"
                            ? e.targetTouches[0].pageY
                            : e.pageY;
                    touchStartTime = Date.now();
                }
                return;
            }
            if (
                isTouchEvent &&
                s.params.touchReleaseOnEdges &&
                !s.params.loop
            ) {
                if (!s.isHorizontal()) {
                    if (
                        (s.touches.currentY < s.touches.startY &&
                            s.translate <= s.maxTranslate()) ||
                        (s.touches.currentY > s.touches.startY &&
                            s.translate >= s.minTranslate())
                    ) {
                        return;
                    }
                } else {
                    if (
                        (s.touches.currentX < s.touches.startX &&
                            s.translate <= s.maxTranslate()) ||
                        (s.touches.currentX > s.touches.startX &&
                            s.translate >= s.minTranslate())
                    ) {
                        return;
                    }
                }
            }
            if (isTouchEvent && document.activeElement) {
                if (
                    e.target === document.activeElement &&
                    $(e.target).is(formElements)
                ) {
                    isMoved = !0;
                    s.allowClick = !1;
                    return;
                }
            }
            if (allowTouchCallbacks) {
                s.emit("onTouchMove", s, e);
            }
            if (e.targetTouches && e.targetTouches.length > 1) return;
            s.touches.currentX =
                e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
            s.touches.currentY =
                e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
            if (typeof isScrolling === "undefined") {
                var touchAngle;
                if (
                    (s.isHorizontal() &&
                        s.touches.currentY === s.touches.startY) ||
                    (!s.isHorizontal() &&
                        s.touches.currentX === s.touches.startX)
                ) {
                    isScrolling = !1;
                } else {
                    touchAngle =
                        (Math.atan2(
                            Math.abs(s.touches.currentY - s.touches.startY),
                            Math.abs(s.touches.currentX - s.touches.startX)
                        ) *
                            180) /
                        Math.PI;
                    isScrolling = s.isHorizontal()
                        ? touchAngle > s.params.touchAngle
                        : 90 - touchAngle > s.params.touchAngle;
                }
            }
            if (isScrolling) {
                s.emit("onTouchMoveOpposite", s, e);
            }
            if (typeof startMoving === "undefined") {
                if (
                    s.touches.currentX !== s.touches.startX ||
                    s.touches.currentY !== s.touches.startY
                ) {
                    startMoving = !0;
                }
            }
            if (!isTouched) return;
            if (isScrolling) {
                isTouched = !1;
                return;
            }
            if (!startMoving) {
                return;
            }
            s.allowClick = !1;
            s.emit("onSliderMove", s, e);
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }
            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger(
                        "webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"
                    );
                }
                if (s.params.autoplay && s.autoplaying) {
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    } else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = !1;
                if (
                    s.params.grabCursor &&
                    (s.params.allowSwipeToNext === !0 ||
                        s.params.allowSwipeToPrev === !0)
                ) {
                    s.setGrabCursor(!0);
                }
            }
            isMoved = !0;
            var diff = (s.touches.diff = s.isHorizontal()
                ? s.touches.currentX - s.touches.startX
                : s.touches.currentY - s.touches.startY);
            diff = diff * s.params.touchRatio;
            if (s.rtl) diff = -diff;
            s.swipeDirection = diff > 0 ? "prev" : "next";
            currentTranslate = diff + startTranslate;
            var disableParentSwiper = !0;
            if (diff > 0 && currentTranslate > s.minTranslate()) {
                disableParentSwiper = !1;
                if (s.params.resistance)
                    currentTranslate =
                        s.minTranslate() -
                        1 +
                        Math.pow(
                            -s.minTranslate() + startTranslate + diff,
                            s.params.resistanceRatio
                        );
            } else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = !1;
                if (s.params.resistance)
                    currentTranslate =
                        s.maxTranslate() +
                        1 -
                        Math.pow(
                            s.maxTranslate() - startTranslate - diff,
                            s.params.resistanceRatio
                        );
            }
            if (disableParentSwiper) {
                e.preventedByNestedSwiper = !0;
            }
            if (
                !s.params.allowSwipeToNext &&
                s.swipeDirection === "next" &&
                currentTranslate < startTranslate
            ) {
                currentTranslate = startTranslate;
            }
            if (
                !s.params.allowSwipeToPrev &&
                s.swipeDirection === "prev" &&
                currentTranslate > startTranslate
            ) {
                currentTranslate = startTranslate;
            }
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = !0;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = s.isHorizontal()
                            ? s.touches.currentX - s.touches.startX
                            : s.touches.currentY - s.touches.startY;
                        return;
                    }
                } else {
                    currentTranslate = startTranslate;
                    return;
                }
            }
            if (!s.params.followFinger) return;
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                if (velocities.length === 0) {
                    velocities.push({
                        position:
                            s.touches[s.isHorizontal() ? "startX" : "startY"],
                        time: touchStartTime,
                    });
                }
                velocities.push({
                    position:
                        s.touches[s.isHorizontal() ? "currentX" : "currentY"],
                    time: new window.Date().getTime(),
                });
            }
            s.updateProgress(currentTranslate);
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (allowTouchCallbacks) {
                s.emit("onTouchEnd", s, e);
            }
            allowTouchCallbacks = !1;
            if (!isTouched) return;
            if (
                s.params.grabCursor &&
                isMoved &&
                isTouched &&
                (s.params.allowSwipeToNext === !0 ||
                    s.params.allowSwipeToPrev === !0)
            ) {
                s.setGrabCursor(!1);
            }
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;
            if (s.allowClick) {
                s.updateClickedSlide(e);
                s.emit("onTap", s, e);
                if (timeDiff < 300 && touchEndTime - lastClickTime > 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if (!s) return;
                        if (
                            s.params.paginationHide &&
                            s.paginationContainer.length > 0 &&
                            !$(e.target).hasClass(s.params.bulletClass)
                        ) {
                            s.paginationContainer.toggleClass(
                                s.params.paginationHiddenClass
                            );
                        }
                        s.emit("onClick", s, e);
                    }, 300);
                }
                if (timeDiff < 300 && touchEndTime - lastClickTime < 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    s.emit("onDoubleTap", s, e);
                }
            }
            lastClickTime = Date.now();
            setTimeout(function () {
                if (s) s.allowClick = !0;
            }, 0);
            if (
                !isTouched ||
                !isMoved ||
                !s.swipeDirection ||
                s.touches.diff === 0 ||
                currentTranslate === startTranslate
            ) {
                isTouched = isMoved = !1;
                return;
            }
            isTouched = isMoved = !1;
            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            } else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                } else if (currentPos > -s.maxTranslate()) {
                    if (s.slides.length < s.snapGrid.length) {
                        s.slideTo(s.snapGrid.length - 1);
                    } else {
                        s.slideTo(s.slides.length - 1);
                    }
                    return;
                }
                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(),
                            velocityEvent = velocities.pop();
                        var distance =
                            lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (
                            Math.abs(s.velocity) <
                            s.params.freeModeMinimumVelocity
                        ) {
                            s.velocity = 0;
                        }
                        if (
                            time > 150 ||
                            new window.Date().getTime() - lastMoveEvent.time >
                                300
                        ) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }
                    s.velocity =
                        s.velocity * s.params.freeModeMomentumVelocityRatio;
                    velocities.length = 0;
                    var momentumDuration =
                        1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;
                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl) newPosition = -newPosition;
                    var doBounce = !1;
                    var afterBouncePosition;
                    var bounceAmount =
                        Math.abs(s.velocity) *
                        20 *
                        s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (
                                newPosition + s.maxTranslate() <
                                -bounceAmount
                            ) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = !0;
                            allowMomentumBounce = !0;
                        } else {
                            newPosition = s.maxTranslate();
                        }
                    } else if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = !0;
                            allowMomentumBounce = !0;
                        } else {
                            newPosition = s.minTranslate();
                        }
                    } else if (s.params.freeModeSticky) {
                        var j = 0,
                            nextSlide;
                        for (j = 0; j < s.snapGrid.length; j += 1) {
                            if (s.snapGrid[j] > -newPosition) {
                                nextSlide = j;
                                break;
                            }
                        }
                        if (
                            Math.abs(s.snapGrid[nextSlide] - newPosition) <
                                Math.abs(
                                    s.snapGrid[nextSlide - 1] - newPosition
                                ) ||
                            s.swipeDirection === "next"
                        ) {
                            newPosition = s.snapGrid[nextSlide];
                        } else {
                            newPosition = s.snapGrid[nextSlide - 1];
                        }
                        if (!s.rtl) newPosition = -newPosition;
                    }
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs(
                                (-newPosition - s.translate) / s.velocity
                            );
                        } else {
                            momentumDuration = Math.abs(
                                (newPosition - s.translate) / s.velocity
                            );
                        }
                    } else if (s.params.freeModeSticky) {
                        s.slideReset();
                        return;
                    }
                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = !0;
                        s.wrapper.transitionEnd(function () {
                            if (!s || !allowMomentumBounce) return;
                            s.emit("onMomentumBounce", s);
                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function () {
                                if (!s) return;
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = !0;
                            s.wrapper.transitionEnd(function () {
                                if (!s) return;
                                s.onTransitionEnd();
                            });
                        }
                    } else {
                        s.updateProgress(newPosition);
                    }
                    s.updateActiveIndex();
                }
                if (
                    !s.params.freeModeMomentum ||
                    timeDiff >= s.params.longSwipesMs
                ) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }
            var i,
                stopIndex = 0,
                groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (
                    typeof s.slidesGrid[i + s.params.slidesPerGroup] !==
                    "undefined"
                ) {
                    if (
                        currentPos >= s.slidesGrid[i] &&
                        currentPos < s.slidesGrid[i + s.params.slidesPerGroup]
                    ) {
                        stopIndex = i;
                        groupSize =
                            s.slidesGrid[i + s.params.slidesPerGroup] -
                            s.slidesGrid[i];
                    }
                } else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize =
                            s.slidesGrid[s.slidesGrid.length - 1] -
                            s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
            if (timeDiff > s.params.longSwipesMs) {
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === "next") {
                    if (ratio >= s.params.longSwipesRatio)
                        s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
                if (s.swipeDirection === "prev") {
                    if (ratio > 1 - s.params.longSwipesRatio)
                        s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
            } else {
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === "next") {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);
                }
                if (s.swipeDirection === "prev") {
                    s.slideTo(stopIndex);
                }
            }
        };
        s._slideTo = function (slideIndex, speed) {
            return s.slideTo(slideIndex, speed, !0, !0);
        };
        s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === "undefined") runCallbacks = !0;
            if (typeof slideIndex === "undefined") slideIndex = 0;
            if (slideIndex < 0) slideIndex = 0;
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length)
                s.snapIndex = s.snapGrid.length - 1;
            var translate = -s.snapGrid[s.snapIndex];
            if (s.params.autoplay && s.autoplaying) {
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    s.pauseAutoplay(speed);
                } else {
                    s.stopAutoplay();
                }
            }
            s.updateProgress(translate);
            if (s.params.normalizeSlideIndex) {
                for (var i = 0; i < s.slidesGrid.length; i++) {
                    if (
                        -Math.floor(translate * 100) >=
                        Math.floor(s.slidesGrid[i] * 100)
                    ) {
                        slideIndex = i;
                    }
                }
            }
            if (
                !s.params.allowSwipeToNext &&
                translate < s.translate &&
                translate < s.minTranslate()
            ) {
                return !1;
            }
            if (
                !s.params.allowSwipeToPrev &&
                translate > s.translate &&
                translate > s.maxTranslate()
            ) {
                if ((s.activeIndex || 0) !== slideIndex) return !1;
            }
            if (typeof speed === "undefined") speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;
            s.updateRealIndex();
            if (
                (s.rtl && -translate === s.translate) ||
                (!s.rtl && translate === s.translate)
            ) {
                if (s.params.autoHeight) {
                    s.updateAutoHeight();
                }
                s.updateClasses();
                if (s.params.effect !== "slide") {
                    s.setWrapperTranslate(translate);
                }
                return !1;
            }
            s.updateClasses();
            s.onTransitionStart(runCallbacks);
            if (speed === 0 || s.browser.lteIE9) {
                s.setWrapperTranslate(translate);
                s.setWrapperTransition(0);
                s.onTransitionEnd(runCallbacks);
            } else {
                s.setWrapperTranslate(translate);
                s.setWrapperTransition(speed);
                if (!s.animating) {
                    s.animating = !0;
                    s.wrapper.transitionEnd(function () {
                        if (!s) return;
                        s.onTransitionEnd(runCallbacks);
                    });
                }
            }
            return !0;
        };
        s.onTransitionStart = function (runCallbacks) {
            if (typeof runCallbacks === "undefined") runCallbacks = !0;
            if (s.params.autoHeight) {
                s.updateAutoHeight();
            }
            if (s.lazy) s.lazy.onTransitionStart();
            if (runCallbacks) {
                s.emit("onTransitionStart", s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit("onSlideChangeStart", s);
                    if (s.activeIndex > s.previousIndex) {
                        s.emit("onSlideNextStart", s);
                    } else {
                        s.emit("onSlidePrevStart", s);
                    }
                }
            }
        };
        s.onTransitionEnd = function (runCallbacks) {
            s.animating = !1;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === "undefined") runCallbacks = !0;
            if (s.lazy) s.lazy.onTransitionEnd();
            if (runCallbacks) {
                s.emit("onTransitionEnd", s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit("onSlideChangeEnd", s);
                    if (s.activeIndex > s.previousIndex) {
                        s.emit("onSlideNextEnd", s);
                    } else {
                        s.emit("onSlidePrevEnd", s);
                    }
                }
            }
            if (s.params.history && s.history) {
                s.history.setHistory(s.params.history, s.activeIndex);
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }
        };
        s.slideNext = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return !1;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(
                    s.activeIndex + s.params.slidesPerGroup,
                    speed,
                    runCallbacks,
                    internal
                );
            } else
                return s.slideTo(
                    s.activeIndex + s.params.slidesPerGroup,
                    speed,
                    runCallbacks,
                    internal
                );
        };
        s._slideNext = function (speed) {
            return s.slideNext(!0, speed, !0);
        };
        s.slidePrev = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return !1;
                s.fixLoop();
                var clientLeft = s.container[0].clientLeft;
                return s.slideTo(
                    s.activeIndex - 1,
                    speed,
                    runCallbacks,
                    internal
                );
            } else
                return s.slideTo(
                    s.activeIndex - 1,
                    speed,
                    runCallbacks,
                    internal
                );
        };
        s._slidePrev = function (speed) {
            return s.slidePrev(!0, speed, !0);
        };
        s.slideReset = function (runCallbacks, speed, internal) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };
        s.disableTouchControl = function () {
            s.params.onlyExternal = !0;
            return !0;
        };
        s.enableTouchControl = function () {
            s.params.onlyExternal = !1;
            return !0;
        };
        s.setWrapperTransition = function (duration, byController) {
            s.wrapper.transition(duration);
            if (s.params.effect !== "slide" && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTransition(duration);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            if (s.params.control && s.controller) {
                s.controller.setTransition(duration, byController);
            }
            s.emit("onSetTransition", s, duration);
        };
        s.setWrapperTranslate = function (
            translate,
            updateActiveIndex,
            byController
        ) {
            var x = 0,
                y = 0,
                z = 0;
            if (s.isHorizontal()) {
                x = s.rtl ? -translate : translate;
            } else {
                y = translate;
            }
            if (s.params.roundLengths) {
                x = round(x);
                y = round(y);
            }
            if (!s.params.virtualTranslate) {
                if (s.support.transforms3d)
                    s.wrapper.transform(
                        "translate3d(" + x + "px, " + y + "px, " + z + "px)"
                    );
                else s.wrapper.transform("translate(" + x + "px, " + y + "px)");
            }
            s.translate = s.isHorizontal() ? x : y;
            var progress;
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                progress = 0;
            } else {
                progress = (translate - s.minTranslate()) / translatesDiff;
            }
            if (progress !== s.progress) {
                s.updateProgress(translate);
            }
            if (updateActiveIndex) s.updateActiveIndex();
            if (s.params.effect !== "slide" && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTranslate(s.translate);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }
            if (s.params.control && s.controller) {
                s.controller.setTranslate(s.translate, byController);
            }
            s.emit("onSetTranslate", s, s.translate);
        };
        s.getTranslate = function (el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;
            if (typeof axis === "undefined") {
                axis = "x";
            }
            if (s.params.virtualTranslate) {
                return s.rtl ? -s.translate : s.translate;
            }
            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                curTransform = curStyle.transform || curStyle.webkitTransform;
                if (curTransform.split(",").length > 6) {
                    curTransform = curTransform
                        .split(", ")
                        .map(function (a) {
                            return a.replace(",", ".");
                        })
                        .join(", ");
                }
                transformMatrix = new window.WebKitCSSMatrix(
                    curTransform === "none" ? "" : curTransform
                );
            } else {
                transformMatrix =
                    curStyle.MozTransform ||
                    curStyle.OTransform ||
                    curStyle.MsTransform ||
                    curStyle.msTransform ||
                    curStyle.transform ||
                    curStyle
                        .getPropertyValue("transform")
                        .replace("translate(", "matrix(1, 0, 0, 1,");
                matrix = transformMatrix.toString().split(",");
            }
            if (axis === "x") {
                if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                else curTransform = parseFloat(matrix[4]);
            }
            if (axis === "y") {
                if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                else curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform) curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function (axis) {
            if (typeof axis === "undefined") {
                axis = s.isHorizontal() ? "x" : "y";
            }
            return s.getTranslate(s.wrapper[0], axis);
        };
        s.observers = [];
        function initObserver(target, options) {
            options = options || {};
            var ObserverFunc =
                window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function (mutations) {
                mutations.forEach(function (mutation) {
                    s.onResize(!0);
                    s.emit("onObserverUpdate", s, mutation);
                });
            });
            observer.observe(target, {
                attributes:
                    typeof options.attributes === "undefined"
                        ? !0
                        : options.attributes,
                childList:
                    typeof options.childList === "undefined"
                        ? !0
                        : options.childList,
                characterData:
                    typeof options.characterData === "undefined"
                        ? !0
                        : options.characterData,
            });
            s.observers.push(observer);
        }
        s.initObservers = function () {
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }
            initObserver(s.container[0], { childList: !1 });
            initObserver(s.wrapper[0], { attributes: !1 });
        };
        s.disconnectObservers = function () {
            for (var i = 0; i < s.observers.length; i++) {
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        s.createLoop = function () {
            s.wrapper
                .children(
                    "." +
                        s.params.slideClass +
                        "." +
                        s.params.slideDuplicateClass
                )
                .remove();
            var slides = s.wrapper.children("." + s.params.slideClass);
            if (s.params.slidesPerView === "auto" && !s.params.loopedSlides)
                s.params.loopedSlides = slides.length;
            s.loopedSlides = parseInt(
                s.params.loopedSlides || s.params.slidesPerView,
                10
            );
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }
            var prependSlides = [],
                appendSlides = [],
                i;
            slides.each(function (index, el) {
                var slide = $(this);
                if (index < s.loopedSlides) appendSlides.push(el);
                if (
                    index < slides.length &&
                    index >= slides.length - s.loopedSlides
                )
                    prependSlides.push(el);
                slide.attr("data-swiper-slide-index", index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.append(
                    $(appendSlides[i].cloneNode(!0)).addClass(
                        s.params.slideDuplicateClass
                    )
                );
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend(
                    $(prependSlides[i].cloneNode(!0)).addClass(
                        s.params.slideDuplicateClass
                    )
                );
            }
        };
        s.destroyLoop = function () {
            s.wrapper
                .children(
                    "." +
                        s.params.slideClass +
                        "." +
                        s.params.slideDuplicateClass
                )
                .remove();
            s.slides.removeAttr("data-swiper-slide-index");
        };
        s.reLoop = function (updatePosition) {
            var oldIndex = s.activeIndex - s.loopedSlides;
            s.destroyLoop();
            s.createLoop();
            s.updateSlidesSize();
            if (updatePosition) {
                s.slideTo(oldIndex + s.loopedSlides, 0, !1);
            }
        };
        s.fixLoop = function () {
            var newIndex;
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, !1, !0);
            } else if (
                (s.params.slidesPerView === "auto" &&
                    s.activeIndex >= s.loopedSlides * 2) ||
                s.activeIndex > s.slides.length - s.params.slidesPerView * 2
            ) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, !1, !0);
            }
        };
        s.appendSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === "object" && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.append(slides[i]);
                }
            } else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(!0);
            }
        };
        s.prependSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === "object" && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            } else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(!0);
            }
            s.slideTo(newActiveIndex, 0, !1);
        };
        s.removeSlide = function (slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
                s.slides = s.wrapper.children("." + s.params.slideClass);
            }
            var newActiveIndex = s.activeIndex,
                indexToRemove;
            if (typeof slidesIndexes === "object" && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove])
                        s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex) newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            } else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove])
                    s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex) newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(!0);
            }
            if (s.params.loop) {
                s.slideTo(newActiveIndex + s.loopedSlides, 0, !1);
            } else {
                s.slideTo(newActiveIndex, 0, !1);
            }
        };
        s.removeAllSlides = function () {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };
        s.effects = {
            fade: {
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset;
                        if (!s.params.virtualTranslate) tx = tx - s.translate;
                        var ty = 0;
                        if (!s.isHorizontal()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade
                            ? Math.max(1 - Math.abs(slide[0].progress), 0)
                            : 1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        slide
                            .css({ opacity: slideOpacity })
                            .transform(
                                "translate3d(" + tx + "px, " + ty + "px, 0px)"
                            );
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration);
                    if (s.params.virtualTranslate && duration !== 0) {
                        var eventTriggered = !1;
                        s.slides.transitionEnd(function () {
                            if (eventTriggered) return;
                            if (!s) return;
                            eventTriggered = !0;
                            s.animating = !1;
                            var triggerEvents = [
                                "webkitTransitionEnd",
                                "transitionend",
                                "oTransitionEnd",
                                "MSTransitionEnd",
                                "msTransitionEnd",
                            ];
                            for (var i = 0; i < triggerEvents.length; i++) {
                                s.wrapper.trigger(triggerEvents[i]);
                            }
                        });
                    }
                },
            },
            flip: {
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var progress = slide[0].progress;
                        if (s.params.flip.limitRotation) {
                            progress = Math.max(
                                Math.min(slide[0].progress, 1),
                                -1
                            );
                        }
                        var offset = slide[0].swiperSlideOffset;
                        var rotate = -180 * progress,
                            rotateY = rotate,
                            rotateX = 0,
                            tx = -offset,
                            ty = 0;
                        if (!s.isHorizontal()) {
                            ty = tx;
                            tx = 0;
                            rotateX = -rotateY;
                            rotateY = 0;
                        } else if (s.rtl) {
                            rotateY = -rotateY;
                        }
                        slide[0].style.zIndex =
                            -Math.abs(Math.round(progress)) + s.slides.length;
                        if (s.params.flip.slideShadows) {
                            var shadowBefore = s.isHorizontal()
                                ? slide.find(".swiper-slide-shadow-left")
                                : slide.find(".swiper-slide-shadow-top");
                            var shadowAfter = s.isHorizontal()
                                ? slide.find(".swiper-slide-shadow-right")
                                : slide.find(".swiper-slide-shadow-bottom");
                            if (shadowBefore.length === 0) {
                                shadowBefore = $(
                                    '<div class="swiper-slide-shadow-' +
                                        (s.isHorizontal() ? "left" : "top") +
                                        '"></div>'
                                );
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $(
                                    '<div class="swiper-slide-shadow-' +
                                        (s.isHorizontal()
                                            ? "right"
                                            : "bottom") +
                                        '"></div>'
                                );
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length)
                                shadowBefore[0].style.opacity = Math.max(
                                    -progress,
                                    0
                                );
                            if (shadowAfter.length)
                                shadowAfter[0].style.opacity = Math.max(
                                    progress,
                                    0
                                );
                        }
                        slide.transform(
                            "translate3d(" +
                                tx +
                                "px, " +
                                ty +
                                "px, 0px) rotateX(" +
                                rotateX +
                                "deg) rotateY(" +
                                rotateY +
                                "deg)"
                        );
                    }
                },
                setTransition: function (duration) {
                    s.slides
                        .transition(duration)
                        .find(
                            ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                        )
                        .transition(duration);
                    if (s.params.virtualTranslate && duration !== 0) {
                        var eventTriggered = !1;
                        s.slides.eq(s.activeIndex).transitionEnd(function () {
                            if (eventTriggered) return;
                            if (!s) return;
                            if (!$(this).hasClass(s.params.slideActiveClass))
                                return;
                            eventTriggered = !0;
                            s.animating = !1;
                            var triggerEvents = [
                                "webkitTransitionEnd",
                                "transitionend",
                                "oTransitionEnd",
                                "MSTransitionEnd",
                                "msTransitionEnd",
                            ];
                            for (var i = 0; i < triggerEvents.length; i++) {
                                s.wrapper.trigger(triggerEvents[i]);
                            }
                        });
                    }
                },
            },
            cube: {
                setTranslate: function () {
                    var wrapperRotate = 0,
                        cubeShadow;
                    if (s.params.cube.shadow) {
                        if (s.isHorizontal()) {
                            cubeShadow = s.wrapper.find(".swiper-cube-shadow");
                            if (cubeShadow.length === 0) {
                                cubeShadow = $(
                                    '<div class="swiper-cube-shadow"></div>'
                                );
                                s.wrapper.append(cubeShadow);
                            }
                            cubeShadow.css({ height: s.width + "px" });
                        } else {
                            cubeShadow = s.container.find(
                                ".swiper-cube-shadow"
                            );
                            if (cubeShadow.length === 0) {
                                cubeShadow = $(
                                    '<div class="swiper-cube-shadow"></div>'
                                );
                                s.container.append(cubeShadow);
                            }
                        }
                    }
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var slideAngle = i * 90;
                        var round = Math.floor(slideAngle / 360);
                        if (s.rtl) {
                            slideAngle = -slideAngle;
                            round = Math.floor(-slideAngle / 360);
                        }
                        var progress = Math.max(
                            Math.min(slide[0].progress, 1),
                            -1
                        );
                        var tx = 0,
                            ty = 0,
                            tz = 0;
                        if (i % 4 === 0) {
                            tx = -round * 4 * s.size;
                            tz = 0;
                        } else if ((i - 1) % 4 === 0) {
                            tx = 0;
                            tz = -round * 4 * s.size;
                        } else if ((i - 2) % 4 === 0) {
                            tx = s.size + round * 4 * s.size;
                            tz = s.size;
                        } else if ((i - 3) % 4 === 0) {
                            tx = -s.size;
                            tz = 3 * s.size + s.size * 4 * round;
                        }
                        if (s.rtl) {
                            tx = -tx;
                        }
                        if (!s.isHorizontal()) {
                            ty = tx;
                            tx = 0;
                        }
                        var transform =
                            "rotateX(" +
                            (s.isHorizontal() ? 0 : -slideAngle) +
                            "deg) rotateY(" +
                            (s.isHorizontal() ? slideAngle : 0) +
                            "deg) translate3d(" +
                            tx +
                            "px, " +
                            ty +
                            "px, " +
                            tz +
                            "px)";
                        if (progress <= 1 && progress > -1) {
                            wrapperRotate = i * 90 + progress * 90;
                            if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
                        }
                        slide.transform(transform);
                        if (s.params.cube.slideShadows) {
                            var shadowBefore = s.isHorizontal()
                                ? slide.find(".swiper-slide-shadow-left")
                                : slide.find(".swiper-slide-shadow-top");
                            var shadowAfter = s.isHorizontal()
                                ? slide.find(".swiper-slide-shadow-right")
                                : slide.find(".swiper-slide-shadow-bottom");
                            if (shadowBefore.length === 0) {
                                shadowBefore = $(
                                    '<div class="swiper-slide-shadow-' +
                                        (s.isHorizontal() ? "left" : "top") +
                                        '"></div>'
                                );
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $(
                                    '<div class="swiper-slide-shadow-' +
                                        (s.isHorizontal()
                                            ? "right"
                                            : "bottom") +
                                        '"></div>'
                                );
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length)
                                shadowBefore[0].style.opacity = Math.max(
                                    -progress,
                                    0
                                );
                            if (shadowAfter.length)
                                shadowAfter[0].style.opacity = Math.max(
                                    progress,
                                    0
                                );
                        }
                    }
                    s.wrapper.css({
                        "-webkit-transform-origin":
                            "50% 50% -" + s.size / 2 + "px",
                        "-moz-transform-origin":
                            "50% 50% -" + s.size / 2 + "px",
                        "-ms-transform-origin": "50% 50% -" + s.size / 2 + "px",
                        "transform-origin": "50% 50% -" + s.size / 2 + "px",
                    });
                    if (s.params.cube.shadow) {
                        if (s.isHorizontal()) {
                            cubeShadow.transform(
                                "translate3d(0px, " +
                                    (s.width / 2 + s.params.cube.shadowOffset) +
                                    "px, " +
                                    -s.width / 2 +
                                    "px) rotateX(90deg) rotateZ(0deg) scale(" +
                                    s.params.cube.shadowScale +
                                    ")"
                            );
                        } else {
                            var shadowAngle =
                                Math.abs(wrapperRotate) -
                                Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                            var multiplier =
                                1.5 -
                                (Math.sin((shadowAngle * 2 * Math.PI) / 360) /
                                    2 +
                                    Math.cos(
                                        (shadowAngle * 2 * Math.PI) / 360
                                    ) /
                                        2);
                            var scale1 = s.params.cube.shadowScale,
                                scale2 = s.params.cube.shadowScale / multiplier,
                                offset = s.params.cube.shadowOffset;
                            cubeShadow.transform(
                                "scale3d(" +
                                    scale1 +
                                    ", 1, " +
                                    scale2 +
                                    ") translate3d(0px, " +
                                    (s.height / 2 + offset) +
                                    "px, " +
                                    -s.height / 2 / scale2 +
                                    "px) rotateX(-90deg)"
                            );
                        }
                    }
                    var zFactor = s.isSafari || s.isUiWebView ? -s.size / 2 : 0;
                    s.wrapper.transform(
                        "translate3d(0px,0," +
                            zFactor +
                            "px) rotateX(" +
                            (s.isHorizontal() ? 0 : wrapperRotate) +
                            "deg) rotateY(" +
                            (s.isHorizontal() ? -wrapperRotate : 0) +
                            "deg)"
                    );
                },
                setTransition: function (duration) {
                    s.slides
                        .transition(duration)
                        .find(
                            ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                        )
                        .transition(duration);
                    if (s.params.cube.shadow && !s.isHorizontal()) {
                        s.container
                            .find(".swiper-cube-shadow")
                            .transition(duration);
                    }
                },
            },
            coverflow: {
                setTranslate: function () {
                    var transform = s.translate;
                    var center = s.isHorizontal()
                        ? -transform + s.width / 2
                        : -transform + s.height / 2;
                    var rotate = s.isHorizontal()
                        ? s.params.coverflow.rotate
                        : -s.params.coverflow.rotate;
                    var translate = s.params.coverflow.depth;
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideSize = s.slidesSizesGrid[i];
                        var slideOffset = slide[0].swiperSlideOffset;
                        var offsetMultiplier =
                            ((center - slideOffset - slideSize / 2) /
                                slideSize) *
                            s.params.coverflow.modifier;
                        var rotateY = s.isHorizontal()
                            ? rotate * offsetMultiplier
                            : 0;
                        var rotateX = s.isHorizontal()
                            ? 0
                            : rotate * offsetMultiplier;
                        var translateZ =
                            -translate * Math.abs(offsetMultiplier);
                        var translateY = s.isHorizontal()
                            ? 0
                            : s.params.coverflow.stretch * offsetMultiplier;
                        var translateX = s.isHorizontal()
                            ? s.params.coverflow.stretch * offsetMultiplier
                            : 0;
                        if (Math.abs(translateX) < 0.001) translateX = 0;
                        if (Math.abs(translateY) < 0.001) translateY = 0;
                        if (Math.abs(translateZ) < 0.001) translateZ = 0;
                        if (Math.abs(rotateY) < 0.001) rotateY = 0;
                        if (Math.abs(rotateX) < 0.001) rotateX = 0;
                        var slideTransform =
                            "translate3d(" +
                            translateX +
                            "px," +
                            translateY +
                            "px," +
                            translateZ +
                            "px)  rotateX(" +
                            rotateX +
                            "deg) rotateY(" +
                            rotateY +
                            "deg)";
                        slide.transform(slideTransform);
                        slide[0].style.zIndex =
                            -Math.abs(Math.round(offsetMultiplier)) + 1;
                        if (s.params.coverflow.slideShadows) {
                            var shadowBefore = s.isHorizontal()
                                ? slide.find(".swiper-slide-shadow-left")
                                : slide.find(".swiper-slide-shadow-top");
                            var shadowAfter = s.isHorizontal()
                                ? slide.find(".swiper-slide-shadow-right")
                                : slide.find(".swiper-slide-shadow-bottom");
                            if (shadowBefore.length === 0) {
                                shadowBefore = $(
                                    '<div class="swiper-slide-shadow-' +
                                        (s.isHorizontal() ? "left" : "top") +
                                        '"></div>'
                                );
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $(
                                    '<div class="swiper-slide-shadow-' +
                                        (s.isHorizontal()
                                            ? "right"
                                            : "bottom") +
                                        '"></div>'
                                );
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length)
                                shadowBefore[0].style.opacity =
                                    offsetMultiplier > 0 ? offsetMultiplier : 0;
                            if (shadowAfter.length)
                                shadowAfter[0].style.opacity =
                                    -offsetMultiplier > 0
                                        ? -offsetMultiplier
                                        : 0;
                        }
                    }
                    if (s.browser.ie) {
                        var ws = s.wrapper[0].style;
                        ws.perspectiveOrigin = center + "px 50%";
                    }
                },
                setTransition: function (duration) {
                    s.slides
                        .transition(duration)
                        .find(
                            ".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
                        )
                        .transition(duration);
                },
            },
        };
        s.lazy = {
            initialImageLoaded: !1,
            loadImageInSlide: function (index, loadInDuplicate) {
                if (typeof index === "undefined") return;
                if (typeof loadInDuplicate === "undefined")
                    loadInDuplicate = !0;
                if (s.slides.length === 0) return;
                var slide = s.slides.eq(index);
                var img = slide.find(
                    "." +
                        s.params.lazyLoadingClass +
                        ":not(." +
                        s.params.lazyStatusLoadedClass +
                        "):not(." +
                        s.params.lazyStatusLoadingClass +
                        ")"
                );
                if (
                    slide.hasClass(s.params.lazyLoadingClass) &&
                    !slide.hasClass(s.params.lazyStatusLoadedClass) &&
                    !slide.hasClass(s.params.lazyStatusLoadingClass)
                ) {
                    img = img.add(slide[0]);
                }
                if (img.length === 0) return;
                img.each(function () {
                    var _img = $(this);
                    _img.addClass(s.params.lazyStatusLoadingClass);
                    var background = _img.attr("data-background");
                    var src = _img.attr("data-src"),
                        srcset = _img.attr("data-srcset"),
                        sizes = _img.attr("data-sizes");
                    s.loadImage(
                        _img[0],
                        src || background,
                        srcset,
                        sizes,
                        !1,
                        function () {
                            if (typeof s === "undefined" || s === null || !s)
                                return;
                            if (background) {
                                _img.css(
                                    "background-image",
                                    'url("' + background + '")'
                                );
                                _img.removeAttr("data-background");
                            } else {
                                if (srcset) {
                                    _img.attr("srcset", srcset);
                                    _img.removeAttr("data-srcset");
                                }
                                if (sizes) {
                                    _img.attr("sizes", sizes);
                                    _img.removeAttr("data-sizes");
                                }
                                if (src) {
                                    _img.attr("src", src);
                                    _img.removeAttr("data-src");
                                }
                            }
                            _img.addClass(
                                s.params.lazyStatusLoadedClass
                            ).removeClass(s.params.lazyStatusLoadingClass);
                            slide
                                .find(
                                    "." +
                                        s.params.lazyPreloaderClass +
                                        ", ." +
                                        s.params.preloaderClass
                                )
                                .remove();
                            if (s.params.loop && loadInDuplicate) {
                                var slideOriginalIndex = slide.attr(
                                    "data-swiper-slide-index"
                                );
                                if (
                                    slide.hasClass(s.params.slideDuplicateClass)
                                ) {
                                    var originalSlide = s.wrapper.children(
                                        '[data-swiper-slide-index="' +
                                            slideOriginalIndex +
                                            '"]:not(.' +
                                            s.params.slideDuplicateClass +
                                            ")"
                                    );
                                    s.lazy.loadImageInSlide(
                                        originalSlide.index(),
                                        !1
                                    );
                                } else {
                                    var duplicatedSlide = s.wrapper.children(
                                        "." +
                                            s.params.slideDuplicateClass +
                                            '[data-swiper-slide-index="' +
                                            slideOriginalIndex +
                                            '"]'
                                    );
                                    s.lazy.loadImageInSlide(
                                        duplicatedSlide.index(),
                                        !1
                                    );
                                }
                            }
                            s.emit("onLazyImageReady", s, slide[0], _img[0]);
                        }
                    );
                    s.emit("onLazyImageLoad", s, slide[0], _img[0]);
                });
            },
            load: function () {
                var i;
                var slidesPerView = s.params.slidesPerView;
                if (slidesPerView === "auto") {
                    slidesPerView = 0;
                }
                if (!s.lazy.initialImageLoaded) s.lazy.initialImageLoaded = !0;
                if (s.params.watchSlidesVisibility) {
                    s.wrapper
                        .children("." + s.params.slideVisibleClass)
                        .each(function () {
                            s.lazy.loadImageInSlide($(this).index());
                        });
                } else {
                    if (slidesPerView > 1) {
                        for (
                            i = s.activeIndex;
                            i < s.activeIndex + slidesPerView;
                            i++
                        ) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                    } else {
                        s.lazy.loadImageInSlide(s.activeIndex);
                    }
                }
                if (s.params.lazyLoadingInPrevNext) {
                    if (
                        slidesPerView > 1 ||
                        (s.params.lazyLoadingInPrevNextAmount &&
                            s.params.lazyLoadingInPrevNextAmount > 1)
                    ) {
                        var amount = s.params.lazyLoadingInPrevNextAmount;
                        var spv = slidesPerView;
                        var maxIndex = Math.min(
                            s.activeIndex + spv + Math.max(amount, spv),
                            s.slides.length
                        );
                        var minIndex = Math.max(
                            s.activeIndex - Math.max(spv, amount),
                            0
                        );
                        for (
                            i = s.activeIndex + slidesPerView;
                            i < maxIndex;
                            i++
                        ) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                        for (i = minIndex; i < s.activeIndex; i++) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                    } else {
                        var nextSlide = s.wrapper.children(
                            "." + s.params.slideNextClass
                        );
                        if (nextSlide.length > 0)
                            s.lazy.loadImageInSlide(nextSlide.index());
                        var prevSlide = s.wrapper.children(
                            "." + s.params.slidePrevClass
                        );
                        if (prevSlide.length > 0)
                            s.lazy.loadImageInSlide(prevSlide.index());
                    }
                }
            },
            onTransitionStart: function () {
                if (s.params.lazyLoading) {
                    if (
                        s.params.lazyLoadingOnTransitionStart ||
                        (!s.params.lazyLoadingOnTransitionStart &&
                            !s.lazy.initialImageLoaded)
                    ) {
                        s.lazy.load();
                    }
                }
            },
            onTransitionEnd: function () {
                if (
                    s.params.lazyLoading &&
                    !s.params.lazyLoadingOnTransitionStart
                ) {
                    s.lazy.load();
                }
            },
        };
        s.scrollbar = {
            isTouched: !1,
            setDragPosition: function (e) {
                var sb = s.scrollbar;
                var x = 0,
                    y = 0;
                var translate;
                var pointerPosition = s.isHorizontal()
                    ? e.type === "touchstart" || e.type === "touchmove"
                        ? e.targetTouches[0].pageX
                        : e.pageX || e.clientX
                    : e.type === "touchstart" || e.type === "touchmove"
                    ? e.targetTouches[0].pageY
                    : e.pageY || e.clientY;
                var position =
                    pointerPosition -
                    sb.track.offset()[s.isHorizontal() ? "left" : "top"] -
                    sb.dragSize / 2;
                var positionMin = -s.minTranslate() * sb.moveDivider;
                var positionMax = -s.maxTranslate() * sb.moveDivider;
                if (position < positionMin) {
                    position = positionMin;
                } else if (position > positionMax) {
                    position = positionMax;
                }
                position = -position / sb.moveDivider;
                s.updateProgress(position);
                s.setWrapperTranslate(position, !0);
            },
            dragStart: function (e) {
                var sb = s.scrollbar;
                sb.isTouched = !0;
                e.preventDefault();
                e.stopPropagation();
                sb.setDragPosition(e);
                clearTimeout(sb.dragTimeout);
                sb.track.transition(0);
                if (s.params.scrollbarHide) {
                    sb.track.css("opacity", 1);
                }
                s.wrapper.transition(100);
                sb.drag.transition(100);
                s.emit("onScrollbarDragStart", s);
            },
            dragMove: function (e) {
                var sb = s.scrollbar;
                if (!sb.isTouched) return;
                if (e.preventDefault) e.preventDefault();
                else e.returnValue = !1;
                sb.setDragPosition(e);
                s.wrapper.transition(0);
                sb.track.transition(0);
                sb.drag.transition(0);
                s.emit("onScrollbarDragMove", s);
            },
            dragEnd: function (e) {
                var sb = s.scrollbar;
                if (!sb.isTouched) return;
                sb.isTouched = !1;
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.dragTimeout);
                    sb.dragTimeout = setTimeout(function () {
                        sb.track.css("opacity", 0);
                        sb.track.transition(400);
                    }, 1000);
                }
                s.emit("onScrollbarDragEnd", s);
                if (s.params.scrollbarSnapOnRelease) {
                    s.slideReset();
                }
            },
            draggableEvents: (function () {
                if (s.params.simulateTouch === !1 && !s.support.touch)
                    return s.touchEventsDesktop;
                else return s.touchEvents;
            })(),
            enableDraggable: function () {
                var sb = s.scrollbar;
                var target = s.support.touch ? sb.track : document;
                $(sb.track).on(sb.draggableEvents.start, sb.dragStart);
                $(target).on(sb.draggableEvents.move, sb.dragMove);
                $(target).on(sb.draggableEvents.end, sb.dragEnd);
            },
            disableDraggable: function () {
                var sb = s.scrollbar;
                var target = s.support.touch ? sb.track : document;
                $(sb.track).off(sb.draggableEvents.start, sb.dragStart);
                $(target).off(sb.draggableEvents.move, sb.dragMove);
                $(target).off(sb.draggableEvents.end, sb.dragEnd);
            },
            set: function () {
                if (!s.params.scrollbar) return;
                var sb = s.scrollbar;
                sb.track = $(s.params.scrollbar);
                if (
                    s.params.uniqueNavElements &&
                    typeof s.params.scrollbar === "string" &&
                    sb.track.length > 1 &&
                    s.container.find(s.params.scrollbar).length === 1
                ) {
                    sb.track = s.container.find(s.params.scrollbar);
                }
                sb.drag = sb.track.find(".swiper-scrollbar-drag");
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = "";
                sb.drag[0].style.height = "";
                sb.trackSize = s.isHorizontal()
                    ? sb.track[0].offsetWidth
                    : sb.track[0].offsetHeight;
                sb.divider = s.size / s.virtualSize;
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                sb.dragSize = sb.trackSize * sb.divider;
                if (s.isHorizontal()) {
                    sb.drag[0].style.width = sb.dragSize + "px";
                } else {
                    sb.drag[0].style.height = sb.dragSize + "px";
                }
                if (sb.divider >= 1) {
                    sb.track[0].style.display = "none";
                } else {
                    sb.track[0].style.display = "";
                }
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function () {
                if (!s.params.scrollbar) return;
                var diff;
                var sb = s.scrollbar;
                var translate = s.translate || 0;
                var newPos;
                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && s.isHorizontal()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    } else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                } else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    } else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (s.isHorizontal()) {
                    if (s.support.transforms3d) {
                        sb.drag.transform(
                            "translate3d(" + newPos + "px, 0, 0)"
                        );
                    } else {
                        sb.drag.transform("translateX(" + newPos + "px)");
                    }
                    sb.drag[0].style.width = newSize + "px";
                } else {
                    if (s.support.transforms3d) {
                        sb.drag.transform(
                            "translate3d(0px, " + newPos + "px, 0)"
                        );
                    } else {
                        sb.drag.transform("translateY(" + newPos + "px)");
                    }
                    sb.drag[0].style.height = newSize + "px";
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function () {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function (duration) {
                if (!s.params.scrollbar) return;
                s.scrollbar.drag.transition(duration);
            },
        };
        s.controller = {
            LinearSpline: function (x, y) {
                var binarySearch = (function () {
                    var maxIndex, minIndex, guess;
                    return function (array, val) {
                        minIndex = -1;
                        maxIndex = array.length;
                        while (maxIndex - minIndex > 1)
                            if (
                                array[(guess = (maxIndex + minIndex) >> 1)] <=
                                val
                            ) {
                                minIndex = guess;
                            } else {
                                maxIndex = guess;
                            }
                        return maxIndex;
                    };
                })();
                this.x = x;
                this.y = y;
                this.lastIndex = x.length - 1;
                var i1, i3;
                var l = this.x.length;
                this.interpolate = function (x2) {
                    if (!x2) return 0;
                    i3 = binarySearch(this.x, x2);
                    i1 = i3 - 1;
                    return (
                        ((x2 - this.x[i1]) * (this.y[i3] - this.y[i1])) /
                            (this.x[i3] - this.x[i1]) +
                        this.y[i1]
                    );
                };
            },
            getInterpolateFunction: function (c) {
                if (!s.controller.spline)
                    s.controller.spline = s.params.loop
                        ? new s.controller.LinearSpline(
                              s.slidesGrid,
                              c.slidesGrid
                          )
                        : new s.controller.LinearSpline(s.snapGrid, c.snapGrid);
            },
            setTranslate: function (translate, byController) {
                var controlled = s.params.control;
                var multiplier, controlledTranslate;
                function setControlledTranslate(c) {
                    translate =
                        c.rtl && c.params.direction === "horizontal"
                            ? -s.translate
                            : s.translate;
                    if (s.params.controlBy === "slide") {
                        s.controller.getInterpolateFunction(c);
                        controlledTranslate = -s.controller.spline.interpolate(
                            -translate
                        );
                    }
                    if (
                        !controlledTranslate ||
                        s.params.controlBy === "container"
                    ) {
                        multiplier =
                            (c.maxTranslate() - c.minTranslate()) /
                            (s.maxTranslate() - s.minTranslate());
                        controlledTranslate =
                            (translate - s.minTranslate()) * multiplier +
                            c.minTranslate();
                    }
                    if (s.params.controlInverse) {
                        controlledTranslate =
                            c.maxTranslate() - controlledTranslate;
                    }
                    c.updateProgress(controlledTranslate);
                    c.setWrapperTranslate(controlledTranslate, !1, s);
                    c.updateActiveIndex();
                }
                if (Array.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (
                            controlled[i] !== byController &&
                            controlled[i] instanceof Swiper
                        ) {
                            setControlledTranslate(controlled[i]);
                        }
                    }
                } else if (
                    controlled instanceof Swiper &&
                    byController !== controlled
                ) {
                    setControlledTranslate(controlled);
                }
            },
            setTransition: function (duration, byController) {
                var controlled = s.params.control;
                var i;
                function setControlledTransition(c) {
                    c.setWrapperTransition(duration, s);
                    if (duration !== 0) {
                        c.onTransitionStart();
                        c.wrapper.transitionEnd(function () {
                            if (!controlled) return;
                            if (
                                c.params.loop &&
                                s.params.controlBy === "slide"
                            ) {
                                c.fixLoop();
                            }
                            c.onTransitionEnd();
                        });
                    }
                }
                if (Array.isArray(controlled)) {
                    for (i = 0; i < controlled.length; i++) {
                        if (
                            controlled[i] !== byController &&
                            controlled[i] instanceof Swiper
                        ) {
                            setControlledTransition(controlled[i]);
                        }
                    }
                } else if (
                    controlled instanceof Swiper &&
                    byController !== controlled
                ) {
                    setControlledTransition(controlled);
                }
            },
        };
        s.hashnav = {
            onHashCange: function (e, a) {
                var newHash = document.location.hash.replace("#", "");
                var activeSlideHash = s.slides
                    .eq(s.activeIndex)
                    .attr("data-hash");
                if (newHash !== activeSlideHash) {
                    s.slideTo(
                        s.wrapper
                            .children(
                                "." +
                                    s.params.slideClass +
                                    '[data-hash="' +
                                    newHash +
                                    '"]'
                            )
                            .index()
                    );
                }
            },
            attachEvents: function (detach) {
                var action = detach ? "off" : "on";
                $(window)[action]("hashchange", s.hashnav.onHashCange);
            },
            setHash: function () {
                if (!s.hashnav.initialized || !s.params.hashnav) return;
                if (
                    s.params.replaceState &&
                    window.history &&
                    window.history.replaceState
                ) {
                    window.history.replaceState(
                        null,
                        null,
                        "#" + s.slides.eq(s.activeIndex).attr("data-hash") || ""
                    );
                } else {
                    var slide = s.slides.eq(s.activeIndex);
                    var hash =
                        slide.attr("data-hash") || slide.attr("data-history");
                    document.location.hash = hash || "";
                }
            },
            init: function () {
                if (!s.params.hashnav || s.params.history) return;
                s.hashnav.initialized = !0;
                var hash = document.location.hash.replace("#", "");
                if (hash) {
                    var speed = 0;
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideHash =
                            slide.attr("data-hash") ||
                            slide.attr("data-history");
                        if (
                            slideHash === hash &&
                            !slide.hasClass(s.params.slideDuplicateClass)
                        ) {
                            var index = slide.index();
                            s.slideTo(
                                index,
                                speed,
                                s.params.runCallbacksOnInit,
                                !0
                            );
                        }
                    }
                }
                if (s.params.hashnavWatchState) s.hashnav.attachEvents();
            },
            destroy: function () {
                if (s.params.hashnavWatchState) s.hashnav.attachEvents(!0);
            },
        };
        s.history = {
            init: function () {
                if (!s.params.history) return;
                if (!window.history || !window.history.pushState) {
                    s.params.history = !1;
                    s.params.hashnav = !0;
                    return;
                }
                s.history.initialized = !0;
                this.paths = this.getPathValues();
                if (!this.paths.key && !this.paths.value) return;
                this.scrollToSlide(
                    0,
                    this.paths.value,
                    s.params.runCallbacksOnInit
                );
                if (!s.params.replaceState) {
                    window.addEventListener(
                        "popstate",
                        this.setHistoryPopState
                    );
                }
            },
            setHistoryPopState: function () {
                s.history.paths = s.history.getPathValues();
                s.history.scrollToSlide(
                    s.params.speed,
                    s.history.paths.value,
                    !1
                );
            },
            getPathValues: function () {
                var pathArray = window.location.pathname.slice(1).split("/");
                var total = pathArray.length;
                var key = pathArray[total - 2];
                var value = pathArray[total - 1];
                return { key: key, value: value };
            },
            setHistory: function (key, index) {
                if (!s.history.initialized || !s.params.history) return;
                var slide = s.slides.eq(index);
                var value = this.slugify(slide.attr("data-history"));
                if (!window.location.pathname.includes(key)) {
                    value = key + "/" + value;
                }
                if (s.params.replaceState) {
                    window.history.replaceState(null, null, value);
                } else {
                    window.history.pushState(null, null, value);
                }
            },
            slugify: function (text) {
                return text
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w\-]+/g, "")
                    .replace(/\-\-+/g, "-")
                    .replace(/^-+/, "")
                    .replace(/-+$/, "");
            },
            scrollToSlide: function (speed, value, runCallbacks) {
                if (value) {
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideHistory = this.slugify(
                            slide.attr("data-history")
                        );
                        if (
                            slideHistory === value &&
                            !slide.hasClass(s.params.slideDuplicateClass)
                        ) {
                            var index = slide.index();
                            s.slideTo(index, speed, runCallbacks);
                        }
                    }
                } else {
                    s.slideTo(0, speed, runCallbacks);
                }
            },
        };
        function handleKeyboard(e) {
            if (e.originalEvent) e = e.originalEvent;
            var kc = e.keyCode || e.charCode;
            if (
                !s.params.allowSwipeToNext &&
                ((s.isHorizontal() && kc === 39) ||
                    (!s.isHorizontal() && kc === 40))
            ) {
                return !1;
            }
            if (
                !s.params.allowSwipeToPrev &&
                ((s.isHorizontal() && kc === 37) ||
                    (!s.isHorizontal() && kc === 38))
            ) {
                return !1;
            }
            if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) {
                return;
            }
            if (
                document.activeElement &&
                document.activeElement.nodeName &&
                (document.activeElement.nodeName.toLowerCase() === "input" ||
                    document.activeElement.nodeName.toLowerCase() ===
                        "textarea")
            ) {
                return;
            }
            if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
                var inView = !1;
                if (
                    s.container.parents("." + s.params.slideClass).length > 0 &&
                    s.container.parents("." + s.params.slideActiveClass)
                        .length === 0
                ) {
                    return;
                }
                var windowScroll = {
                    left: window.pageXOffset,
                    top: window.pageYOffset,
                };
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var swiperOffset = s.container.offset();
                if (s.rtl)
                    swiperOffset.left =
                        swiperOffset.left - s.container[0].scrollLeft;
                var swiperCoord = [
                    [swiperOffset.left, swiperOffset.top],
                    [swiperOffset.left + s.width, swiperOffset.top],
                    [swiperOffset.left, swiperOffset.top + s.height],
                    [swiperOffset.left + s.width, swiperOffset.top + s.height],
                ];
                for (var i = 0; i < swiperCoord.length; i++) {
                    var point = swiperCoord[i];
                    if (
                        point[0] >= windowScroll.left &&
                        point[0] <= windowScroll.left + windowWidth &&
                        point[1] >= windowScroll.top &&
                        point[1] <= windowScroll.top + windowHeight
                    ) {
                        inView = !0;
                    }
                }
                if (!inView) return;
            }
            if (s.isHorizontal()) {
                if (kc === 37 || kc === 39) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = !1;
                }
                if ((kc === 39 && !s.rtl) || (kc === 37 && s.rtl))
                    s.slideNext();
                if ((kc === 37 && !s.rtl) || (kc === 39 && s.rtl))
                    s.slidePrev();
            } else {
                if (kc === 38 || kc === 40) {
                    if (e.preventDefault) e.preventDefault();
                    else e.returnValue = !1;
                }
                if (kc === 40) s.slideNext();
                if (kc === 38) s.slidePrev();
            }
            s.emit("onKeyPress", s, kc);
        }
        s.disableKeyboardControl = function () {
            s.params.keyboardControl = !1;
            $(document).off("keydown", handleKeyboard);
        };
        s.enableKeyboardControl = function () {
            s.params.keyboardControl = !0;
            $(document).on("keydown", handleKeyboard);
        };
        s.mousewheel = {
            event: !1,
            lastScrollTime: new window.Date().getTime(),
        };
        function isEventSupported() {
            var eventName = "onwheel";
            var isSupported = eventName in document;
            if (!isSupported) {
                var element = document.createElement("div");
                element.setAttribute(eventName, "return;");
                isSupported = typeof element[eventName] === "function";
            }
            if (
                !isSupported &&
                document.implementation &&
                document.implementation.hasFeature &&
                document.implementation.hasFeature("", "") !== !0
            ) {
                isSupported = document.implementation.hasFeature(
                    "Events.wheel",
                    "3.0"
                );
            }
            return isSupported;
        }
        function normalizeWheel(event) {
            var PIXEL_STEP = 10;
            var LINE_HEIGHT = 40;
            var PAGE_HEIGHT = 800;
            var sX = 0,
                sY = 0,
                pX = 0,
                pY = 0;
            if ("detail" in event) {
                sY = event.detail;
            }
            if ("wheelDelta" in event) {
                sY = -event.wheelDelta / 120;
            }
            if ("wheelDeltaY" in event) {
                sY = -event.wheelDeltaY / 120;
            }
            if ("wheelDeltaX" in event) {
                sX = -event.wheelDeltaX / 120;
            }
            if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
                sX = sY;
                sY = 0;
            }
            pX = sX * PIXEL_STEP;
            pY = sY * PIXEL_STEP;
            if ("deltaY" in event) {
                pY = event.deltaY;
            }
            if ("deltaX" in event) {
                pX = event.deltaX;
            }
            if ((pX || pY) && event.deltaMode) {
                if (event.deltaMode === 1) {
                    pX *= LINE_HEIGHT;
                    pY *= LINE_HEIGHT;
                } else {
                    pX *= PAGE_HEIGHT;
                    pY *= PAGE_HEIGHT;
                }
            }
            if (pX && !sX) {
                sX = pX < 1 ? -1 : 1;
            }
            if (pY && !sY) {
                sY = pY < 1 ? -1 : 1;
            }
            return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
        }
        if (s.params.mousewheelControl) {
            s.mousewheel.event =
                navigator.userAgent.indexOf("firefox") > -1
                    ? "DOMMouseScroll"
                    : isEventSupported()
                    ? "wheel"
                    : "mousewheel";
        }
        function handleMousewheel(e) {
            if (e.originalEvent) e = e.originalEvent;
            var delta = 0;
            var rtlFactor = s.rtl ? -1 : 1;
            var data = normalizeWheel(e);
            if (s.params.mousewheelForceToAxis) {
                if (s.isHorizontal()) {
                    if (Math.abs(data.pixelX) > Math.abs(data.pixelY))
                        delta = data.pixelX * rtlFactor;
                    else return;
                } else {
                    if (Math.abs(data.pixelY) > Math.abs(data.pixelX))
                        delta = data.pixelY;
                    else return;
                }
            } else {
                delta =
                    Math.abs(data.pixelX) > Math.abs(data.pixelY)
                        ? -data.pixelX * rtlFactor
                        : -data.pixelY;
            }
            if (delta === 0) return;
            if (s.params.mousewheelInvert) delta = -delta;
            if (!s.params.freeMode) {
                if (
                    new window.Date().getTime() - s.mousewheel.lastScrollTime >
                    60
                ) {
                    if (delta < 0) {
                        if ((!s.isEnd || s.params.loop) && !s.animating) {
                            s.slideNext();
                            s.emit("onScroll", s, e);
                        } else if (s.params.mousewheelReleaseOnEdges) return !0;
                    } else {
                        if ((!s.isBeginning || s.params.loop) && !s.animating) {
                            s.slidePrev();
                            s.emit("onScroll", s, e);
                        } else if (s.params.mousewheelReleaseOnEdges) return !0;
                    }
                }
                s.mousewheel.lastScrollTime = new window.Date().getTime();
            } else {
                var position =
                    s.getWrapperTranslate() +
                    delta * s.params.mousewheelSensitivity;
                var wasBeginning = s.isBeginning,
                    wasEnd = s.isEnd;
                if (position >= s.minTranslate()) position = s.minTranslate();
                if (position <= s.maxTranslate()) position = s.maxTranslate();
                s.setWrapperTransition(0);
                s.setWrapperTranslate(position);
                s.updateProgress();
                s.updateActiveIndex();
                if ((!wasBeginning && s.isBeginning) || (!wasEnd && s.isEnd)) {
                    s.updateClasses();
                }
                if (s.params.freeModeSticky) {
                    clearTimeout(s.mousewheel.timeout);
                    s.mousewheel.timeout = setTimeout(function () {
                        s.slideReset();
                    }, 300);
                } else {
                    if (s.params.lazyLoading && s.lazy) {
                        s.lazy.load();
                    }
                }
                s.emit("onScroll", s, e);
                if (s.params.autoplay && s.params.autoplayDisableOnInteraction)
                    s.stopAutoplay();
                if (position === 0 || position === s.maxTranslate()) return;
            }
            if (e.preventDefault) e.preventDefault();
            else e.returnValue = !1;
            return !1;
        }
        s.disableMousewheelControl = function () {
            if (!s.mousewheel.event) return !1;
            var target = s.container;
            if (s.params.mousewheelEventsTarged !== "container") {
                target = $(s.params.mousewheelEventsTarged);
            }
            target.off(s.mousewheel.event, handleMousewheel);
            s.params.mousewheelControl = !1;
            return !0;
        };
        s.enableMousewheelControl = function () {
            if (!s.mousewheel.event) return !1;
            var target = s.container;
            if (s.params.mousewheelEventsTarged !== "container") {
                target = $(s.params.mousewheelEventsTarged);
            }
            target.on(s.mousewheel.event, handleMousewheel);
            s.params.mousewheelControl = !0;
            return !0;
        };
        function setParallaxTransform(el, progress) {
            el = $(el);
            var p, pX, pY;
            var rtlFactor = s.rtl ? -1 : 1;
            p = el.attr("data-swiper-parallax") || "0";
            pX = el.attr("data-swiper-parallax-x");
            pY = el.attr("data-swiper-parallax-y");
            if (pX || pY) {
                pX = pX || "0";
                pY = pY || "0";
            } else {
                if (s.isHorizontal()) {
                    pX = p;
                    pY = "0";
                } else {
                    pY = p;
                    pX = "0";
                }
            }
            if (pX.indexOf("%") >= 0) {
                pX = parseInt(pX, 10) * progress * rtlFactor + "%";
            } else {
                pX = pX * progress * rtlFactor + "px";
            }
            if (pY.indexOf("%") >= 0) {
                pY = parseInt(pY, 10) * progress + "%";
            } else {
                pY = pY * progress + "px";
            }
            el.transform("translate3d(" + pX + ", " + pY + ",0px)");
        }
        s.parallax = {
            setTranslate: function () {
                s.container
                    .children(
                        "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
                    )
                    .each(function () {
                        setParallaxTransform(this, s.progress);
                    });
                s.slides.each(function () {
                    var slide = $(this);
                    slide
                        .find(
                            "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
                        )
                        .each(function () {
                            var progress = Math.min(
                                Math.max(slide[0].progress, -1),
                                1
                            );
                            setParallaxTransform(this, progress);
                        });
                });
            },
            setTransition: function (duration) {
                if (typeof duration === "undefined") duration = s.params.speed;
                s.container
                    .find(
                        "[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
                    )
                    .each(function () {
                        var el = $(this);
                        var parallaxDuration =
                            parseInt(
                                el.attr("data-swiper-parallax-duration"),
                                10
                            ) || duration;
                        if (duration === 0) parallaxDuration = 0;
                        el.transition(parallaxDuration);
                    });
            },
        };
        s.zoom = {
            scale: 1,
            currentScale: 1,
            isScaling: !1,
            gesture: {
                slide: undefined,
                slideWidth: undefined,
                slideHeight: undefined,
                image: undefined,
                imageWrap: undefined,
                zoomMax: s.params.zoomMax,
            },
            image: {
                isTouched: undefined,
                isMoved: undefined,
                currentX: undefined,
                currentY: undefined,
                minX: undefined,
                minY: undefined,
                maxX: undefined,
                maxY: undefined,
                width: undefined,
                height: undefined,
                startX: undefined,
                startY: undefined,
                touchesStart: {},
                touchesCurrent: {},
            },
            velocity: {
                x: undefined,
                y: undefined,
                prevPositionX: undefined,
                prevPositionY: undefined,
                prevTime: undefined,
            },
            getDistanceBetweenTouches: function (e) {
                if (e.targetTouches.length < 2) return 1;
                var x1 = e.targetTouches[0].pageX,
                    y1 = e.targetTouches[0].pageY,
                    x2 = e.targetTouches[1].pageX,
                    y2 = e.targetTouches[1].pageY;
                var distance = Math.sqrt(
                    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
                );
                return distance;
            },
            onGestureStart: function (e) {
                var z = s.zoom;
                if (!s.support.gestures) {
                    if (
                        e.type !== "touchstart" ||
                        (e.type === "touchstart" && e.targetTouches.length < 2)
                    ) {
                        return;
                    }
                    z.gesture.scaleStart = z.getDistanceBetweenTouches(e);
                }
                if (!z.gesture.slide || !z.gesture.slide.length) {
                    z.gesture.slide = $(this);
                    if (z.gesture.slide.length === 0)
                        z.gesture.slide = s.slides.eq(s.activeIndex);
                    z.gesture.image = z.gesture.slide.find("img, svg, canvas");
                    z.gesture.imageWrap = z.gesture.image.parent(
                        "." + s.params.zoomContainerClass
                    );
                    z.gesture.zoomMax =
                        z.gesture.imageWrap.attr("data-swiper-zoom") ||
                        s.params.zoomMax;
                    if (z.gesture.imageWrap.length === 0) {
                        z.gesture.image = undefined;
                        return;
                    }
                }
                z.gesture.image.transition(0);
                z.isScaling = !0;
            },
            onGestureChange: function (e) {
                var z = s.zoom;
                if (!s.support.gestures) {
                    if (
                        e.type !== "touchmove" ||
                        (e.type === "touchmove" && e.targetTouches.length < 2)
                    ) {
                        return;
                    }
                    z.gesture.scaleMove = z.getDistanceBetweenTouches(e);
                }
                if (!z.gesture.image || z.gesture.image.length === 0) return;
                if (s.support.gestures) {
                    z.scale = e.scale * z.currentScale;
                } else {
                    z.scale =
                        (z.gesture.scaleMove / z.gesture.scaleStart) *
                        z.currentScale;
                }
                if (z.scale > z.gesture.zoomMax) {
                    z.scale =
                        z.gesture.zoomMax -
                        1 +
                        Math.pow(z.scale - z.gesture.zoomMax + 1, 0.5);
                }
                if (z.scale < s.params.zoomMin) {
                    z.scale =
                        s.params.zoomMin +
                        1 -
                        Math.pow(s.params.zoomMin - z.scale + 1, 0.5);
                }
                z.gesture.image.transform(
                    "translate3d(0,0,0) scale(" + z.scale + ")"
                );
            },
            onGestureEnd: function (e) {
                var z = s.zoom;
                if (!s.support.gestures) {
                    if (
                        e.type !== "touchend" ||
                        (e.type === "touchend" && e.changedTouches.length < 2)
                    ) {
                        return;
                    }
                }
                if (!z.gesture.image || z.gesture.image.length === 0) return;
                z.scale = Math.max(
                    Math.min(z.scale, z.gesture.zoomMax),
                    s.params.zoomMin
                );
                z.gesture.image
                    .transition(s.params.speed)
                    .transform("translate3d(0,0,0) scale(" + z.scale + ")");
                z.currentScale = z.scale;
                z.isScaling = !1;
                if (z.scale === 1) z.gesture.slide = undefined;
            },
            onTouchStart: function (s, e) {
                var z = s.zoom;
                if (!z.gesture.image || z.gesture.image.length === 0) return;
                if (z.image.isTouched) return;
                if (s.device.os === "android") e.preventDefault();
                z.image.isTouched = !0;
                z.image.touchesStart.x =
                    e.type === "touchstart"
                        ? e.targetTouches[0].pageX
                        : e.pageX;
                z.image.touchesStart.y =
                    e.type === "touchstart"
                        ? e.targetTouches[0].pageY
                        : e.pageY;
            },
            onTouchMove: function (e) {
                var z = s.zoom;
                if (!z.gesture.image || z.gesture.image.length === 0) return;
                s.allowClick = !1;
                if (!z.image.isTouched || !z.gesture.slide) return;
                if (!z.image.isMoved) {
                    z.image.width = z.gesture.image[0].offsetWidth;
                    z.image.height = z.gesture.image[0].offsetHeight;
                    z.image.startX =
                        s.getTranslate(z.gesture.imageWrap[0], "x") || 0;
                    z.image.startY =
                        s.getTranslate(z.gesture.imageWrap[0], "y") || 0;
                    z.gesture.slideWidth = z.gesture.slide[0].offsetWidth;
                    z.gesture.slideHeight = z.gesture.slide[0].offsetHeight;
                    z.gesture.imageWrap.transition(0);
                    if (s.rtl) z.image.startX = -z.image.startX;
                    if (s.rtl) z.image.startY = -z.image.startY;
                }
                var scaledWidth = z.image.width * z.scale;
                var scaledHeight = z.image.height * z.scale;
                if (
                    scaledWidth < z.gesture.slideWidth &&
                    scaledHeight < z.gesture.slideHeight
                )
                    return;
                z.image.minX = Math.min(
                    z.gesture.slideWidth / 2 - scaledWidth / 2,
                    0
                );
                z.image.maxX = -z.image.minX;
                z.image.minY = Math.min(
                    z.gesture.slideHeight / 2 - scaledHeight / 2,
                    0
                );
                z.image.maxY = -z.image.minY;
                z.image.touchesCurrent.x =
                    e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
                z.image.touchesCurrent.y =
                    e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
                if (!z.image.isMoved && !z.isScaling) {
                    if (
                        (s.isHorizontal() &&
                            Math.floor(z.image.minX) ===
                                Math.floor(z.image.startX) &&
                            z.image.touchesCurrent.x <
                                z.image.touchesStart.x) ||
                        (Math.floor(z.image.maxX) ===
                            Math.floor(z.image.startX) &&
                            z.image.touchesCurrent.x > z.image.touchesStart.x)
                    ) {
                        z.image.isTouched = !1;
                        return;
                    } else if (
                        (!s.isHorizontal() &&
                            Math.floor(z.image.minY) ===
                                Math.floor(z.image.startY) &&
                            z.image.touchesCurrent.y <
                                z.image.touchesStart.y) ||
                        (Math.floor(z.image.maxY) ===
                            Math.floor(z.image.startY) &&
                            z.image.touchesCurrent.y > z.image.touchesStart.y)
                    ) {
                        z.image.isTouched = !1;
                        return;
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                z.image.isMoved = !0;
                z.image.currentX =
                    z.image.touchesCurrent.x -
                    z.image.touchesStart.x +
                    z.image.startX;
                z.image.currentY =
                    z.image.touchesCurrent.y -
                    z.image.touchesStart.y +
                    z.image.startY;
                if (z.image.currentX < z.image.minX) {
                    z.image.currentX =
                        z.image.minX +
                        1 -
                        Math.pow(z.image.minX - z.image.currentX + 1, 0.8);
                }
                if (z.image.currentX > z.image.maxX) {
                    z.image.currentX =
                        z.image.maxX -
                        1 +
                        Math.pow(z.image.currentX - z.image.maxX + 1, 0.8);
                }
                if (z.image.currentY < z.image.minY) {
                    z.image.currentY =
                        z.image.minY +
                        1 -
                        Math.pow(z.image.minY - z.image.currentY + 1, 0.8);
                }
                if (z.image.currentY > z.image.maxY) {
                    z.image.currentY =
                        z.image.maxY -
                        1 +
                        Math.pow(z.image.currentY - z.image.maxY + 1, 0.8);
                }
                if (!z.velocity.prevPositionX)
                    z.velocity.prevPositionX = z.image.touchesCurrent.x;
                if (!z.velocity.prevPositionY)
                    z.velocity.prevPositionY = z.image.touchesCurrent.y;
                if (!z.velocity.prevTime) z.velocity.prevTime = Date.now();
                z.velocity.x =
                    (z.image.touchesCurrent.x - z.velocity.prevPositionX) /
                    (Date.now() - z.velocity.prevTime) /
                    2;
                z.velocity.y =
                    (z.image.touchesCurrent.y - z.velocity.prevPositionY) /
                    (Date.now() - z.velocity.prevTime) /
                    2;
                if (
                    Math.abs(
                        z.image.touchesCurrent.x - z.velocity.prevPositionX
                    ) < 2
                )
                    z.velocity.x = 0;
                if (
                    Math.abs(
                        z.image.touchesCurrent.y - z.velocity.prevPositionY
                    ) < 2
                )
                    z.velocity.y = 0;
                z.velocity.prevPositionX = z.image.touchesCurrent.x;
                z.velocity.prevPositionY = z.image.touchesCurrent.y;
                z.velocity.prevTime = Date.now();
                z.gesture.imageWrap.transform(
                    "translate3d(" +
                        z.image.currentX +
                        "px, " +
                        z.image.currentY +
                        "px,0)"
                );
            },
            onTouchEnd: function (s, e) {
                var z = s.zoom;
                if (!z.gesture.image || z.gesture.image.length === 0) return;
                if (!z.image.isTouched || !z.image.isMoved) {
                    z.image.isTouched = !1;
                    z.image.isMoved = !1;
                    return;
                }
                z.image.isTouched = !1;
                z.image.isMoved = !1;
                var momentumDurationX = 300;
                var momentumDurationY = 300;
                var momentumDistanceX = z.velocity.x * momentumDurationX;
                var newPositionX = z.image.currentX + momentumDistanceX;
                var momentumDistanceY = z.velocity.y * momentumDurationY;
                var newPositionY = z.image.currentY + momentumDistanceY;
                if (z.velocity.x !== 0)
                    momentumDurationX = Math.abs(
                        (newPositionX - z.image.currentX) / z.velocity.x
                    );
                if (z.velocity.y !== 0)
                    momentumDurationY = Math.abs(
                        (newPositionY - z.image.currentY) / z.velocity.y
                    );
                var momentumDuration = Math.max(
                    momentumDurationX,
                    momentumDurationY
                );
                z.image.currentX = newPositionX;
                z.image.currentY = newPositionY;
                var scaledWidth = z.image.width * z.scale;
                var scaledHeight = z.image.height * z.scale;
                z.image.minX = Math.min(
                    z.gesture.slideWidth / 2 - scaledWidth / 2,
                    0
                );
                z.image.maxX = -z.image.minX;
                z.image.minY = Math.min(
                    z.gesture.slideHeight / 2 - scaledHeight / 2,
                    0
                );
                z.image.maxY = -z.image.minY;
                z.image.currentX = Math.max(
                    Math.min(z.image.currentX, z.image.maxX),
                    z.image.minX
                );
                z.image.currentY = Math.max(
                    Math.min(z.image.currentY, z.image.maxY),
                    z.image.minY
                );
                z.gesture.imageWrap
                    .transition(momentumDuration)
                    .transform(
                        "translate3d(" +
                            z.image.currentX +
                            "px, " +
                            z.image.currentY +
                            "px,0)"
                    );
            },
            onTransitionEnd: function (s) {
                var z = s.zoom;
                if (z.gesture.slide && s.previousIndex !== s.activeIndex) {
                    z.gesture.image.transform("translate3d(0,0,0) scale(1)");
                    z.gesture.imageWrap.transform("translate3d(0,0,0)");
                    z.gesture.slide =
                        z.gesture.image =
                        z.gesture.imageWrap =
                            undefined;
                    z.scale = z.currentScale = 1;
                }
            },
            toggleZoom: function (s, e) {
                var z = s.zoom;
                if (!z.gesture.slide) {
                    z.gesture.slide = s.clickedSlide
                        ? $(s.clickedSlide)
                        : s.slides.eq(s.activeIndex);
                    z.gesture.image = z.gesture.slide.find("img, svg, canvas");
                    z.gesture.imageWrap = z.gesture.image.parent(
                        "." + s.params.zoomContainerClass
                    );
                }
                if (!z.gesture.image || z.gesture.image.length === 0) return;
                var touchX,
                    touchY,
                    offsetX,
                    offsetY,
                    diffX,
                    diffY,
                    translateX,
                    translateY,
                    imageWidth,
                    imageHeight,
                    scaledWidth,
                    scaledHeight,
                    translateMinX,
                    translateMinY,
                    translateMaxX,
                    translateMaxY,
                    slideWidth,
                    slideHeight;
                if (typeof z.image.touchesStart.x === "undefined" && e) {
                    touchX =
                        e.type === "touchend"
                            ? e.changedTouches[0].pageX
                            : e.pageX;
                    touchY =
                        e.type === "touchend"
                            ? e.changedTouches[0].pageY
                            : e.pageY;
                } else {
                    touchX = z.image.touchesStart.x;
                    touchY = z.image.touchesStart.y;
                }
                if (z.scale && z.scale !== 1) {
                    z.scale = z.currentScale = 1;
                    z.gesture.imageWrap
                        .transition(300)
                        .transform("translate3d(0,0,0)");
                    z.gesture.image
                        .transition(300)
                        .transform("translate3d(0,0,0) scale(1)");
                    z.gesture.slide = undefined;
                } else {
                    z.scale = z.currentScale =
                        z.gesture.imageWrap.attr("data-swiper-zoom") ||
                        s.params.zoomMax;
                    if (e) {
                        slideWidth = z.gesture.slide[0].offsetWidth;
                        slideHeight = z.gesture.slide[0].offsetHeight;
                        offsetX = z.gesture.slide.offset().left;
                        offsetY = z.gesture.slide.offset().top;
                        diffX = offsetX + slideWidth / 2 - touchX;
                        diffY = offsetY + slideHeight / 2 - touchY;
                        imageWidth = z.gesture.image[0].offsetWidth;
                        imageHeight = z.gesture.image[0].offsetHeight;
                        scaledWidth = imageWidth * z.scale;
                        scaledHeight = imageHeight * z.scale;
                        translateMinX = Math.min(
                            slideWidth / 2 - scaledWidth / 2,
                            0
                        );
                        translateMinY = Math.min(
                            slideHeight / 2 - scaledHeight / 2,
                            0
                        );
                        translateMaxX = -translateMinX;
                        translateMaxY = -translateMinY;
                        translateX = diffX * z.scale;
                        translateY = diffY * z.scale;
                        if (translateX < translateMinX) {
                            translateX = translateMinX;
                        }
                        if (translateX > translateMaxX) {
                            translateX = translateMaxX;
                        }
                        if (translateY < translateMinY) {
                            translateY = translateMinY;
                        }
                        if (translateY > translateMaxY) {
                            translateY = translateMaxY;
                        }
                    } else {
                        translateX = 0;
                        translateY = 0;
                    }
                    z.gesture.imageWrap
                        .transition(300)
                        .transform(
                            "translate3d(" +
                                translateX +
                                "px, " +
                                translateY +
                                "px,0)"
                        );
                    z.gesture.image
                        .transition(300)
                        .transform("translate3d(0,0,0) scale(" + z.scale + ")");
                }
            },
            attachEvents: function (detach) {
                var action = detach ? "off" : "on";
                if (s.params.zoom) {
                    var target = s.slides;
                    var passiveListener =
                        s.touchEvents.start === "touchstart" &&
                        s.support.passiveListener &&
                        s.params.passiveListeners
                            ? { passive: !0, capture: !1 }
                            : !1;
                    if (s.support.gestures) {
                        s.slides[action](
                            "gesturestart",
                            s.zoom.onGestureStart,
                            passiveListener
                        );
                        s.slides[action](
                            "gesturechange",
                            s.zoom.onGestureChange,
                            passiveListener
                        );
                        s.slides[action](
                            "gestureend",
                            s.zoom.onGestureEnd,
                            passiveListener
                        );
                    } else if (s.touchEvents.start === "touchstart") {
                        s.slides[action](
                            s.touchEvents.start,
                            s.zoom.onGestureStart,
                            passiveListener
                        );
                        s.slides[action](
                            s.touchEvents.move,
                            s.zoom.onGestureChange,
                            passiveListener
                        );
                        s.slides[action](
                            s.touchEvents.end,
                            s.zoom.onGestureEnd,
                            passiveListener
                        );
                    }
                    s[action]("touchStart", s.zoom.onTouchStart);
                    s.slides.each(function (index, slide) {
                        if (
                            $(slide).find("." + s.params.zoomContainerClass)
                                .length > 0
                        ) {
                            $(slide)[action](
                                s.touchEvents.move,
                                s.zoom.onTouchMove
                            );
                        }
                    });
                    s[action]("touchEnd", s.zoom.onTouchEnd);
                    s[action]("transitionEnd", s.zoom.onTransitionEnd);
                    if (s.params.zoomToggle) {
                        s.on("doubleTap", s.zoom.toggleZoom);
                    }
                }
            },
            init: function () {
                s.zoom.attachEvents();
            },
            destroy: function () {
                s.zoom.attachEvents(!0);
            },
        };
        s._plugins = [];
        for (var plugin in s.plugins) {
            var p = s.plugins[plugin](s, s.params[plugin]);
            if (p) s._plugins.push(p);
        }
        s.callPlugins = function (eventName) {
            for (var i = 0; i < s._plugins.length; i++) {
                if (eventName in s._plugins[i]) {
                    s._plugins[i][eventName](
                        arguments[1],
                        arguments[2],
                        arguments[3],
                        arguments[4],
                        arguments[5]
                    );
                }
            }
        };
        function normalizeEventName(eventName) {
            if (eventName.indexOf("on") !== 0) {
                if (eventName[0] !== eventName[0].toUpperCase()) {
                    eventName =
                        "on" +
                        eventName[0].toUpperCase() +
                        eventName.substring(1);
                } else {
                    eventName = "on" + eventName;
                }
            }
            return eventName;
        }
        s.emitterEventListeners = {};
        s.emit = function (eventName) {
            if (s.params[eventName]) {
                s.params[eventName](
                    arguments[1],
                    arguments[2],
                    arguments[3],
                    arguments[4],
                    arguments[5]
                );
            }
            var i;
            if (s.emitterEventListeners[eventName]) {
                for (
                    i = 0;
                    i < s.emitterEventListeners[eventName].length;
                    i++
                ) {
                    s.emitterEventListeners[eventName][i](
                        arguments[1],
                        arguments[2],
                        arguments[3],
                        arguments[4],
                        arguments[5]
                    );
                }
            }
            if (s.callPlugins)
                s.callPlugins(
                    eventName,
                    arguments[1],
                    arguments[2],
                    arguments[3],
                    arguments[4],
                    arguments[5]
                );
        };
        s.on = function (eventName, handler) {
            eventName = normalizeEventName(eventName);
            if (!s.emitterEventListeners[eventName])
                s.emitterEventListeners[eventName] = [];
            s.emitterEventListeners[eventName].push(handler);
            return s;
        };
        s.off = function (eventName, handler) {
            var i;
            eventName = normalizeEventName(eventName);
            if (typeof handler === "undefined") {
                s.emitterEventListeners[eventName] = [];
                return s;
            }
            if (
                !s.emitterEventListeners[eventName] ||
                s.emitterEventListeners[eventName].length === 0
            )
                return;
            for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                if (s.emitterEventListeners[eventName][i] === handler)
                    s.emitterEventListeners[eventName].splice(i, 1);
            }
            return s;
        };
        s.once = function (eventName, handler) {
            eventName = normalizeEventName(eventName);
            var _handler = function () {
                handler(
                    arguments[0],
                    arguments[1],
                    arguments[2],
                    arguments[3],
                    arguments[4]
                );
                s.off(eventName, _handler);
            };
            s.on(eventName, _handler);
            return s;
        };
        s.a11y = {
            makeFocusable: function ($el) {
                $el.attr("tabIndex", "0");
                return $el;
            },
            addRole: function ($el, role) {
                $el.attr("role", role);
                return $el;
            },
            addLabel: function ($el, label) {
                $el.attr("aria-label", label);
                return $el;
            },
            disable: function ($el) {
                $el.attr("aria-disabled", !0);
                return $el;
            },
            enable: function ($el) {
                $el.attr("aria-disabled", !1);
                return $el;
            },
            onEnterKey: function (event) {
                if (event.keyCode !== 13) return;
                if ($(event.target).is(s.params.nextButton)) {
                    s.onClickNext(event);
                    if (s.isEnd) {
                        s.a11y.notify(s.params.lastSlideMessage);
                    } else {
                        s.a11y.notify(s.params.nextSlideMessage);
                    }
                } else if ($(event.target).is(s.params.prevButton)) {
                    s.onClickPrev(event);
                    if (s.isBeginning) {
                        s.a11y.notify(s.params.firstSlideMessage);
                    } else {
                        s.a11y.notify(s.params.prevSlideMessage);
                    }
                }
                if ($(event.target).is("." + s.params.bulletClass)) {
                    $(event.target)[0].click();
                }
            },
            liveRegion: $(
                '<span class="' +
                    s.params.notificationClass +
                    '" aria-live="assertive" aria-atomic="true"></span>'
            ),
            notify: function (message) {
                var notification = s.a11y.liveRegion;
                if (notification.length === 0) return;
                notification.html("");
                notification.html(message);
            },
            init: function () {
                if (
                    s.params.nextButton &&
                    s.nextButton &&
                    s.nextButton.length > 0
                ) {
                    s.a11y.makeFocusable(s.nextButton);
                    s.a11y.addRole(s.nextButton, "button");
                    s.a11y.addLabel(s.nextButton, s.params.nextSlideMessage);
                }
                if (
                    s.params.prevButton &&
                    s.prevButton &&
                    s.prevButton.length > 0
                ) {
                    s.a11y.makeFocusable(s.prevButton);
                    s.a11y.addRole(s.prevButton, "button");
                    s.a11y.addLabel(s.prevButton, s.params.prevSlideMessage);
                }
                $(s.container).append(s.a11y.liveRegion);
            },
            initPagination: function () {
                if (
                    s.params.pagination &&
                    s.params.paginationClickable &&
                    s.bullets &&
                    s.bullets.length
                ) {
                    s.bullets.each(function () {
                        var bullet = $(this);
                        s.a11y.makeFocusable(bullet);
                        s.a11y.addRole(bullet, "button");
                        s.a11y.addLabel(
                            bullet,
                            s.params.paginationBulletMessage.replace(
                                /{{index}}/,
                                bullet.index() + 1
                            )
                        );
                    });
                }
            },
            destroy: function () {
                if (s.a11y.liveRegion && s.a11y.liveRegion.length > 0)
                    s.a11y.liveRegion.remove();
            },
        };
        s.init = function () {
            if (s.params.loop) s.createLoop();
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
                if (s.params.scrollbarDraggable) {
                    s.scrollbar.enableDraggable();
                }
            }
            if (s.params.effect !== "slide" && s.effects[s.params.effect]) {
                if (!s.params.loop) s.updateProgress();
                s.effects[s.params.effect].setTranslate();
            }
            if (s.params.loop) {
                s.slideTo(
                    s.params.initialSlide + s.loopedSlides,
                    0,
                    s.params.runCallbacksOnInit
                );
            } else {
                s.slideTo(
                    s.params.initialSlide,
                    0,
                    s.params.runCallbacksOnInit
                );
                if (s.params.initialSlide === 0) {
                    if (s.parallax && s.params.parallax)
                        s.parallax.setTranslate();
                    if (s.lazy && s.params.lazyLoading) {
                        s.lazy.load();
                        s.lazy.initialImageLoaded = !0;
                    }
                }
            }
            s.attachEvents();
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.preloadImages && !s.params.lazyLoading) {
                s.preloadImages();
            }
            if (s.params.zoom && s.zoom) {
                s.zoom.init();
            }
            if (s.params.autoplay) {
                s.startAutoplay();
            }
            if (s.params.keyboardControl) {
                if (s.enableKeyboardControl) s.enableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.enableMousewheelControl) s.enableMousewheelControl();
            }
            if (s.params.hashnavReplaceState) {
                s.params.replaceState = s.params.hashnavReplaceState;
            }
            if (s.params.history) {
                if (s.history) s.history.init();
            }
            if (s.params.hashnav) {
                if (s.hashnav) s.hashnav.init();
            }
            if (s.params.a11y && s.a11y) s.a11y.init();
            s.emit("onInit", s);
        };
        s.cleanupStyles = function () {
            s.container.removeClass(s.classNames.join(" ")).removeAttr("style");
            s.wrapper.removeAttr("style");
            if (s.slides && s.slides.length) {
                s.slides
                    .removeClass(
                        [
                            s.params.slideVisibleClass,
                            s.params.slideActiveClass,
                            s.params.slideNextClass,
                            s.params.slidePrevClass,
                        ].join(" ")
                    )
                    .removeAttr("style")
                    .removeAttr("data-swiper-column")
                    .removeAttr("data-swiper-row");
            }
            if (s.paginationContainer && s.paginationContainer.length) {
                s.paginationContainer.removeClass(
                    s.params.paginationHiddenClass
                );
            }
            if (s.bullets && s.bullets.length) {
                s.bullets.removeClass(s.params.bulletActiveClass);
            }
            if (s.params.prevButton)
                $(s.params.prevButton).removeClass(
                    s.params.buttonDisabledClass
                );
            if (s.params.nextButton)
                $(s.params.nextButton).removeClass(
                    s.params.buttonDisabledClass
                );
            if (s.params.scrollbar && s.scrollbar) {
                if (s.scrollbar.track && s.scrollbar.track.length)
                    s.scrollbar.track.removeAttr("style");
                if (s.scrollbar.drag && s.scrollbar.drag.length)
                    s.scrollbar.drag.removeAttr("style");
            }
        };
        s.destroy = function (deleteInstance, cleanupStyles) {
            s.detachEvents();
            s.stopAutoplay();
            if (s.params.scrollbar && s.scrollbar) {
                if (s.params.scrollbarDraggable) {
                    s.scrollbar.disableDraggable();
                }
            }
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (cleanupStyles) {
                s.cleanupStyles();
            }
            s.disconnectObservers();
            if (s.params.zoom && s.zoom) {
                s.zoom.destroy();
            }
            if (s.params.keyboardControl) {
                if (s.disableKeyboardControl) s.disableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.disableMousewheelControl) s.disableMousewheelControl();
            }
            if (s.params.a11y && s.a11y) s.a11y.destroy();
            if (s.params.history && !s.params.replaceState) {
                window.removeEventListener(
                    "popstate",
                    s.history.setHistoryPopState
                );
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.destroy();
            }
            s.emit("onDestroy");
            if (deleteInstance !== !1) s = null;
        };
        s.init();
        return s;
    };
    Swiper.prototype = {
        isSafari: (function () {
            var ua = window.navigator.userAgent.toLowerCase();
            return (
                ua.indexOf("safari") >= 0 &&
                ua.indexOf("chrome") < 0 &&
                ua.indexOf("android") < 0
            );
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
            window.navigator.userAgent
        ),
        isArray: function (arr) {
            return Object.prototype.toString.apply(arr) === "[object Array]";
        },
        browser: {
            ie:
                window.navigator.pointerEnabled ||
                window.navigator.msPointerEnabled,
            ieTouch:
                (window.navigator.msPointerEnabled &&
                    window.navigator.msMaxTouchPoints > 1) ||
                (window.navigator.pointerEnabled &&
                    window.navigator.maxTouchPoints > 1),
            lteIE9: (function () {
                var div = document.createElement("div");
                div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
                return div.getElementsByTagName("i").length === 1;
            })(),
        },
        device: (function () {
            var ua = window.navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
            return { ios: ipad || iphone || ipod, android: android };
        })(),
        support: {
            touch:
                (window.Modernizr && Modernizr.touch === !0) ||
                (function () {
                    return !!(
                        "ontouchstart" in window ||
                        (window.DocumentTouch &&
                            document instanceof DocumentTouch)
                    );
                })(),
            transforms3d:
                (window.Modernizr && Modernizr.csstransforms3d === !0) ||
                (function () {
                    var div = document.createElement("div").style;
                    return (
                        "webkitPerspective" in div ||
                        "MozPerspective" in div ||
                        "OPerspective" in div ||
                        "MsPerspective" in div ||
                        "perspective" in div
                    );
                })(),
            flexbox: (function () {
                var div = document.createElement("div").style;
                var styles =
                    "alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(
                        " "
                    );
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return !0;
                }
            })(),
            observer: (function () {
                return (
                    "MutationObserver" in window ||
                    "WebkitMutationObserver" in window
                );
            })(),
            passiveListener: (function () {
                var supportsPassive = !1;
                try {
                    var opts = Object.defineProperty({}, "passive", {
                        get: function () {
                            supportsPassive = !0;
                        },
                    });
                    window.addEventListener("testPassiveListener", null, opts);
                } catch (e) {}
                return supportsPassive;
            })(),
            gestures: (function () {
                return "ongesturestart" in window;
            })(),
        },
        plugins: {},
    };
    var swiperDomPlugins = ["jQuery", "Zepto", "Dom7"];
    for (var i = 0; i < swiperDomPlugins.length; i++) {
        if (window[swiperDomPlugins[i]]) {
            addLibraryPlugin(window[swiperDomPlugins[i]]);
        }
    }
    var domLib;
    if (typeof Dom7 === "undefined") {
        domLib = window.Dom7 || window.Zepto || window.jQuery;
    } else {
        domLib = Dom7;
    }
    function addLibraryPlugin(lib) {
        lib.fn.swiper = function (params) {
            var firstInstance;
            lib(this).each(function () {
                var s = new Swiper(this, params);
                if (!firstInstance) firstInstance = s;
            });
            return firstInstance;
        };
    }
    if (domLib) {
        if (!("transitionEnd" in domLib.fn)) {
            domLib.fn.transitionEnd = function (callback) {
                var events = [
                        "webkitTransitionEnd",
                        "transitionend",
                        "oTransitionEnd",
                        "MSTransitionEnd",
                        "msTransitionEnd",
                    ],
                    i,
                    j,
                    dom = this;
                function fireCallBack(e) {
                    if (e.target !== this) return;
                    callback.call(this, e);
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
                if (callback) {
                    for (i = 0; i < events.length; i++) {
                        dom.on(events[i], fireCallBack);
                    }
                }
                return this;
            };
        }
        if (!("transform" in domLib.fn)) {
            domLib.fn.transform = function (transform) {
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransform =
                        elStyle.MsTransform =
                        elStyle.msTransform =
                        elStyle.MozTransform =
                        elStyle.OTransform =
                        elStyle.transform =
                            transform;
                }
                return this;
            };
        }
        if (!("transition" in domLib.fn)) {
            domLib.fn.transition = function (duration) {
                if (typeof duration !== "string") {
                    duration = duration + "ms";
                }
                for (var i = 0; i < this.length; i++) {
                    var elStyle = this[i].style;
                    elStyle.webkitTransitionDuration =
                        elStyle.MsTransitionDuration =
                        elStyle.msTransitionDuration =
                        elStyle.MozTransitionDuration =
                        elStyle.OTransitionDuration =
                        elStyle.transitionDuration =
                            duration;
                }
                return this;
            };
        }
        if (!("outerWidth" in domLib.fn)) {
            domLib.fn.outerWidth = function (includeMargins) {
                if (this.length > 0) {
                    if (includeMargins)
                        return (
                            this[0].offsetWidth +
                            parseFloat(this.css("margin-right")) +
                            parseFloat(this.css("margin-left"))
                        );
                    else return this[0].offsetWidth;
                } else return null;
            };
        }
    }
    window.Swiper = Swiper;
})();
if (typeof module !== "undefined") {
    module.exports = window.Swiper;
} else if (typeof define === "function" && define.amd) {
    define([], function () {
        "use strict";
        return window.Swiper;
    });
}
(function ($) {
    $.prettyPhoto = { version: "3.1.6" };
    $.fn.prettyPhoto = function (pp_settings) {
        pp_settings = jQuery.extend(
            {
                hook: "rel",
                animation_speed: "fast",
                ajaxcallback: function () {},
                slideshow: 5000,
                autoplay_slideshow: !1,
                opacity: 0.8,
                show_title: !0,
                allow_resize: !0,
                allow_expand: !0,
                default_width: 500,
                default_height: 344,
                counter_separator_label: "/",
                theme: "pp_default",
                horizontal_padding: 20,
                hideflash: !1,
                wmode: "opaque",
                autoplay: !0,
                modal: !1,
                deeplinking: !0,
                overlay_gallery: !0,
                overlay_gallery_max: 30,
                keyboard_shortcuts: !0,
                changepicturecallback: function () {},
                callback: function () {},
                ie6_fallback: !0,
                markup: '<div class="pp_pic_holder"> \
						<div class="ppt">&nbsp;</div> \
						<div class="pp_top"> \
							<div class="pp_left"></div> \
							<div class="pp_middle"></div> \
							<div class="pp_right"></div> \
						</div> \
						<div class="pp_content_container"> \
							<div class="pp_left"> \
							<div class="pp_right"> \
								<div class="pp_content"> \
									<div class="pp_loaderIcon"></div> \
									<div class="pp_fade"> \
										<a href="#" class="pp_expand" title="Expand the image">Expand</a> \
										<div class="pp_hoverContainer"> \
											<a class="pp_next" href="#">next</a> \
											<a class="pp_previous" href="#">previous</a> \
										</div> \
										<div id="pp_full_res"></div> \
										<div class="pp_details"> \
											<div class="pp_nav"> \
												<a href="#" class="pp_arrow_previous">Previous</a> \
												<p class="currentTextHolder">0/0</p> \
												<a href="#" class="pp_arrow_next">Next</a> \
											</div> \
											<p class="pp_description"></p> \
											<div class="pp_social">{pp_social}</div> \
											<a class="pp_close" href="#">Close</a> \
										</div> \
									</div> \
								</div> \
							</div> \
							</div> \
						</div> \
						<div class="pp_bottom"> \
							<div class="pp_left"></div> \
							<div class="pp_middle"></div> \
							<div class="pp_right"></div> \
						</div> \
					</div> \
					<div class="pp_overlay"></div>',
                gallery_markup:
                    '<div class="pp_gallery"> \
								<a href="#" class="pp_arrow_previous">Previous</a> \
								<div> \
									<ul> \
										{gallery} \
									</ul> \
								</div> \
								<a href="#" class="pp_arrow_next">Next</a> \
							</div>',
                image_markup: '<img id="fullResImage" src="{path}" />',
                flash_markup:
                    '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
                quicktime_markup:
                    '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
                iframe_markup:
                    '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',
                inline_markup: '<div class="pp_inline">{content}</div>',
                custom_markup: "",
                social_tools:
                    '<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&amp;layout=button_count&amp;show_faces=true&amp;width=500&amp;action=like&amp;font&amp;colorscheme=light&amp;height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>',
            },
            pp_settings
        );
        var matchedObjects = this,
            percentBased = !1,
            pp_dimensions,
            pp_open,
            pp_contentHeight,
            pp_contentWidth,
            pp_containerHeight,
            pp_containerWidth,
            windowHeight = $(window).height(),
            windowWidth = $(window).width(),
            pp_slideshow;
        (doresize = !0), (scroll_pos = _get_scroll());
        $(window)
            .unbind("resize.prettyphoto")
            .bind("resize.prettyphoto", function () {
                _center_overlay();
                _resize_overlay();
            });
        if (pp_settings.keyboard_shortcuts) {
            $(document)
                .unbind("keydown.prettyphoto")
                .bind("keydown.prettyphoto", function (e) {
                    if (typeof $pp_pic_holder != "undefined") {
                        if ($pp_pic_holder.is(":visible")) {
                            switch (e.keyCode) {
                                case 37:
                                    $.prettyPhoto.changePage("previous");
                                    e.preventDefault();
                                    break;
                                case 39:
                                    $.prettyPhoto.changePage("next");
                                    e.preventDefault();
                                    break;
                                case 27:
                                    if (!settings.modal) $.prettyPhoto.close();
                                    e.preventDefault();
                                    break;
                            }
                        }
                    }
                });
        }
        $.prettyPhoto.initialize = function () {
            settings = pp_settings;
            if (settings.theme == "pp_default")
                settings.horizontal_padding = 16;
            theRel = $(this).attr(settings.hook);
            galleryRegExp = /\[(?:.*)\]/;
            isSet = galleryRegExp.exec(theRel) ? !0 : !1;
            pp_images = isSet
                ? jQuery.map(matchedObjects, function (n, i) {
                      if ($(n).attr(settings.hook).indexOf(theRel) != -1)
                          return $(n).attr("href");
                  })
                : $.makeArray($(this).attr("href"));
            pp_titles = isSet
                ? jQuery.map(matchedObjects, function (n, i) {
                      if ($(n).attr(settings.hook).indexOf(theRel) != -1)
                          return $(n).find("img").attr("alt")
                              ? $(n).find("img").attr("alt")
                              : "";
                  })
                : $.makeArray($(this).find("img").attr("alt"));
            pp_descriptions = isSet
                ? jQuery.map(matchedObjects, function (n, i) {
                      if ($(n).attr(settings.hook).indexOf(theRel) != -1)
                          return $(n).attr("title") ? $(n).attr("title") : "";
                  })
                : $.makeArray($(this).attr("title"));
            if (pp_images.length > settings.overlay_gallery_max)
                settings.overlay_gallery = !1;
            set_position = jQuery.inArray($(this).attr("href"), pp_images);
            rel_index = isSet
                ? set_position
                : $("a[" + settings.hook + "^='" + theRel + "']").index(
                      $(this)
                  );
            _build_overlay(this);
            if (settings.allow_resize)
                $(window).bind("scroll.prettyphoto", function () {
                    _center_overlay();
                });
            $.prettyPhoto.open();
            return !1;
        };
        $.prettyPhoto.open = function (event) {
            if (typeof settings == "undefined") {
                settings = pp_settings;
                pp_images = $.makeArray(arguments[0]);
                pp_titles = arguments[1]
                    ? $.makeArray(arguments[1])
                    : $.makeArray("");
                pp_descriptions = arguments[2]
                    ? $.makeArray(arguments[2])
                    : $.makeArray("");
                isSet = pp_images.length > 1 ? !0 : !1;
                set_position = arguments[3] ? arguments[3] : 0;
                _build_overlay(event.target);
            }
            if (settings.hideflash)
                $("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css(
                    "visibility",
                    "hidden"
                );
            _checkPosition($(pp_images).size());
            $(".pp_loaderIcon").show();
            if (settings.deeplinking) setHashtag();
            if (settings.social_tools) {
                facebook_like_link = settings.social_tools.replace(
                    "{location_href}",
                    encodeURIComponent(location.href)
                );
                $pp_pic_holder.find(".pp_social").html(facebook_like_link);
            }
            if ($ppt.is(":hidden")) $ppt.css("opacity", 0).show();
            $pp_overlay
                .show()
                .fadeTo(settings.animation_speed, settings.opacity);
            $pp_pic_holder
                .find(".currentTextHolder")
                .text(
                    set_position +
                        1 +
                        settings.counter_separator_label +
                        $(pp_images).size()
                );
            if (
                typeof pp_descriptions[set_position] != "undefined" &&
                pp_descriptions[set_position] != ""
            ) {
                $pp_pic_holder
                    .find(".pp_description")
                    .show()
                    .html(unescape(pp_descriptions[set_position]));
            } else {
                $pp_pic_holder.find(".pp_description").hide();
            }
            movie_width = parseFloat(getParam("width", pp_images[set_position]))
                ? getParam("width", pp_images[set_position])
                : settings.default_width.toString();
            movie_height = parseFloat(
                getParam("height", pp_images[set_position])
            )
                ? getParam("height", pp_images[set_position])
                : settings.default_height.toString();
            percentBased = !1;
            if (movie_height.indexOf("%") != -1) {
                movie_height = parseFloat(
                    ($(window).height() * parseFloat(movie_height)) / 100 - 150
                );
                percentBased = !0;
            }
            if (movie_width.indexOf("%") != -1) {
                movie_width = parseFloat(
                    ($(window).width() * parseFloat(movie_width)) / 100 - 150
                );
                percentBased = !0;
            }
            $pp_pic_holder.fadeIn(function () {
                settings.show_title &&
                pp_titles[set_position] != "" &&
                typeof pp_titles[set_position] != "undefined"
                    ? $ppt.html(unescape(pp_titles[set_position]))
                    : $ppt.html("&nbsp;");
                imgPreloader = "";
                skipInjection = !1;
                switch (_getFileType(pp_images[set_position])) {
                    case "image":
                        imgPreloader = new Image();
                        nextImage = new Image();
                        if (isSet && set_position < $(pp_images).size() - 1)
                            nextImage.src = pp_images[set_position + 1];
                        prevImage = new Image();
                        if (isSet && pp_images[set_position - 1])
                            prevImage.src = pp_images[set_position - 1];
                        $pp_pic_holder.find("#pp_full_res")[0].innerHTML =
                            settings.image_markup.replace(
                                /{path}/g,
                                pp_images[set_position]
                            );
                        imgPreloader.onload = function () {
                            pp_dimensions = _fitToViewport(
                                imgPreloader.width,
                                imgPreloader.height
                            );
                            _showContent();
                        };
                        imgPreloader.onerror = function () {
                            alert(
                                "Image cannot be loaded. Make sure the path is correct and image exist."
                            );
                            $.prettyPhoto.close();
                        };
                        imgPreloader.src = pp_images[set_position];
                        break;
                    case "youtube":
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        movie_id = getParam("v", pp_images[set_position]);
                        if (movie_id == "") {
                            movie_id =
                                pp_images[set_position].split("youtu.be/");
                            movie_id = movie_id[1];
                            if (movie_id.indexOf("?") > 0)
                                movie_id = movie_id.substr(
                                    0,
                                    movie_id.indexOf("?")
                                );
                            if (movie_id.indexOf("&") > 0)
                                movie_id = movie_id.substr(
                                    0,
                                    movie_id.indexOf("&")
                                );
                        }
                        movie = "https://www.youtube.com/embed/" + movie_id;
                        getParam("rel", pp_images[set_position])
                            ? (movie +=
                                  "?rel=" +
                                  getParam("rel", pp_images[set_position]))
                            : (movie += "?rel=1");
                        if (settings.autoplay) movie += "&autoplay=1";
                        toInject = settings.iframe_markup
                            .replace(/{width}/g, pp_dimensions.width)
                            .replace(/{height}/g, pp_dimensions.height)
                            .replace(/{wmode}/g, settings.wmode)
                            .replace(/{path}/g, movie);
                        break;
                    case "vimeo":
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        movie_id = pp_images[set_position];
                        var regExp = /http(s?):\/\/(www\.)?vimeo.com\/(\d+)/;
                        var match = movie_id.match(regExp);
                        movie =
                            "https://player.vimeo.com/video/" +
                            match[3] +
                            "?title=0&amp;byline=0&amp;portrait=0";
                        if (settings.autoplay) movie += "&autoplay=1;";
                        vimeo_width =
                            pp_dimensions.width +
                            "/embed/?moog_width=" +
                            pp_dimensions.width;
                        toInject = settings.iframe_markup
                            .replace(/{width}/g, vimeo_width)
                            .replace(/{height}/g, pp_dimensions.height)
                            .replace(/{path}/g, movie);
                        break;
                    case "quicktime":
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        pp_dimensions.height += 15;
                        pp_dimensions.contentHeight += 15;
                        pp_dimensions.containerHeight += 15;
                        toInject = settings.quicktime_markup
                            .replace(/{width}/g, pp_dimensions.width)
                            .replace(/{height}/g, pp_dimensions.height)
                            .replace(/{wmode}/g, settings.wmode)
                            .replace(/{path}/g, pp_images[set_position])
                            .replace(/{autoplay}/g, settings.autoplay);
                        break;
                    case "flash":
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        flash_vars = pp_images[set_position];
                        flash_vars = flash_vars.substring(
                            pp_images[set_position].indexOf("flashvars") + 10,
                            pp_images[set_position].length
                        );
                        filename = pp_images[set_position];
                        filename = filename.substring(0, filename.indexOf("?"));
                        toInject = settings.flash_markup
                            .replace(/{width}/g, pp_dimensions.width)
                            .replace(/{height}/g, pp_dimensions.height)
                            .replace(/{wmode}/g, settings.wmode)
                            .replace(/{path}/g, filename + "?" + flash_vars);
                        break;
                    case "iframe":
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        frame_url = pp_images[set_position];
                        frame_url = frame_url.substr(
                            0,
                            frame_url.indexOf("iframe") - 1
                        );
                        toInject = settings.iframe_markup
                            .replace(/{width}/g, pp_dimensions.width)
                            .replace(/{height}/g, pp_dimensions.height)
                            .replace(/{path}/g, frame_url);
                        break;
                    case "ajax":
                        doresize = !1;
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        doresize = !0;
                        skipInjection = !0;
                        $.get(pp_images[set_position], function (responseHTML) {
                            toInject = settings.inline_markup.replace(
                                /{content}/g,
                                responseHTML
                            );
                            $pp_pic_holder.find("#pp_full_res")[0].innerHTML =
                                toInject;
                            _showContent();
                        });
                        break;
                    case "custom":
                        pp_dimensions = _fitToViewport(
                            movie_width,
                            movie_height
                        );
                        toInject = settings.custom_markup;
                        break;
                    case "inline":
                        myClone = $(pp_images[set_position])
                            .clone()
                            .append('<br clear="all" />')
                            .css({ width: settings.default_width })
                            .wrapInner(
                                '<div id="pp_full_res"><div class="pp_inline"></div></div>'
                            )
                            .appendTo($("body"))
                            .show();
                        doresize = !1;
                        pp_dimensions = _fitToViewport(
                            $(myClone).width(),
                            $(myClone).height()
                        );
                        doresize = !0;
                        $(myClone).remove();
                        toInject = settings.inline_markup.replace(
                            /{content}/g,
                            $(pp_images[set_position]).html()
                        );
                        break;
                }
                if (!imgPreloader && !skipInjection) {
                    $pp_pic_holder.find("#pp_full_res")[0].innerHTML = toInject;
                    _showContent();
                }
            });
            return !1;
        };
        $.prettyPhoto.changePage = function (direction) {
            currentGalleryPage = 0;
            if (direction == "previous") {
                set_position--;
                if (set_position < 0) set_position = $(pp_images).size() - 1;
            } else if (direction == "next") {
                set_position++;
                if (set_position > $(pp_images).size() - 1) set_position = 0;
            } else {
                set_position = direction;
            }
            rel_index = set_position;
            if (!doresize) doresize = !0;
            if (settings.allow_expand) {
                $(".pp_contract")
                    .removeClass("pp_contract")
                    .addClass("pp_expand");
            }
            _hideContent(function () {
                $.prettyPhoto.open();
            });
        };
        $.prettyPhoto.changeGalleryPage = function (direction) {
            if (direction == "next") {
                currentGalleryPage++;
                if (currentGalleryPage > totalPage) currentGalleryPage = 0;
            } else if (direction == "previous") {
                currentGalleryPage--;
                if (currentGalleryPage < 0) currentGalleryPage = totalPage;
            } else {
                currentGalleryPage = direction;
            }
            slide_speed =
                direction == "next" || direction == "previous"
                    ? settings.animation_speed
                    : 0;
            slide_to = currentGalleryPage * (itemsPerPage * itemWidth);
            $pp_gallery.find("ul").animate({ left: -slide_to }, slide_speed);
        };
        $.prettyPhoto.startSlideshow = function () {
            if (typeof pp_slideshow == "undefined") {
                $pp_pic_holder
                    .find(".pp_play")
                    .unbind("click")
                    .removeClass("pp_play")
                    .addClass("pp_pause")
                    .click(function () {
                        $.prettyPhoto.stopSlideshow();
                        return !1;
                    });
                pp_slideshow = setInterval(
                    $.prettyPhoto.startSlideshow,
                    settings.slideshow
                );
            } else {
                $.prettyPhoto.changePage("next");
            }
        };
        $.prettyPhoto.stopSlideshow = function () {
            $pp_pic_holder
                .find(".pp_pause")
                .unbind("click")
                .removeClass("pp_pause")
                .addClass("pp_play")
                .click(function () {
                    $.prettyPhoto.startSlideshow();
                    return !1;
                });
            clearInterval(pp_slideshow);
            pp_slideshow = undefined;
        };
        $.prettyPhoto.close = function () {
            if ($pp_overlay.is(":animated")) return;
            $.prettyPhoto.stopSlideshow();
            $pp_pic_holder
                .stop()
                .find("object,embed")
                .css("visibility", "hidden");
            $("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(
                settings.animation_speed,
                function () {
                    $(this).remove();
                }
            );
            $pp_overlay.fadeOut(settings.animation_speed, function () {
                if (settings.hideflash)
                    $(
                        "object,embed,iframe[src*=youtube],iframe[src*=vimeo]"
                    ).css("visibility", "visible");
                $(this).remove();
                $(window).unbind("scroll.prettyphoto");
                clearHashtag();
                settings.callback();
                doresize = !0;
                pp_open = !1;
                delete settings;
            });
        };
        function _showContent() {
            $(".pp_loaderIcon").hide();
            projectedTop =
                scroll_pos.scrollTop +
                (windowHeight / 2 - pp_dimensions.containerHeight / 2);
            if (projectedTop < 0) projectedTop = 0;
            $ppt.fadeTo(settings.animation_speed, 1);
            $pp_pic_holder
                .find(".pp_content")
                .animate(
                    {
                        height: pp_dimensions.contentHeight,
                        width: pp_dimensions.contentWidth,
                    },
                    settings.animation_speed
                );
            $pp_pic_holder.animate(
                {
                    top: projectedTop,
                    left:
                        windowWidth / 2 - pp_dimensions.containerWidth / 2 < 0
                            ? 0
                            : windowWidth / 2 -
                              pp_dimensions.containerWidth / 2,
                    width: pp_dimensions.containerWidth,
                },
                settings.animation_speed,
                function () {
                    $pp_pic_holder
                        .find(".pp_hoverContainer,#fullResImage")
                        .height(pp_dimensions.height)
                        .width(pp_dimensions.width);
                    $pp_pic_holder
                        .find(".pp_fade")
                        .fadeIn(settings.animation_speed);
                    if (
                        isSet &&
                        _getFileType(pp_images[set_position]) == "image"
                    ) {
                        $pp_pic_holder.find(".pp_hoverContainer").show();
                    } else {
                        $pp_pic_holder.find(".pp_hoverContainer").hide();
                    }
                    if (settings.allow_expand) {
                        if (pp_dimensions.resized) {
                            $("a.pp_expand,a.pp_contract").show();
                        } else {
                            $("a.pp_expand").hide();
                        }
                    }
                    if (
                        settings.autoplay_slideshow &&
                        !pp_slideshow &&
                        !pp_open
                    )
                        $.prettyPhoto.startSlideshow();
                    settings.changepicturecallback();
                    pp_open = !0;
                }
            );
            _insert_gallery();
            pp_settings.ajaxcallback();
        }
        function _hideContent(callback) {
            $pp_pic_holder
                .find("#pp_full_res object,#pp_full_res embed")
                .css("visibility", "hidden");
            $pp_pic_holder
                .find(".pp_fade")
                .fadeOut(settings.animation_speed, function () {
                    $(".pp_loaderIcon").show();
                    callback();
                });
        }
        function _checkPosition(setCount) {
            setCount > 1 ? $(".pp_nav").show() : $(".pp_nav").hide();
        }
        function _fitToViewport(width, height) {
            resized = !1;
            _getDimensions(width, height);
            (imageWidth = width), (imageHeight = height);
            if (
                (pp_containerWidth > windowWidth ||
                    pp_containerHeight > windowHeight) &&
                doresize &&
                settings.allow_resize &&
                !percentBased
            ) {
                (resized = !0), (fitting = !1);
                while (!fitting) {
                    if (pp_containerWidth > windowWidth) {
                        imageWidth = windowWidth - 200;
                        imageHeight = (height / width) * imageWidth;
                    } else if (pp_containerHeight > windowHeight) {
                        imageHeight = windowHeight - 200;
                        imageWidth = (width / height) * imageHeight;
                    } else {
                        fitting = !0;
                    }
                    (pp_containerHeight = imageHeight),
                        (pp_containerWidth = imageWidth);
                }
                if (
                    pp_containerWidth > windowWidth ||
                    pp_containerHeight > windowHeight
                ) {
                    _fitToViewport(pp_containerWidth, pp_containerHeight);
                }
                _getDimensions(imageWidth, imageHeight);
            }
            return {
                width: Math.floor(imageWidth),
                height: Math.floor(imageHeight),
                containerHeight: Math.floor(pp_containerHeight),
                containerWidth:
                    Math.floor(pp_containerWidth) +
                    settings.horizontal_padding * 2,
                contentHeight: Math.floor(pp_contentHeight),
                contentWidth: Math.floor(pp_contentWidth),
                resized: resized,
            };
        }
        function _getDimensions(width, height) {
            width = parseFloat(width);
            height = parseFloat(height);
            $pp_details = $pp_pic_holder.find(".pp_details");
            $pp_details.width(width);
            detailsHeight =
                parseFloat($pp_details.css("marginTop")) +
                parseFloat($pp_details.css("marginBottom"));
            $pp_details = $pp_details
                .clone()
                .addClass(settings.theme)
                .width(width)
                .appendTo($("body"))
                .css({ position: "absolute", top: -10000 });
            detailsHeight += $pp_details.height();
            detailsHeight = detailsHeight <= 34 ? 36 : detailsHeight;
            $pp_details.remove();
            $pp_title = $pp_pic_holder.find(".ppt");
            $pp_title.width(width);
            titleHeight =
                parseFloat($pp_title.css("marginTop")) +
                parseFloat($pp_title.css("marginBottom"));
            $pp_title = $pp_title
                .clone()
                .appendTo($("body"))
                .css({ position: "absolute", top: -10000 });
            titleHeight += $pp_title.height();
            $pp_title.remove();
            pp_contentHeight = height + detailsHeight;
            pp_contentWidth = width;
            pp_containerHeight =
                pp_contentHeight +
                titleHeight +
                $pp_pic_holder.find(".pp_top").height() +
                $pp_pic_holder.find(".pp_bottom").height();
            pp_containerWidth = width;
        }
        function _getFileType(itemSrc) {
            if (
                itemSrc.match(/youtube\.com\/watch/i) ||
                itemSrc.match(/youtu\.be/i)
            ) {
                return "youtube";
            } else if (itemSrc.match(/vimeo\.com/i)) {
                return "vimeo";
            } else if (itemSrc.match(/\b.mov\b/i)) {
                return "quicktime";
            } else if (itemSrc.match(/\b.swf\b/i)) {
                return "flash";
            } else if (itemSrc.match(/\biframe=true\b/i)) {
                return "iframe";
            } else if (itemSrc.match(/\bajax=true\b/i)) {
                return "ajax";
            } else if (itemSrc.match(/\bcustom=true\b/i)) {
                return "custom";
            } else if (itemSrc.substr(0, 1) == "#") {
                return "inline";
            } else {
                return "image";
            }
        }
        function _center_overlay() {
            if (doresize && typeof $pp_pic_holder != "undefined") {
                scroll_pos = _get_scroll();
                (contentHeight = $pp_pic_holder.height()),
                    (contentwidth = $pp_pic_holder.width());
                projectedTop =
                    windowHeight / 2 + scroll_pos.scrollTop - contentHeight / 2;
                if (projectedTop < 0) projectedTop = 0;
                if (contentHeight > windowHeight) return;
                $pp_pic_holder.css({
                    top: projectedTop,
                    left:
                        windowWidth / 2 +
                        scroll_pos.scrollLeft -
                        contentwidth / 2,
                });
            }
        }
        function _get_scroll() {
            if (self.pageYOffset) {
                return {
                    scrollTop: self.pageYOffset,
                    scrollLeft: self.pageXOffset,
                };
            } else if (
                document.documentElement &&
                document.documentElement.scrollTop
            ) {
                return {
                    scrollTop: document.documentElement.scrollTop,
                    scrollLeft: document.documentElement.scrollLeft,
                };
            } else if (document.body) {
                return {
                    scrollTop: document.body.scrollTop,
                    scrollLeft: document.body.scrollLeft,
                };
            }
        }
        function _resize_overlay() {
            (windowHeight = $(window).height()),
                (windowWidth = $(window).width());
            if (typeof $pp_overlay != "undefined")
                $pp_overlay.height($(document).height()).width(windowWidth);
        }
        function _insert_gallery() {
            if (
                isSet &&
                settings.overlay_gallery &&
                _getFileType(pp_images[set_position]) == "image"
            ) {
                itemWidth = 52 + 5;
                navWidth =
                    settings.theme == "facebook" ||
                    settings.theme == "pp_default"
                        ? 50
                        : 30;
                itemsPerPage = Math.floor(
                    (pp_dimensions.containerWidth - 100 - navWidth) / itemWidth
                );
                itemsPerPage =
                    itemsPerPage < pp_images.length
                        ? itemsPerPage
                        : pp_images.length;
                totalPage = Math.ceil(pp_images.length / itemsPerPage) - 1;
                if (totalPage == 0) {
                    navWidth = 0;
                    $pp_gallery
                        .find(".pp_arrow_next,.pp_arrow_previous")
                        .hide();
                } else {
                    $pp_gallery
                        .find(".pp_arrow_next,.pp_arrow_previous")
                        .show();
                }
                galleryWidth = itemsPerPage * itemWidth;
                fullGalleryWidth = pp_images.length * itemWidth;
                $pp_gallery
                    .css("margin-left", -(galleryWidth / 2 + navWidth / 2))
                    .find("div:first")
                    .width(galleryWidth + 5)
                    .find("ul")
                    .width(fullGalleryWidth)
                    .find("li.selected")
                    .removeClass("selected");
                goToPage =
                    Math.floor(set_position / itemsPerPage) < totalPage
                        ? Math.floor(set_position / itemsPerPage)
                        : totalPage;
                $.prettyPhoto.changeGalleryPage(goToPage);
                $pp_gallery_li
                    .filter(":eq(" + set_position + ")")
                    .addClass("selected");
            } else {
                $pp_pic_holder
                    .find(".pp_content")
                    .unbind("mouseenter mouseleave");
            }
        }
        function _build_overlay(caller) {
            if (settings.social_tools)
                facebook_like_link = settings.social_tools.replace(
                    "{location_href}",
                    encodeURIComponent(location.href)
                );
            settings.markup = settings.markup.replace("{pp_social}", "");
            $("body").append(settings.markup);
            ($pp_pic_holder = $(".pp_pic_holder")),
                ($ppt = $(".ppt")),
                ($pp_overlay = $("div.pp_overlay"));
            if (isSet && settings.overlay_gallery) {
                currentGalleryPage = 0;
                toInject = "";
                for (var i = 0; i < pp_images.length; i++) {
                    if (!pp_images[i].match(/\b(jpg|jpeg|png|gif)\b/gi)) {
                        classname = "default";
                        img_src = "";
                    } else {
                        classname = "";
                        img_src = pp_images[i];
                    }
                    toInject +=
                        "<li class='" +
                        classname +
                        "'><a href='#'><img src='" +
                        img_src +
                        "' width='50' alt='' /></a></li>";
                }
                toInject = settings.gallery_markup.replace(
                    /{gallery}/g,
                    toInject
                );
                $pp_pic_holder.find("#pp_full_res").after(toInject);
                ($pp_gallery = $(".pp_pic_holder .pp_gallery")),
                    ($pp_gallery_li = $pp_gallery.find("li"));
                $pp_gallery.find(".pp_arrow_next").click(function () {
                    $.prettyPhoto.changeGalleryPage("next");
                    $.prettyPhoto.stopSlideshow();
                    return !1;
                });
                $pp_gallery.find(".pp_arrow_previous").click(function () {
                    $.prettyPhoto.changeGalleryPage("previous");
                    $.prettyPhoto.stopSlideshow();
                    return !1;
                });
                $pp_pic_holder.find(".pp_content").hover(
                    function () {
                        $pp_pic_holder
                            .find(".pp_gallery:not(.disabled)")
                            .fadeIn();
                    },
                    function () {
                        $pp_pic_holder
                            .find(".pp_gallery:not(.disabled)")
                            .fadeOut();
                    }
                );
                itemWidth = 52 + 5;
                $pp_gallery_li.each(function (i) {
                    $(this)
                        .find("a")
                        .click(function () {
                            $.prettyPhoto.changePage(i);
                            $.prettyPhoto.stopSlideshow();
                            return !1;
                        });
                });
            }
            if (settings.slideshow) {
                $pp_pic_holder
                    .find(".pp_nav")
                    .prepend('<a href="#" class="pp_play">Play</a>');
                $pp_pic_holder.find(".pp_nav .pp_play").click(function () {
                    $.prettyPhoto.startSlideshow();
                    return !1;
                });
            }
            $pp_pic_holder.attr("class", "pp_pic_holder " + settings.theme);
            $pp_overlay
                .css({
                    opacity: 0,
                    height: $(document).height(),
                    width: $(window).width(),
                })
                .bind("click", function () {
                    if (!settings.modal) $.prettyPhoto.close();
                });
            $("a.pp_close").bind("click", function () {
                $.prettyPhoto.close();
                return !1;
            });
            if (settings.allow_expand) {
                $("a.pp_expand").bind("click", function (e) {
                    if ($(this).hasClass("pp_expand")) {
                        $(this)
                            .removeClass("pp_expand")
                            .addClass("pp_contract");
                        doresize = !1;
                    } else {
                        $(this)
                            .removeClass("pp_contract")
                            .addClass("pp_expand");
                        doresize = !0;
                    }
                    _hideContent(function () {
                        $.prettyPhoto.open();
                    });
                    return !1;
                });
            }
            $pp_pic_holder
                .find(".pp_previous, .pp_nav .pp_arrow_previous")
                .bind("click", function () {
                    $.prettyPhoto.changePage("previous");
                    $.prettyPhoto.stopSlideshow();
                    return !1;
                });
            $pp_pic_holder
                .find(".pp_next, .pp_nav .pp_arrow_next")
                .bind("click", function () {
                    $.prettyPhoto.changePage("next");
                    $.prettyPhoto.stopSlideshow();
                    return !1;
                });
            _center_overlay();
        }
        if (!pp_alreadyInitialized && getHashtag()) {
            pp_alreadyInitialized = !0;
            hashIndex = getHashtag();
            hashRel = hashIndex;
            hashIndex = hashIndex.substring(
                hashIndex.indexOf("/") + 1,
                hashIndex.length - 1
            );
            hashRel = hashRel.substring(0, hashRel.indexOf("/"));
            setTimeout(function () {
                $(
                    "a[" +
                        pp_settings.hook +
                        "^='" +
                        hashRel +
                        "']:eq(" +
                        hashIndex +
                        ")"
                ).trigger("click");
            }, 50);
        }
        return this.unbind("click.prettyphoto").bind(
            "click.prettyphoto",
            $.prettyPhoto.initialize
        );
    };
    function getHashtag() {
        var url = location.href;
        hashtag =
            url.indexOf("#prettyPhoto") !== -1
                ? decodeURI(
                      url.substring(url.indexOf("#prettyPhoto") + 1, url.length)
                  )
                : !1;
        if (hashtag) {
            hashtag = hashtag.replace(/<|>/g, "");
        }
        return hashtag;
    }
    function setHashtag() {
        if (typeof theRel == "undefined") return;
        location.hash = theRel + "/" + rel_index + "/";
    }
    function clearHashtag() {
        if (location.href.indexOf("#prettyPhoto") !== -1)
            location.hash = "prettyPhoto";
    }
    function getParam(name, url) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? "" : results[1];
    }
})(jQuery);
var pp_alreadyInitialized = !1;
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(function ($) {
    var CountTo = function (element, options) {
        this.$element = $(element);
        this.options = $.extend(
            {},
            CountTo.DEFAULTS,
            this.dataOptions(),
            options
        );
        this.init();
    };
    CountTo.DEFAULTS = {
        from: 0,
        to: 0,
        speed: 1000,
        refreshInterval: 100,
        decimals: 0,
        formatter: formatter,
        onUpdate: null,
        onComplete: null,
    };
    CountTo.prototype.init = function () {
        this.value = this.options.from;
        this.loops = Math.ceil(
            this.options.speed / this.options.refreshInterval
        );
        this.loopCount = 0;
        this.increment = (this.options.to - this.options.from) / this.loops;
    };
    CountTo.prototype.dataOptions = function () {
        var options = {
            from: this.$element.data("from"),
            to: this.$element.data("to"),
            speed: this.$element.data("speed"),
            refreshInterval: this.$element.data("refresh-interval"),
            decimals: this.$element.data("decimals"),
        };
        var keys = Object.keys(options);
        for (var i in keys) {
            var key = keys[i];
            if (typeof options[key] === "undefined") {
                delete options[key];
            }
        }
        return options;
    };
    CountTo.prototype.update = function () {
        this.value += this.increment;
        this.loopCount++;
        this.render();
        if (typeof this.options.onUpdate == "function") {
            this.options.onUpdate.call(this.$element, this.value);
        }
        if (this.loopCount >= this.loops) {
            clearInterval(this.interval);
            this.value = this.options.to;
            if (typeof this.options.onComplete == "function") {
                this.options.onComplete.call(this.$element, this.value);
            }
        }
    };
    CountTo.prototype.render = function () {
        var formattedValue = this.options.formatter.call(
            this.$element,
            this.value,
            this.options
        );
        this.$element.text(formattedValue);
    };
    CountTo.prototype.restart = function () {
        this.stop();
        this.init();
        this.start();
    };
    CountTo.prototype.start = function () {
        this.stop();
        this.render();
        this.interval = setInterval(
            this.update.bind(this),
            this.options.refreshInterval
        );
    };
    CountTo.prototype.stop = function () {
        if (this.interval) {
            clearInterval(this.interval);
        }
    };
    CountTo.prototype.toggle = function () {
        if (this.interval) {
            this.stop();
        } else {
            this.start();
        }
    };
    function formatter(value, options) {
        return value.toFixed(options.decimals);
    }
    $.fn.countTo = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data("countTo");
            var init = !data || typeof option === "object";
            var options = typeof option === "object" ? option : {};
            var method = typeof option === "string" ? option : "start";
            if (init) {
                if (data) data.stop();
                $this.data("countTo", (data = new CountTo(this, options)));
            }
            data[method].call(data);
        });
    };
});
(function (factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(function ($) {
    var _previousResizeWidth = -1,
        _updateTimeout = -1;
    var _parse = function (value) {
        return parseFloat(value) || 0;
    };
    var _rows = function (elements) {
        var tolerance = 1,
            $elements = $(elements),
            lastTop = null,
            rows = [];
        $elements.each(function () {
            var $that = $(this),
                top = $that.offset().top - _parse($that.css("margin-top")),
                lastRow = rows.length > 0 ? rows[rows.length - 1] : null;
            if (lastRow === null) {
                rows.push($that);
            } else {
                if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                    rows[rows.length - 1] = lastRow.add($that);
                } else {
                    rows.push($that);
                }
            }
            lastTop = top;
        });
        return rows;
    };
    var _parseOptions = function (options) {
        var opts = { byRow: !0, property: "height", target: null, remove: !1 };
        if (typeof options === "object") {
            return $.extend(opts, options);
        }
        if (typeof options === "boolean") {
            opts.byRow = options;
        } else if (options === "remove") {
            opts.remove = !0;
        }
        return opts;
    };
    var matchHeight = ($.fn.matchHeight = function (options) {
        var opts = _parseOptions(options);
        if (opts.remove) {
            var that = this;
            this.css(opts.property, "");
            $.each(matchHeight._groups, function (key, group) {
                group.elements = group.elements.not(that);
            });
            return this;
        }
        if (this.length <= 1 && !opts.target) {
            return this;
        }
        matchHeight._groups.push({ elements: this, options: opts });
        matchHeight._apply(this, opts);
        return this;
    });
    matchHeight.version = "0.7.2";
    matchHeight._groups = [];
    matchHeight._throttle = 80;
    matchHeight._maintainScroll = !1;
    matchHeight._beforeUpdate = null;
    matchHeight._afterUpdate = null;
    matchHeight._rows = _rows;
    matchHeight._parse = _parse;
    matchHeight._parseOptions = _parseOptions;
    matchHeight._apply = function (elements, options) {
        var opts = _parseOptions(options),
            $elements = $(elements),
            rows = [$elements];
        var scrollTop = $(window).scrollTop(),
            htmlHeight = $("html").outerHeight(!0);
        var $hiddenParents = $elements.parents().filter(":hidden");
        $hiddenParents.each(function () {
            var $that = $(this);
            $that.data("style-cache", $that.attr("style"));
        });
        $hiddenParents.css("display", "block");
        if (opts.byRow && !opts.target) {
            $elements.each(function () {
                var $that = $(this),
                    display = $that.css("display");
                if (
                    display !== "inline-block" &&
                    display !== "flex" &&
                    display !== "inline-flex"
                ) {
                    display = "block";
                }
                $that.data("style-cache", $that.attr("style"));
                $that.css({
                    display: display,
                    "padding-top": "0",
                    "padding-bottom": "0",
                    "margin-top": "0",
                    "margin-bottom": "0",
                    "border-top-width": "0",
                    "border-bottom-width": "0",
                    height: "100px",
                    overflow: "hidden",
                });
            });
            rows = _rows($elements);
            $elements.each(function () {
                var $that = $(this);
                $that.attr("style", $that.data("style-cache") || "");
            });
        }
        $.each(rows, function (key, row) {
            var $row = $(row),
                targetHeight = 0;
            if (!opts.target) {
                if (opts.byRow && $row.length <= 1) {
                    $row.css(opts.property, "");
                    return;
                }
                $row.each(function () {
                    var $that = $(this),
                        style = $that.attr("style"),
                        display = $that.css("display");
                    if (
                        display !== "inline-block" &&
                        display !== "flex" &&
                        display !== "inline-flex"
                    ) {
                        display = "block";
                    }
                    var css = { display: display };
                    css[opts.property] = "";
                    $that.css(css);
                    if ($that.outerHeight(!1) > targetHeight) {
                        targetHeight = $that.outerHeight(!1);
                    }
                    if (style) {
                        $that.attr("style", style);
                    } else {
                        $that.css("display", "");
                    }
                });
            } else {
                targetHeight = opts.target.outerHeight(!1);
            }
            $row.each(function () {
                var $that = $(this),
                    verticalPadding = 0;
                if (opts.target && $that.is(opts.target)) {
                    return;
                }
                if ($that.css("box-sizing") !== "border-box") {
                    verticalPadding +=
                        _parse($that.css("border-top-width")) +
                        _parse($that.css("border-bottom-width"));
                    verticalPadding +=
                        _parse($that.css("padding-top")) +
                        _parse($that.css("padding-bottom"));
                }
                $that.css(opts.property, targetHeight - verticalPadding + "px");
            });
        });
        $hiddenParents.each(function () {
            var $that = $(this);
            $that.attr("style", $that.data("style-cache") || null);
        });
        if (matchHeight._maintainScroll) {
            $(window).scrollTop(
                (scrollTop / htmlHeight) * $("html").outerHeight(!0)
            );
        }
        return this;
    };
    matchHeight._applyDataApi = function () {
        var groups = {};
        $("[data-match-height], [data-mh]").each(function () {
            var $this = $(this),
                groupId =
                    $this.attr("data-mh") || $this.attr("data-match-height");
            if (groupId in groups) {
                groups[groupId] = groups[groupId].add($this);
            } else {
                groups[groupId] = $this;
            }
        });
        $.each(groups, function () {
            this.matchHeight(!0);
        });
    };
    var _update = function (event) {
        if (matchHeight._beforeUpdate) {
            matchHeight._beforeUpdate(event, matchHeight._groups);
        }
        $.each(matchHeight._groups, function () {
            matchHeight._apply(this.elements, this.options);
        });
        if (matchHeight._afterUpdate) {
            matchHeight._afterUpdate(event, matchHeight._groups);
        }
    };
    matchHeight._update = function (throttle, event) {
        if (event && event.type === "resize") {
            var windowWidth = $(window).width();
            if (windowWidth === _previousResizeWidth) {
                return;
            }
            _previousResizeWidth = windowWidth;
        }
        if (!throttle) {
            _update(event);
        } else if (_updateTimeout === -1) {
            _updateTimeout = setTimeout(function () {
                _update(event);
                _updateTimeout = -1;
            }, matchHeight._throttle);
        }
    };
    $(matchHeight._applyDataApi);
    var on = $.fn.on ? "on" : "bind";
    $(window)[on]("load", function (event) {
        matchHeight._update(!1, event);
    });
    $(window)[on]("resize orientationchange", function (event) {
        matchHeight._update(!0, event);
    });
});

var _gsScope =
    "undefined" != typeof module &&
    module.exports &&
    "undefined" != typeof global
        ? global
        : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
    "use strict";
    _gsScope._gsDefine(
        "easing.Back",
        ["easing.Ease"],
        function (t) {
            var e,
                i,
                s,
                r = _gsScope.GreenSockGlobals || _gsScope,
                n = r.com.greensock,
                a = 2 * Math.PI,
                o = Math.PI / 2,
                h = n._class,
                l = function (e, i) {
                    var s = h("easing." + e, function () {}, !0),
                        r = (s.prototype = new t());
                    return (r.constructor = s), (r.getRatio = i), s;
                },
                _ = t.register || function () {},
                u = function (t, e, i, s) {
                    var r = h(
                        "easing." + t,
                        {
                            easeOut: new e(),
                            easeIn: new i(),
                            easeInOut: new s(),
                        },
                        !0
                    );
                    return _(r, t), r;
                },
                c = function (t, e, i) {
                    (this.t = t),
                        (this.v = e),
                        i &&
                            ((this.next = i),
                            (i.prev = this),
                            (this.c = i.v - e),
                            (this.gap = i.t - t));
                },
                p = function (e, i) {
                    var s = h(
                            "easing." + e,
                            function (t) {
                                (this._p1 = t || 0 === t ? t : 1.70158),
                                    (this._p2 = 1.525 * this._p1);
                            },
                            !0
                        ),
                        r = (s.prototype = new t());
                    return (
                        (r.constructor = s),
                        (r.getRatio = i),
                        (r.config = function (t) {
                            return new s(t);
                        }),
                        s
                    );
                },
                f = u(
                    "Back",
                    p("BackOut", function (t) {
                        return (
                            (t -= 1) * t * ((this._p1 + 1) * t + this._p1) + 1
                        );
                    }),
                    p("BackIn", function (t) {
                        return t * t * ((this._p1 + 1) * t - this._p1);
                    }),
                    p("BackInOut", function (t) {
                        return 1 > (t *= 2)
                            ? 0.5 * t * t * ((this._p2 + 1) * t - this._p2)
                            : 0.5 *
                                  ((t -= 2) *
                                      t *
                                      ((this._p2 + 1) * t + this._p2) +
                                      2);
                    })
                ),
                m = h(
                    "easing.SlowMo",
                    function (t, e, i) {
                        (e = e || 0 === e ? e : 0.7),
                            null == t ? (t = 0.7) : t > 1 && (t = 1),
                            (this._p = 1 !== t ? e : 0),
                            (this._p1 = (1 - t) / 2),
                            (this._p2 = t),
                            (this._p3 = this._p1 + this._p2),
                            (this._calcEnd = i === !0);
                    },
                    !0
                ),
                d = (m.prototype = new t());
            return (
                (d.constructor = m),
                (d.getRatio = function (t) {
                    var e = t + (0.5 - t) * this._p;
                    return this._p1 > t
                        ? this._calcEnd
                            ? 1 - (t = 1 - t / this._p1) * t
                            : e - (t = 1 - t / this._p1) * t * t * t * e
                        : t > this._p3
                        ? this._calcEnd
                            ? 1 - (t = (t - this._p3) / this._p1) * t
                            : e +
                              (t - e) *
                                  (t = (t - this._p3) / this._p1) *
                                  t *
                                  t *
                                  t
                        : this._calcEnd
                        ? 1
                        : e;
                }),
                (m.ease = new m(0.7, 0.7)),
                (d.config = m.config =
                    function (t, e, i) {
                        return new m(t, e, i);
                    }),
                (e = h(
                    "easing.SteppedEase",
                    function (t) {
                        (t = t || 1), (this._p1 = 1 / t), (this._p2 = t + 1);
                    },
                    !0
                )),
                (d = e.prototype = new t()),
                (d.constructor = e),
                (d.getRatio = function (t) {
                    return (
                        0 > t ? (t = 0) : t >= 1 && (t = 0.999999999),
                        ((this._p2 * t) >> 0) * this._p1
                    );
                }),
                (d.config = e.config =
                    function (t) {
                        return new e(t);
                    }),
                (i = h(
                    "easing.RoughEase",
                    function (e) {
                        e = e || {};
                        for (
                            var i,
                                s,
                                r,
                                n,
                                a,
                                o,
                                h = e.taper || "none",
                                l = [],
                                _ = 0,
                                u = 0 | (e.points || 20),
                                p = u,
                                f = e.randomize !== !1,
                                m = e.clamp === !0,
                                d = e.template instanceof t ? e.template : null,
                                g =
                                    "number" == typeof e.strength
                                        ? 0.4 * e.strength
                                        : 0.4;
                            --p > -1;

                        )
                            (i = f ? Math.random() : (1 / u) * p),
                                (s = d ? d.getRatio(i) : i),
                                "none" === h
                                    ? (r = g)
                                    : "out" === h
                                    ? ((n = 1 - i), (r = n * n * g))
                                    : "in" === h
                                    ? (r = i * i * g)
                                    : 0.5 > i
                                    ? ((n = 2 * i), (r = 0.5 * n * n * g))
                                    : ((n = 2 * (1 - i)),
                                      (r = 0.5 * n * n * g)),
                                f
                                    ? (s += Math.random() * r - 0.5 * r)
                                    : p % 2
                                    ? (s += 0.5 * r)
                                    : (s -= 0.5 * r),
                                m && (s > 1 ? (s = 1) : 0 > s && (s = 0)),
                                (l[_++] = { x: i, y: s });
                        for (
                            l.sort(function (t, e) {
                                return t.x - e.x;
                            }),
                                o = new c(1, 1, null),
                                p = u;
                            --p > -1;

                        )
                            (a = l[p]), (o = new c(a.x, a.y, o));
                        this._prev = new c(0, 0, 0 !== o.t ? o : o.next);
                    },
                    !0
                )),
                (d = i.prototype = new t()),
                (d.constructor = i),
                (d.getRatio = function (t) {
                    var e = this._prev;
                    if (t > e.t) {
                        for (; e.next && t >= e.t; ) e = e.next;
                        e = e.prev;
                    } else for (; e.prev && e.t >= t; ) e = e.prev;
                    return (this._prev = e), e.v + ((t - e.t) / e.gap) * e.c;
                }),
                (d.config = function (t) {
                    return new i(t);
                }),
                (i.ease = new i()),
                u(
                    "Bounce",
                    l("BounceOut", function (t) {
                        return 1 / 2.75 > t
                            ? 7.5625 * t * t
                            : 2 / 2.75 > t
                            ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
                            : 2.5 / 2.75 > t
                            ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
                            : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                    }),
                    l("BounceIn", function (t) {
                        return 1 / 2.75 > (t = 1 - t)
                            ? 1 - 7.5625 * t * t
                            : 2 / 2.75 > t
                            ? 1 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75)
                            : 2.5 / 2.75 > t
                            ? 1 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375)
                            : 1 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
                    }),
                    l("BounceInOut", function (t) {
                        var e = 0.5 > t;
                        return (
                            (t = e ? 1 - 2 * t : 2 * t - 1),
                            (t =
                                1 / 2.75 > t
                                    ? 7.5625 * t * t
                                    : 2 / 2.75 > t
                                    ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
                                    : 2.5 / 2.75 > t
                                    ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
                                    : 7.5625 * (t -= 2.625 / 2.75) * t +
                                      0.984375),
                            e ? 0.5 * (1 - t) : 0.5 * t + 0.5
                        );
                    })
                ),
                u(
                    "Circ",
                    l("CircOut", function (t) {
                        return Math.sqrt(1 - (t -= 1) * t);
                    }),
                    l("CircIn", function (t) {
                        return -(Math.sqrt(1 - t * t) - 1);
                    }),
                    l("CircInOut", function (t) {
                        return 1 > (t *= 2)
                            ? -0.5 * (Math.sqrt(1 - t * t) - 1)
                            : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
                    })
                ),
                (s = function (e, i, s) {
                    var r = h(
                            "easing." + e,
                            function (t, e) {
                                (this._p1 = t || 1),
                                    (this._p2 = e || s),
                                    (this._p3 =
                                        (this._p2 / a) *
                                        (Math.asin(1 / this._p1) || 0));
                            },
                            !0
                        ),
                        n = (r.prototype = new t());
                    return (
                        (n.constructor = r),
                        (n.getRatio = i),
                        (n.config = function (t, e) {
                            return new r(t, e);
                        }),
                        r
                    );
                }),
                u(
                    "Elastic",
                    s(
                        "ElasticOut",
                        function (t) {
                            return (
                                this._p1 *
                                    Math.pow(2, -10 * t) *
                                    Math.sin(((t - this._p3) * a) / this._p2) +
                                1
                            );
                        },
                        0.3
                    ),
                    s(
                        "ElasticIn",
                        function (t) {
                            return -(
                                this._p1 *
                                Math.pow(2, 10 * (t -= 1)) *
                                Math.sin(((t - this._p3) * a) / this._p2)
                            );
                        },
                        0.3
                    ),
                    s(
                        "ElasticInOut",
                        function (t) {
                            return 1 > (t *= 2)
                                ? -0.5 *
                                      this._p1 *
                                      Math.pow(2, 10 * (t -= 1)) *
                                      Math.sin(((t - this._p3) * a) / this._p2)
                                : 0.5 *
                                      this._p1 *
                                      Math.pow(2, -10 * (t -= 1)) *
                                      Math.sin(
                                          ((t - this._p3) * a) / this._p2
                                      ) +
                                      1;
                        },
                        0.45
                    )
                ),
                u(
                    "Expo",
                    l("ExpoOut", function (t) {
                        return 1 - Math.pow(2, -10 * t);
                    }),
                    l("ExpoIn", function (t) {
                        return Math.pow(2, 10 * (t - 1)) - 0.001;
                    }),
                    l("ExpoInOut", function (t) {
                        return 1 > (t *= 2)
                            ? 0.5 * Math.pow(2, 10 * (t - 1))
                            : 0.5 * (2 - Math.pow(2, -10 * (t - 1)));
                    })
                ),
                u(
                    "Sine",
                    l("SineOut", function (t) {
                        return Math.sin(t * o);
                    }),
                    l("SineIn", function (t) {
                        return -Math.cos(t * o) + 1;
                    }),
                    l("SineInOut", function (t) {
                        return -0.5 * (Math.cos(Math.PI * t) - 1);
                    })
                ),
                h(
                    "easing.EaseLookup",
                    {
                        find: function (e) {
                            return t.map[e];
                        },
                    },
                    !0
                ),
                _(r.SlowMo, "SlowMo", "ease,"),
                _(i, "RoughEase", "ease,"),
                _(e, "SteppedEase", "ease,"),
                f
            );
        },
        !0
    );
}),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()();

(function (t, e) {
    "use strict";
    var i = (t.GreenSockGlobals = t.GreenSockGlobals || t);
    if (!i.TweenLite) {
        var s,
            n,
            r,
            a,
            o,
            l = function (t) {
                var e,
                    s = t.split("."),
                    n = i;
                for (e = 0; s.length > e; e++) n[s[e]] = n = n[s[e]] || {};
                return n;
            },
            h = l("com.greensock"),
            _ = 1e-10,
            u = function (t) {
                var e,
                    i = [],
                    s = t.length;
                for (e = 0; e !== s; i.push(t[e++]));
                return i;
            },
            f = function () {},
            m = (function () {
                var t = Object.prototype.toString,
                    e = t.call([]);
                return function (i) {
                    return (
                        null != i &&
                        (i instanceof Array ||
                            ("object" == typeof i &&
                                !!i.push &&
                                t.call(i) === e))
                    );
                };
            })(),
            p = {},
            c = function (s, n, r, a) {
                (this.sc = p[s] ? p[s].sc : []),
                    (p[s] = this),
                    (this.gsClass = null),
                    (this.func = r);
                var o = [];
                (this.check = function (h) {
                    for (var _, u, f, m, d = n.length, v = d; --d > -1; )
                        (_ = p[n[d]] || new c(n[d], [])).gsClass
                            ? ((o[d] = _.gsClass), v--)
                            : h && _.sc.push(this);
                    if (0 === v && r)
                        for (
                            u = ("com.greensock." + s).split("."),
                                f = u.pop(),
                                m =
                                    l(u.join("."))[f] =
                                    this.gsClass =
                                        r.apply(r, o),
                                a &&
                                    ((i[f] = m),
                                    "function" == typeof define && define.amd
                                        ? define(
                                              (t.GreenSockAMDPath
                                                  ? t.GreenSockAMDPath + "/"
                                                  : "") + s.split(".").pop(),
                                              [],
                                              function () {
                                                  return m;
                                              }
                                          )
                                        : s === e &&
                                          "undefined" != typeof module &&
                                          module.exports &&
                                          (module.exports = m)),
                                d = 0;
                            this.sc.length > d;
                            d++
                        )
                            this.sc[d].check();
                }),
                    this.check(!0);
            },
            d = (t._gsDefine = function (t, e, i, s) {
                return new c(t, e, i, s);
            }),
            v = (h._class = function (t, e, i) {
                return (
                    (e = e || function () {}),
                    d(
                        t,
                        [],
                        function () {
                            return e;
                        },
                        i
                    ),
                    e
                );
            });
        d.globals = i;
        var g = [0, 0, 1, 1],
            T = [],
            y = v(
                "easing.Ease",
                function (t, e, i, s) {
                    (this._func = t),
                        (this._type = i || 0),
                        (this._power = s || 0),
                        (this._params = e ? g.concat(e) : g);
                },
                !0
            ),
            w = (y.map = {}),
            P = (y.register = function (t, e, i, s) {
                for (
                    var n,
                        r,
                        a,
                        o,
                        l = e.split(","),
                        _ = l.length,
                        u = (i || "easeIn,easeOut,easeInOut").split(",");
                    --_ > -1;

                )
                    for (
                        r = l[_],
                            n = s
                                ? v("easing." + r, null, !0)
                                : h.easing[r] || {},
                            a = u.length;
                        --a > -1;

                    )
                        (o = u[a]),
                            (w[r + "." + o] =
                                w[o + r] =
                                n[o] =
                                    t.getRatio ? t : t[o] || new t());
            });
        for (
            r = y.prototype,
                r._calcEnd = !1,
                r.getRatio = function (t) {
                    if (this._func)
                        return (
                            (this._params[0] = t),
                            this._func.apply(null, this._params)
                        );
                    var e = this._type,
                        i = this._power,
                        s =
                            1 === e
                                ? 1 - t
                                : 2 === e
                                ? t
                                : 0.5 > t
                                ? 2 * t
                                : 2 * (1 - t);
                    return (
                        1 === i
                            ? (s *= s)
                            : 2 === i
                            ? (s *= s * s)
                            : 3 === i
                            ? (s *= s * s * s)
                            : 4 === i && (s *= s * s * s * s),
                        1 === e
                            ? 1 - s
                            : 2 === e
                            ? s
                            : 0.5 > t
                            ? s / 2
                            : 1 - s / 2
                    );
                },
                s = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"],
                n = s.length;
            --n > -1;

        )
            (r = s[n] + ",Power" + n),
                P(new y(null, null, 1, n), r, "easeOut", !0),
                P(
                    new y(null, null, 2, n),
                    r,
                    "easeIn" + (0 === n ? ",easeNone" : "")
                ),
                P(new y(null, null, 3, n), r, "easeInOut");
        (w.linear = h.easing.Linear.easeIn),
            (w.swing = h.easing.Quad.easeInOut);
        var b = v("events.EventDispatcher", function (t) {
            (this._listeners = {}), (this._eventTarget = t || this);
        });
        (r = b.prototype),
            (r.addEventListener = function (t, e, i, s, n) {
                n = n || 0;
                var r,
                    l,
                    h = this._listeners[t],
                    _ = 0;
                for (
                    null == h && (this._listeners[t] = h = []), l = h.length;
                    --l > -1;

                )
                    (r = h[l]),
                        r.c === e && r.s === i
                            ? h.splice(l, 1)
                            : 0 === _ && n > r.pr && (_ = l + 1);
                h.splice(_, 0, { c: e, s: i, up: s, pr: n }),
                    this !== a || o || a.wake();
            }),
            (r.removeEventListener = function (t, e) {
                var i,
                    s = this._listeners[t];
                if (s)
                    for (i = s.length; --i > -1; )
                        if (s[i].c === e) return s.splice(i, 1), void 0;
            }),
            (r.dispatchEvent = function (t) {
                var e,
                    i,
                    s,
                    n = this._listeners[t];
                if (n)
                    for (e = n.length, i = this._eventTarget; --e > -1; )
                        (s = n[e]),
                            s.up
                                ? s.c.call(s.s || i, { type: t, target: i })
                                : s.c.call(s.s || i);
            });
        var k = t.requestAnimationFrame,
            A = t.cancelAnimationFrame,
            S =
                Date.now ||
                function () {
                    return new Date().getTime();
                },
            x = S();
        for (s = ["ms", "moz", "webkit", "o"], n = s.length; --n > -1 && !k; )
            (k = t[s[n] + "RequestAnimationFrame"]),
                (A =
                    t[s[n] + "CancelAnimationFrame"] ||
                    t[s[n] + "CancelRequestAnimationFrame"]);
        v("Ticker", function (t, e) {
            var i,
                s,
                n,
                r,
                l,
                h = this,
                u = S(),
                m = e !== !1 && k,
                p = 500,
                c = 33,
                d = function (t) {
                    var e,
                        a,
                        o = S() - x;
                    o > p && (u += o - c),
                        (x += o),
                        (h.time = (x - u) / 1e3),
                        (e = h.time - l),
                        (!i || e > 0 || t === !0) &&
                            (h.frame++,
                            (l += e + (e >= r ? 0.004 : r - e)),
                            (a = !0)),
                        t !== !0 && (n = s(d)),
                        a && h.dispatchEvent("tick");
                };
            b.call(h),
                (h.time = h.frame = 0),
                (h.tick = function () {
                    d(!0);
                }),
                (h.lagSmoothing = function (t, e) {
                    (p = t || 1 / _), (c = Math.min(e, p, 0));
                }),
                (h.sleep = function () {
                    null != n &&
                        (m && A ? A(n) : clearTimeout(n),
                        (s = f),
                        (n = null),
                        h === a && (o = !1));
                }),
                (h.wake = function () {
                    null !== n ? h.sleep() : h.frame > 10 && (x = S() - p + 5),
                        (s =
                            0 === i
                                ? f
                                : m && k
                                ? k
                                : function (t) {
                                      return setTimeout(
                                          t,
                                          0 | (1e3 * (l - h.time) + 1)
                                      );
                                  }),
                        h === a && (o = !0),
                        d(2);
                }),
                (h.fps = function (t) {
                    return arguments.length
                        ? ((i = t),
                          (r = 1 / (i || 60)),
                          (l = this.time + r),
                          h.wake(),
                          void 0)
                        : i;
                }),
                (h.useRAF = function (t) {
                    return arguments.length
                        ? (h.sleep(), (m = t), h.fps(i), void 0)
                        : m;
                }),
                h.fps(t),
                setTimeout(function () {
                    m && (!n || 5 > h.frame) && h.useRAF(!1);
                }, 1500);
        }),
            (r = h.Ticker.prototype = new h.events.EventDispatcher()),
            (r.constructor = h.Ticker);
        var C = v("core.Animation", function (t, e) {
            if (
                ((this.vars = e = e || {}),
                (this._duration = this._totalDuration = t || 0),
                (this._delay = Number(e.delay) || 0),
                (this._timeScale = 1),
                (this._active = e.immediateRender === !0),
                (this.data = e.data),
                (this._reversed = e.reversed === !0),
                B)
            ) {
                o || a.wake();
                var i = this.vars.useFrames ? q : B;
                i.add(this, i._time), this.vars.paused && this.paused(!0);
            }
        });
        (a = C.ticker = new h.Ticker()),
            (r = C.prototype),
            (r._dirty = r._gc = r._initted = r._paused = !1),
            (r._totalTime = r._time = 0),
            (r._rawPrevTime = -1),
            (r._next = r._last = r._onUpdate = r._timeline = r.timeline = null),
            (r._paused = !1);
        var R = function () {
            o && S() - x > 2e3 && a.wake(), setTimeout(R, 2e3);
        };
        R(),
            (r.play = function (t, e) {
                return (
                    null != t && this.seek(t, e), this.reversed(!1).paused(!1)
                );
            }),
            (r.pause = function (t, e) {
                return null != t && this.seek(t, e), this.paused(!0);
            }),
            (r.resume = function (t, e) {
                return null != t && this.seek(t, e), this.paused(!1);
            }),
            (r.seek = function (t, e) {
                return this.totalTime(Number(t), e !== !1);
            }),
            (r.restart = function (t, e) {
                return this.reversed(!1)
                    .paused(!1)
                    .totalTime(t ? -this._delay : 0, e !== !1, !0);
            }),
            (r.reverse = function (t, e) {
                return (
                    null != t && this.seek(t || this.totalDuration(), e),
                    this.reversed(!0).paused(!1)
                );
            }),
            (r.render = function () {}),
            (r.invalidate = function () {
                return this;
            }),
            (r.isActive = function () {
                var t,
                    e = this._timeline,
                    i = this._startTime;
                return (
                    !e ||
                    (!this._gc &&
                        !this._paused &&
                        e.isActive() &&
                        (t = e.rawTime()) >= i &&
                        i + this.totalDuration() / this._timeScale > t)
                );
            }),
            (r._enabled = function (t, e) {
                return (
                    o || a.wake(),
                    (this._gc = !t),
                    (this._active = this.isActive()),
                    e !== !0 &&
                        (t && !this.timeline
                            ? this._timeline.add(
                                  this,
                                  this._startTime - this._delay
                              )
                            : !t &&
                              this.timeline &&
                              this._timeline._remove(this, !0)),
                    !1
                );
            }),
            (r._kill = function () {
                return this._enabled(!1, !1);
            }),
            (r.kill = function (t, e) {
                return this._kill(t, e), this;
            }),
            (r._uncache = function (t) {
                for (var e = t ? this : this.timeline; e; )
                    (e._dirty = !0), (e = e.timeline);
                return this;
            }),
            (r._swapSelfInParams = function (t) {
                for (var e = t.length, i = t.concat(); --e > -1; )
                    "{self}" === t[e] && (i[e] = this);
                return i;
            }),
            (r.eventCallback = function (t, e, i, s) {
                if ("on" === (t || "").substr(0, 2)) {
                    var n = this.vars;
                    if (1 === arguments.length) return n[t];
                    null == e
                        ? delete n[t]
                        : ((n[t] = e),
                          (n[t + "Params"] =
                              m(i) && -1 !== i.join("").indexOf("{self}")
                                  ? this._swapSelfInParams(i)
                                  : i),
                          (n[t + "Scope"] = s)),
                        "onUpdate" === t && (this._onUpdate = e);
                }
                return this;
            }),
            (r.delay = function (t) {
                return arguments.length
                    ? (this._timeline.smoothChildTiming &&
                          this.startTime(this._startTime + t - this._delay),
                      (this._delay = t),
                      this)
                    : this._delay;
            }),
            (r.duration = function (t) {
                return arguments.length
                    ? ((this._duration = this._totalDuration = t),
                      this._uncache(!0),
                      this._timeline.smoothChildTiming &&
                          this._time > 0 &&
                          this._time < this._duration &&
                          0 !== t &&
                          this.totalTime(
                              this._totalTime * (t / this._duration),
                              !0
                          ),
                      this)
                    : ((this._dirty = !1), this._duration);
            }),
            (r.totalDuration = function (t) {
                return (
                    (this._dirty = !1),
                    arguments.length ? this.duration(t) : this._totalDuration
                );
            }),
            (r.time = function (t, e) {
                return arguments.length
                    ? (this._dirty && this.totalDuration(),
                      this.totalTime(
                          t > this._duration ? this._duration : t,
                          e
                      ))
                    : this._time;
            }),
            (r.totalTime = function (t, e, i) {
                if ((o || a.wake(), !arguments.length)) return this._totalTime;
                if (this._timeline) {
                    if (
                        (0 > t && !i && (t += this.totalDuration()),
                        this._timeline.smoothChildTiming)
                    ) {
                        this._dirty && this.totalDuration();
                        var s = this._totalDuration,
                            n = this._timeline;
                        if (
                            (t > s && !i && (t = s),
                            (this._startTime =
                                (this._paused ? this._pauseTime : n._time) -
                                (this._reversed ? s - t : t) / this._timeScale),
                            n._dirty || this._uncache(!1),
                            n._timeline)
                        )
                            for (; n._timeline; )
                                n._timeline._time !==
                                    (n._startTime + n._totalTime) /
                                        n._timeScale &&
                                    n.totalTime(n._totalTime, !0),
                                    (n = n._timeline);
                    }
                    this._gc && this._enabled(!0, !1),
                        (this._totalTime !== t || 0 === this._duration) &&
                            (this.render(t, e, !1), O.length && M());
                }
                return this;
            }),
            (r.progress = r.totalProgress =
                function (t, e) {
                    return arguments.length
                        ? this.totalTime(this.duration() * t, e)
                        : this._time / this.duration();
                }),
            (r.startTime = function (t) {
                return arguments.length
                    ? (t !== this._startTime &&
                          ((this._startTime = t),
                          this.timeline &&
                              this.timeline._sortChildren &&
                              this.timeline.add(this, t - this._delay)),
                      this)
                    : this._startTime;
            }),
            (r.timeScale = function (t) {
                if (!arguments.length) return this._timeScale;
                if (
                    ((t = t || _),
                    this._timeline && this._timeline.smoothChildTiming)
                ) {
                    var e = this._pauseTime,
                        i = e || 0 === e ? e : this._timeline.totalTime();
                    this._startTime =
                        i - ((i - this._startTime) * this._timeScale) / t;
                }
                return (this._timeScale = t), this._uncache(!1);
            }),
            (r.reversed = function (t) {
                return arguments.length
                    ? (t != this._reversed &&
                          ((this._reversed = t),
                          this.totalTime(
                              this._timeline &&
                                  !this._timeline.smoothChildTiming
                                  ? this.totalDuration() - this._totalTime
                                  : this._totalTime,
                              !0
                          )),
                      this)
                    : this._reversed;
            }),
            (r.paused = function (t) {
                if (!arguments.length) return this._paused;
                if (t != this._paused && this._timeline) {
                    o || t || a.wake();
                    var e = this._timeline,
                        i = e.rawTime(),
                        s = i - this._pauseTime;
                    !t &&
                        e.smoothChildTiming &&
                        ((this._startTime += s), this._uncache(!1)),
                        (this._pauseTime = t ? i : null),
                        (this._paused = t),
                        (this._active = this.isActive()),
                        !t &&
                            0 !== s &&
                            this._initted &&
                            this.duration() &&
                            this.render(
                                e.smoothChildTiming
                                    ? this._totalTime
                                    : (i - this._startTime) / this._timeScale,
                                !0,
                                !0
                            );
                }
                return this._gc && !t && this._enabled(!0, !1), this;
            });
        var D = v("core.SimpleTimeline", function (t) {
            C.call(this, 0, t),
                (this.autoRemoveChildren = this.smoothChildTiming = !0);
        });
        (r = D.prototype = new C()),
            (r.constructor = D),
            (r.kill()._gc = !1),
            (r._first = r._last = null),
            (r._sortChildren = !1),
            (r.add = r.insert =
                function (t, e) {
                    var i, s;
                    if (
                        ((t._startTime = Number(e || 0) + t._delay),
                        t._paused &&
                            this !== t._timeline &&
                            (t._pauseTime =
                                t._startTime +
                                (this.rawTime() - t._startTime) / t._timeScale),
                        t.timeline && t.timeline._remove(t, !0),
                        (t.timeline = t._timeline = this),
                        t._gc && t._enabled(!0, !0),
                        (i = this._last),
                        this._sortChildren)
                    )
                        for (s = t._startTime; i && i._startTime > s; )
                            i = i._prev;
                    return (
                        i
                            ? ((t._next = i._next), (i._next = t))
                            : ((t._next = this._first), (this._first = t)),
                        t._next ? (t._next._prev = t) : (this._last = t),
                        (t._prev = i),
                        this._timeline && this._uncache(!0),
                        this
                    );
                }),
            (r._remove = function (t, e) {
                return (
                    t.timeline === this &&
                        (e || t._enabled(!1, !0),
                        t._prev
                            ? (t._prev._next = t._next)
                            : this._first === t && (this._first = t._next),
                        t._next
                            ? (t._next._prev = t._prev)
                            : this._last === t && (this._last = t._prev),
                        (t._next = t._prev = t.timeline = null),
                        this._timeline && this._uncache(!0)),
                    this
                );
            }),
            (r.render = function (t, e, i) {
                var s,
                    n = this._first;
                for (this._totalTime = this._time = this._rawPrevTime = t; n; )
                    (s = n._next),
                        (n._active || (t >= n._startTime && !n._paused)) &&
                            (n._reversed
                                ? n.render(
                                      (n._dirty
                                          ? n.totalDuration()
                                          : n._totalDuration) -
                                          (t - n._startTime) * n._timeScale,
                                      e,
                                      i
                                  )
                                : n.render(
                                      (t - n._startTime) * n._timeScale,
                                      e,
                                      i
                                  )),
                        (n = s);
            }),
            (r.rawTime = function () {
                return o || a.wake(), this._totalTime;
            });
        var I = v(
                "TweenLite",
                function (e, i, s) {
                    if (
                        (C.call(this, i, s),
                        (this.render = I.prototype.render),
                        null == e)
                    )
                        throw "Cannot tween a null target.";
                    this.target = e =
                        "string" != typeof e ? e : I.selector(e) || e;
                    var n,
                        r,
                        a,
                        o =
                            e.jquery ||
                            (e.length &&
                                e !== t &&
                                e[0] &&
                                (e[0] === t ||
                                    (e[0].nodeType &&
                                        e[0].style &&
                                        !e.nodeType))),
                        l = this.vars.overwrite;
                    if (
                        ((this._overwrite = l =
                            null == l
                                ? Q[I.defaultOverwrite]
                                : "number" == typeof l
                                ? l >> 0
                                : Q[l]),
                        (o || e instanceof Array || (e.push && m(e))) &&
                            "number" != typeof e[0])
                    )
                        for (
                            this._targets = a = u(e),
                                this._propLookup = [],
                                this._siblings = [],
                                n = 0;
                            a.length > n;
                            n++
                        )
                            (r = a[n]),
                                r
                                    ? "string" != typeof r
                                        ? r.length &&
                                          r !== t &&
                                          r[0] &&
                                          (r[0] === t ||
                                              (r[0].nodeType &&
                                                  r[0].style &&
                                                  !r.nodeType))
                                            ? (a.splice(n--, 1),
                                              (this._targets = a =
                                                  a.concat(u(r))))
                                            : ((this._siblings[n] = $(
                                                  r,
                                                  this,
                                                  !1
                                              )),
                                              1 === l &&
                                                  this._siblings[n].length >
                                                      1 &&
                                                  K(
                                                      r,
                                                      this,
                                                      null,
                                                      1,
                                                      this._siblings[n]
                                                  ))
                                        : ((r = a[n--] = I.selector(r)),
                                          "string" == typeof r &&
                                              a.splice(n + 1, 1))
                                    : a.splice(n--, 1);
                    else
                        (this._propLookup = {}),
                            (this._siblings = $(e, this, !1)),
                            1 === l &&
                                this._siblings.length > 1 &&
                                K(e, this, null, 1, this._siblings);
                    (this.vars.immediateRender ||
                        (0 === i &&
                            0 === this._delay &&
                            this.vars.immediateRender !== !1)) &&
                        ((this._time = -_), this.render(-this._delay));
                },
                !0
            ),
            E = function (e) {
                return (
                    e.length &&
                    e !== t &&
                    e[0] &&
                    (e[0] === t || (e[0].nodeType && e[0].style && !e.nodeType))
                );
            },
            z = function (t, e) {
                var i,
                    s = {};
                for (i in t)
                    G[i] ||
                        (i in e &&
                            "transform" !== i &&
                            "x" !== i &&
                            "y" !== i &&
                            "width" !== i &&
                            "height" !== i &&
                            "className" !== i &&
                            "border" !== i) ||
                        !(!U[i] || (U[i] && U[i]._autoCSS)) ||
                        ((s[i] = t[i]), delete t[i]);
                t.css = s;
            };
        (r = I.prototype = new C()),
            (r.constructor = I),
            (r.kill()._gc = !1),
            (r.ratio = 0),
            (r._firstPT = r._targets = r._overwrittenProps = r._startAt = null),
            (r._notifyPluginsOfEnabled = r._lazy = !1),
            (I.version = "1.13.1"),
            (I.defaultEase = r._ease = new y(null, null, 1, 1)),
            (I.defaultOverwrite = "auto"),
            (I.ticker = a),
            (I.autoSleep = !0),
            (I.lagSmoothing = function (t, e) {
                a.lagSmoothing(t, e);
            }),
            (I.selector =
                t.$ ||
                t.jQuery ||
                function (e) {
                    var i = t.$ || t.jQuery;
                    return i
                        ? ((I.selector = i), i(e))
                        : "undefined" == typeof document
                        ? e
                        : document.querySelectorAll
                        ? document.querySelectorAll(e)
                        : document.getElementById(
                              "#" === e.charAt(0) ? e.substr(1) : e
                          );
                });
        var O = [],
            L = {},
            N = (I._internals = { isArray: m, isSelector: E, lazyTweens: O }),
            U = (I._plugins = {}),
            F = (N.tweenLookup = {}),
            j = 0,
            G = (N.reservedProps = {
                ease: 1,
                delay: 1,
                overwrite: 1,
                onComplete: 1,
                onCompleteParams: 1,
                onCompleteScope: 1,
                useFrames: 1,
                runBackwards: 1,
                startAt: 1,
                onUpdate: 1,
                onUpdateParams: 1,
                onUpdateScope: 1,
                onStart: 1,
                onStartParams: 1,
                onStartScope: 1,
                onReverseComplete: 1,
                onReverseCompleteParams: 1,
                onReverseCompleteScope: 1,
                onRepeat: 1,
                onRepeatParams: 1,
                onRepeatScope: 1,
                easeParams: 1,
                yoyo: 1,
                immediateRender: 1,
                repeat: 1,
                repeatDelay: 1,
                data: 1,
                paused: 1,
                reversed: 1,
                autoCSS: 1,
                lazy: 1,
            }),
            Q = {
                none: 0,
                all: 1,
                auto: 2,
                concurrent: 3,
                allOnStart: 4,
                preexisting: 5,
                true: 1,
                false: 0,
            },
            q = (C._rootFramesTimeline = new D()),
            B = (C._rootTimeline = new D()),
            M = (N.lazyRender = function () {
                var t = O.length;
                for (L = {}; --t > -1; )
                    (s = O[t]),
                        s &&
                            s._lazy !== !1 &&
                            (s.render(s._lazy, !1, !0), (s._lazy = !1));
                O.length = 0;
            });
        (B._startTime = a.time),
            (q._startTime = a.frame),
            (B._active = q._active = !0),
            setTimeout(M, 1),
            (C._updateRoot = I.render =
                function () {
                    var t, e, i;
                    if (
                        (O.length && M(),
                        B.render(
                            (a.time - B._startTime) * B._timeScale,
                            !1,
                            !1
                        ),
                        q.render(
                            (a.frame - q._startTime) * q._timeScale,
                            !1,
                            !1
                        ),
                        O.length && M(),
                        !(a.frame % 120))
                    ) {
                        for (i in F) {
                            for (e = F[i].tweens, t = e.length; --t > -1; )
                                e[t]._gc && e.splice(t, 1);
                            0 === e.length && delete F[i];
                        }
                        if (
                            ((i = B._first),
                            (!i || i._paused) &&
                                I.autoSleep &&
                                !q._first &&
                                1 === a._listeners.tick.length)
                        ) {
                            for (; i && i._paused; ) i = i._next;
                            i || a.sleep();
                        }
                    }
                }),
            a.addEventListener("tick", C._updateRoot);
        var $ = function (t, e, i) {
                var s,
                    n,
                    r = t._gsTweenID;
                if (
                    (F[r || (t._gsTweenID = r = "t" + j++)] ||
                        (F[r] = { target: t, tweens: [] }),
                    e && ((s = F[r].tweens), (s[(n = s.length)] = e), i))
                )
                    for (; --n > -1; ) s[n] === e && s.splice(n, 1);
                return F[r].tweens;
            },
            K = function (t, e, i, s, n) {
                var r, a, o, l;
                if (1 === s || s >= 4) {
                    for (l = n.length, r = 0; l > r; r++)
                        if ((o = n[r]) !== e)
                            o._gc || (o._enabled(!1, !1) && (a = !0));
                        else if (5 === s) break;
                    return a;
                }
                var h,
                    u = e._startTime + _,
                    f = [],
                    m = 0,
                    p = 0 === e._duration;
                for (r = n.length; --r > -1; )
                    (o = n[r]) === e ||
                        o._gc ||
                        o._paused ||
                        (o._timeline !== e._timeline
                            ? ((h = h || H(e, 0, p)),
                              0 === H(o, h, p) && (f[m++] = o))
                            : u >= o._startTime &&
                              o._startTime + o.totalDuration() / o._timeScale >
                                  u &&
                              (((p || !o._initted) &&
                                  2e-10 >= u - o._startTime) ||
                                  (f[m++] = o)));
                for (r = m; --r > -1; )
                    (o = f[r]),
                        2 === s && o._kill(i, t) && (a = !0),
                        (2 !== s || (!o._firstPT && o._initted)) &&
                            o._enabled(!1, !1) &&
                            (a = !0);
                return a;
            },
            H = function (t, e, i) {
                for (
                    var s = t._timeline, n = s._timeScale, r = t._startTime;
                    s._timeline;

                ) {
                    if (((r += s._startTime), (n *= s._timeScale), s._paused))
                        return -100;
                    s = s._timeline;
                }
                return (
                    (r /= n),
                    r > e
                        ? r - e
                        : (i && r === e) || (!t._initted && 2 * _ > r - e)
                        ? _
                        : (r += t.totalDuration() / t._timeScale / n) > e + _
                        ? 0
                        : r - e - _
                );
            };
        (r._init = function () {
            var t,
                e,
                i,
                s,
                n,
                r = this.vars,
                a = this._overwrittenProps,
                o = this._duration,
                l = !!r.immediateRender,
                h = r.ease;
            if (r.startAt) {
                this._startAt &&
                    (this._startAt.render(-1, !0), this._startAt.kill()),
                    (n = {});
                for (s in r.startAt) n[s] = r.startAt[s];
                if (
                    ((n.overwrite = !1),
                    (n.immediateRender = !0),
                    (n.lazy = l && r.lazy !== !1),
                    (n.startAt = n.delay = null),
                    (this._startAt = I.to(this.target, 0, n)),
                    l)
                )
                    if (this._time > 0) this._startAt = null;
                    else if (0 !== o) return;
            } else if (r.runBackwards && 0 !== o)
                if (this._startAt)
                    this._startAt.render(-1, !0),
                        this._startAt.kill(),
                        (this._startAt = null);
                else {
                    i = {};
                    for (s in r) (G[s] && "autoCSS" !== s) || (i[s] = r[s]);
                    if (
                        ((i.overwrite = 0),
                        (i.data = "isFromStart"),
                        (i.lazy = l && r.lazy !== !1),
                        (i.immediateRender = l),
                        (this._startAt = I.to(this.target, 0, i)),
                        l)
                    ) {
                        if (0 === this._time) return;
                    } else this._startAt._init(), this._startAt._enabled(!1);
                }
            if (
                ((this._ease = h =
                    h
                        ? h instanceof y
                            ? h
                            : "function" == typeof h
                            ? new y(h, r.easeParams)
                            : w[h] || I.defaultEase
                        : I.defaultEase),
                r.easeParams instanceof Array &&
                    h.config &&
                    (this._ease = h.config.apply(h, r.easeParams)),
                (this._easeType = this._ease._type),
                (this._easePower = this._ease._power),
                (this._firstPT = null),
                this._targets)
            )
                for (t = this._targets.length; --t > -1; )
                    this._initProps(
                        this._targets[t],
                        (this._propLookup[t] = {}),
                        this._siblings[t],
                        a ? a[t] : null
                    ) && (e = !0);
            else
                e = this._initProps(
                    this.target,
                    this._propLookup,
                    this._siblings,
                    a
                );
            if (
                (e && I._onPluginEvent("_onInitAllProps", this),
                a &&
                    (this._firstPT ||
                        ("function" != typeof this.target &&
                            this._enabled(!1, !1))),
                r.runBackwards)
            )
                for (i = this._firstPT; i; )
                    (i.s += i.c), (i.c = -i.c), (i = i._next);
            (this._onUpdate = r.onUpdate), (this._initted = !0);
        }),
            (r._initProps = function (e, i, s, n) {
                var r, a, o, l, h, _;
                if (null == e) return !1;
                L[e._gsTweenID] && M(),
                    this.vars.css ||
                        (e.style &&
                            e !== t &&
                            e.nodeType &&
                            U.css &&
                            this.vars.autoCSS !== !1 &&
                            z(this.vars, e));
                for (r in this.vars) {
                    if (((_ = this.vars[r]), G[r]))
                        _ &&
                            (_ instanceof Array || (_.push && m(_))) &&
                            -1 !== _.join("").indexOf("{self}") &&
                            (this.vars[r] = _ =
                                this._swapSelfInParams(_, this));
                    else if (
                        U[r] &&
                        (l = new U[r]())._onInitTween(e, this.vars[r], this)
                    ) {
                        for (
                            this._firstPT = h =
                                {
                                    _next: this._firstPT,
                                    t: l,
                                    p: "setRatio",
                                    s: 0,
                                    c: 1,
                                    f: !0,
                                    n: r,
                                    pg: !0,
                                    pr: l._priority,
                                },
                                a = l._overwriteProps.length;
                            --a > -1;

                        )
                            i[l._overwriteProps[a]] = this._firstPT;
                        (l._priority || l._onInitAllProps) && (o = !0),
                            (l._onDisable || l._onEnable) &&
                                (this._notifyPluginsOfEnabled = !0);
                    } else
                        (this._firstPT =
                            i[r] =
                            h =
                                {
                                    _next: this._firstPT,
                                    t: e,
                                    p: r,
                                    f: "function" == typeof e[r],
                                    n: r,
                                    pg: !1,
                                    pr: 0,
                                }),
                            (h.s = h.f
                                ? e[
                                      r.indexOf("set") ||
                                      "function" !=
                                          typeof e["get" + r.substr(3)]
                                          ? r
                                          : "get" + r.substr(3)
                                  ]()
                                : parseFloat(e[r])),
                            (h.c =
                                "string" == typeof _ && "=" === _.charAt(1)
                                    ? parseInt(_.charAt(0) + "1", 10) *
                                      Number(_.substr(2))
                                    : Number(_) - h.s || 0);
                    h && h._next && (h._next._prev = h);
                }
                return n && this._kill(n, e)
                    ? this._initProps(e, i, s, n)
                    : this._overwrite > 1 &&
                      this._firstPT &&
                      s.length > 1 &&
                      K(e, this, i, this._overwrite, s)
                    ? (this._kill(i, e), this._initProps(e, i, s, n))
                    : (this._firstPT &&
                          ((this.vars.lazy !== !1 && this._duration) ||
                              (this.vars.lazy && !this._duration)) &&
                          (L[e._gsTweenID] = !0),
                      o);
            }),
            (r.render = function (t, e, i) {
                var s,
                    n,
                    r,
                    a,
                    o = this._time,
                    l = this._duration,
                    h = this._rawPrevTime;
                if (t >= l)
                    (this._totalTime = this._time = l),
                        (this.ratio = this._ease._calcEnd
                            ? this._ease.getRatio(1)
                            : 1),
                        this._reversed || ((s = !0), (n = "onComplete")),
                        0 === l &&
                            (this._initted || !this.vars.lazy || i) &&
                            (this._startTime === this._timeline._duration &&
                                (t = 0),
                            (0 === t || 0 > h || h === _) &&
                                h !== t &&
                                ((i = !0), h > _ && (n = "onReverseComplete")),
                            (this._rawPrevTime = a =
                                !e || t || h === t ? t : _));
                else if (1e-7 > t)
                    (this._totalTime = this._time = 0),
                        (this.ratio = this._ease._calcEnd
                            ? this._ease.getRatio(0)
                            : 0),
                        (0 !== o || (0 === l && h > 0 && h !== _)) &&
                            ((n = "onReverseComplete"), (s = this._reversed)),
                        0 > t
                            ? ((this._active = !1),
                              0 === l &&
                                  (this._initted || !this.vars.lazy || i) &&
                                  (h >= 0 && (i = !0),
                                  (this._rawPrevTime = a =
                                      !e || t || h === t ? t : _)))
                            : this._initted || (i = !0);
                else if (((this._totalTime = this._time = t), this._easeType)) {
                    var u = t / l,
                        f = this._easeType,
                        m = this._easePower;
                    (1 === f || (3 === f && u >= 0.5)) && (u = 1 - u),
                        3 === f && (u *= 2),
                        1 === m
                            ? (u *= u)
                            : 2 === m
                            ? (u *= u * u)
                            : 3 === m
                            ? (u *= u * u * u)
                            : 4 === m && (u *= u * u * u * u),
                        (this.ratio =
                            1 === f
                                ? 1 - u
                                : 2 === f
                                ? u
                                : 0.5 > t / l
                                ? u / 2
                                : 1 - u / 2);
                } else this.ratio = this._ease.getRatio(t / l);
                if (this._time !== o || i) {
                    if (!this._initted) {
                        if ((this._init(), !this._initted || this._gc)) return;
                        if (
                            !i &&
                            this._firstPT &&
                            ((this.vars.lazy !== !1 && this._duration) ||
                                (this.vars.lazy && !this._duration))
                        )
                            return (
                                (this._time = this._totalTime = o),
                                (this._rawPrevTime = h),
                                O.push(this),
                                (this._lazy = t),
                                void 0
                            );
                        this._time && !s
                            ? (this.ratio = this._ease.getRatio(this._time / l))
                            : s &&
                              this._ease._calcEnd &&
                              (this.ratio = this._ease.getRatio(
                                  0 === this._time ? 0 : 1
                              ));
                    }
                    for (
                        this._lazy !== !1 && (this._lazy = !1),
                            this._active ||
                                (!this._paused &&
                                    this._time !== o &&
                                    t >= 0 &&
                                    (this._active = !0)),
                            0 === o &&
                                (this._startAt &&
                                    (t >= 0
                                        ? this._startAt.render(t, e, i)
                                        : n || (n = "_dummyGS")),
                                this.vars.onStart &&
                                    (0 !== this._time || 0 === l) &&
                                    (e ||
                                        this.vars.onStart.apply(
                                            this.vars.onStartScope || this,
                                            this.vars.onStartParams || T
                                        ))),
                            r = this._firstPT;
                        r;

                    )
                        r.f
                            ? r.t[r.p](r.c * this.ratio + r.s)
                            : (r.t[r.p] = r.c * this.ratio + r.s),
                            (r = r._next);
                    this._onUpdate &&
                        (0 > t &&
                            this._startAt &&
                            this._startTime &&
                            this._startAt.render(t, e, i),
                        e ||
                            ((this._time !== o || s) &&
                                this._onUpdate.apply(
                                    this.vars.onUpdateScope || this,
                                    this.vars.onUpdateParams || T
                                ))),
                        n &&
                            (!this._gc || i) &&
                            (0 > t &&
                                this._startAt &&
                                !this._onUpdate &&
                                this._startTime &&
                                this._startAt.render(t, e, i),
                            s &&
                                (this._timeline.autoRemoveChildren &&
                                    this._enabled(!1, !1),
                                (this._active = !1)),
                            !e &&
                                this.vars[n] &&
                                this.vars[n].apply(
                                    this.vars[n + "Scope"] || this,
                                    this.vars[n + "Params"] || T
                                ),
                            0 === l &&
                                this._rawPrevTime === _ &&
                                a !== _ &&
                                (this._rawPrevTime = 0));
                }
            }),
            (r._kill = function (t, e) {
                if (
                    ("all" === t && (t = null),
                    null == t && (null == e || e === this.target))
                )
                    return (this._lazy = !1), this._enabled(!1, !1);
                e =
                    "string" != typeof e
                        ? e || this._targets || this.target
                        : I.selector(e) || e;
                var i, s, n, r, a, o, l, h;
                if ((m(e) || E(e)) && "number" != typeof e[0])
                    for (i = e.length; --i > -1; )
                        this._kill(t, e[i]) && (o = !0);
                else {
                    if (this._targets) {
                        for (i = this._targets.length; --i > -1; )
                            if (e === this._targets[i]) {
                                (a = this._propLookup[i] || {}),
                                    (this._overwrittenProps =
                                        this._overwrittenProps || []),
                                    (s = this._overwrittenProps[i] =
                                        t
                                            ? this._overwrittenProps[i] || {}
                                            : "all");
                                break;
                            }
                    } else {
                        if (e !== this.target) return !1;
                        (a = this._propLookup),
                            (s = this._overwrittenProps =
                                t ? this._overwrittenProps || {} : "all");
                    }
                    if (a) {
                        (l = t || a),
                            (h =
                                t !== s &&
                                "all" !== s &&
                                t !== a &&
                                ("object" != typeof t || !t._tempKill));
                        for (n in l)
                            (r = a[n]) &&
                                (r.pg && r.t._kill(l) && (o = !0),
                                (r.pg && 0 !== r.t._overwriteProps.length) ||
                                    (r._prev
                                        ? (r._prev._next = r._next)
                                        : r === this._firstPT &&
                                          (this._firstPT = r._next),
                                    r._next && (r._next._prev = r._prev),
                                    (r._next = r._prev = null)),
                                delete a[n]),
                                h && (s[n] = 1);
                        !this._firstPT &&
                            this._initted &&
                            this._enabled(!1, !1);
                    }
                }
                return o;
            }),
            (r.invalidate = function () {
                return (
                    this._notifyPluginsOfEnabled &&
                        I._onPluginEvent("_onDisable", this),
                    (this._firstPT = null),
                    (this._overwrittenProps = null),
                    (this._onUpdate = null),
                    (this._startAt = null),
                    (this._initted =
                        this._active =
                        this._notifyPluginsOfEnabled =
                        this._lazy =
                            !1),
                    (this._propLookup = this._targets ? {} : []),
                    this
                );
            }),
            (r._enabled = function (t, e) {
                if ((o || a.wake(), t && this._gc)) {
                    var i,
                        s = this._targets;
                    if (s)
                        for (i = s.length; --i > -1; )
                            this._siblings[i] = $(s[i], this, !0);
                    else this._siblings = $(this.target, this, !0);
                }
                return (
                    C.prototype._enabled.call(this, t, e),
                    this._notifyPluginsOfEnabled && this._firstPT
                        ? I._onPluginEvent(t ? "_onEnable" : "_onDisable", this)
                        : !1
                );
            }),
            (I.to = function (t, e, i) {
                return new I(t, e, i);
            }),
            (I.from = function (t, e, i) {
                return (
                    (i.runBackwards = !0),
                    (i.immediateRender = 0 != i.immediateRender),
                    new I(t, e, i)
                );
            }),
            (I.fromTo = function (t, e, i, s) {
                return (
                    (s.startAt = i),
                    (s.immediateRender =
                        0 != s.immediateRender && 0 != i.immediateRender),
                    new I(t, e, s)
                );
            }),
            (I.delayedCall = function (t, e, i, s, n) {
                return new I(e, 0, {
                    delay: t,
                    onComplete: e,
                    onCompleteParams: i,
                    onCompleteScope: s,
                    onReverseComplete: e,
                    onReverseCompleteParams: i,
                    onReverseCompleteScope: s,
                    immediateRender: !1,
                    useFrames: n,
                    overwrite: 0,
                });
            }),
            (I.set = function (t, e) {
                return new I(t, 0, e);
            }),
            (I.getTweensOf = function (t, e) {
                if (null == t) return [];
                t = "string" != typeof t ? t : I.selector(t) || t;
                var i, s, n, r;
                if ((m(t) || E(t)) && "number" != typeof t[0]) {
                    for (i = t.length, s = []; --i > -1; )
                        s = s.concat(I.getTweensOf(t[i], e));
                    for (i = s.length; --i > -1; )
                        for (r = s[i], n = i; --n > -1; )
                            r === s[n] && s.splice(i, 1);
                } else
                    for (s = $(t).concat(), i = s.length; --i > -1; )
                        (s[i]._gc || (e && !s[i].isActive())) && s.splice(i, 1);
                return s;
            }),
            (I.killTweensOf = I.killDelayedCallsTo =
                function (t, e, i) {
                    "object" == typeof e && ((i = e), (e = !1));
                    for (var s = I.getTweensOf(t, e), n = s.length; --n > -1; )
                        s[n]._kill(i, t);
                });
        var J = v(
            "plugins.TweenPlugin",
            function (t, e) {
                (this._overwriteProps = (t || "").split(",")),
                    (this._propName = this._overwriteProps[0]),
                    (this._priority = e || 0),
                    (this._super = J.prototype);
            },
            !0
        );
        if (
            ((r = J.prototype),
            (J.version = "1.10.1"),
            (J.API = 2),
            (r._firstPT = null),
            (r._addTween = function (t, e, i, s, n, r) {
                var a, o;
                return null != s &&
                    (a =
                        "number" == typeof s || "=" !== s.charAt(1)
                            ? Number(s) - i
                            : parseInt(s.charAt(0) + "1", 10) *
                              Number(s.substr(2)))
                    ? ((this._firstPT = o =
                          {
                              _next: this._firstPT,
                              t: t,
                              p: e,
                              s: i,
                              c: a,
                              f: "function" == typeof t[e],
                              n: n || e,
                              r: r,
                          }),
                      o._next && (o._next._prev = o),
                      o)
                    : void 0;
            }),
            (r.setRatio = function (t) {
                for (var e, i = this._firstPT, s = 1e-6; i; )
                    (e = i.c * t + i.s),
                        i.r ? (e = Math.round(e)) : s > e && e > -s && (e = 0),
                        i.f ? i.t[i.p](e) : (i.t[i.p] = e),
                        (i = i._next);
            }),
            (r._kill = function (t) {
                var e,
                    i = this._overwriteProps,
                    s = this._firstPT;
                if (null != t[this._propName]) this._overwriteProps = [];
                else
                    for (e = i.length; --e > -1; )
                        null != t[i[e]] && i.splice(e, 1);
                for (; s; )
                    null != t[s.n] &&
                        (s._next && (s._next._prev = s._prev),
                        s._prev
                            ? ((s._prev._next = s._next), (s._prev = null))
                            : this._firstPT === s && (this._firstPT = s._next)),
                        (s = s._next);
                return !1;
            }),
            (r._roundProps = function (t, e) {
                for (var i = this._firstPT; i; )
                    (t[this._propName] ||
                        (null != i.n &&
                            t[i.n.split(this._propName + "_").join("")])) &&
                        (i.r = e),
                        (i = i._next);
            }),
            (I._onPluginEvent = function (t, e) {
                var i,
                    s,
                    n,
                    r,
                    a,
                    o = e._firstPT;
                if ("_onInitAllProps" === t) {
                    for (; o; ) {
                        for (a = o._next, s = n; s && s.pr > o.pr; )
                            s = s._next;
                        (o._prev = s ? s._prev : r)
                            ? (o._prev._next = o)
                            : (n = o),
                            (o._next = s) ? (s._prev = o) : (r = o),
                            (o = a);
                    }
                    o = e._firstPT = n;
                }
                for (; o; )
                    o.pg && "function" == typeof o.t[t] && o.t[t]() && (i = !0),
                        (o = o._next);
                return i;
            }),
            (J.activate = function (t) {
                for (var e = t.length; --e > -1; )
                    t[e].API === J.API && (U[new t[e]()._propName] = t[e]);
                return !0;
            }),
            (d.plugin = function (t) {
                if (!(t && t.propName && t.init && t.API))
                    throw "illegal plugin definition.";
                var e,
                    i = t.propName,
                    s = t.priority || 0,
                    n = t.overwriteProps,
                    r = {
                        init: "_onInitTween",
                        set: "setRatio",
                        kill: "_kill",
                        round: "_roundProps",
                        initAll: "_onInitAllProps",
                    },
                    a = v(
                        "plugins." +
                            i.charAt(0).toUpperCase() +
                            i.substr(1) +
                            "Plugin",
                        function () {
                            J.call(this, i, s),
                                (this._overwriteProps = n || []);
                        },
                        t.global === !0
                    ),
                    o = (a.prototype = new J(i));
                (o.constructor = a), (a.API = t.API);
                for (e in r) "function" == typeof t[e] && (o[r[e]] = t[e]);
                return (a.version = t.version), J.activate([a]), a;
            }),
            (s = t._gsQueue))
        ) {
            for (n = 0; s.length > n; n++) s[n]();
            for (r in p)
                p[r].func ||
                    t.console.log(
                        "GSAP encountered missing dependency: com.greensock." +
                            r
                    );
        }
        o = !1;
    }
})(
    "undefined" != typeof module &&
        module.exports &&
        "undefined" != typeof global
        ? global
        : this || window,
    "TweenLite"
);
// update this

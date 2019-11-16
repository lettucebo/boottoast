/*! @preserve
 * boottoast.js
 * version: 0.0.1
 * author: Money Yu <abc12207@gmail.com>
 * license: MIT
 * http://boottoastjs.com/
 */
(function(root, factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        // AMD
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        // Node, CommonJS-like
        module.exports = factory(require("jquery"));
    } else {
        // Browser globals (root is window)
        root.boottoast = factory(root.jQuery);
    }
})(this, function init($, undefined) {
    "use strict";

    //  Polyfills Object.keys, if necessary.
    //  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = (function() {
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !{ toString: null }.propertyIsEnumerable(
                    "toString"
                ),
                dontEnums = [
                    "toString",
                    "toLocaleString",
                    "valueOf",
                    "hasOwnProperty",
                    "isPrototypeOf",
                    "propertyIsEnumerable",
                    "constructor"
                ],
                dontEnumsLength = dontEnums.length;

            return function(obj) {
                if (
                    typeof obj !== "function" &&
                    (typeof obj !== "object" || obj === null)
                ) {
                    throw new TypeError("Object.keys called on non-object");
                }

                var result = [],
                    prop,
                    i;

                for (prop in obj) {
                    if (hasOwnProperty.call(obj, prop)) {
                        result.push(prop);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }

                return result;
            };
        })();
    }

    var exports = {};

    var VERSION = "0.0.1";
    exports.VERSION = VERSION;

    var templates = {
        dialog:
            '<div class="boottoast toast" aria-live="assertive" aria-atomic="true">' +
            '<div class="boottoast-content">' +
            '<div class="toast-header">' +
            '<strong class="mr-auto toast-title"></strong>' +
            '<small class="toast-small-title" style="margin-left: 5px;"></small>' +
            "</div>" +
            '<div class="toast-body"><div class="boottoast-body"></div></div>' +
            "</div>" +
            "</div>",
        closeButton:
            '<button type="button" class="boottoast-close-button ml-2 mb-1 close" data-dismiss="toast">&times;</button>'
    };

    var positionDivClass = "boottoast-position";
    var defaults = {
        // show backdrop or not. Default to static so user has to interact with dialog
        backdrop: "static",
        // animate the modal in/out
        animate: true,
        // additional class string applied to the top level dialog
        className: null,
        // whether or not to include a close button
        closeButton: true,
        // show the dialog immediately by default
        show: true,
        // dialog container
        container: "body",
        // center modal vertically in page
        centerVertical: false,
        // Automatically scroll modal content when height exceeds viewport height
        scrollable: false,
        // Horizontal placement: left, center, right
        horizontalPlacement: "right",
        // Vertical placement: top, center, bottom
        verticalPlacement: "top",
        // Delay hiding the toast (ms)
        delay: 2000
    };

    // PUBLIC FUNCTIONS
    // *************************************************************************************************************

    // Override default value(s) of boottoast.
    exports.setDefaults = function() {
        var values = {};

        if (arguments.length === 2) {
            // allow passing of single key/value...
            values[arguments[0]] = arguments[1];
        } else {
            // ... and as an object too
            values = arguments[0];
        }

        $.extend(defaults, values);

        return exports;
    };

    // Hides all currently active boottoast modals
    exports.hideAll = function() {
        $(".boottoast").toast("hide");

        return exports;
    };

    // Allows the base init() function to be overridden
    exports.init = function(_$) {
        return init(_$ || $);
    };

    // CORE HELPER FUNCTIONS
    // *************************************************************************************************************

    // Core dialog function
    exports.dialog = function(options) {
        if ($.fn.toast === undefined) {
            throw new Error(
                '"$.fn.toast" is not defined; please double check you have included ' +
                    "the Bootstrap4 JavaScript library. See http://getbootstrap.com/javascript/ " +
                    "for more details."
            );
        }

        options = sanitize(options);

        // check positionDiv exist or create it
        var positionContainer = $("." + positionDivClass);
        if (
            positionContainer === undefined ||
            positionContainer === null ||
            positionContainer.length === 0
        ) {
            var styleStr = "position: fixed; ";
            if (options.horizontalPlacement === "left") {
                styleStr += " left: 0; margin-left: 20px; ";
            } else if (options.horizontalPlacement === "right") {
                styleStr += " right: 0; margin-right: 20px; ";
            } else if (options.horizontalPlacement === "center") {
            } else {
                throw new Error(
                    "horizontalPlacement must be left, center or right."
                );
            }

            if (options.verticalPlacement === "top") {
                styleStr += " top: 0; margin-top: 20px; ";
            } else if (options.verticalPlacement === "bottom") {
                styleStr += " bottom: 0; margin-bottom: 20px; ";
            } else if (options.verticalPlacement === "center") {
            } else {
                throw new Error(
                    "verticalPlacement must be top, center or buttom."
                );
            }

            styleStr += " z-index:9999; "

            positionContainer = $("<div>", {
                class: positionDivClass,
                style: styleStr
            });
            positionContainer.appendTo($(options.container));
        }

        if ($.fn.toast.Constructor.VERSION) {
            options.fullBootstrapVersion = $.fn.toast.Constructor.VERSION;
            var i = options.fullBootstrapVersion.indexOf(".");
            options.bootstrap = options.fullBootstrapVersion.substring(0, i);
        } else {
            throw new Error(
                "boottoast will only work with Bootstrap 4 and above. Please upgrade."
            );
        }

        var dialog = $(templates.dialog);
        var innerDialog = dialog.find(".boottoast-content");
        var body = dialog.find(".toast-body");
        var header = dialog.find(".toast-header");

        var callbacks = {
            onEscape: options.onEscape
        };

        body.find(".boottoast-body").html(options.message);

        if (options.animate === true) {
            dialog.addClass("fade");
        }

        if (options.className) {
            dialog.addClass(options.className);
        }

        if (options.scrollable) {
            // Requires Bootstrap 4.3.0 or higher
            if (options.fullBootstrapVersion.substring(0, 3) < "4.3") {
                console.warn(
                    'Using "scrollable" requires Bootstrap 4.3.0 or higher. You appear to be using ' +
                        options.fullBootstrapVersion +
                        ". Please upgrade to use this option."
                );
            }

            innerDialog.addClass("toast-dialog-scrollable");
        }

        if (options.iconClass) {
            var div = $("<div>", {
                class: "rounded " + options.iconClass,
                style: "width: 20px; height: 20px; margin-right: 5px;"
            });
            header.prepend(div);
        }

        if (options.title) {
            dialog.find(".toast-title").html(options.title);
        }

        if (options.smallTitle) {
            dialog.find(".toast-small-title").html(options.smallTitle);
        }

        if (options.closeButton) {
            var closeButton = $(templates.closeButton);
            dialog.find(".toast-header").append(closeButton);
        }

        // Bootstrap event listeners; these handle extra
        // setup & teardown required after the underlying
        // modal has performed certain actions.

        // make sure we unbind any listeners once the dialog has definitively been dismissed
        dialog.one("hide.bs.toast", function(e) {
            if (e.target === this) {
                dialog.off("escape.close.bb");
                dialog.off("click");
            }
        });

        dialog.one("hidden.bs.toast", function(e) {
            // ensure we don't accidentally intercept hidden events triggered
            // by children of the current dialog. We shouldn't need to handle this anymore,
            // now that Bootstrap namespaces its events, but still worth doing.
            if (e.target === this) {
                dialog.remove();
            }
        });

        dialog.one("shown.bs.toast", function() {
            dialog
                .find(".boottoast-accept")
                .first()
                .trigger("focus");
        });

        // boottoast event listeners; used to decouple some
        // behaviours from their respective triggers

        if (options.backdrop !== "static") {
            // A boolean true/false according to the Bootstrap docs
            // should show a dialog the user can dismiss by clicking on
            // the background.
            // We always only ever pass static/false to the actual
            // $.modal function because with "true" we can't trap
            // this event (the .toast-backdrop swallows it)
            // However, we still want to sort of respect true
            // and invoke the escape mechanism instead
            dialog.on("click.dismiss.bs.toast", function(e) {
                // @NOTE: the target varies in >= 3.3.x releases since the modal backdrop
                // moved *inside* the outer dialog rather than *alongside* it
                if (dialog.children(".toast-backdrop").length) {
                    e.currentTarget = dialog.children(".toast-backdrop").get(0);
                }

                if (e.target !== e.currentTarget) {
                    return;
                }

                dialog.trigger("escape.close.bb");
            });
        }

        dialog.on("escape.close.bb", function(e) {
            // the if statement looks redundant but it isn't; without it
            // if we *didn't* have an onEscape handler then processCallback
            // would automatically dismiss the dialog
            if (callbacks.onEscape) {
                processCallback(e, dialog, callbacks.onEscape);
            }
        });

        dialog.on("click", ".toast-footer button:not(.disabled)", function(e) {
            var callbackKey = $(this).data("bb-handler");

            if (callbackKey !== undefined) {
                // Only process callbacks for buttons we recognize:
                processCallback(e, dialog, callbacks[callbackKey]);
            }
        });

        dialog.on("click", ".boottoast-close-button", function(e) {
            // onEscape might be falsy but that's fine; the fact is
            // if the user has managed to click the close button we
            // have to close the dialog, callback or not
            processCallback(e, dialog, callbacks.onEscape);
        });

        dialog.on("keyup", function(e) {
            if (e.which === 27) {
                dialog.trigger("escape.close.bb");
            }
        });

        // the remainder of this method simply deals with adding our
        // dialogent to the DOM, augmenting it with Bootstrap's modal
        // functionality and then giving the resulting object back
        // to our caller

        $("." + positionDivClass).append(dialog);

        dialog.toast({
            backdrop: options.backdrop ? "static" : false,
            keyboard: false,
            show: false,
            delay: options.delay
        });

        if (options.show) {
            dialog.toast("show");
        }

        return dialog;
    };

    // Helper function to simulate the native alert() behavior. **NOTE**: This is non-blocking, so any
    // code that must happen after the alert is dismissed should be placed within the callback function
    // for this alert.
    exports.alert = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.primary = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-primary";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.secondary = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-secondary";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.success = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-success";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.danger = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-danger";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.warning = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-warning";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.info = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-info";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.light = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-light";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.dark = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-dark";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.white = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-white";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    exports.transparent = function() {
        var options;

        options = mergeDialogOptions(
            "alert",
            ["ok"],
            ["message", "callback"],
            arguments
        );

        options.iconClass = "bg-transparent";

        // @TODO: can this move inside exports.dialog when we're iterating over each
        // button and checking its button.callback value instead?
        if (options.callback && !$.isFunction(options.callback)) {
            throw new Error(
                'alert requires the "callback" property to be a function when provided'
            );
        }

        return exports.dialog(options);
    };

    // INTERNAL FUNCTIONS
    // *************************************************************************************************************

    // Map a flexible set of arguments into a single returned object
    // If args.length is already one just return it, otherwise
    // use the properties argument to map the unnamed args to
    // object properties.
    // So in the latter case:
    //  mapArguments(["foo", $.noop], ["message", "callback"])
    //  -> { message: "foo", callback: $.noop }
    function mapArguments(args, properties) {
        var argn = args.length;
        var options = {};

        if (argn < 1 || argn > 2) {
            throw new Error("Invalid argument length");
        }

        if (argn === 2 || typeof args[0] === "string") {
            options[properties[0]] = args[0];
            options[properties[1]] = args[1];
        } else {
            options = args[0];
        }

        return options;
    }

    //  Merge a set of default dialog options with user supplied arguments
    function mergeArguments(defaults, args, properties) {
        return $.extend(
            // deep merge
            true,
            // ensure the target is an empty, unreferenced object
            {},
            // the base options object for this type of dialog (often just buttons)
            defaults,
            // args could be an object or array; if it's an array properties will
            // map it to a proper options object
            mapArguments(args, properties)
        );
    }

    //  This entry-level method makes heavy use of composition to take a simple
    //  range of inputs and return valid options suitable for passing to boottoast.dialog
    function mergeDialogOptions(className, labels, properties, args) {
        //  build up a base set of dialog properties
        var baseOptions = {
            className: "boottoast-" + className
        };

        // Ensure the buttons properties generated, *after* merging
        // with user args are still valid against the supplied labels
        return validateButtons(
            // merge the generated base properties with user supplied arguments
            mergeArguments(
                baseOptions,
                args,
                // if args.length > 1, properties specify how each arg maps to an object key
                properties
            ),
            labels
        );
    }

    //  Checks each button object to see if key is valid.
    //  This function will only be called by the alert, confirm, and prompt helpers.
    function validateButtons(options, buttons) {
        var allowedButtons = {};
        each(buttons, function(key, value) {
            allowedButtons[value] = true;
        });

        each(options.buttons, function(key) {
            if (allowedButtons[key] === undefined) {
                throw new Error(
                    'button key "' +
                        key +
                        '" is not allowed (options are ' +
                        buttons.join(" ") +
                        ")"
                );
            }
        });

        return options;
    }

    //  Filter and tidy up any user supplied parameters to this dialog.
    //  Also looks for any shorthands used and ensures that the options
    //  which are returned are all normalized properly
    function sanitize(options) {
        var buttons;
        var total;

        if (typeof options !== "object") {
            throw new Error("Please supply an object of options");
        }

        if (!options.message) {
            throw new Error(
                '"message" option must not be null or an empty string.'
            );
        }

        // make sure any supplied options take precedence over defaults
        options = $.extend({}, defaults, options);

        // no buttons is still a valid dialog but it's cleaner to always have
        // a buttons object to iterate over, even if it's empty
        if (!options.buttons) {
            options.buttons = {};
        }

        buttons = options.buttons;

        total = getKeyLength(buttons);

        each(buttons, function(key, button, index) {
            if ($.isFunction(button)) {
                // short form, assume value is our callback. Since button
                // isn't an object it isn't a reference either so re-assign it
                button = buttons[key] = {
                    callback: button
                };
            }

            // before any further checks make sure by now button is the correct type
            if ($.type(button) !== "object") {
                throw new Error(
                    'button with key "' + key + '" must be an object'
                );
            }

            if (!button.label) {
                // the lack of an explicit label means we'll assume the key is good enough
                button.label = key;
            }

            if (!button.className) {
                var isPrimary = false;
                if (options.swapButtonOrder) {
                    isPrimary = index === 0;
                } else {
                    isPrimary = index === total - 1;
                }

                if (total <= 2 && isPrimary) {
                    // always add a primary to the main option in a one or two-button dialog
                    button.className = "btn-primary";
                } else {
                    // adding both classes allows us to target both BS3 and BS4 without needing to check the version
                    button.className = "btn-secondary btn-default";
                }
            }
        });

        return options;
    }

    //  Returns a count of the properties defined on the object
    function getKeyLength(obj) {
        return Object.keys(obj).length;
    }

    //  Tiny wrapper function around jQuery.each; just adds index as the third parameter
    function each(collection, iterator) {
        var index = 0;
        $.each(collection, function(key, value) {
            iterator(key, value, index++);
        });
    }

    //  Handle the invoked dialog callback
    function processCallback(e, dialog, callback) {
        e.stopPropagation();
        e.preventDefault();

        // by default we assume a callback will get rid of the dialog,
        // although it is given the opportunity to override this

        // so, if the callback can be invoked and it *explicitly returns false*
        // then we'll set a flag to keep the dialog active...
        var preserveDialog =
            $.isFunction(callback) && callback.call(dialog, e) === false;

        // ... otherwise we'll bin it
        if (!preserveDialog) {
            dialog.modal("hide");
        }
    }

    //  The boottoast object
    return exports;
});

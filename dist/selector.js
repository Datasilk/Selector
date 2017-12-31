// selector.js - micro library as a jQuery replacement
// https://github.com/Websilk/Selector
// copyright 2017 by Mark Entingh

(function () {

    //global variables
    const tru = true;
    const fals = false;
    const doc = document;
    var pxStyles = ['top', 'right', 'bottom', 'left', 'width', 'height', 'maxWidth', 'maxHeight', 'fontSize'],
        pxStylesPrefix = ['border', 'padding', 'margin'],
        pxStylesSuffix = ['Top', 'Right', 'Bottom', 'Left'],
        listeners = []; //used for capturing event listeners from $('').on 
    //listeners = [{ elem: null, events: [{ name: '', list: [[selector, event]] }] }];

    var idMatch = /^#[\w-]*$/,
        classMatch = /^\.[\w-]*$/,
        htmlMatch = /<.+>/,
        singlet = /^\w+$/;


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Internal functions //////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * selector
     * @constructor
     */
    function select(sel) {
        //main function, instantiated via $(sel)
        if (sel) { this.push(query(document, sel)); }
        return this;
    }

    function query(context, selector) {
        //gets a list of elements from a CSS selector
        if (context == null) { return [];}
        var elems = [];
        if (isType(selector,4)) {
            //elements are already defined instead of using a selector /////////////////////////////////////
            elems = isType(selector, 5) ? selector : [selector];
        } else if (selector != null && selector != '') {
            //only use vanilla Javascript to select DOM elements based on a CSS selector (Chrome 1, IE 9, Safari 3.2, Firefox 3.5, Opera 10)
            context = context || doc;
            var el = (
                classMatch.test(selector) ?
                    context.getElementsByClassName(selector.slice(1)) :
                    singlet.test(selector) ?
                        context.getElementsByTagName(selector) :
                        context.querySelectorAll(selector)
            );
            //convert node list into array
            for (var i = el.length; i--; elems.unshift(el[i])) { };
        }
        return elems;
    }

    function isDescendant(parent, child) {
        //checks if element is child of another element
        var node = child;
        while (node != null) {
            node = node.parentNode;
            if (node == parent) {
                return tru;
            }
        }
        return fals;
    }

    function styleName(str) {
        //gets the proper style name from shorthand string
        //for example: border-width translates to borderWidth;
        if (str.indexOf('-') < 0) { return str; }
        var name = str.split('-');
        if(name.length > 1){name[1] = name[1][0].toUpperCase() + name[1].substr(1);}
        return name.join('');
    }

    function styleShorthand(str) {
        //gets the shorthand style name from proper string
        var reg = new RegExp('[A-Z]');
        if (str.match(reg)) {
            //has capital letter
            var name = '', chr;
            for (var x in str) {
                chr = str[x];
                if (chr.match(reg)) {
                    name += '-' + chr.toLowerCase();
                } else {
                    name += chr;
                }
            }
            return name;
        }
    }

    function getStyle(e, name) {
        return getComputedStyle(e).getPropertyValue(name);
    }

    function setStyle(e, name, val) {
        //properly set a style for an element
        if (e.nodeName == '#text') { return; }
        var v = val, n = styleName(name);
        
        //check for empty value
        if (v == '' || v == null) { e.style[n] = v == '' ? null : v; return; }

        //check for numbers that should be using 'px';

        if (Number(v) == v && v.toString().indexOf('%') < 0) {
            if (pxStyles.indexOf(n) >= 0) {
                v = val + 'px';
            } else if (pxStylesPrefix.some(function (a) { return n.indexOf(a) == 0 })) {
                v = val + 'px';
            }
        }

        //last resort, set style to string value
        e.style[n] = v;
    }

    function getObj(obj) {
        //get a string from object (either string, number, or function)
        if (!obj) { return obj; }
        if (isType(obj, 5)) {
            //handle object as array
            return obj[0];
        }
        else if (isType(obj, 6)) {
            //handle object as function (get value from object function execution)
            return getObj(obj());
        }
        return obj;
    }
    
    function diffArray(arr, remove) {
        return arr.filter(function (el) {
            return !remove.includes(el);
        });
    }

    function isArrayThen(obj, arrayFunc) {
        if (isType(obj, 5)) {
            //handle content as array
            for(var x in obj){
                arrayFunc.call(this,obj[x]);
            }
            return tru;
        }
        return fals;
    }

    function isType(obj, type) {
        switch (type) {
            case 0: return tru; //anything
            case 1: return typeof (obj) == 'string'; //string
            case 2: return typeof (obj) == 'boolean'; //boolean
            case 3: return !isNaN(parseFloat(obj)) && isFinite(obj); //number
            case 4: return typeof (obj) == 'object'; //object
            case 5: return typeof obj.splice === 'function'; //array
            case 6: return typeof obj == 'function'; //function
        }
        return fals;
    }

    function normalizeArgs(types, args) {
        var results = [],
            a = [].slice.call(args), //convert arguments object into array
            step = types.length - 1,
            req, skip;
        for (var x = a.length-1; x >= 0; x--) {
            for (var i = step; i >= 0; i--) {
                skip = fals;
                if (types[i].o == tru) {
                    //make sure there are enough arguments
                    //left over for required types
                    req = 0;
                    for (var t = 0; t <= i; t++) {
                        if (types[t].o == fals) { req++;}
                    }
                    skip = req > x;
                }
                if (skip == fals) { skip = !isType(a[x], types[i].t) && a[x] != null; }
                
                results[i] = !skip ? a[x] : null;
                step = i - 1;
                if (!skip || a[x] == null) { break; }
            }
        }
        return results;
    }

    function insertContent(obj, elements, stringFunc, objFunc) {
        //checks type of object and execute callback functions depending on object type
        var type = isType(obj,1);
        for (var x = 0; x < elements.length; x++) {
            if (type) {
                stringFunc(elements[x]);
            } else {
                objFunc(elements[x]); 
            }
        }
        return this;
    }

    function clone(elems) {
        var n = new select(null);
        return n.push(elems);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //prototype functions that are accessable by $(selector) //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    select.prototype = {

        add: function (elems) {
            //Add new (unique) elements to the existing elements array
            var obj = getObj(elems);
            if (!obj) { return this; }
            if (obj.elements) { obj = obj.elements; }
            for (var x in obj) {
                //check for duplicates
                if (this.indexOf(obj[x]) < 0) {
                    //element is unique
                    this.push(obj[x]);
                }
            }
            return this;
        },

        addClass: function (classes) {
            //Add class name to each of the elements in the collection. 
            //Multiple class names can be given in a space-separated string.
            if (this.length > 0) {
                var classList = classes.split(' ');
                for (var x = 0; x < this.length; x++) {
                    var e = this[x];
                    //alter classname for each element in selector
                    if (e.className) {
                        var className = e.className;
                        var list = className.split(' ');
                        for (var c in classList) {
                            if (list.indexOf(classList[c]) < 0) {
                                //class doesn't exist in element classname list
                                className += ' ' + classList[c];
                            }
                        }
                        //finally, change element classname if it was altered
                        e.className = className;
                    } else {
                        e.className = classes;
                    }
                }
            }
            return this;
        },

        after: function (content) {
            //Add content to the DOM after each elements in the collection. 
            //The content can be an HTML string, a DOM node or an array of nodes.
            var obj = getObj(content);
            if (isArrayThen(obj, this.after) || obj == null) { return this; }

            insertContent(obj, this,
                function (e) { e.insertAdjacentHTML('afterend', obj); },
                function (e) { e.parentNode.insertBefore(obj, e.nextSibling); }
            );
            return this;
        },

        animate: function (props, options) {
            if (typeof (Velocity) != 'undefined') {
                Velocity(this, props, options);
            }
            return this;
        },

        append: function (content) {
            //Append content to the DOM inside each individual element in the collection. 
            //The content can be an HTML string, a DOM node or an array of nodes.

            var obj = getObj(content);
            if (isArrayThen.call(this, obj, this.append) || obj == null) { return this; }
            insertContent(obj, this,
                function (e) { e.insertAdjacentHTML('beforeend', obj); },
                function (e) { e.appendChild(obj); }
            );
            return this;
        },

        attr: function (name, val) {
            //Read or set DOM attributes. When no value is given, reads 
            //specified attribute from the first element in the collection. 
            //When value is given, sets the attribute to that value on each element 
            //in the collection. When value is null, the attribute is removed  = function(like with removeAttr). 
            //Multiple attributes can be set by passing an object with name-value pairs.
            var n = getObj(name), v = getObj(val);
            if (isType(n, 5)) {
                //get array of attribute values from first element
                var attrs = {};
                for (var p in n) {
                    attrs[n[p]] = this.length > 0 ? this[0].getAttribute(n[p]) : attrs[n[p]] = '';
                }
                return attrs;
            } else {
                if (v != null) {
                    //set single attribute value to all elements in list
                    for (var x = 0; x < this.length; x++) {
                        this[x].setAttribute(n, v);
                    }
                } else {
                    //get single attribute value from first element in list
                    return this.length > 0 ? this[0].getAttribute(n) : '';
                }
            }
            return this;
        },

        before: function (content) {
            //Add content to the DOM before each element in the collection. 
            //The content can be an HTML string, a DOM node or an array of nodes.
            var obj = getObj(content);
            if (isArrayThen(obj, this.before) || obj == null) { return this; }

            insertContent(obj, this,
                function (e) { e.insertAdjacentHTML('beforebegin', obj); },
                function (e) { e.parentNode.insertBefore(obj, e); }
            );
            return this;
        },

        children: function (sel) {
            //Get immediate children of each element in the current collection. 
            //If selector is given, filter the results to only include ones matching the CSS select.
            var elems = [];
            var seltype = 0;
            if (sel != null) {
                if (isType(sel, 3)) {
                    seltype = 1;
                } else {
                    seltype = 2;
                }
            }
            this.each(function (e) {
                if (seltype == 1) {
                    //get child from index
                    elems.push(e.children[sel]);
                } else {
                    for (var x = 0; x < e.children.length; x++) {
                        if (!seltype) { //no selector
                            elems.push(e.children[x]);
                        } else if (seltype == 2) { //match selector
                            if (e.matches(sel)) {
                                elems.push(e.children[x]);
                            }
                        }
                    }
                }
            });
            return clone(elems);
        },

        closest: function (selector) {
            //Traverse upwards from the current element to find the first element that matches the select. 
            return this;
        },

        css: function (params) {
            //Read or set CSS properties on DOM elements. When no value is given, 
            //returns the CSS property from the first element in the collection. 
            //When a value is given, sets the property to that value on each element of the collection.

            //Multiple properties can be retrieved at once by passing an array of property names. 
            //Multiple properties can be set by passing an object to the method.

            //When a value for a property is blank  = function(empty string, null, or undefined), that property is removed. 
            //When a unitless number value is given, "px" is appended to it for properties that require units.
            if (isType(params, 4)) {
                var haskeys = fals;
                for (var x in params) {
                    //if params is an object with key/value pairs, apply styling to elements\
                    haskeys = tru;
                    var name = styleName(x);
                    this.each(function (e) {
                        setStyle(e, name, params[x]);
                    });
                }
                if (haskeys) { return this; }
                if (isType(params, 5)) {
                    //if params is an array of style names, return an array of style values
                    var vals = [];
                    this.each(function (e) {
                        var props = new Object();
                        params.forEach(function (param) {
                            var prop = e.style[styleName(param)];
                            if (prop) { props[param] = prop; }
                        });
                        vals.push(props);
                    });
                    return vals;
                }
            } else if (isType(params, 1)) {
                var name = styleName(params);
                var arg = arguments[1];
                if (isType(arg, 1)) {
                    //set a single style property if two string arguments are supplied (key, value);
                    this.each(function (e) {
                        setStyle(e, name, arg);
                    });
                } else {
                    //if params is a string, return a single style property
                    if (this.length > 0) {

                        if (this.length == 1) {
                            //return a string value for one element
                            return this[0].style[name];
                        } else {
                            //return an array of strings for multiple elements
                            var vals = [];
                            this.each(function (e) {
                                var val = e.style[name];
                                if (val == null) { val = ''; }
                                vals.push(val);
                            });
                            return vals;
                        }
                    }
                }

            }
            return this;
        },

        each: function (func) {
            //Iterate through every element of the collection. Inside the iterator function, 
            //this keyword refers to the current item  = function(also passed as the second argument to the function). 
            //If the iterator select.prototype.returns 0, iteration stops.
            for (var x = 0; x < this.length; x++) {
                func.call(this, this[x]);
            }
            return this;
        },

        empty: function (func) {
            //Clear DOM contents of each element in the collection.
            this.each(function (e) {
                e.innerHTML = '';
            });
            return this;
        },

        eq: function (index) {
            //Reduce the set of matched elements to the one at the specified index
            var elems = [];
            if (index > this.length - 1) {
                //out of bounds
                elems = [];
            } else if (index < 0) {
                //negetive index
                if (index * -1 >= this.length) {
                    elems = [];
                } else {
                    elems = [this[(this.length - 1) + index]];
                }
            } else {
                elems = [this[index]];
            }
            return clone(elems);
        },

        filter: function (sel) {
            //Filter the collection to contain only items that match the CSS select. 
            //If a select.prototype.is given, return only elements for which the select.prototype.returns a truthy value. 
            var elems = [];
            if (isType(sel, 6)) {
                //filter a boolean function
                this.each(function (e) {
                    if (sel.call(e, e) == tru) { elems.push(e); }
                });
            } else {
                //filter selector string
                var found = query(document, sel);
                if (found.length > 0) {
                    this.each(function (e) {
                        if (found.indexOf(e) >= 0) {
                            //make sure no duplicates are being added to the array
                            if (elems.indexOf(e) < 0) { elems.push(e); }
                        }
                    });
                }
            }
            return clone(elems);
        },

        find: function (sel) {
            //Find elements that match CSS selector executed in scope of nodes in the current collection.
            var elems = [];
            if (this.length > 0) {
                this.each(function (e) {
                    var found = query(e, sel);
                    if (found.length > 0) {
                        found.forEach(function (a) {
                            //make sure no duplicates are being added to the array
                            if (elems.indexOf(a) < 0) { elems.push(a); }
                        });
                    }
                });
            }
            return clone(elems);
        },

        first: function () {
            //the first element found in the selector
            var elems = [];
            if (this.length > 0) {
                elems = [this[0]];
            }
            return clone(elems);
        },

        get: function (index) {
            //Get all elements or a single element from the current collection. 
            //When no index is given, returns all elements in an ordinary array. 
            //When index is specified, return only the element at that position. 
            return this[index || 0];
        },

        has: function (selector) {
            //Filter the current collection to include only elements that have 
            //any number of descendants that match a selector, or that contain a specific DOM node.
            var elems = [];
            if (this.length > 0) {
                this.each(function (e) {
                    if (query(e, selector).length > 0) {
                        if (elems.indexOf(e) < 0) { elems.push(e); }
                    }
                });
            }
            return clone(elems);
        },

        hasClass: function (classes) {
            //Check if any elements in the collection have the specified class.
            var classList;
            if (isType(classes, 5)) {
                classList = classes;
            } else if (isType(classes, 1)) {
                classList = classes.split(' ');
            }
            for (var x = 0; x < this.length; x++) {
                var n = this[x].className || '';
                if (isType(n, 1)) {
                    var classNames = n.split(' ');
                    if (classNames.length > 0) {
                        if (
                            classList.every(function (a) {
                                return classNames.some(function (b) { return a == b; });
                            })
                        ) {
                            return tru;
                        }
                    }
                }
            }
            return fals;
        },

        height: function (val) {
            //Get the height of the first element in the collection; 
            //or set the height of all elements in the collection.
            //this function differs from jQuery as it doesn't care
            //about box-sizing & border when returning the height
            //of an element (when val is not specified). 
            //It simply returns vanilla js offsetHeight (as it should);
            var obj = getObj(val);
            if (isType(obj, 1)) {
                var n = parseFloat(obj);
                if (!isNaN(n)) { obj = n; } else {
                    //height is string
                    this.each(function (e) {
                        if (e != window && e != document) {
                            e.style.height = obj;
                        }
                    });
                    return this;
                }
            } else if (obj == null) {
                if (this.length > 0) {
                    //get height from first element
                    var elem = this[0];
                    if (elem == window) {
                        return window.innerHeight;
                    } else if (elem == document) {
                        var body = document.body;
                        var html = document.documentElement;
                        return Math.max(
                            body.offsetHeight,
                            body.scrollHeight,
                            html.clientHeight,
                            html.offsetHeight,
                            html.scrollHeight
                        );
                    } else {
                        return elem.clientHeight;
                    }
                }
            } else {
                //height is a number
                if (obj == 0) {
                    this.each(function (e) {
                        e.style.height = 0;
                    });
                } else {
                    this.each(function (e) {
                        e.style.height = obj + 'px';
                    });
                }
            }
            return this;
        },

        hide: function () {
            //Hide elements in this collection by setting their display CSS property to none.
            this.each(function (e) {
                e.style.display = 'none';
            });
            return this;
        },

        hover: function () {
            var args = normalizeArgs([
                { t: 1, o: tru }, //0: selector = string
                { t: 0, o: tru }, //1: data = anything
                { t: 6, o: fals }, //2: onEnter = function
                { t: 6, o: fals }  //3: onLeave = function
            ], arguments);

            var entered = fals;
            this.on('mouseenter', args[0], args[1], function (e) {
                if (!entered) {
                    if (args[2]) { args[2](e); }
                    entered = tru;
                }
            });
            this.on('mouseleave', args[0], args[1], function (e) {
                var p = e, f = fals;
                while (p != null) { if (p == elem) { f = tru; break; } p = p.parentNode; }
                if (!f) {
                    entered = fals;
                    if (args[3]) { args[3](e); }
                }
            });
        },

        html: function (content) {
            //Get or set HTML contents of elements in the collection. 
            //When no content given, returns innerHTML of the first element. 
            //When content is given, use it to replace contents of each element. 
            var obj = getObj(content);
            if (obj == null) {
                if (this.length > 0) {
                    return this[0].innerHTML;
                } else {
                    return '';
                }
            } else {
                this.each(function (e) {
                    e.innerHTML = obj;
                });
            }
            return this;
        },

        /**
         * @suppress {checkTypes}
         */
        index: function (e) {
            //Get the position of an element. When no element is given, 
            //returns position of the current element among its siblings. 
            //When an element is given, returns its position in the current collection. 
            //Returns -1 if not found.
            var i = -1;
            if (this.length > 0) {
                var elem = e ? e : this[0];
                var p = elem.parentNode;
                var c;
                if (p) {
                    c = p.children;
                    if ([].indexOf) {
                        return [].indexOf.call(c, elem);
                    } else {
                        //fallback for older browsers
                        for (var x = 0; x < c.length; x++) {
                            if (c[x] == elem) {
                                return x;
                            }
                        }
                    }
                }
            }
            return i;
        },

        innerHeight: function (height) {
            //Get the current computed inner height (including padding but not border) for the 
            //first element in the set of matched elements or set the inner height of every matched element
            var obj = getObj(height);
            if (obj == null) {
                //get inner height of first element (minus padding)
                if (this.length > 0) {
                    var e = this[0];
                    var style = getComputedStyle(e);
                    var padtop = parseFloat(style.paddingTop);
                    var padbot = parseFloat(style.paddingBottom);
                    if (isNaN(padtop)) { padtop = 0; }
                    if (isNaN(padbot)) { padbot = 0; }
                    return e.clientHeight - (padtop + padbot);
                }
            } else {
                //set height of elements
                return this.height(height);
            }
        },

        innerWidth: function (width) {
            //Get the current computed inner width (including padding but not border) for the 
            //first element in the set of matched elements or set the inner width of every matched element
            var obj = getObj(width);
            if (obj == null) {
                //get inner width of first element (minus padding)
                if (this.length > 0) {
                    var e = this[0];
                    var style = getComputedStyle(e);
                    var padright = parseFloat(style.paddingRight);
                    var padleft = parseFloat(style.paddingLeft);
                    if (isNaN(padright)) { padright = 0; }
                    if (isNaN(padleft)) { padleft = 0; }
                    return e.clientWidth - (padright + padleft);
                }
            } else {
                //set width of elements
                return this.width(width);
            }
        },

        is: function (selector) {
            //Check if all the elements of the current collection matches the CSS select.
            if (this.length > 0) {
                var self = this;
                var obj = getObj(selector);
                for (var x = 0; x < this.length; x++) {
                    switch (obj) {
                        case ':focus':
                            if (this[x] == document.activeElement) {
                                return tru;
                            }
                            break;
                        default:
                            var q = query(this[x].parentNode, obj);
                            if (q.some(function (a) { return a == self[0] })) {
                                return tru;
                            }
                            break;
                    }
                }
                
            }
            return fals;
        },

        last: function () {
            //Get the last element of the current collection.
            var elems = [];
            if (this.length > 0) {
                elems = [this[this.length - 1]];
            }
            return clone(elems);
        },

        map: function (func) { //func(index, element)        
            //Iterate through every element of the collection. Inside the iterator function, 
            //this keyword refers to the current item  = function(also passed as the second argument to the function). 
            //If the iterator select.prototype.returns 0, iteration stops.
            for (var x = 0; x < this.length; x++) {
                if (func(x, this[x]) == fals) {
                    break;
                }
            }
            return this;
        },

        next: function (selector) {
            //Get the next sibling optionally filtered by selector of each element in the collection.
            var elems = [];
            if (selector) {
                //use selector
                this.each(function (e) {
                    var q = query(e, selector);
                    var n = e.nextSibling; if (n) { while (n.nodeName == '#text') { n = n.nextSibling; if (!n) { break; } } }
                    if (n) {
                        if (q.some(function (s) { return s == n; })) { elems.push(n); }
                    } else { elems.push(e); }
                });
            } else {
                //no selector
                this.each(function (e) {
                    var n = e.nextSibling; if (n) { while (n.nodeName == '#text') { n = n.nextSibling; if (!n) { break; } } }
                    if (n) { elems.push(n); } else { elems.push(e); }
                });
            }
            return clone(elems);
        },

        not: function (selector) {
            //Filter the current collection to get a new collection of elements that don't match the CSS select. 
            //If another collection is given instead of selector, return only elements not present in it. 
            //If a select.prototype.is given, return only elements for which the select.prototype.returns a falsy value. 
            //Inside the function, the this keyword refers to the current element.
            var sel = getObj(selector);
            var elems = this;
            //check if selector is an array (of selectors)
            if (isType(sel, 5)) {
                sel.forEach(function (s) {
                    var q = query(document, s);
                    elems = diffArray(elems, q);
                });
                this.push(elems);
                return this;
            }
            var q = query(document, sel);
            return clone(diffArray(elems, q));
        },

        off: function (event, func) {
            //remove an event handler
            var args = normalizeArgs([
                { t: 1, o: fals }, //0: event = string
                { t: 1, o: tru }, //1: selector = string (optional)
                { t: 6, o: fals }  //2: handler = function
            ], arguments);
            this.each(function (e) {
                for (var x = 0; x < listeners.length; x++) {
                    if (listeners[x].elem == e) {
                        //found element in listeners array, now find specific function (func)
                        var item = listeners[x];
                        if (args[2] == null) {
                            //if no function specified, remove all listeners for a specific event
                            if (args[0] == null) {
                                //remove all events and functions for element from listener
                                for (var y = 0; y < item.events.length; y++) {
                                    var ev = item.events[y];
                                    for (var z = 0; z < ev.list.length; z++) {
                                        e.removeEventListener(ev.name, ev.list[z][1], tru);
                                    }
                                }
                                listeners.splice(x, 1);
                            } else {
                                //remove all functions (for event) from element in listener
                                for (var y = 0; y < item.events.length; y++) {
                                    if (item.events[y].name == args[0]) {
                                        var ev = item.events[y];
                                        for (var z = 0; z < ev.list.length; z++) {
                                            e.removeEventListener(args[0], ev.list[z][1], tru);
                                        }
                                        listeners[x].events.splice(y, 1);
                                        if (listeners[x].events.length == 0) {
                                            //remove element from listeners array since no more events exist for the element
                                            listeners.splice(x, 1);
                                        }
                                        break;
                                    }
                                }
                            }
                        } else {
                            //remove specific listener based on event & function
                            for (var y = 0; y < item.events.length; y++) {
                                if (item.events[y].name == args[0]) {
                                    //remove specific event from element in listeners array
                                    var ev = item.events[y];
                                    for (var z = 0; z < ev.list.length; z++) {
                                        if (ev.list[z][1].toString() === args[2].toString() //check function match
                                            && ev.list[z][0] == args[1]) { //check selector match
                                            e.removeEventListener(args[0], args[2], tru);
                                            listeners[x].events[y].list.splice(z, 1);
                                            break;
                                        }
                                    }

                                    if (listeners[x].events[y].list.length == 0) {
                                        //remove event from element list array since no more functions exist for the event
                                        listeners[x].events.splice(y, 1);
                                        if (listeners[x].events.length == 0) {
                                            //remove element from listeners array since no more events exist for the element
                                            listeners.splice(x, 1);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            });
            return this;
        },

        offset: function (coordinates) {
            //Get position of the element in the document. 
            //Returns an object with properties: top, left, width and height.

            //When given an object with properties left and top, use those values to 
            //position each element in the collection relative to the document.
            if (this.length > 0) {
                var box = this[0].getBoundingClientRect();
                return {
                    top: box.top + document.body.scrollTop,
                    left: box.left + document.body.scrollLeft
                };
            }
            return { top: 0, left: 0 };
        },

        offsetParent: function () {
            //Find the first ancestor element that is positioned, 
            //meaning its CSS position value is "relative", "absolute"" or "fixed".
            if (this.length > 0) {
                return this[0].offsetParent;
            }
            return null;
        },

        on: function () {
            //Attach an event handler function for one or more events to the selected elements.
            var args = normalizeArgs([
                { t: 1, o: fals }, //0: event = string
                { t: 1, o: tru }, //1: selector = string (optional)
                { t: 0, o: tru }, //2: data = anything (optional)
                { t: 6, o: fals }  //3: handler = function
            ], arguments);
            var events = args[0].replace(/\s/g, '').split(',');
            for (var i = 0; i < events.length; i++) {
                var ev = events[i];
                if (ev == "hover") {
                    this.hover(args[1], args[2], args[3], args[3]);
                } else {
                    this.each(function (e) {
                        var params = [args[1], args[3]];
                        if (args[1] != null && args[1] != '') {
                            function delegate(el) {
                                var sels = query(e, args[1]);
                                for (var x = 0; x < sels.length; x++) {
                                    if (el.target == sels[x]) {
                                        args[3].apply(sels[x], [].slice.call(arguments));
                                    }
                                }
                            }
                            params = [args[1], delegate];
                            e.addEventListener(ev, delegate, tru);
                        } else {
                            e.addEventListener(ev, args[3], tru);
                        }

                        var listen = fals;
                        for (var x = 0; x < listeners.length; x++) {
                            if (listeners[x].elem == e) {
                                //found element, now find specific event
                                var events = listeners[x].events;
                                var f = fals;
                                for (var y = 0; y < events.length; y++) {
                                    if (events[y].name == ev) {
                                        //found existing event in list
                                        listeners[x].events[y].list.push(params);
                                        f = tru;
                                        break;
                                    }
                                }
                                if (f == fals) {
                                    //event doesn't exist yet
                                    var evnt = { name: ev, list: [params] };
                                    listeners[x].events.push(evnt);
                                }
                                listen = tru;
                                break;
                            }
                        }
                        if (listen == fals) { listeners.push({ elem: e, events: [{ name: ev, list: [params] }] }); }
                    });
                }
            }

            return this;
        },

        //TODO: one
        one: function (event, func) {
            //Attach a handler to an event for the elements. The handler is executed at most once per element per event type
        },

        //TODO: outerHeight
        outerHeight: function () {

        },

        //TODO: outerWidth
        outerWidth: function () {

        },

        parent: function (selector) {
            //Get immediate parents of each element in the collection. 
            //If CSS selector is given, filter results to include only ones matching the select.
            var elems = [];
            this.each(function (e) {
                var el = e.parentNode;
                if (selector == null || selector == '') {
                    if (elems.indexOf(el) < 0) {
                        elems.push(el);
                    }
                } else if (el.matches(selector)) {
                    if (elems.indexOf(el) < 0) {
                        elems.push(el);
                    }
                }

            });
            return clone(elems);
        },

        parents: function (selector) {
            //Get all ancestors of each element in the selector. 
            //If CSS selector is given, filter results to include only ones matching the select.
            var elems = [];
            this.each(function (e) {
                var el = e.parentNode;
                while (el) {
                    if (selector == null || selector == '') {
                        if (elems.indexOf(el) < 0) {
                            elems.push(el);
                        }
                    } else {
                        if (el.matches) {
                            if (el.matches(selector)) {
                                if (elems.indexOf(el) < 0) {
                                    elems.push(el);
                                }
                            }
                        } else if (el.matchesSelector) {
                            if (el.matchesSelector(selector)) {
                                if (elems.indexOf(el) < 0) {
                                    elems.push(el);
                                }
                            }
                        }
                    }
                    el = el.parentNode;
                }
            });
            return clone(elems);
        },

        position: function () {
            //Get the position of the first element in the collection, relative to the offsetParent. 
            //This information is useful when absolutely positioning an element to appear aligned with another.
            if (this.length > 0) {
                return { left: this[0].offsetLeft, top: this[0].offsetTop };
            }
            return { left: 0, top: 0 };
        },

        prepend: function (content) {
            //Prepend content to the DOM inside each element in the collection. 
            //The content can be an HTML string, a DOM node or an array of nodes.
            var obj = getObj(content);
            if (isArrayThen(obj, this.append) || obj == null) { return this; }


            insertContent(obj, this,
                function (e) { e.insertAdjacentHTML('afterbegin', obj); },
                function (e) { e.insertBefore(obj, e.firstChild); }
            );
            return this;
        },

        prev: function (selector) {
            //Get the previous sibling optionally filtered by selector of each element in the collection.
            var elems = [];
            this.each(function (e) {
                var p = e.previousSibling;
                if (selector) {
                    //use selector
                    var q = query(e.parentNode, selector);
                    if (q.some(function (s) { return s == p })) {
                        elems.push(p ? p : e);
                    }
                } else {
                    //no selector
                    elems.push(p ? p : e);
                }
            });
            return clone(elems);
        },

        prop: function (name, val) {
            //Read or set properties of DOM elements. This should be preferred over attr in case of 
            //reading values of properties that change with user interaction over time, such as checked and selected.
            var n = getObj(name);
            var v = getObj(val);
            if (isType(n, 5)) {
                //get multiple properties from the first element
                var props = {};
                n.forEach(function (p) {
                    props[p] = this.prop(p);
                });
                return props;
            }

            var execAttr = function (a, b) {
                //get / set / remove DOM attribute
                if (v != null) {
                    if (v == '--') {
                        //remove
                        this.each(function (e) {
                            e.removeAttribute(a);
                        });
                    } else {
                        //set
                        if (v == fals) {
                            this.each(function (e) {
                                e.removeAttribute(a);
                            });
                        } else {
                            this.attr(a, b);
                        }
                    }
                } else {
                    //get
                    if (this.length > 0) {
                        return this[0].getAttribute(a) || '';
                    }
                }
            };

            var execStyle = function (a, b) {
                //get / set / remove DOM style property
                if (v != null) {
                    if (v == '--') {
                        //remove
                        this.each(function (e) {
                            e.style[a] = '';
                        });
                    } else {
                        //set
                        this.each(function (e) {
                            setStyle(e, a, b);
                        });
                    }
                } else {
                    //get
                    if (this.length > 0) {
                        return getStyle(this[0], a);
                    }
                }
            };

            //get, set, or remove (if val == '--') a specific property from element(s)
            var nn = '';
            switch (n) {
                case "defaultChecked":
                    nn = 'checked';
                case "checked":
                    if (!v) { if (this.length > 0) { return this[0].checked; } }
                case "defaultSelected":
                    nn = 'selected';
                case "selected":
                case "defaultDisabled":
                    nn = 'disabled';
                case "disabled":
                    //get/set/remove boolean property that belongs to the DOM element object or is an attribute (default)


                    var execProp = function (a) {
                        if (v != null) {
                            if (v == '--') {
                                //remove
                                this.each(function (e) {
                                    if (e[a]) { delete e[a]; }
                                });
                            } else {
                                //set
                                v = v == 0 ? fals : tru;
                                this.each(function (e) {
                                    e[a] = v;
                                });
                            }

                        } else {
                            //get
                            if (this.length > 0) {
                                var e = this[0];
                                var b = e[a];
                                if (b == null) {
                                    b = e.getAttribute(a) != null ? tru : fals;
                                    e[a] = b;
                                }
                                return b;
                            }
                        }
                    };

                    if (nn != '') {
                        //get/set/remove default property
                        var a = execAttr.call(this, nn, nn);
                        if (a != null) { return a; }
                    } else {
                        //get/set/remove property
                        var a = execProp.call(this, n);
                        if (a != null) { return a; }
                    }
                    break;

                case "selectedIndex":
                    if (v != null) {
                        if (v === parseInt(v, 10)) {
                            this.each(function (e) {
                                if (e.nodeType == 'SELECT') {
                                    e.selectedIndex = v;
                                }
                            });
                        }
                    }
                    break;

                case "nodeName":
                    if (val != null) {
                        //set node name
                        //TODO: replace DOM element with new element of new node name, cloning all attributes & appending all children elements
                    } else {
                        //get node name
                        if (this.length > 0) {
                            return this[0].nodeName;
                        } else {
                            return '';
                        }
                    }
                    break;
                case "tagName":
                    if (val != null) {
                        //set node name
                        //TODO: replace DOM element with new element of new tag name, cloning all attributes & appending all children elements
                    } else {
                        //get tag name
                        if (this.length > 0) {
                            return this[0].tagName;
                        } else {
                            return '';
                        }
                    }
                    break;

                default:
                    // last resort to get/set/remove property value from style or attribute
                    //first, try getting a style
                    var a = execProp.call(this, n);
                    if (a != null) {
                        return a;
                    } else {
                        //next, try getting a attribute
                        a = execAttr.call(this, n, v);
                        if (a != null) {
                            return a;
                        }
                    }

            }
            return this;
        },

        push: function (elems) {
            [].push.apply(this, elems);
            return this;
        },

        ready: function (callback) {
            if (this.length == 1) {
                if (this[0] == document) {
                    if (document.readyState != 'loading') {
                        callback();
                    } else {
                        document.addEventListener('DOMContentLoaded', callback);
                    }
                }
            }
        },

        remove: function (selector) {
            //Remove the set of matched elements from the DOM
            this.each(function (e) {
                e.parentNode.removeChild(e);
            });
            this.push([]);
            return this;
        },

        removeAttr: function (attr) {
            //Remove an attribute from each element in the set of matched elements
            var obj = getObj(attr);
            if (isType(obj, 5)) {
                obj.forEach(function (a) {
                    this.each(function (e) {
                        e.removeAttribute(a);
                    });
                });
            } else if (typeof obj == 'string') {
                this.each(function (e) {
                    e.removeAttribute(obj);
                });
            }

            return this;
        },

        removeClass: function (className) {
            //Remove a single class, multiple classes, or all classes from each element in the set of matched elements
            var obj = getObj(className);
            if (typeof obj == 'string') {
                //check for class name array
                obj = obj.replace(/\,/g, ' ').replace(/\s\s/g, ' ');
                if (obj.indexOf(' ') > 0) {
                    obj = obj.split(' ');
                }
            }
            if (isType(obj, 5)) {
                this.each(function (e) {
                    obj.forEach(function (a) {
                        if (e.className) {
                            e.className = e.className.split(' ').filter(function (b) { return b != '' && b != a; }).join(' ');
                        }
                    });
                });
            } else if (typeof obj == 'string') {
                this.each(function (e) {
                    if (e.className) {
                        e.className = e.className.split(' ').filter(function (b) { return b != '' && b != obj; }).join(' ');
                    }
                });
            }
            return this;
        },

        removeProp: function (name) {
            //Remove a property for the set of matched elements
            this.prop(name, '--');
            return this;
        },

        serialize: function () {
            if (this.length == 0) { return ''; }
            var form = this[0];
            if (!form || form.nodeName !== "FORM") {
                return '';
            }
            var i, j, q = [];
            for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                if (form.elements[i].name === "") {
                    continue;
                }
                switch (form.elements[i].nodeName) {
                    case 'INPUT':
                        switch (form.elements[i].type) {
                            case 'text':
                            case 'hidden':
                            case 'password':
                            case 'button':
                            case 'reset':
                            case 'submit':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                            case 'checkbox':
                            case 'radio':
                                if (form.elements[i].checked) {
                                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                }
                                break;
                        }
                        break;
                    case 'file':
                        break;
                    case 'TEXTAREA':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'SELECT':
                        switch (form.elements[i].type) {
                            case 'select-one':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                            case 'select-multiple':
                                for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                    if (form.elements[i].options[j].selected) {
                                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                                    }
                                }
                                break;
                        }
                        break;
                    case 'BUTTON':
                        switch (form.elements[i].type) {
                            case 'reset':
                            case 'submit':
                            case 'button':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        }
                        break;
                }
            }
            return q.join("&");
        },

        show: function () {
            //Display the matched elements
            this.removeClass('hide');
            this.each(function (e) {
                e.style.display = 'block';
            });
            return this;
        },

        siblings: function (selector) {
            //Get the siblings of each element in the set of matched elements, optionally filtered by a selector
            var elems = [];
            var sibs = [];
            var q = [];
            var sel = getObj(selector);
            var add = function (e) {
                if (!elems.some(function (a) { return a == e })) { elems.push(e); }
            }
            var find = function (e, s) {
                //find siblings
                if (s != null) {
                    q = query(e.parentNode, s);
                }
                sibs = e.parentNode.children;
                for (var x = 0; x < sibs.length; x++) {
                    var sib = sibs[x];
                    if (sib != e) {
                        if (s != null) {
                            if (q.some(function (a) { return a == sib; })) {
                                add(sib);
                            }
                        } else {
                            add(sib);
                        }
                    }
                }
            };

            if (sel != null) {
                if (isType(sel, 5)) {
                    this.each(function (e) {
                        sel.forEach(function (s) {
                            find(e, s);
                        });
                    });
                } else {
                    this.each(function (e) {
                        find(e, sel);
                    });
                }
            } else {
                this.each(function (e) {
                    find(e, null);
                });
            }
            return clone(elems);
        },

        //TODO: slice
        slice: function () {
            //Reduce the set of matched elements to a subset specified by a range of indices
            [].slice.apply(this, arguments);
            return this;
        },

        splice: function () {
            [].splice.apply(this, arguments);
        },

        stop: function () {
            if (typeof (Velocity) != 'undefined') {
                Velocity(this, "stop");
            }
            return this;
        },

        //TODO: text
        text: function () {
            //Get the combined text contents of each element in the set of matched elements, including their descendants, or set the text contents of the matched elements
            return '';
        },

        toggle: function () {
            //Display or hide the matched elements
            this.each(function (e) {
                if (e.style.display == 'none') {
                    e.style.display = '';
                } else { e.style.display = 'none'; }
            });
            return this;
        },

        toggleClass: function (className) {
            //Add or remove one or more classes from each element in the set of matched elements, depending on either the class' presence or the value of the state argument
            var obj = getObj(className);
            if (typeof obj == 'string') {
                obj = obj.split(' ');
            }
            if (isType(obj, 5)) {
                this.each(function (e) {
                    var c = e.className;
                    var b = -1;
                    if (c != null && c != '') {
                        c = c.split(' ');
                        //array of class names
                        obj.forEach(function (a) {
                            b = c.indexOf(a);
                            if (b >= 0) {
                                //remove class
                                c.splice(b, 1);
                            } else {
                                //add class
                                c.push(a);
                            }
                        });
                        //update element className attr
                        e.className = c.join(' ');
                    } else {
                        e.className = className;
                    }
                });
            }
        },

        val: function (value) {
            //Get the current value of the first element in the set of matched elements or set the value of every matched element
            if (value != null) {
                this.each(function (a) {
                    a.value = value;
                });
            } else {
                if (this.length > 0) {
                    return this[0].value;
                }
                return '';
            }
            return this;
        },

        width: function (val) {
            //Get the current computed width for the first element in the set of matched elements or set the width of every matched element
            var obj = getObj(val);
            if (isType(obj, 1)) {
                var n = parseFloat(obj);
                if (!isNaN(n)) { obj = n; } else {
                    //width is string
                    this.each(function (e) {
                        if (e != window && e != document) {
                            e.style.width = obj;
                        }
                    });
                    return this;
                }
            } else if (obj == null) {
                if (this.length > 0) {
                    //get width from first element
                    var elem = this[0];
                    if (elem == window) {
                        return window.innerWidth;
                    } else if (elem == document) {
                        var body = document.body;
                        var html = document.documentElement;
                        return Math.max(
                            body.offsetWidth,
                            body.scrollWidth,
                            html.clientWidth,
                            html.offsetWidth,
                            html.scrollWidth
                        );
                    } else {
                        return elem.clientWidth;
                    }
                }
            } else {
                //width is a number
                if (obj == 0) {
                    this.each(function (e) {
                        e.style.width = 0;
                    });
                } else {
                    this.each(function (e) {
                        e.style.width = obj + 'px';
                    });
                }
            }
            return this;
        },

        //TODO: wrap
        wrap: function (elem) {
            //Wrap an HTML structure around each element in the set of matched elements
            return this;
        },

        //TODO: wrapAll
        wrapAll: function (elem) {
            //Wrap an HTML structure around all elements in the set of matched elements
            return this;
        },

        //TODO: wrapInner
        wrapInner: function (elem) {
            //Wrap an HTML structure around the content of each element in the set of matched elements
            return this;
        }
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // create public selector object //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /** @noalias */
    window['$'] = function(selector) {
        return new select(selector);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // add functionality to the $ object //////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /** @noalias */
    window['$'].ajax = function () {
        var args = normalizeArgs([
            { t: 1, o: tru }, //0: url = string (optional)
            { t: 4, o: tru }, //1: settings = object (optional)
        ], arguments);
        args[1] = getObj(args[1]);
        var opt = args[1] || { url: args[0] };
        opt.url = args[0] || opt.url;
        opt.async = opt.async || tru;
        opt.cache = opt.cache || fals; 
        opt.contentType = opt.contentType || 'application/x-www-form-urlencoded; charset=UTF-8'; 
        opt.data = opt.data || '';
        opt.dataType = opt.dataType || ''; 
        opt.method = opt.method || "GET";
        opt.type = opt.method || opt.type;

        //set up AJAX request
        var req = new XMLHttpRequest();

        //set up callbacks
        req.onload = function () {
            if (req.status >= 200 && req.status < 400) {
                //request success
                var resp = req.responseText;
                if (opt.dataType.toLowerCase() == "json") {
                    resp = JSON.parse(resp);
                }
                if (opt.success) {
                    opt.success(resp, req.statusText, req);
                }
            } else {
                //connected to server, but returned an error
                if (opt.error) {
                    opt.error(req, req.statusText);
                }
            }
        };

        req.onerror = function () {
            //an error occurred before connecting to server
            if (opt.error) {
                opt.error(req, req.statusText);
            }
        };

        if (opt.beforeSend) {
            if (opt.beforeSend(req, opt) == fals) {
                //canceled ajax call before sending
                return fals;
            }
        }

        //finally, send AJAX request
        req.open(opt.method, opt.url, opt.async, opt.username, opt.password);
        req.setRequestHeader('Content-Type', opt.contentType);
        req.send(opt.data);
    }

    /** @noalias */
    /**
     * @param {...string|boolean} var_args
     */
    window['$'].extend = function (var_args) {
        var extended = {};
        var deep = fals;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    // If deep merge and property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = window['$'].extend(1, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (; i < length; i++) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };

})();
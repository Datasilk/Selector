# Selector
A micro JavaScript library used as a replacement for jQuery, weighing in at nearly 5KB. 

The aim of this project is to build a replacement for jQuery while constantly finding optimizations to shrink the overall filesize of the library, keeping the minified, gzip compressed file under 5KB while simultaniously adding more support for jQuery features.

[View Demo](https://jsfiddle.net/markentingh/L2o0qrwy/)

### Add to your project via public CDN from jsDelivr
[https://cdn.jsdelivr.net/selectorjs/0.9.1/selector.min.js](https://cdn.jsdelivr.net/selectorjs/0.9.1/selector.min.js)

### File size comparison between jQuery and selector.js

#### jquery (uncompressed)
jquery-3.2.0.js (**271 KB**)

jquery-3.2.0.min.js (**84.5 KB**)

jquery-3.2.0.slim.js (**217 KB**)

jquery-3.2.0.slim.min.js (**67.9 KB**)


#### jquery (gzip compressed)
jquery-3.2.0.js (**74.7 KB**)

jquery-3.2.0.min.js (**28.6 KB**)

jquery-3.2.0.slim.js (**60 KB**)

jquery-3.2.0.slim.min.js (**22.7 KB**)


#### selector.js (uncompressed)
selector.js (**64.9 KB**)

selector.min.js (**17.3 KB**)


#### selector.js (gzip compressed)
selector.js (**11.5 KB**)

selector.min.js (**4.92 KB**)


### Supported jQuery selector functions
* add
* addClass
* after
* animate (requires Velocity.js)
* append
* attr
* before
* children
* closest
* css
* each
* empty
* eq
* filter
* find
* first
* get
* has
* hasClass
* height
* hide
* html
* index
* innerHeight
* innerWidth
* is
* last
* map
* next
* not
* off
* offset
* offsetParent
* on
* one
* outerHeight
* outerWidth
* parent
* parents
* position
* prepend
* prev
* prop
* ready
* remove
* removeAttr
* removeClass
* removeProp
* serialize
* show
* siblings
* slice
* stop (requires Velocity.js)
* toggle
* toggleClass
* val
* width

### Supported jQuery objects
* $

### Supported jQuery functions
* $.ajax
* $.extend

### Unsupported jQuery functionality
* jQuery object
* All jQuery plugins
* jQuery UI
* jQuery.fx
* Deprecated functions
* More...


## Disclaimer
This project is in beta and has been tested in Chrome 51+, IE8+ (using ie-shim.js), Safari 9+, and iOS 6+. Use at your own risk. 

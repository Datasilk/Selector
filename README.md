# Selector
A micro JavaScript library used as a replacement for jQuery, weighing in at nearly 5KB. 

The aim of this project is to build a library that can be used to replace jQuery. The challenge will be to shrink the overall filesize of the library, keeping the minified, gzip compressed file under 5KB while simultaniously adding more support for jQuery features. The ultimate goal is to have a modern library that runs faster than jQuery under stress.

[View Demo](https://jsfiddle.net/markentingh/L2o0qrwy/)

### Add to your project via public CDN from jsDelivr
[https://cdn.jsdelivr.net/npm/selectorjs@0.9.12/dist/selector.min.js](https://cdn.jsdelivr.net/npm/selectorjs@0.9.12/dist/selector.min.js)

### File size comparison between jQuery and selector.js

| Library                   | **Selector.js**| jQuery 3.2  | jQuery 3.2 Slim  |
| ------------------------- | --------------:| -----------:| ----------------:|
| Uncompressed              | **68K**        | 271K        | 217K             |
| Minified                  | **16K**        | 84.5K       | 68K              |
| **Minified & Gzipped**    | **4.8K**       | 28.6K       | 22.7K            |

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
* hover
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
* parent
* parents
* position
* prepend
* prev
* prop
* push (*pushStack)
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

#### NOTES
* *pushStack is now called push

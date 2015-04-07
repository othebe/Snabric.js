/**
 * @fileoverview
 * Snabric.js extends the Fabric.js canvas with Snap.SVG's functionality to manipulate SVG's.
 * Requirements: Fabric.js, Snap.SVG
 */


/**
 * Initialize a Snabric object.
 * @param {HTMLElement | String} elt <canvas> element to initialize instance on.
 * @param {Object} options Fabric.js options object.
 * @constructor
 */
var Snabric = function(elt, options) {
    /**
      * Fabric.js canvas.
      * @type {fabric.Canvas}
      * @private
      */
    this._fCanvas = new fabric.Canvas(elt, options);

    /**
     * A mapping of snabric images to fabric.js images.
     * @type {Map.<Snabric.Image, fabric.Image>}
     * @private
     */
    this._imgMap = new Map();
    
    this._snabricContainer = document.createElement('div');
    this._snabricContainer.style.opacity = 0;
    document.body.appendChild(this._snabricContainer);
    
    /**
     * Key press handler. Called on response to key up.
     * @type {Function(e)}
     */
    this.handleKeyPress = function(e) { };
    
    /**
     * Grid.
     * @type {Snabric.Grid}
     * @private
     */
    this._grid = null;

    // Setup event listeners.
    this._setupEventListeners();
};


/**
 * Setup event listeners for the Snabric canvas.
 * @private
 */
Snabric.prototype._setupEventListeners = function() {
    // Focus canvas on click.
    var canvas = this._fCanvas.upperCanvasEl;
    canvas.setAttribute('tabindex', 1);
    canvas.addEventListener('click', function () {
      canvas.focus();
    });

    // Setup key listener.
    canvas.addEventListener('keyup', function (e) {
        this.handleKeyPress(e);
    }.bind(this));
};


/**
 * Add a SVG to the canvas. Updates the image map.
 * @param {Snabric.Image} sImg Snabric image to add on the canvas.
 * @param {Function(Snabric.Image)} onUpdate Callback function.
 * @private
 */
Snabric.prototype._updateCanvasImage = function(sImg, onUpdate) {
    var main = this;
    
    var fImg = this._imgMap.get(sImg);

    // Add a new fabric image.
    if (fImg == null) {    
        fabric.Image.fromURL(sImg.getDataUrl(), function(fImg) {
            main._fCanvas.add(fImg);
            main._imgMap.set(sImg, fImg);
            
            if (onUpdate != null) {
                onUpdate(sImg);
            }
        });
    }
    // Update an existing fabric image.
    else {
        fImg.setSrc(sImg.getDataUrl(), function() {
            fImg.render(main._fCanvas.getContext());
            
            if (onUpdate != null) {
                onUpdate(sImg);
            }
        });      
    }
};


/**
 * Load a SVG image from a given URL.
 * @param {String} url SVG url.
 * @param {Function(Snabric.Image)} onLoad Callback function.
 */
Snabric.prototype.loadFromUrl = function(url, onLoad) {
    var main = this;
    
    var obj = document.createElement('object');
    obj.type = 'image/svg+xml';
    obj.data = url;
    obj.onload = function() {
        var svgDoc = obj.getSVGDocument();
        if (svgDoc != null) {
            var svgElt = svgDoc.documentElement;
            var snabricImg = new Snabric.Image(svgElt, main._updateCanvasImage.bind(main));
            main._updateCanvasImage(snabricImg, onLoad);
            
            main._snabricContainer.removeChild(obj);
        }
    };
    
    this._snabricContainer.appendChild(obj);  
};


/**
 * Remove an snabric image.
 * @param {Snabric.Image} img Snabric image to remove.
 */
Snabric.prototype.remove = function(img) {
    this._fCanvas.remove(img);
};


/**
 * Get the canvas.
 * TODO (othebe): Overwrite functions that Snabric takes over from the canvas.
 * @return {fabric.Canvas}
 */
Snabric.prototype.getCanvas = function() {
    return this._fCanvas;
};


/**
 * Get fabric image.
 * @param {Snabric.Image} sImg Snabric image.
 * @return {fabric.Image}
 */
Snabric.prototype.getFImg = function(sImg) {
    return this._imgMap.get(sImg);
};


/**
 * Set visibility of grid.
 * @param {boolean} isVisible Determines if the grid is visible.
 * @param {Object} options Grid options.
 */
Snabric.prototype.setGridVisibility = function(isVisible, options) {
    if (isVisible) {
        // Redraw grid if dimensions have changed.
        if (this._grid != null) {
            var origDimensions = this._grid.getDimensions();
            if (origDimensions.width != this._fCanvas.getWidth() || origDimensions.height != this._fCanvas.getHeight()) {
                this._fCanvas.remove(this._grid.getGrid());
                this._grid = null;
            }
        }
        
        // Initialize grid.
        if (this._grid == null) {
            options = options || {};
            // Grid width and height cannot be overwritten.
            options.width = this._fCanvas.getWidth();
            options.height = this._fCanvas.getHeight();
            this._grid = new Snabric.Grid(options);
        }
        
        // Draw grid only if it is not on the canvas.
        var grid = this._grid.getGrid();
        if (!this._fCanvas.contains(grid)) {
            this._fCanvas.add(grid);
            grid.sendToBack();
        }
    } else {
        if (this._grid != null) {
            this._fCanvas.remove(this._grid.getGrid());
        }
    }
};



/**
 * A snabric image object.
 * @param {SVGElement} svgElt SVGElement to wrap in Snap.
 * @param {Function(Snabric.Image)} onUpdate Callback function on update.
 * @constructor
 */
Snabric.Image = function(svgElt, onUpdate) {
    /**
     * The internal SVG representation.
     * @type {SVGElement}
     * @private
     */
    this._svgElt = svgElt;
    
    /**
     * The Snap object constructed from the SVG.
     * @type {Snap}
     * @private
     */
    this._snap = Snap(this._svgElt);
    
    /**
     * The function to call on an update.
     * @type {Function(Snabric.Image)}
     * @private
     */
    this._onUpdate = onUpdate;
};


/**
 * Get the SVG element.
 * @return {SVGElement}
 */
Snabric.Image.prototype.getSvgElement = function() {
    return this._svgElt;
};


/**
 * Get the Snap object.
 * @return {Snap}
 */
Snabric.Image.prototype.getSnap = function() {
    return this._snap;
};


/**
 * Update Snap object.
 * @param {Snap} snapObj Snap object.
 */
Snabric.Image.prototype.updateSnap = function(snapObj) {
    var d = document.createElement('div');
    d.innerHTML = snapObj.toString();
    this._updateSvgElt(d.children[0]);
    
    this._onUpdate(this);
};


/**
 * Update SVG element.
 * @param {SVGElement} svgElt SVGElement.
 * @private
 */
Snabric.Image.prototype._updateSvgElt = function(svgElt) {
    this._svgElt = svgElt;
};


/**
 * Gets the data URL for the image.
 * @return {String}
 */
Snabric.Image.prototype.getDataUrl = function() {
    var svg = this.getSvgElement();
    var canvas = document.createElement('canvas');

    // Image dimensions.
    var width = 0;
    var height = 0;
    
    if (svg.height != null) {
        height = svg.height.baseVal.value;
        width = svg.width.baseVal.value;
    } else {
        height = svg.getAttribute('height');
        width = svg.getAttribute('width');
    }
    
    canvas.setAttribute('height', height);
    canvas.setAttribute('width', width);
    var ctx = canvas.getContext('2d');
    ctx.drawSvg(svg.outerHTML, 0, 0);
    
    return canvas.toDataURL();
};



/**
 * A snabric grid object.
 * @param {Object} options Grid options.
 * @constructor
 */
Snabric.Grid = function(options) {
    /**
     * Grid options.
     * @type {Object}
     * @private
     */
    this._options = options || {};
    
    /**
     * Grid display group.
     * @type {fabric.Group}
     * @private
     */
    this._group = new fabric.Group();
    
    /**
     * Grid dimensions.
     * @type {Object}
     * @private
     */
    this._dimensions = { width: null, height: null};
    
    this._constructGroup(this._options);
};


/**
 * Construct the grid group.
 * @private
 */
Snabric.Grid.prototype._constructGroup = function(options) {
    var canvasWidth = options['width'] || 0;
    var canvasHeight = options['height'] || 0;
    var tileSize = options['tileSize'] || 1;
    var strokeColor = options['strokeColor'] || 'green';
    var strokeWidth = options['stroke'] || 0.5
    
    // Horizontal lines.
    for (var y = tileSize; y < canvasHeight; y += tileSize) {
        var line = new fabric.Line([0, y, canvasWidth, y], {
            stroke: strokeColor,
            strokeWidth: strokeWidth
        });
        this._group.add(line);
    }
    
    // Vertical lines.
    for (var x = tileSize; x < canvasWidth; x += tileSize) {
        var line = new fabric.Line([x, 0, x, canvasHeight], {
            stroke: strokeColor,
            strokeWidth: strokeWidth
        });
        this._group.add(line);
    }
    
    this._dimensions.width = canvasWidth;
    this._dimensions.height = canvasHeight;
};


/**
 * Get grid.
 * @return {fabric.IObject}
 */
Snabric.Grid.prototype.getGrid = function() {
    return this._group;
};


/**
 * Get dimensions.
 * @return {Object}
 */
Snabric.Grid.prototype.getDimensions = function() {
    return this._dimensions;
};

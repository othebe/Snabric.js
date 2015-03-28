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
};


/**
 * Add a SVG to the canvas. Updates the image map.
 * @param {Snabric.Image} sImg Snabric image to add on the canvas.\
 * @param {Function(Snabric.Image)} onUpdate Callback function.
 * @private
 */
Snabric.prototype._updateCanvasImage = function(sImg, onUpdate) {
    var main = this;
    
    var fImg = this._imgMap.get(sImg);

    // Add a new fabric image.
    if (fImg == null) {    
        fabric.Image.fromURL(sImg.getDataUrl(), function(img) {
            main._fCanvas.add(img);
            main._imgMap.set(sImg, img);
            
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

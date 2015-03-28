# Snabric.js
Add SVG manipulation to Fabric.js using Snap.svg

The fabric canvas imports SVG's as image objects, thus losing the level of manipulation available from dedicated SVG libraries like Snap.svg. Snap provides a more detailed SVG interface, but lacks any canvas control. This package introduces a Snabric object, that allows Snap.svg objects to be added into a Fabric.js canvas.

## Usage

### Create a Snabric.js canvas.
```
// Similar to the Fabric.js canvas constructor
var s = new Snabric(canvasElt, options);
```

### Import a SVG from a URL.
```
s.loadFromUrl(LOCAL_URL, function(snabricImg) {
  var snap = snabricImg.getSnap();
});
```

### Modify and update the Snap object.
```
snap.text(50, 50, "Hello from Snabric!");
snabricImg.updateSnap(snap);
```

See [demo/index.html](https://github.com/othebe/Snabric.js/blob/master/demo/index.html) for examples and the necessary imports.


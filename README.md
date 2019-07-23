
# smiltool

SMIL+CSS+SVG -> static SVG -> IMGS -> APNG / PNG Sequence / GIF



## Note

 * always use integer in width and height


## Note about Image Quality

One can control how image is resized / rendered with following approach:

 * ctx.imageSmoothingEnabled = false  ( default true )
 * image-rendering: crisp-edges / pixelated  ( default auto )
   - for indicating the resampling algorithm when image is resized
 * shape-rendering: crispEdges ( default auto )
   - hint browser about how to tradeoff when rendering shapes.


## Todo

 * Optimize CSS based animation generation
 * Support GIF format natively
 * GIF generation optimization


## LICENSE

MIT License.

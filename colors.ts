
var Vibrant = require('node-vibrant')

(async () => {
    Vibrant.from('path/to/image').getPalette((err: any, palette: any) => console.log(palette))
})()
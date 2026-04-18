// p5.js sketch for guitar fretboard mockup

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop(); // prevent continuous redrawing for static display
}

function draw() {
    background(240); // light gray background
    
    // variables for the rectangle
    globalThis.sideMargin = 50;
    globalThis.x = sideMargin;
    globalThis.y = height / 2 - 100;
    globalThis.width = windowWidth - (2 * sideMargin);
    globalThis.rectHeight = height / 3;
    globalThis.radius = 20;

    globalThis.topbottomMargin = 20;
    
    // draw the main fretboard panel
    fill(255); // white fill
    stroke(0); // black border
    strokeWeight(2);
    //rect(x, y, width, rectHeight, radius);
    
    // draw fret lines
    drawFretLines(x, y, width, rectHeight);
    
    // draw strings
    drawStrings(x, y, width, rectHeight);
}

function drawFretLines(x, y, width, height) {
    const scaleLength = 50; // arbitrary scale length for spacing calculation
    stroke(100); // dark gray for fret lines
    strokeWeight(1);
    
    for (let fretNumber = 1; fretNumber <= 12; fretNumber++) {
        const fretSpacing = scaleLength / (Math.pow(2, fretNumber / 12) - 1);
        const fretX = x + fretSpacing;
        line(fretX, y, fretX, y + height);
    }
}

//draw nut and "bridge" lines at string start and end
function drawNutAndBridge(x, y, width, height) {
    stroke(100); // dark gray for nut and bridge
    strokeWeight(2);
    // we define x/y coordinages for the nut and bridge lines.
    // nut is at the left edge of the fretboard
    const nutX = x;
    line(nutX, y, nutX, y + height);
    // bride is at the right edge of the fretboard
    const bridgeX = x + width;
    line(bridgeX, y, bridgeX, y + height);

}


function drawFretLines(x, y, width, height) {
    const scaleLength = width * 0.9; // use ~90% of panel width as scale
    stroke(100); // dark gray for fret lines
    strokeWeight(1);
    
    for (let fretNumber = 1; fretNumber <= 12; fretNumber++) {
        // Each fret is positioned at: scaleLength * (1 - 2^(-fretNumber/12))
        const fretX = x + 2 * scaleLength * (1 - Math.pow(2, -fretNumber / 12));
        line(fretX, y + topbottomMargin, fretX, y + height - topbottomMargin);
    }
}

//draw strings as horizontal lines across the fretboard, set topbottmMargin as the location of the highest and lowest strings, and space them evenly in between
function drawStrings(x, y, width, height) {
    const stringCount = 6; // standard guitar
    stroke(150); // medium gray for strings
    strokeWeight(2);
    for (let stringNumber = 0; stringNumber < stringCount; stringNumber++) {
        const stringY = y + topbottomMargin + (stringNumber / (stringCount - 1)) * (height - 2 * topbottomMargin);
        line(x, stringY, x + width, stringY);
    }   
}

// redraw on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
}

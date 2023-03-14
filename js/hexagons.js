// BACKGROUND AND GRID COLORS:
let backgroundColor1 =  "#080808" // "rgb(12,12,12)";
let backgroundColor2 =  "#242424" // "rgb(24,24,24)";
let hexagonsColor1 =    "#384048" // "rgb(56,64,72)";
let hexagonsColor2 =    "#708090" // "rgb(84,96,108)";
let hexagonsEdgeColor = "#C0C0C0" // "rgb(192,192,192)";
// HEXAGONS:
let hexagonsSize = 40;
let hexagonsMargin = 5;
// CURSOR LIGHT:    
let cursorLightColor = "#6080FF";
let cursorLightColorHueChange = -18;
let cursorLightSize = 75;
let cursorLightTrailLenght = 25;
// RANDOM LIGHTS 
let randomLightsCount = 2;
let randomLightsColor = "#FF6000";
let randomLightsColorHueRange = -64;      
let randomLightsColorHueChange = 32;  
let randomLightsSizeMin = 20;
let randomLightsSizeMax = 40;
let randomLightsSpeedMin = 3;
let randomLightsSpeedMax = 5;
let randomLightsTrailLenght = 50;
// CLICK LIGTHS
let clickLightsCount = 10;
let clickLightsColor = "#6080FF";
let clickLightsColorHueRange = 32      
let clickLightsColorHueChange = 128; 
let clickLightsMatchCursor = true;
let clickLightsSizeMin = 10;
let clickLightsSizeMax = 15;
let clickLightsSpeedMin = 20;
let clickLightsSpeedMax = 20;
let clickLightsTrailLenght = 10;
 
// consts
const FramesPerSecond = 1200;
const LogicUpdatesPerSecond = 1200;

const angle60 = Math.PI * 2 / 6;
const angle30 = Math.PI * 2 / 12;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.height = innerHeight;
canvas.width = innerWidth;

const cursor = {
    x: - 2 * cursorLightSize,
    y: - 2 * cursorLightSize
};

const rand = (min, max) => Math.random() * (max - min) + min;
const hexToDecimal = hex => parseInt(hex, 16);

function decimalToHex(decimal)
{
    if(decimal<16)
        return "0" + decimal.toString(16);
    else
        return decimal.toString(16);
}

// Changes the RGB/HEX temporarily to a HSL-Value, modifies that value and changes it back to RGB/HEX.
function changeHue(rgb, degree) {
    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string (#XXXXXX) and returns an object
function rgbToHSL(rgb) { 

    var r = parseInt(rgb.slice(1, 3), 16) / 255,
        g = parseInt(rgb.slice(3, 5), 16) / 255,
        b = parseInt(rgb.slice(5, 7), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return "#" + decimalToHex(r) + decimalToHex(g) + decimalToHex(b);
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0)
        color = 0;
    return color;
}

// hexagons generation
// context.isPointInPath(cursor.x, cursor.y)

function generateGrid(width, height, size, margin) {
    hexagons = [];
    for (let y = 0; y < height + size * 2; y += size * 2 * Math.sin(angle60))
    {
        for(let x = 0; x < width + size * 2; x += size * 1.5) {
            hexagons.push(new Hexagon(x, x%size==0 ? y : y + size * Math.sin(angle60), size, margin, hexagonsGradient, "default"));
        }
    }
}

class Hexagon{
    constructor(x, y, size, margin, fillstyle, state){
        this.x = x;
        this.y = y;
        this.size = size;
        this.margin = margin;
        this.fillstyle = fillstyle;
        this.state = state;
        this.stateVariable = 0;

        this.createHexPath(this.size - this.margin);
    }

    createHexPath(size) {
        this.path = new Path2D();
        for (let i = 0; i < 6; i++) 
            this.path.lineTo(this.x + (size) * Math.cos(angle60 * i), this.y + (size) * Math.sin(angle60 * i));
        this.path.closePath();
    }

    draw() {
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = hexagonsEdgeColor;

        if(this.state == "active")
            context.fillStyle = "#808080";
        if(this.state == "click")
            context.fillStyle = "#ffffff";
        if(this.state == "default")
            context.fillStyle = hexagonsGradient;

        context.fill(this.path);
        context.stroke(this.path);
    }
}

class Particle{
    constructor(x, y, radius, color, remainingLife) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.remainingLife = remainingLife;
        this.totalLife = remainingLife;
    }

    draw() {
        const size = this.radius*2*this.remainingLife/this.totalLife;
        context.translate(this.x-size, this.y-size);

        let gradient = context.createRadialGradient(size, size, 0, size, size, size);

        gradient.addColorStop(0,   this.color + decimalToHex(Math.floor(255*this.remainingLife/this.totalLife)));
        gradient.addColorStop(0.6, this.color + decimalToHex(Math.floor(128*this.remainingLife/this.totalLife)));
        gradient.addColorStop(0.8, this.color + decimalToHex(Math.floor(55*this.remainingLife/this.totalLife)));
        gradient.addColorStop(1,   this.color + decimalToHex(0));

        context.fillStyle = gradient;
        context.fillRect(0, 0, size*2, size*2); 
        context.setTransform(1, 0, 0, 1, 0, 0);  
    }

    reduceLife() {
        this.remainingLife--;
    }

    update() {
        this.reduceLife();
    }
}

class Light {
    constructor(x, y, radius, color, trailLenght, hueChange, xSpeed = 0, ySpeed = 0) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.trailLenght = trailLenght;
        this.hueChange = hueChange;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;

        if(this.hueChange!=0)
            setInterval(() => {this.hueChange>0 ? this.changeHue(1) : this.changeHue(-1);}, 1000/Math.abs(this.hueChange));
    }

    draw() {
        const size = this.radius*2;
        context.translate(this.x-size, this.y-size);

        let gradient = context.createRadialGradient(size, size, 0, size, size, size);

            gradient.addColorStop(0,   this.color + decimalToHex(255));
            gradient.addColorStop(0.6, this.color + decimalToHex(128));
            gradient.addColorStop(0.8, this.color + decimalToHex(55));
            gradient.addColorStop(1,   this.color + decimalToHex(0));

        context.fillStyle = gradient;
        context.fillRect(0, 0, size*2, size*2); 
        context.setTransform(1, 0, 0, 1, 0, 0);  
    }

    moveTo(x,y) {   // CursorLight exclusive

        let distance = Math.sqrt((x-this.x)*(x-this.x) + (y-this.y)*(y-this.y))
        let minDistanceBetweenParticles = Math.max(3, this.radius/5);

        if(distance > minDistanceBetweenParticles) {
            let trailAngle = Math.atan2(x-this.x, y-this.y);// * 180 / Math.PI;

            for(let i=0; i<Math.floor(distance/minDistanceBetweenParticles); i++)
                trailParticles.push(new Particle(this.x+Math.sin(trailAngle)*minDistanceBetweenParticles*i, this.y+Math.cos(trailAngle)*minDistanceBetweenParticles*i, this.radius, this.color, this.trailLenght));
        }

        this.x = x;
        this.y = y;
    }

    move() {

        let distance = Math.sqrt(this.xSpeed*this.xSpeed + this.ySpeed*this.ySpeed)
        let minDistanceBetweenParticles = Math.max(3, this.radius/5);

        if(distance > minDistanceBetweenParticles) {
            let trailAngle = Math.atan2(this.xSpeed, this.ySpeed);// * 180 / Math.PI;

            for(let i=0; i<Math.floor(distance/minDistanceBetweenParticles); i++)
                trailParticles.push(new Particle(this.x+Math.sin(trailAngle)*minDistanceBetweenParticles*i, this.y+Math.cos(trailAngle)*minDistanceBetweenParticles*i, this.radius, this.color, this.trailLenght));
        }

        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    changeHue(shift) {
         this.color = changeHue(this.color, shift);
    }

    createParticle() {
        trailParticles.push(new Particle(this.x, this.y, this.radius, this.color, this.trailLenght));
    }

    update()
    {      
        if(this.trailLenght>0)
            this.createParticle();

        if(this.xSpeed!=0 && this.ySpeed!=0)
            this.move();
    }
}

// lights

function newRandomLight() {
    let size = rand(randomLightsSizeMin, randomLightsSizeMax);
    let speed = rand(randomLightsSpeedMin, randomLightsSpeedMax);
    let randomLightAngle = Math.random() * Math.PI * 2;
    let xSpeed = Math.cos(randomLightAngle)*speed;
    let ySpeed = Math.sin(randomLightAngle)*speed;
    let xPos;
    let yPos;
    let random = Math.floor(Math.random()*2);
    let color = randomLightsColor;
    if(randomLightsColorHueRange!=0)
        color = changeHue(randomLightsColor, randomLightsColorHueRange>0 ? rand(0, randomLightsColorHueRange) : -rand (0, -randomLightsColorHueRange));

    if(xSpeed >= 0 && ySpeed >= 0){
        xPos = (random == 0 ? 0 : rand(0, innerWidth/2)) - Math.cos(randomLightAngle)*size;
        yPos = (random != 0 ? 0 : rand(0, innerHeight/2)) - Math.sin(randomLightAngle)*size;
    }
    if(xSpeed >= 0 && ySpeed < 0){
        xPos = (random == 0 ? 0 : rand(0, innerWidth/2)) - Math.cos(randomLightAngle)*size;
        yPos = (random != 0 ? innerHeight : rand(innerHeight/2, innerHeight)) + Math.sin(randomLightAngle)*size;
    }
    if(xSpeed < 0 && ySpeed < 0){
        xPos = (random == 0 ? innerWidth : rand(innerWidth/2, innerWidth)) + Math.cos(randomLightAngle)*size;
        yPos = (random != 0 ? innerHeight : rand(innerHeight/2, innerHeight)) + Math.sin(randomLightAngle)*size;
    }
    if(xSpeed < 0 && ySpeed >= 0){
        xPos = (random == 0 ? innerWidth : rand(innerWidth/2, innerWidth)) + Math.cos(randomLightAngle)*size;
        yPos = (random != 0 ? 0 : rand(0, innerHeight/2)) - Math.sin(randomLightAngle)*size;
    }

    return new Light(xPos, yPos, size, color, randomLightsTrailLenght, randomLightsColorHueChange, xSpeed, ySpeed);
}

function newClickLight() {
    let size = rand(clickLightsSizeMin, clickLightsSizeMax);
    let speed = rand(clickLightsSpeedMin, clickLightsSpeedMax);
    let clickLightAngle = Math.random() * Math.PI * 2;
    let xSpeed = Math.cos(clickLightAngle)*speed;
    let ySpeed = Math.sin(clickLightAngle)*speed;
    let color = clickLightsColor;
    if(clickLightsMatchCursor) {
        color = cursorLight.color;
    } 
    else {
        if(clickLightsColorHueRange!=0) {       
            color = changeHue(clickLightsColor, clickLightsColorHueRange>0 ? rand(0, clickLightsColorHueRange) : -rand (0, -clickLightsColorHueRange));
        }
    }

    return new Light(cursorLight.x, cursorLight.y, size, color, clickLightsTrailLenght, clickLightsColorHueChange, xSpeed, ySpeed);
}

function updateCursorLight() {
    cursorLight.moveTo(cursor.x, cursor.y);
    cursorLight.update()
}

function updateRandomLights() {
    while(randomLightsCount < randomLights.length) {
        randomLights.pop();
    }

    for(let i = 0; i < randomLightsCount; i++) {

        if( typeof randomLights[i] == "undefined"
            || randomLights[i].x > innerWidth + randomLights[i].radius || randomLights[i].x < -randomLights[i].radius
            || randomLights[i].y > innerHeight + randomLights[i].radius || randomLights[i].y < -randomLights[i].radius 
        )
        randomLights[i] = newRandomLight();

        randomLights[i].update();
    }
}

function updateClickLights() {

    remainingClickLights = clickLights.filter(clickLight => (
        clickLight.x < innerWidth + clickLight.radius  && clickLight.x > -clickLight.radius &&      // drop it to another function
        clickLight.y < innerHeight + clickLight.radius && clickLight.y > -clickLight.radius 
    ));
    clickLights = remainingClickLights;

    clickLights.forEach(light => {light.update();});
}

function generateClickLights() {
    for(let i=0; i<clickLightsCount; i++)
        clickLights.push(newClickLight());
}

function updateParticles()
{
    trailParticles.forEach(particle => {particle.update();});
    remainingTrailParticles = trailParticles.filter(particle => particle.remainingLife > 0);
    trailParticles = remainingTrailParticles;
}

function updateHexagons(click = false) {
    hexagons.forEach(hex => {
        if(hex.state == "active") {
            if(hex.stateVariable<1)
                hex.state = "default";
            else
                hex.stateVariable--;
        }

        if(context.isPointInPath(hex.path, cursor.x, cursor.y)) 
        {
            if(click) {
                if(hex.state != "click")
                    hex.state = "click";
                else {
                    hex.state = "active";
                    hex.stateVariable = 60;
                }
            } else {
                if(hex.state != "click") {
                    hex.state = "active";
                    hex.stateVariable = 60;
                }
            }
        }
    });
}

// animation setup and loop

let cursorLight = new Light(cursor.x, cursor.y, cursorLightSize, cursorLightColor, cursorLightTrailLenght, cursorLightColorHueChange);

let randomLights = [];
let trailParticles = [];
let clickLights = [];

let hexagons = [];

let backgroundGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
    backgroundGradient.addColorStop(0, backgroundColor1);
    backgroundGradient.addColorStop(1, backgroundColor2);

let hexagonsGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
    hexagonsGradient.addColorStop(0, hexagonsColor1);
    hexagonsGradient.addColorStop(1, hexagonsColor2);

generateGrid(canvas.width, canvas.height, hexagonsSize, hexagonsMargin);

let logicFrameTime1 = performance.now();
let logicFrameTime2 = performance.now();
let renderFrameTime1 = performance.now();
let renderFrameTime2 = performance.now();

// web workers?
setInterval(() => {updateLogic();}, 1000/LogicUpdatesPerSecond);
setInterval(() => {renderFrame();}, 1000/FramesPerSecond);

function updateLogic() {
    updateRandomLights();
    updateClickLights();
    updateCursorLight();
    updateParticles();
//    updateHexagons();

    // logicFrameTime2 = performance.now();
    // console.log("Logic frame time: " + (logicFrameTime2 - logicFrameTime1).toFixed(1) + " ms");
    // logicFrameTime1 = performance.now();
}

function renderFrame() {
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    randomLights.forEach(randomLight => {randomLight.draw();});
    clickLights.forEach(clickLight => {clickLight.draw();});
    cursorLight.draw();
    trailParticles.forEach(particle => {particle.draw();});
    hexagons.forEach(hexagon => {hexagon.draw();});

    renderFrameTime2 = performance.now();
    console.log("render frame time: " + (renderFrameTime2 - renderFrameTime1).toFixed(1) + " ms");
    renderFrameTime1 = performance.now();
}

// listeners

addEventListener("resize", (e) => {
    canvas.height = innerHeight;
    canvas.width = innerWidth;
    generateGrid(canvas.width, canvas.height, hexagonsSize, hexagonsMargin);
});

addEventListener("mousemove", (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
//    updateHexagons();
});

// not working
addEventListener("mouseenter", (e) => {
    console.log("mouseenter");
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});

// not working
addEventListener("mouseleave", (e) => {
    console.log("mouseleave");
    cursor.x = - cursorLightSize
    cursor.y = - cursorLightSize
});

addEventListener("click", (e) => {
    generateClickLights();
//    updateHexagons(true);
})

trailParticles.push(new Particle(this.x, this.y, this.radius, this.color, this.trailLenght));

function livelyPropertyListener(name, val) {
    switch(name) {

    // BACKGROUND AND GRID COLORS:

        case "backgroundColor1":
            backgroundColor1 = val;
            backgroundGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
            backgroundGradient.addColorStop(0, backgroundColor1);
            backgroundGradient.addColorStop(1, backgroundColor2);
            break;

        case "backgroundColor2":
            backgroundColor2 = val;
            backgroundGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
            backgroundGradient.addColorStop(0, backgroundColor1);
            backgroundGradient.addColorStop(1, backgroundColor2);
            break;

        case "hexagonsColor1":
            hexagonsColor1 = val;
            hexagonsGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
            hexagonsGradient.addColorStop(0, hexagonsColor1);
            hexagonsGradient.addColorStop(1, hexagonsColor2);
            break;

        case "hexagonsColor2":
            hexagonsColor2 = val;
            hexagonsGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
            hexagonsGradient.addColorStop(0, hexagonsColor1);
            hexagonsGradient.addColorStop(1, hexagonsColor2);
            break;

        case "HexagonsEdgeColor":
            hexagonsEdgeColor = val;
            break;

    // HEXAGONS:

        case "hexagonsSize":
            hexagonsSize = val;
            break;

        case "hexagonsMargin":
            hexagonsMargin = val;
            break;

        case "displayAsTriangles":
            displayAsTriangles = val;
            break;

    // CURSOR LIGHT:        

        case "cursorLightColor":
            cursorLightColor = val;
            cursorLight = new Light(cursor.x, cursor.y, cursorLightSize, cursorLightColor, cursorLightTrailLenght, cursorLightColorHueChange);
            break;

        case "cursorLightColorHueChange":
            cursorLightColorHueChange = val;
            cursorLight = new Light(cursor.x, cursor.y, cursorLightSize, cursorLightColor, cursorLightTrailLenght, cursorLightColorHueChange);
            break;

        case "cursorLightSize":
            cursorLightSize = val;
            cursorLight = new Light(cursor.x, cursor.y, cursorLightSize, cursorLightColor, cursorLightTrailLenght, cursorLightColorHueChange);
            break;
            
        case "cursorLightTrailLenght":
            cursorLightTrailLenght = val;
            cursorLight = new Light(cursor.x, cursor.y, cursorLightSize, cursorLightColor, cursorLightTrailLenght, cursorLightColorHueChange);
            break;

    // RANDOM LIGHTS:

        case "randomLightsCount":
            randomLightsCount = val;
            break;

        case "randomLightsColor":
            randomLightsColor = val;
            break;

        case "randomLightsColorHueRange":
            randomLightsColorHueRange = val;
            break;

        case "randomLightsColorHueChange":    
            randomLightsColorHueChange = val;
            break;

        case "randomLightsSizeMin":
            randomLightsSizeMin = val;
            break;

        case "randomLightsSizeMax":
            randomLightsSizeMax = val;
            break; 

        case "randomLightsSpeedMin":
            randomLightsSpeedMin = val;
            break;    

        case "randomLightsSpeedMax":
            randomLightsSpeedMax = val;
            break;    
            
        case "randomLightsTrailLenght":
            randomLightsTrailLenght = val;
            break;

    // CLICK LIGHTS:

        case "clickLightsCount":
            clickLightsCount = val;
            break;

        case "clickLightsColor":
            clickLightsColor = val;
            break;

        case "clickLightsColorHueRange":
            clickLightsColorHueRange = val;
            break;

        case "clickLightsMatchCursor":
            clickLightsMatchCursor = val;
            break;

        case "clickLightsColorHueChange":    
            clickLightsColorHueChange = val;
            break;

        case "clickLightsSizeMin":
            clickLightsSizeMin = val;
            break;

        case "clickLightsSizeMax":
            clickLightsSizeMax = val;
            break; 

        case "clickLightsSpeedMin":
            clickLightsSpeedMin = val;
            break;    

        case "clickLightsSpeedMax":
            clickLightsSpeedMax = val;
            break;    
            
        case "clickLightsTrailLenght":
            clickLightsTrailLenght = val;
            break;
    }
}
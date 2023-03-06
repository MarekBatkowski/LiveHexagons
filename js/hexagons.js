// variables customisable using LivelyProperties.json

// COLORS:
let backgroundColor1 =  "#0C0C0C" // "rgb(12,12,12)";
let backgroundColor2 =  "#181818" // "rgb(24,24,24)";
let hexagonsColor1 =    "#384048" // "rgb(56,64,72)";
let hexagonsColor2 =    "#54606C" // "rgb(84,96,108)";
let HexagonsEdgeColor = "#C0C0C0" // "rgb(192,192,192)";

// HEXAGONS:
let hexagonsSize = 50;
let hexagonsMargin = 5;
let displayAsTriangles = false;         //

// CURSOR LIGHT:    
let cursorLightColor = "#6080FF";
let cursorLightColorHueChange = 10;
let cursorLightSize = 50;
let cursorLightTrailLenght = 100;

// RANDOM LIGHTS 
let randomLightsCount = 2;
let randomLightsColor = "#FF6000";
let randomLightsColorHueRange = -64;      
let randomLightsColorHueChange = 0;  
let randomLightsSizeMin = 20;
let randomLightsSizeMax = 40;
let randomLightsSpeedMin = 3;
let randomLightsSpeedMax = 5;
let randomLightsTrailLenght = 50;
 
// consts

const fps = 240;
const rareOperationsSyncFpsDivider = 12;
const angle = 2 * Math.PI / 6;

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

// objects

class Particle{
    constructor(x, y, radius, color, remainingLife) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.remainingLife = remainingLife;
        this.totalLife = remainingLife;
        // console.log(this);
    }

    draw(context) {
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

    update()
    {
        this.reduceLife();
        this.draw(context);
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
    }

    // use this to create light by creating smaller more transparent objects as "echo"
    draw(context) {
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

    moveTo(x,y) {
        this.x = x;
        this.y = y;
    }

    move() {
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
        if(this.hueChange!=0 && hueChangecounter == 0)
            this.changeHue(this.hueChange);
        
        if(this.trailLenght>0)
            this.createParticle();

        if(this.xSpeed!=0 && this.ySpeed!=0)
            this.move();

        this.draw(context);
    }
}

// hexagons generation

function drawGrid(width, height, size, margin) {
    for (let y = 0; y < height + size; y += size * Math.sin(angle)) {
        for (let x = 0, j = 0; x < width + (2 + (-1)**j) * size; x += size * (1 + Math.cos(angle)), y += (-1) ** j++ * size * Math.sin(angle)) {
            drawHexagon(x, y, size-margin);
        }
    }
}

function drawHexagon(x, y, size) {
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = HexagonsEdgeColor;
    context.fillStyle = hexagondGradient;

    for (let i = 0; i < 6; i++) 
        context.lineTo(x + size * Math.cos(angle * i), y + size * Math.sin(angle * i));
    context.closePath();
    context.fill();
    context.stroke();
}

//function drawTriangles(x, y, size)

// lights

function newRandomLight() {
    let size = rand(randomLightsSizeMin, randomLightsSizeMax);
    let speed = rand(randomLightsSpeedMin, randomLightsSpeedMax);
    let angle = Math.random() * Math.PI * 2;
    let xSpeed = Math.cos(angle)*speed;
    let ySpeed = Math.sin(angle)*speed;
    let xPos;
    let yPos;
    let random = Math.floor(Math.random()*2);
    let color = randomLightsColor;
    if(randomLightsColorHueRange!=0)
        color = changeHue(randomLightsColor, randomLightsColorHueRange>0 ? rand(0, randomLightsColorHueRange) : -rand (0, -randomLightsColorHueRange));

    if(xSpeed >= 0 && ySpeed >= 0){
        xPos = (random == 0 ? 0 : rand(0, innerWidth/2)) - Math.cos(angle)*size;
        yPos = (random != 0 ? 0 : rand(0, innerHeight/2)) - Math.sin(angle)*size;
    }
    if(xSpeed >= 0 && ySpeed < 0){
        xPos = (random == 0 ? 0 : rand(0, innerWidth/2)) - Math.cos(angle)*size;
        yPos = (random != 0 ? innerHeight : rand(innerHeight/2, innerHeight)) + Math.sin(angle)*size;
    }
    if(xSpeed < 0 && ySpeed < 0){
        xPos = (random == 0 ? innerWidth : rand(innerWidth/2, innerWidth)) + Math.cos(angle)*size;
        yPos = (random != 0 ? innerHeight : rand(innerHeight/2, innerHeight)) + Math.sin(angle)*size;
    }
    if(xSpeed < 0 && ySpeed >= 0){
        xPos = (random == 0 ? innerWidth : rand(innerWidth/2, innerWidth)) + Math.cos(angle)*size;
        yPos = (random != 0 ? 0 : rand(0, innerHeight/2)) - Math.sin(angle)*size;
    }

    return new Light(xPos, yPos, size, color, randomLightsTrailLenght, randomLightsColorHueChange, xSpeed, ySpeed);
}

function updateCursorLight() {
    cursorLight.moveTo(cursor.x, cursor.y);
    if(cursor.x>0 && cursor.x<innerWidth && cursor.y>0 && cursor.y<innerHeight)
        cursorLight.update()
}

function updateRandomLights() {
    for(let i = 0; i < randomLightsCount; i++) {

        if( typeof randomLights[i] == "undefined" ||
            randomLights[i].x > innerWidth + randomLights[i].radius ||
            randomLights[i].x < -randomLights[i].radius || 
            randomLights[i].y > innerHeight + randomLights[i].radius ||
            randomLights[i].y < -randomLights[i].radius 
        )
        randomLights[i] = newRandomLight();

        randomLights[i].update();
    }
}

function updateParticles()
{
    for(let i = 0; i < trailParticles.length; i++)
        trailParticles[i].update();

    remainingTrailParticles = trailParticles.filter(particle => particle.remainingLife > 0);
    trailParticles = remainingTrailParticles;
}

// animation setup and loop

let hueChangecounter = rareOperationsSyncFpsDivider;
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};

let cursorLight = new Light(cursor.x, cursor.y, cursorLightSize, cursorLightColor, cursorLightTrailLenght, cursorLightColorHueChange);
let randomLights = [];
let trailParticles = [];

let backgroundGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
    backgroundGradient.addColorStop(0, backgroundColor1);
    backgroundGradient.addColorStop(1, backgroundColor2);

let hexagondGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
    hexagondGradient.addColorStop(0, hexagonsColor1);
    hexagondGradient.addColorStop(1, hexagonsColor2);
    
canvas.height = innerHeight;
canvas.width = innerWidth;
animate();

function animate() {
    hueChangecounter--;
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    updateRandomLights();
    updateCursorLight();
    updateParticles();
    drawGrid(canvas.width, canvas.height, hexagonsSize, hexagonsMargin);
    if(hueChangecounter<1) hueChangecounter = rareOperationsSyncFpsDivider;
    setTimeout(() => {requestAnimationFrame(animate);}, 1000 / fps);
}

// listeners

addEventListener("mousemove", (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});

addEventListener("touchmove", (e) => {
    e.preventDefault();
    cursor.x = e.touches[0].clientX;
    cursor.y = e.touches[0].clientY;
    },
    { passive: false }
);
  
addEventListener("resize", (e) => {
    canvas.height = innerHeight;
    canvas.width = innerWidth;
});

function livelyPropertyListener(name, val) {
    switch(name) {

    // COLORS:

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
            hexagondGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
            hexagondGradient.addColorStop(0, hexagonsColor1);
            hexagondGradient.addColorStop(1, hexagonsColor2);
            break;

        case "hexagonsColor2":
            hexagonsColor2 = val;
            hexagondGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
            hexagondGradient.addColorStop(0, hexagonsColor1);
            hexagondGradient.addColorStop(1, hexagonsColor2);
            break;

        case "HexagonsEdgeColor":
            HexagonsEdgeColor = val;
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
    }
}
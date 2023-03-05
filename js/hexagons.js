// consts
const fps = 120;
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const hexToDecimal = hex => parseInt(hex, 16);
const angle = 2 * Math.PI / 6;

const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};

//variables customisable using LivelyProperties.json
let backgroundColor1 = "#0C0C0C" // "rgb(12,12,12)";
let backgroundColor2 = "#181818" // "rgb(24,24,24)";
let hexagonsColor1 = "#384048" // "rgb(56,64,72)";
let hexagonsColor2 = "#54606C" // "rgb(84,96,108)";
let HexagonsEdgeStyle = "#C0C0C0" // "rgb(192,192,192)";
let hexagonsSize = 50;
let hexagonsMargin = 5;
let cursorLightColor = "rgb(64,128,255)";
let lightSize = 50;
let lightTrail = 15;
let randomLightsCount = 3;
////////////////////////////////////////////////////

class Light {
    constructor(x, y, radius, color, intensity, xSpeed = 0, ySpeed = 0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.intensity = intensity
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    }

    // use this to create light by creating smaller more transparent objects as "echo"
    draw(context) {
        let colorArr = this.color.slice(
            this.color.indexOf("(") + 1, 
            this.color.indexOf(")")
        ).split(",");

        const size = this.radius*2;
        context.translate(this.x-size, this.y-size);
        let gradient = context.createRadialGradient(size, size, 0, size, size, size);

            gradient.addColorStop(0,   "rgba("+colorArr[0]+","+colorArr[1]+","+colorArr[2]+","+this.intensity+")");
            gradient.addColorStop(0.6, "rgba("+colorArr[0]+","+colorArr[1]+","+colorArr[2]+","+this.intensity*0.5+")");
            gradient.addColorStop(0.8, "rgba("+colorArr[0]+","+colorArr[1]+","+colorArr[2]+","+this.intensity*0.2+")");
            gradient.addColorStop(1,   "rgba("+colorArr[0]+","+colorArr[1]+","+colorArr[2]+",0)");

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
}

let cursorLight = new Light(cursor.x, cursor.y, lightSize, cursorLightColor, 1);
let randomLights = [];

let backgroundGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
    backgroundGradient.addColorStop(0, backgroundColor1);
    backgroundGradient.addColorStop(1, backgroundColor2);

let hexagondGradient = context.createLinearGradient(0, 0, innerHeight, innerWidth);
    hexagondGradient.addColorStop(0, hexagonsColor1);
    hexagondGradient.addColorStop(1, hexagonsColor2);

updateRandomLights();
setCanvasSize();
animate();

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
  
addEventListener("resize", () => setCanvasSize());
  
function setCanvasSize() {
    canvas.height = innerHeight;
    canvas.width = innerWidth;
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function updateRandomLights() {
    for(let i = 0; i < 3; i++) {
        
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
    context.strokeStyle = HexagonsEdgeStyle;
    context.fillStyle = hexagondGradient;

    for (let i = 0; i < 6; i++) {
        context.lineTo(x + size * Math.cos(angle * i), y + size * Math.sin(angle * i));
    }
    context.closePath();
    context.fill();
    context.stroke();
}

function animate() {
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    cursorLight.moveTo(cursor.x, cursor.y);
    cursorLight.draw(context);
    updateRandomLights();
    drawGrid(canvas.width, canvas.height, hexagonsSize, hexagonsMargin);
    setTimeout(() => {requestAnimationFrame(animate);}, 1000 / fps);   // sync fps
}

function livelyPropertyListener(name, val) {
    switch(name) {
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

        case "HexagonsEdgeStyle":
            HexagonsEdgeStyle = val;
            break;

        case "hexagonsSize":
            hexagonsSize = val;
            break;

        case "hexagonsMargin":
            hexagonsMargin = val;
            break;

        case "cursorLightColor":
            let colorinHex = val;
            cursorLightColor = "rgb(" + hexToDecimal(val.slice(1,3)) + "," + hexToDecimal(val.slice(3,5)) + "," +hexToDecimal(val.slice(5,7)) + ")";
            cursorLight = new Light(cursor.x, cursor.y, lightSize, cursorLightColor, 1);
            break;

        case "lightSize":
            lightSize = val;
            cursorLight = new Light(cursor.x, cursor.y, lightSize, cursorLightColor, 1);
            break;                       
    }
}
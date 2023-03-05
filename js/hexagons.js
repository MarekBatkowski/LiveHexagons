const hexToDecimal = hex => parseInt(hex, 16);
const angle = 2 * Math.PI / 6;
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
  };

let hexagonsSize = 50;
let hexagonsMargin = 5;
let cursorLightColor = "rgb(64,128,255)";
let lightSize = 50;

class Light {
    constructor(x, y, radius, color, intensity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.intensity = intensity
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
        //context.fillStyle = "rgba("+colorArr[0]+","+colorArr[1]+","+colorArr[2]+","+this.intensity+")"
        context.fillRect(0, 0, size*2, size*2); 
        context.setTransform(1, 0, 0, 1, 0, 0);  
    }

    moveTo(x,y) {
        this.x = x;
        this.y = y;
    }
}

let cursorLight = new Light(cursor.x, cursor.y, lightSize, cursorLightColor, 1);
let randomLights = [];

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
setCanvasSize();
anim();

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
    context.strokeStyle = "rgba(255,255,255,1)"
    context.fillStyle= "rgba(64,64,64,1)"

    for (let i = 0; i < 6; i++) {
        context.lineTo(x + size * Math.cos(angle * i), y + size * Math.sin(angle * i));
    }
    context.closePath();
    context.fill();
    context.stroke();
}

function anim() {
    requestAnimationFrame(anim);
    context.fillStyle = "rgba(16,16,16,1)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    cursorLight.moveTo(cursor.x, cursor.y);
    cursorLight.draw(context);
    drawGrid(canvas.width, canvas.height, hexagonsSize, hexagonsMargin);
}

function livelyPropertyListener(name, val)
{
    switch(name) {
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
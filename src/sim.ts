import {CSS, ELEM} from "htmlgen";
import {convolve2dComplex} from "./convolution.js";

const width = 512/2;
const height = 512/2;

CSS.add(`
.sim{
    display: grid;
    justify-content: center;
    align-content: center; 
    grid-template-columns: ${Math.max(512,width)}px 15em;
    grid-template-rows: ${Math.max(512,height)}px;
    column-gap: 1em;
    row-gap: 1em;
    padding: 1em;
    box-sizing: border-box;
    height: 100vh;
    width: 100vw;
}

.sim>div{
    margin: 0px;
    box-sizing: border-box;
}

.main{
    grid-area: 1/1/2/2;
}

.right{
    grid-area: 1/2/2/3;
}
`);


const toColor = function(v: number){
    if(v > 1)v = 1;
    if(v < 0)v = 0;
    const r = v*256;
    const g = Math.cos((v-0.5)*4)*255;
    //const g = (0.5-Math.abs(v-0.5))*2*256;
    const b = (1-v)*256;
    const a = 255;
    return [r,g,b,a];
};

const squash = function(x: number, slope=0.01){
    slope = 0.2e-31;
    if(x === Infinity)return 1;
    // log => sigmoid
    return -2/(1+Math.E**(2*Math.log(slope*x+1)))+1;
};


class SimCanvas extends ELEM{
    constructor(){
        super("canvas");
        const canvas = this.canvas = this.e;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Fuck You",width/2,height*0.7);
        const objects = [];// mass, x, y, vx, vy
        const imgdata = ctx.getImageData(0,0,width,height);
        const data = imgdata.data;
        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                const idx = (y*width+x)*4;
                const alpha = data[idx+3];
                if(alpha > 100){
                    for(let dx = 0; dx < 1; dx += 0.2){
                        for(let dy = 0; dy < 1; dy += 0.2){
                            objects.push([1.989e+30,x+dx,y+dy,0,0]);
                        }
                    }
                }
            }
        }
        console.log(objects.length);
        this.objects = objects;
        this.imgdata = imgdata;
        this.ctx = ctx;

        const size = width*height;
        const hw = Math.floor(width/2);
        const hh = Math.floor(height/2);
        this.densityMask = new Float32Array(size*2);
        this.kernelX     = new Float32Array(size*2);
        this.kernelY     = new Float32Array(size*2);

        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                const idx = (y*width+x);
                let x1 = (x+hw)%width;
                let y1 = (y+hh)%height;
                let dx = hw-x1;
                let dy = hh-y1;
                if(dx === 0 && dy === 0){
                    this.kernelX[idx*2] = 0;
                    this.kernelY[idx*2] = 0;
                    continue;
                }
                // multiply with pixel width
                dx *= this.pw;
                dy *= this.pw;
                // inverse square
                const r2 = dx*dx+dy*dy;
                const r = Math.sqrt(r2);
                const isq = 1/r2;
                const xcomp = isq*(dx/r);
                const ycomp = isq*(dy/r);
                this.kernelX[idx*2] = xcomp*this.G;
                this.kernelY[idx*2] = ycomp*this.G;
            }
        }
        this.start();
    }
    G = 6.6743015e-11;
    pw = 150e+9;//1au
    step(dt: number){
        console.log("stepping");
        //calculate density field
        const density = this.densityMask;
        const objects = this.objects;
        const {ctx, imgdata} = this;
        const {data} = imgdata;
        density.fill(0);
        for(let object of objects){
            let m = object[0];
            let x = Math.floor(object[1]);
            let y = Math.floor(object[2]);
            const idx = y*width+x;
            density[idx*2] += m;
        }
        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                let idx = y*width+x;
                const [r,g,b,a] = toColor(squash(density[idx*2],1));
                data[idx*4+0] = r;
                data[idx*4+1] = g;
                data[idx*4+2] = b;
                data[idx*4+3] = a;
            }
        }
        ctx.putImageData(imgdata,0,0);

        //Actual calculation
        const xaccs = convolve2dComplex(density, this.kernelX, width, height);
        const yaccs = convolve2dComplex(density, this.kernelY, width, height);
        //console.log(density,this.kernelX,xaccs);
        //
        
        //for now calculate without close field interaction
        for(let object of objects){
            const x_ = Math.floor(object[1]);
            const y_ = Math.floor(object[2]);
            const idx = y_*width+x_;
            object[3] += xaccs[idx*2]*dt;
            object[4] += yaccs[idx*2]*dt;
            object[1] += object[3]*dt;
            object[2] += object[4]*dt;
        }
    }
    async start(){
        while(true){
            this.step(0.8);
            //console.log(this.objects);
            //return;
            await new Promise(res=>setTimeout(res,0));
        }
    }
}


CSS.add(`
.sim canvas{
    margin-left: ${(512-width)/2}px;
    margin-top: ${(512-height)/2}px;
}
`);


export class Sim extends ELEM{
    constructor(){
        super("div","class: sim");
        const main = this.add("div","class: stdbox main",0,"padding:0px;");
        const right = this.add("div","class: stdbox right");
        const sim = main.add(new SimCanvas());
        right.add("div",0,`Number of particles: ${sim.objects.length}`);
    }
}



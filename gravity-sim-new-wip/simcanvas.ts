import {CSS, ELEM} from "htmlgen";
import {GravitySimulation} from "./sim-backend";
import {goto} from "../src/router";

const width = 512;
const height = 512;

const simulationWidth = 256;
const simulationHeight = 256;

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

const squash = function(x,slope=0.01){
    if(x === Infinity)return 1;
    // log => sigmoid
    return -2/(1+Math.E**(2*Math.log(slope*x+1)))+1;
};

const getStarsFromMessage = function(width: number, height: number, pixelWidth: number, message: string){
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const lines = message.split("\n");
    ctx.font = "70px Arial";
    ctx.textAlign = "center";
    for(let i = 0; i < lines.length; i++){
        const line = lines[i];
        const r = ((i/(lines.length-1))-0.5)*0.4+0.5;
        ctx.strokeText(line,width/2,height*r);
    }
    const objects = [];
    for(let y = 0; y < width; y++){
        for(let x = 0; x < width; x++){
            const idx = (y*width+x)*4;
            const alpha = data[idx+3];
            if(alpha > 100){
                for(let dx = 0; dx < 1; dx += 0.2){
                    for(let dy = 0; dy < 1; dy += 0.2){
                        const xx = (x+dx)*pixelWidth;
                        const yy = (y+dy)*pixelWidth;
                        // mass x y vx vy
                        objects.push([1.989e+30,xx,yy,0,0]);// last 2 are the velocity
                    }
                }
            }
        }
    }
    return objects;
};


class MessageCanvas extends ELEM{
    constructor(width: number, height: number, message: number){
        super("canvas");
        const simPW = 150e+9;// 1 AU 
        this.pw = simPW*simulationWidth/width;
        this.objects = getStarsFromMessage(width,height,pw,message);
        this.canvas = this.e;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = canvas.getContext("2d");
        this.imgdata = ctx.getImageData(0,0,width,height);
        this.data = imgdata.data;
        this.density = new Float32Array(width*height);
        this.simulation = new GravitySimulation(objects, simPW, simulationWidth, simulationHeight);
    }
    step(dt: number){
        //calculate density field
        const {ctx, imgdata, data, pw, density, objects} = this;
        density.fill(0);
        for(let object of objects){
            const m = object[0];
            const x = Math.floor(object[1]/pw);
            const y = Math.floor(object[2]/pw);
            const idx = y*width+x;
            density[idx] += m;
        }
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                let idx = y*width+x;
                const [r,g,b,a] = toColor(squash(density[idx],0.2e-31));
                data[idx*4+0] = r;
                data[idx*4+1] = g;
                data[idx*4+2] = b;
                data[idx*4+3] = a;
            }
        }
        ctx.putImageData(imgdata,0,0);
        this.simulation.step(dt);
    }
    stopped = false;
    async start(){
        let t = 0;
        const dt = 60000;
        while(!this.stopped){
            this.step(dt);
            this.onFrame(t,dt);
            t += dt;
            await new Promise(res=>setTimeout(res,0));
        }
    }
    async stop(){
        this.stopped = true;
    }
    onFrame = ()=>{};
}


CSS.add(`
.sim canvas{
    margin-left: ${(512-width)/2}px;
    margin-top: ${(512-height)/2}px;
}
`);





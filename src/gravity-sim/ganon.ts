import {CSS, ELEM} from "htmlgen";
import {GravitySimulation} from "./sim-backend";
import {goto} from "../router";

const width = 512;
const height = 512;

const simulationWidth = 256;
const simulationHeight = 256;

CSS.add(`
.sim{
    display: grid;
    justify-content: center;
    align-content: center; 
    grid-template-columns: ${width}px 15em;
    grid-template-rows: 1fr 4em;
    column-gap: 1em;
    row-gap: 1em;
    padding: 1em;
    box-sizing: border-box;
    height: calc(${height}px + 2em);
    width: 100vw;
}

.sim>div{
    margin: 0px;
    box-sizing: border-box;
}

.main{
    grid-area: 1/1/3/2;
}

.right{
    grid-area: 1/2/2/3;
}

.bottom{
    grid-area: 2/2/3/3;
    background-color: #00ab4d;
}
.bottom:hover{
    background-color: #00d15e;
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

const squash = function(x: number,slope=0.01){
    if(x === Infinity)return 1;
    // log => sigmoid
    return -2/(1+Math.E**(2*Math.log(slope*x+1)))+1;
};


class SimCanvas extends ELEM{
    canvas: HTMLCanvasElement;
    pw: number;
    ctx: CanvasRenderingContext2D;
    objects: number[][] = [];// mass, x, y, vx, vy
    imgdata: ImageData;
    data: Uint8ClampedArray;
    density: Float32Array;
    simulation: GravitySimulation;
    constructor(){
        super("canvas");
        const simPW = 150e+9;// 1 AU 
        const pw = this.pw = simPW*simulationWidth/width;
        const canvas = this.canvas = this.e as HTMLCanvasElement;
        canvas.width = width;
        canvas.height = height;
        const ctx = this.ctx = canvas.getContext("2d")!;
        ctx.font = "70px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Ganons",width/2,height*0.3);
        ctx.fillText("volumptous",width/2,height*0.5);
        ctx.fillText("booty",width/2,height*0.7);
        const imgdata = this.imgdata = ctx.getImageData(0,0,width,height);
        const data = this.data = imgdata.data;
        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                const idx = (y*width+x)*4;
                const alpha = data[idx+3];
                if(alpha > 100){
                    for(let dx = 0; dx < 1; dx += 0.2){
                        for(let dy = 0; dy < 1; dy += 0.2){
                            const xx = (x+dx)*pw;
                            const yy = (y+dy)*pw;
                            this.objects.push([1.989e+30,xx,yy,0,0]);
                        }
                    }
                }
            }
        }
        this.density = new Float32Array(width*height);
        this.simulation = new GravitySimulation(this.objects, simPW, simulationWidth, simulationHeight);
    }
    step(dt: number){
        //calculate density field
        const objects = this.simulation.objects;
        const {ctx, imgdata, pw, density} = this;
        const {data} = imgdata;
        density.fill(0);
        for(let object of objects){
            let m = object[0];
            let x = Math.floor(object[1]/pw);
            let y = Math.floor(object[2]/pw);
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
    onFrame = (t: number, dt: number)=>{};
}


CSS.add(`
.sim canvas{
    margin-left: ${(512-width)/2}px;
    margin-top: ${(512-height)/2}px;
}
`);


export default class GravitySim extends ELEM{
    constructor(){
        super("div",{class: "sim"});
        const main = this.add("div",{class: "stdbox main"},0,{padding:"0px"});
        const right = this.add("div",{class: "stdbox right"});
        const sim = main.add(new SimCanvas());

        right.add("div",{},`Number of particles: ${sim.objects.length}`);
        const e_s = right.add("div");
        const e_h = right.add("div");
        const e_d = right.add("div");
        const e_y = right.add("div");
        sim.onFrame = function(t: number, _dt: number){
            e_s.setInner(`Time elapsed (s): ${t}`);
            const hours = Math.floor(t/60/60);
            const days = Math.floor(hours/24);
            const years = Math.floor(days/365);
            e_h.setInner(`${hours%24} hours`);
            e_d.setInner(`${days%365} days`);
            e_y.setInner(`${years} years`);
        };

        const bottom = this.add("div",{class: "stdbox bottom"}, "ur mom →");
        bottom.on("click",()=>{
            goto("adsfasd");
            sim.stop();
        })
        sim.start();
    }
}



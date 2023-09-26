import {CSS, ELEM} from "htmlgen";
import {FlatFFT} from "flat-fft"

const width = 512;
const height = 512;

CSS.add(`
.sim{
    display: grid;
    justify-content: center;
    align-content: center; 
    grid-template-columns: ${width}px 15em;
    grid-template-rows: ${height}px;
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

const squash = function(x,slope=0.01){
    if(x === Infinity)return 1;
    // log => sigmoid
    return -2/(1+Math.E**(2*Math.log(slope*x+1)))+1;
};


const fft = new FlatFFT(Math.round(Math.log(width)/Math.log(2)));
const convolve2d = function(buff1,buff2,width,height){
    
}


class SimCanvas extends ELEM{
    constructor(){
        super("canvas");
        const canvas = this.canvas = this.e;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Fuck You",width/2,height/2);
        const objects = [];// mass, x, y, vx, vy
        const imgdata = ctx.getImageData(0,0,width,height);
        const data = imgdata.data;
        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                const idx = (y*width+x)*4;
                const alpha = data[idx+3];
                if(alpha > 100)objects.push([1.989e+30,x,y,0,0]);
            }
        }
        console.log(objects.length);
        this.objects = objects;
        this.densityMask = new Float32Array(width*height);
        this.imgdata = imgdata;
        this.ctx = ctx;
        this.step();

        const convolutionKernel = new Float32Array(width*height);
        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                const idx = (y*width+x);
                const dx = x-Math.floor(width/2);
                const dy = y-Math.floor(height/2);
                if(dx === 0 && dy === 0){
                    convolutionKernel[idx] = 0;
                    continue;
                }
                // inverse square root
                // pw is the pixel width
                const isq = 1/(dx*dx+dy*dy)/this.pw;
                convolutionKernel[idx] = isq;
            }
        }
        this.convolutionKernel = convolutionKernel;
    }
    G = 6.6743015e-11;
    pw = 150e+9;//1au
    step(dt){
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
            density[idx] += m;
        }
        for(let y = 0; y < width; y++){
            for(let x = 0; x < width; x++){
                let idx = y*width+x;
                const [r,g,b,a] = toColor(squash(density[idx],1));
                idx *= 4;
                data[idx+0] = r;
                data[idx+1] = g;
                data[idx+2] = b;
                data[idx+3] = a;
            }
        }
        ctx.putImageData(imgdata,0,0);


        // convolution, then apply forces

        
    }
        // ctx.putImageData(imgdata,0,0);
        // const imgdata = ctx.getImageData(0,0,width,height);
        // const data = imgdata.data;
        // for(let y = 0; y < width; y++){
        //     for(let x = 0; x < width; x++){
        //         const idx = (y*width+x)*4;
        //         let gf = 1/(x*x+y*y);
        //         const [r,g,b,a] = toColor(squash(gf,100000));
        //         data[idx+0] = r;
        //         data[idx+1] = g;
        //         data[idx+2] = b;
        //         data[idx+3] = a;
        //     }
        // }
        // ctx.putImageData(imgdata,0,0);
}


export class Sim extends ELEM{
    constructor(){
        super("div","class: sim");
        const main = this.add("div","class: stdbox main",0,"padding:0px;");
        const right = this.add("div","class: stdbox right");
        main.add(new SimCanvas);
        
    }
}



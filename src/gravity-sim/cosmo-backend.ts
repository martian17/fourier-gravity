import {convolve2dComplex} from "../convolution";

const expansionFunction = (t)=>{
    //return Math.log(t/10+1)*30+1+t/10;
    //return 10/(1+Math.E**(-t/1+4.6))+0.1*t;
    //return 10*Math.log(t+0.1)+10+t;
    console.log(t);
    t *= 1;
    const t1 = 20;
    const ef = (2/(1+Math.E**(-2*t/t1))-1)*t1+0.01*t
    return (2**ef)/100//+t/10
}


export class GravitySimulation{
    constructor(objects, pw, width, height){
        this.pw = pw;
        const size = width*height;
        const hw = Math.floor(width/2);
        const hh = Math.floor(height/2);
        this.densityMask = new Float32Array(size*2);
        this.kernelX     = new Float32Array(size*2);
        this.kernelY     = new Float32Array(size*2);
        this.objects = objects;
        this.width = width;
        this.height = height;

        //create kernels for the xy gravity map
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
    }
    //G = 6.6743015e-11;
    G = 6.6743015e-8;
    //Λ = 1;
    volume = 1;
    t = 0;
    step(dt: number){
        //calculate density field
        const density = this.densityMask;
        const objects = this.objects;
        density.fill(0);
        const {width, height, pw} = this;
        let called = false;
        for(let object of objects){
            let m = object[0];
            let x = Math.floor(object[1]/pw);
            let y = Math.floor(object[2]/pw);
            const idx = y*width+x;
            density[idx*2] += m;
        }

        //Actual calculation
        const xaccs = convolve2dComplex(density, this.kernelX, width, height);
        const yaccs = convolve2dComplex(density, this.kernelY, width, height);
        
        //for now calculate without close field interaction
        const s_width = width*pw;
        const s_height = height*pw;
        const v0 = expansionFunction(this.t++);
        const v1 = expansionFunction(this.t);
        const vr = v1/v0;
        
        for(let object of objects){
            const x_ = Math.floor(object[1]/pw);
            const y_ = Math.floor(object[2]/pw);
            const idx = y_*width+x_;
            object[3] += xaccs[idx*2]*dt/v1//*this.Λ;
            object[4] += yaccs[idx*2]*dt/v1//*this.Λ;

            object[3] /= vr;
            object[4] /= vr;

            object[1] = (object[1] + object[3]*dt + s_width)%s_width;
            object[2] = (object[2] + object[4]*dt + s_height)%s_height;
        }
        return objects;
    }
}





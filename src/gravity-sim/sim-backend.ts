import {convolve2dComplex} from "../convolution";

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
    G = 6.6743015e-11;
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
        for(let object of objects){
            const x_ = Math.floor(object[1]/pw);
            const y_ = Math.floor(object[2]/pw);
            const idx = y_*width+x_;
            object[3] += xaccs[idx*2]*dt;
            object[4] += yaccs[idx*2]*dt;
            object[1] = (object[1] + object[3]*dt + s_width)%s_width;
            object[2] = (object[2] + object[4]*dt + s_height)%s_height;
        }
        return objects;
    }
}





import {FlatFFT} from "flat-fft"

const fftCache = new Map();
const getFFT = function(size: number){
    const order = Math.round(Math.log(size)/Math.log(2));
    let res;
    if(!(res = fftCache.get(order))){
        res = new FlatFFT(order);
        fftCache.set(order,res);
    }
    return res;
};

export const fft = function(arr: Float32Array){
    const transformer = getFFT(arr.length/2);
    return transformer.fft(arr);
};

export const ifft = function(arr: Float32Array){
    const transformer = getFFT(arr.length/2);
    return transformer.ifft(arr);
};


export const fft2d = function(buff: Float32Array, width: number, height: number){
    const w2 = width*2;
    const h2 = height*2;
    const rows = [];
    for(let i = 0; i < height; i++){
        rows.push(fft(buff.slice(i*w2, (i+1)*w2)));
    }
    let res = new Float32Array(width*height*2);
    for(let i = 0; i < width; i++){
        let column = new Float32Array(h2);
        for(let j = 0; j < height; j++){
            column[j*2+0] = rows[j][i*2+0];
            column[j*2+1] = -rows[j][i*2+1];//idek how it works but like bruh
        }
        column = fft(column);
        for(let j = 0; j < height; j++){
            res[j*w2+i*2+0] = column[j*2+0];
            res[j*w2+i*2+1] = column[j*2+1];
        }
    }
    return res;
};

export const ifft2d = function(buff: Float32Array, width: number, height: number){
    const w2 = width*2;
    const h2 = height*2;
    const rows = [];
    for(let i = 0; i < height; i++){
        rows.push(ifft(buff.slice(i*w2, (i+1)*w2)));
    }
    let res = new Float32Array(width*height*2);
    for(let i = 0; i < width; i++){
        let column = new Float32Array(h2);
        for(let j = 0; j < height; j++){
            column[j*2+0] = rows[j][i*2+0];
            column[j*2+1] = rows[j][i*2+1];
        }
        column = ifft(column);
        for(let j = 0; j < height; j++){
            res[j*w2+i*2+0] = column[j*2+0];
            res[j*w2+i*2+1] = column[j*2+1];
        }
    }
    return res;
};




export const convolveComplex = function(arr1: Float32Array, arr2: Float32Array){
    let f1 = fft(arr1);
    let f2 = fft(arr2);
    //multiply two complex vectors
    for(let i = 0; i < f1.length; i+= 2){
        const r1 = f1[i];
        const r2 = f2[i];
        const i1 = f1[i+1];
        const i2 = f2[i+1];
        f1[i] = r1*r2-i1*i2;
        f1[i+1] = r1*i2+r2*i1
    }
    let res = ifft(f1);
    return res;
};

export const convolve = function(arr1,arr2){
    return convolveComplex(FlatFFT.toComplex(arr1),FlatFFT.toComplex(arr2));
};


export const convolve2dComplex = function(arr1: Float32Array, arr2: Float32Array, width: number, height: number){
    let f1 = fft2d(arr1,width,height);
    let f2 = fft2d(arr2,width,height);
    //multiply two complex vectors
    for(let i = 0; i < f1.length; i+= 2){
        const r1 = f1[i];
        const r2 = f2[i];
        const i1 = f1[i+1];
        const i2 = f2[i+1];
        f1[i] = r1*r2-i1*i2;
        f1[i+1] = r1*i2+r2*i1
    }
    // let res = ifft2d(f1,width,height);
    // let f2 = fft2d(arr2,width,height);
    // let f1 = fft2d(arr1,width,height);
    let res = ifft2d(f1,width,height);
    
    return res;
};

export const convolve2d = function(arr1: number[], arr2: number[], width: number, height: number){
    return convolve2dComplex(FlatFFT.toComplex(arr1),FlatFFT.toComplex(arr2), width, height);
};


const convolveSlow = function(a,b){
    let res = [];
    for(let i = 0; i < a.length; i++){
        let r = 0;
        for(let j = 0; j < b.length; j++){
            r += a[i]*b[j];
        }
        res.push(r);
    }
    return FlatFFT.toComplex(res);
}



//console.log(convolve([0,0,0,1],[2,1,0,1]));
//console.log(convolve([0,2,0,0],[2,1,1,1]));
let r = convolve2d(
    [
    //     11,12,13,14,
    //     21,22,23,24,
    //     31,32,33,34,
    //     41,42,43,44,
        0,0,0,0,
        0,0,0,0,
        0,0,1,0,
        0,0,0,0,
    ],
    [
        2,1,0,1,
        1,1,0,1,
        0,0,0,0,
        1,1,0,1,
    ],
    4,4);

r = [...r].map(v=>Math.round(v*100000)/100000);

console.log(`
${r[0]} ${r[2]} ${r[4]} ${r[6]}
${r[8]} ${r[10]} ${r[12]} ${r[14]}
${r[16]} ${r[18]} ${r[20]} ${r[22]}
${r[24]} ${r[26]} ${r[28]} ${r[30]}
`);

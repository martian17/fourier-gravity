import {fft, ifft, fft2d, ifft2d, convolveComplex, convolve2dComplex} from "./convolution";
import {FlatFFT} from "flat-fft";

type numbers = number[] | Float32Array;

const toRealRound = function(arr: numbers){
    const res = [];
    const r = 1000000;
    for(let i = 0; i < arr.length; i+=2){
        const v = arr[i];
        res.push(Math.round(v*r)/r);
    }
    return res;
};

const round = function(arr: numbers){
    const res = [];
    for(let i = 0; i < arr.length; i+=2){
        res.push(arr[i]);
    }
    return res;
};


test("fft->ifft should give back the same input", ()=>{
    const original = FlatFFT.toComplex([1,2,3,4]);
    expect(
        round(ifft(fft(original)))
    ).toStrictEqual(
        round(original)
    );
});

test("fft2d->ifft2d should give back the same input", ()=>{
    const original = FlatFFT.toComplex([
        11,12,13,14,
        21,22,23,24,
        31,32,33,34,
        41,42,43,44,
    ]);
    expect(
        round(ifft2d(fft2d(original,4,4),4,4))
    ).toStrictEqual(
        round(original)
    );
});

test("convolveComplex should be the identity when one of the matrix is identity kernel", ()=>{
    const original = FlatFFT.toComplex([1,2,3,4]);
    const identity = FlatFFT.toComplex([1,0,0,0]);
    expect(
        round(convolveComplex(original,identity))
    ).toStrictEqual(
        round(original)
    );
});

test("convolve2dComplex should be the identity when one of the matrix is identity kernel", ()=>{
    const original = FlatFFT.toComplex([
        11,12,13,14,
        21,22,23,24,
        31,32,33,34,
        41,42,43,44,
    ]);
    const identity = FlatFFT.toComplex([
        1,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
    ]);
    expect(
        round(convolve2dComplex(original,identity,4,4))
    ).toStrictEqual(
        round(original)
    );
});




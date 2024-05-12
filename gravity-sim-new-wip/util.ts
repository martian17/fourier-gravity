const getStarsFromMessage = function(width: number, height: number, pixelWidth: number, message: string){
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.heigth = height;
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


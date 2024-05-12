import {CSS, ELEM} from "htmlgen";
import {GravitySimulation} from "./sim-backend";
import {goto} from "../router";
import {getStarsFromMessage} from "./util";

const width = 512;
const height = 512;

const simulationWidth = 128;
const simulationHeight = 128;

CSS.add(`
.sim{

}


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

CSS.add(`
.sim canvas{
    margin-left: ${(512-width)/2}px;
    margin-top: ${(512-height)/2}px;
}
`);


class SimUI extends ELEM{
    constructor({simParams, UIParams}){
        super("div","class: sim");
        const main = this.add("div","class: stdbox main",0,"padding:0px;");
        const right = this.add("div","class: stdbox right");
        const sim = main.add(new SimCanvas(simParams));

        right.add("div",0,`Number of particles: ${sim.objects.length}`);
        const e_s = right.add("div",0);
        const e_h = right.add("div",0);
        const e_d = right.add("div",0);
        const e_y = right.add("div",0);
        sim.onFrame = function(t,dt){
            e_s.setInner(`Time elapsed (s): ${t}`);
            const hours = Math.floor(t/60/60);
            const days = Math.floor(hours/24);
            const years = Math.floor(days/365);
            e_h.setInner(`${hours%24} hours`);
            e_d.setInner(`${days%365} days`);
            e_y.setInner(`${years} years`);
        };

        const bottom = this.add("div","class: stdbox bottom", "ur mom →");
        bottom.on("click",()=>{
            goto("adsfasd");
            sim.stop();
        })
        sim.start();
    }
}

export default function({gravityField, }){
    return class extends GravitySim{
        getGravityField(){
            return getStarsFromMessage(message);
        }
    }
};



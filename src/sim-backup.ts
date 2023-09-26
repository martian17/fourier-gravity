import {CSS, ELEM} from "htmlgen";

CSS.add(`
.sim{
    display: grid;
    grid-template-columns: 1fr 15em;
    grid-template-rows: 3em 1fr 10em;
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

.top{
    grid-area: 1/1/2/3;
}

.main{
    grid-area: 2/1/3/2;
}

.right{
    grid-area: 2/2/3/3;
}

.bottom{
    grid-area: 3/1/4/3;
}

`);


class SimCanvas extends ELEM{
    constructor(){

    }
}


export class Sim extends ELEM{
    constructor(){
        super("div","class: sim");
        const top = this.add("div","class: stdbox top");
        const main = this.add("div","class: stdbox main");
        const right = this.add("div","class: stdbox right");
        const bottom = this.add("div","class: stdbox bottom");

        
    }
}



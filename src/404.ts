import {CSS, ELEM} from "htmlgen";
import logo404 from "/404.png";

CSS.add(`
#e404{
    max-width: 900px;
    margin: 0 auto;
}

#e404 .container{
    position:relative;
}

#e404 h1{
    color: #222;
    position: absolute;
    top: 1em;
    width: 100%;
    text-align: center;
    font-size: 2.5em;
}

#e404 img{
    width:100%;
}
`);


export class Page404 extends ELEM{
    constructor(){
        super("div","id:e404");
        this.add("div","class:stdbox","The resource you were looking for were not found");
        let container = this.add("div","class:stdbox container");
        container.add("h1",0,"418 Ur mom is a teapot");
        let img = container.add("img");
        img.attr("src",logo404);
    }
}

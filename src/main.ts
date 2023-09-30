import { ELEM, CSS } from "htmlgen";
import "./common";
import { Page404 } from "./404";
import { Sim } from "./sim";
import { GravitySim } from "./gravity-sim/sim-ui";

import {initRouter} from "./router";

class App{
    constructor(container: HTMLElement){
        this.container = container;
        this.pages = {
            page404: Page404,
            sim: Sim,
            "gravity-sim": GravitySim
            //about: About
        };
        this.route("gravity-sim");
    }
    route(page: string, ...args: any[]){
        if(!(page in this.pages))
            page = "page404";
        this.setPage(this.pages[page],args);
    }
    setPage(page: ELEM, args: any){
        this.current?.remove?.();
        this.current = new page(args);
        console.log(this.container,this.current.e);
        this.container.appendChild(this.current.e);
    }
}


CSS.init();

const app = new App(document.body);

initRouter(app);


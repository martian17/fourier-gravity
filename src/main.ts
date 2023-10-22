import { ELEM, CSS } from "htmlgen";
import "./common";
import { Page404 } from "./404";
import { Sim } from "./sim";
import GravitySim from "./gravity-sim/sim-ui";
import Ganon from "./gravity-sim/ganon";
import Cosmological from "./gravity-sim/cosmological";

import {initRouter} from "./router";

class App{
    constructor(container: HTMLElement){
        this.container = container;
        this.pages = {
            page404: Page404,
            sim: Sim,
            "gravity-sim": GravitySim,
            "ganon": Ganon,
            "cosmological": Cosmological
            //about: About
        };
        const searchParams = new URLSearchParams(window.location.search);
        this.route(searchParams.get("page") || "gravity-sim");
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


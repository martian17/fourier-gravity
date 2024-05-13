import { ELEM, CSS } from "htmlgen";
import "./common";
import { Page404 } from "./404";
import { Sim } from "./sim";
import GravitySim from "./gravity-sim/sim-ui";
import Ganon from "./gravity-sim/ganon";
import Cosmological from "./gravity-sim/cosmological";
import UIP from "./uip/main";
import Nice from "./uip/nice";
import Bad from "./uip/bad";
import Final from "./uip/final";
import FluidSim from "./fluid-sim/sim-ui";
//import GravitySimMsg from "./gravity-sim/simmsg";

import {initRouter} from "./router";

type AConstructorTypeOf<T> = new (...args:any[]) => T;

class App{
    pages: any;
    constructor(public container: HTMLElement){
        this.pages = {
            page404: Page404,
            sim: Sim,
            "gravity-sim": GravitySim,
            "ganon": Ganon,
            "cosmological": Cosmological,
            "uip": UIP,
            "fluid": FluidSim,
            "nice": Nice,
            "bad": Bad,
            "final": Final,
            //"whatsup": GravitySimMsg("What's up?\nWanna have a chat?")
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
    current?: ELEM;
    setPage(page: AConstructorTypeOf<ELEM>, args: any){
        this.current?.remove?.();
        console.log(args);
        this.current = new page(args);
        console.log(this.container,this.current.e);
        this.container.appendChild(this.current.e);
    }
}


CSS.init();
console.log("asdf");
const app = new App(document.body);

initRouter(app);


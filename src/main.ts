import { ELEM, CSS } from "htmlgen";
import "./common";
import { Page404 } from "./404";
import { Sim } from "./Sim";

class App{
    constructor(container: HTMLElement){
        this.container = container;
        this.pages = {
            page404: Page404,
            sim: Sim,
            //about: About
        };
        this.route("simm");
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


import {CSS, ELEM} from "htmlgen";
import {goto} from "../router";

const V = function<T>(v: T | undefined){
    return v !== undefined;
}

type CSSObject = {[key: string]: string};

type LayoutObject = {
    row?: number,
    col?: number,
    gap?: string | number,
    buds?: (LayoutObject | ELEM)[],
    color?: string,
    font?: string,
    css?: CSSObject,
}

const layoutWithDefault = function(layout: LayoutObject, base: LayoutObject){
    let res: LayoutObject = {};
    res.row = layout.row;
    res.col = layout.col;
    res.gap = layout.gap || base.gap;
    res.buds = layout.buds;
    res.color = layout.color || base.color;
    res.font = layout.font || base.font;
    res.css = {...base.css} || {};
    if(layout.css){
        for(const key in layout.css){
            if(!res.css[key])res.css[key] = layout.css[key];
        }
    }
    return res;
}

const layoutGenerator = function(layoutDefault: LayoutObject = {}, leafDefault: LayoutObject = {}){
    return function createLayout(layout: LayoutObject, parentCSS: CSSObject = {}){
        // if leaf then apply leaf default
        if((layout.buds || []).every(v=>(v instanceof ELEM)))layout = layoutWithDefault(layout, leafDefault);
        // apply normal default
        layout = layoutWithDefault(layout , layoutDefault);
        const row = layout.row;
        const col = layout.col;
        const css: CSSObject = { display: "flex", ... (layout.css || {})};
        if(V(row)){
            parentCSS.flexDirection = "row";
            if(row! >= 0)css.flex = row+"";
        }else if(V(col)){
            parentCSS.flexDirection = "column";
            if(col! >= 0)css.flex = col+"";
        }
        if(layout.font){
            //font size, color, and famil
            const sizeRegex = /(?<=^|\s)[0-9]+[^\s]*/g
            const colorRegex = /#[0-9a-fA-F]{3,}/g
            css.fontSize = (layout.font.match(sizeRegex) || [])[0]!
            css.color = (layout.font.match(colorRegex) || [])[0]!
            const fontFamily = layout.font.replace(sizeRegex,"").replace(colorRegex,"").replace(/\s+/g," ").trim();
            if(fontFamily !== "")css.fontFamily = fontFamily;
        }
        if(layout.color){
            css.backgroundColor = layout.color;
        }
        if(layout.gap){
            let gap = layout.gap;
            if(typeof gap === "number")gap = gap+"px";
            css.gap = gap;
        }
        let children = [];
        for(let bud of (layout.buds || [])){
            if(bud instanceof ELEM){
                children.push(bud);
            }else{
                children.push(createLayout(bud, css));
            }
        }
        const el = ELEM.create("div",0,0,css);
        for(let child of children){
            el.add(child);
        }
        return el;
    };
};

class SimulationCanvas extends ELEM{
    constructor(){
        super("canvas",0,0,{
            width: "100%",
            height: "100%",
        });
        const canvas = this.e as HTMLCanvasElement;
        canvas.width = 500;
    }
}

export default class Main extends ELEM{
    constructor(){
        super("div",0,0,{
            display: "flex",
            flexDirection: "row",
            width: "100vw",
            height: "100vh",
            backgroundColor: "#222",
            gap: "10px",
            padding: "10px",
            boxSizing: "border-box",
        });
        const createLayout = layoutGenerator({
            gap: 10,
        },{
            color: "#4444",
            css: {
                borderRadius: "5px",
            }
        });
        this.add(createLayout({
            row: 3,
            buds: [
                //{col: -1, css: {width: "min(60vh, 50vw)", height: "min(60vh, 50vw)"}, buds: [SimulationCanvas.create()]},
                {col: 1},
                {col: 1},
            ],
        }));
        this.add(createLayout({
            row: 7,
            buds: [
                {col: 5, buds: [{row: 2, css: {minWidth: "200px"}, buds: [{col: 1}, {col: 1}]}, {row: 5}]},
                {col: 4},
            ],
        }));
    }
}

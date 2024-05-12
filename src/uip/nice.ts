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

type Ratio = {row: number, col: number, area?: number, isTree?: false, x?: number, y?: number};
const UNSET = 0;
const HOR = 1;
const VER = 2;
type UNSET = 0;
type HOR = 1;
type VER = 2;

type Tree = {
    x?: number,
    y?: number,
    row: number,
    col: number,
    direction: HOR | VER | UNSET,
    isTree: true,
    children?: (Ratio|Tree)[]
}

const dragonInsert = function(tree: Tree, item: Ratio): boolean{
    if(!tree.children){
        // split the tree
        const coldiff = (tree.col - item.col);
        const rowdiff = (tree.row - item.row);
        if(coldiff < 0 || rowdiff < 0)return false;
        if(coldiff*item.row < rowdiff*item.col){
            tree.direction = HOR;
            tree.children = [
                {
                    row: item.row,
                    col: tree.col,
                    direction: VER,
                    isTree: true,
                    children: [
                        item,
                        {
                            row: item.row,
                            col: coldiff,
                            direction: UNSET,
                            isTree: true,
                        }
                    ],
                },
                {
                    row: rowdiff,
                    col: tree.col,
                    direction: UNSET,
                    isTree: true,
                }
            ];
        }else{
            tree.direction = VER;
            tree.children = [
                {
                    row: tree.row,
                    col: item.col,
                    direction: HOR,
                    isTree: true,
                    children: [
                        item,
                        {
                            row: rowdiff,
                            col: item.col,
                            direction: UNSET,
                            isTree: true,
                        }
                    ],
                },
                {
                    row: tree.row,
                    col: coldiff,
                    direction: UNSET,
                    isTree: true,
                }
            ];
        }
        return true;
    }
    for(let child of tree.children!){
        if(!child.isTree)continue;
        let res = dragonInsert(child,item);
        if(res)return res;
    }
    return false;
};

const niceDragon = function(row: number, col: number, ratios: Ratio[]): Tree{
    // ratios.sort((a,b)=>{
    //     if(a.area === undefined)a.area = a.row * a.col;
    //     if(b.area === undefined)b.area = b.row * b.col;
    //     return b.area - a.area;
    // });
    const tree: Tree = {
        row,
        col,
        direction: UNSET,
        isTree: true,
        x: 0,
        y: 0,
    }
    for(const ratio of ratios){
        let res = dragonInsert(tree,ratio);
        if(!res)return niceDragon(row+1,col+1,ratios);
    }
    updatePosition(tree);
    return tree;
}

const updatePosition = function(tree: Tree){
    if(!tree.children)return tree;
    if(tree.direction === HOR){
        let dx = 0;
        for(let child of tree.children){
            child.x = tree.x!+dx;
            child.y = tree.y;
            dx += child.row;
            if(child.isTree)updatePosition(child);
        }
    }else{// if(tree.direction === VER)
        let dy = 0;
        for(let child of tree.children){
            child.x = tree.x;
            child.y = tree.y!+dy;
            dy += child.col;
            if(child.isTree)updatePosition(child);
        }
    }
    return tree;
}

const chaosDragonWalk = function(tree: Tree){
    if(!tree.children)return tree;
    if(Math.random() > 0.5)return;
    tree.children.reverse();
    for(let child of tree.children){
        if(child.isTree)chaosDragonWalk(child);
    }
}

const chaosDragon = function(row: number, col: number, ratios: Ratio[]){
    const tree = niceDragon(row, col, ratios);
    chaosDragonWalk(tree);
    updatePosition(tree);
    return tree;
}

const ferrimDragonWalk = function(tree: Tree, depth: number){
    if(!tree.children)return tree;
    if(depth%2 === 0)tree.children.reverse();
    for(let child of tree.children){
        if(child.isTree)ferrimDragonWalk(child,depth+1);
    }
}

const ferrimDragon = function(row: number, col: number, ratios: Ratio[]){
    const tree = niceDragon(row, col, ratios);
    ferrimDragonWalk(tree,1);
    updatePosition(tree);
    return tree;
}


const GAP = 10;

export default class NiceDragon extends ELEM{
    constructor(){
        super("div",0,0,{
            display: "block",
            margin: `${GAP/2}px`,
            width: `calc(100vw - ${GAP}px)`,
            height: `calc(100vh - ${GAP}px)`,
            position: "relative",
        });
        this.render();
        window.addEventListener('resize', (evt) => {
            this.render();
        }, true);
    }
    render(){
        for(let child of this.children){
            child!.remove();
        }
        //const ratios: Ratio[] = [{row: 5, col: 5}, {row: 2, col: 5}, {row: 2, col: 2}, {row: 2, col: 2}, {row: 5, col: 4}, {row: 5, col: 2}, {row: 5, col: 2}, {row: 7, col: 4}];
        //const ratios: Ratio[] = [{row: 2, col: 2}, {row: 1, col: 2}, {row: 1, col: 1}, {row: 1, col: 1}, {row: 2, col: 2}, {row: 2, col: 1}, {row: 2, col: 1}, {row: 3, col: 2},{row:1,col:1},{row:1,col:1}];
        //const ratios: Ratio[] = [{row: 2, col: 1},{row:1,col:1},{row:1,col:1}];
        const ratios: Ratio[] = new Array(100).fill(0).map(v=>({row: Math.floor(Math.random()*3+1), col: Math.floor(Math.random()*3+1)}));
        const width = window.innerWidth;
        const height = window.innerHeight;
        const screenArea = width*height;
        const areasum = ratios.map(r=>r.row*r.col).reduce((a,b)=>a+b);
        const row = Math.floor(width * Math.sqrt(areasum/screenArea));
        const col = Math.floor(height * Math.sqrt(areasum/screenArea));
        const tree = ferrimDragon(row,col,ratios);
        let rowmax = tree.row;
        let colmax = tree.col;
        for(const ratio of ratios){
            const row = ratio.row+ratio.x!
            const col = ratio.col+ratio.y!
            if(row > rowmax)rowmax = row;
            if(col > colmax)colmax = col;
        }
        for(let ratio of ratios){
            this.add("div",0,0,{
                boxSizing: "borderBox",
                display: "flex", 
                position: "absolute",
                width: `${ratio.row/rowmax*100}%`,
                height: `${ratio.col/colmax*100}%`,
                left: `${ratio.x!/rowmax*100}%`,
                top: `${ratio.y!/colmax*100}%`,
            }).add("div",0,0,{
                margin: `${GAP/2}px`,
                flex: "1",
                backgroundColor: "#4444",
                borderRadius: `${GAP/4}px`,
            });
        }
        const traverse = (tree: Tree)=>{
            if(tree.children){
                for(let child of tree.children){
                    if(child.isTree)traverse(child);
                }
                return;
            }
            this.add("div",0,0,{
                boxSizing: "borderBox",
                display: "flex", 
                position: "absolute",
                width: `${tree.row/rowmax*100}%`,
                height: `${tree.col/colmax*100}%`,
                left: `${tree.x!/rowmax*100}%`,
                top: `${tree.y!/colmax*100}%`,
            }).add("div",0,0,{
                margin: `${GAP/2}px`,
                flex: "1",
                backgroundColor: "#4442",
                borderRadius: `${GAP/4}px`,
            });
            
        }
        traverse(tree);
    }
}

class Main extends ELEM{
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
                {col: -1, css: {width: "min(60vh, 50vw)", height: "min(60vh, 50vw)"}},
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

        // super("div",0,0,{
        //     display: "flex",
        //     flexDirection: "column",
        //     width: "100vw",
        //     height: "100vh",
        //     backgroundColor: "#222",
        //     gap: "10px",
        //     padding: "10px",
        //     boxSizing: "border-box",
        // });
        // const createLayout = layoutGenerator({
        //     gap: 10,
        // },{
        //     color: "#4444",
        //     css: {
        //         borderRadius: "10px",
        //     }
        // });
        // this.add(createLayout({col: 1}));
        // this.add(createLayout({
        //     col: 20,
        //     buds: [
        //         {
        //             row: 3,
        //             buds: [{col: 4}, {col: 3}],
        //         },
        //         {
        //             row: 8,
        //             buds: [{col: 3,
        //                 buds: [{row: 6}, {row:4}]
        //             }, {col: 6,
        //                 buds: [{row: 5}, {row:5}]
        //             }],
        //         },
        //     ]
        // }));

        // super("div",0,0,{
        //     display: "flex",
        //     flexDirection: "row",
        //     width: "100vw",
        //     height: "100vh",
        //     backgroundColor: "#222",
        //     gap: "10px",
        //     padding: "10px",
        //     boxSizing: "border-box",
        // });
        // const createLayout = layoutGenerator({
        //     gap: 10,
        // },{
        //     color: "#4444",
        //     css: {
        //         borderRadius: "10px",
        //     }
        // });
        // this.add(createLayout({
        //     row: 3,
        //     buds: [
        //         {col: -1, css: {width: "min(60vh, 50vw)", height: "min(60vh, 50vw)"}},
        //         {col: 1},
        //         {col: 1},
        //     ],
        // }));
        // this.add(createLayout({
        //     row: 2,
        //     buds: [
        //         {col: 3, css: {minWidth: "200px"}},
        //         {col: 3},
        //         {col: 3},
        //     ],
        // }));
        // this.add(createLayout({
        //     row: 5,
        //     buds: [
        //         {col: 2},
        //         {col: 3},
        //         {col: 4},
        //     ],
        // }));
    }
}

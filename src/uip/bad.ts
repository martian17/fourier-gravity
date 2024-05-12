import {CSS, ELEM} from "htmlgen";
import {goto} from "../router";

const V = function<T>(v: T | undefined){
    return v !== undefined;
}

type CSSObject = {[key: string]: string};

type Ratio = {row: number, col: number, area?: number, isTree?: false, x?: number, y?: number};
const UNSET = 0;
const HOR = 1;
const VER = 2;
type UNSET = 0;
type HOR = 1;
type VER = 2;

type Tree = {
    x: number,
    y: number,
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
        item.x = tree.x;
        item.y = tree.y;
        if(coldiff*item.row < rowdiff*item.col){
            tree.direction = HOR;
            tree.children = [
                {
                    row: item.row,
                    col: tree.col,
                    direction: VER,
                    isTree: true,
                    x: tree.x,
                    y: tree.y,
                    children: [
                        item,
                        {
                            row: item.row,
                            col: coldiff,
                            direction: UNSET,
                            isTree: true,
                            x: tree.x,
                            y: tree.y+item.col,
                        }
                    ],
                },
                {
                    row: rowdiff,
                    col: tree.col,
                    direction: UNSET,
                    isTree: true,
                    x: tree.x+item.row,
                    y: tree.y,
                }
            ];
        }else{
            tree.direction = VER;
            tree.children = [
                {
                    row: tree.row,
                    col: item.col,
                    direction: VER,
                    isTree: true,
                    x: tree.x,
                    y: tree.y,
                    children: [
                        item,
                        {
                            row: rowdiff,
                            col: item.col,
                            direction: UNSET,
                            isTree: true,
                            x: tree.x+item.row,
                            y: tree.y,
                        }
                    ],
                },
                {
                    row: tree.row,
                    col: coldiff,
                    direction: UNSET,
                    isTree: true,
                    x: tree.x,
                    y: tree.y+item.col,
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

// class Grid{
//     constructor(w: number, h: number){
//         for(let i = 0; i < w; i++){
//             const n = number
// 
//         }
//     }
//     register(x: number, y: number, w: number, h: number, obj: any){
//         
// 
//     }
// }

const badDragon = function(row: number, col: number, ratios: Ratio[]): Tree{
    //const grid = 
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
        if(!res)return badDragon(row+0.5,col+0.5,ratios);
    }
    return tree;
}


const findNiceLayout = function(...ratios : Ratio[]){
    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenArea = width*height;
    const areasum = ratios.map(r=>r.row*r.col).reduce((a,b)=>a+b);
    const row = width * Math.sqrt(areasum/screenArea);
    const col = height * Math.sqrt(areasum/screenArea);
    console.log(row,col,row*col,areasum);
    const tree = badDragon(row,col,ratios);
    let rowmax = 0;
    let colmax = 0
    for(const ratio of ratios){
        if(ratio.row > rowmax)rowmax = ratio.row;
        if(ratio.col > colmax)colmax = ratio.col;
    }
}

export default class BadDragon extends ELEM{
    constructor(){
        super("div",0,0,{
            display: "block",
            width: "100vw",
            height: "100vh",
            position: "relative",
        });
        this.render();
        window.addEventListener('resize', (evt) => {
            this.render();
        }, true);
    }
    ratios = [{row: 4, col: 2},{row:2, col:2},{row: 2, col: 2},{row:3, col:1},{row:3,col:3}]
    //new Array(100).fill(0).map(v=>({row: Math.floor(Math.random()*3+1), col: Math.floor(Math.random()*3+1)}));
    //[{row: 2, col: 2}, {row: 1, col: 2}, {row: 1, col: 1}, {row: 1, col: 1}, {row: 2, col: 2}, {row: 2, col: 1}, {row: 2, col: 1}, {row: 3, col: 2}];
    render(){
        for(let child of this.children){
            child!.remove();
        }
        //const ratios: Ratio[] = [{row: 5, col: 5}, {row: 2, col: 5}, {row: 2, col: 2}, {row: 2, col: 2}, {row: 5, col: 4}, {row: 5, col: 2}, {row: 5, col: 2}, {row: 7, col: 4}];
        const ratios: Ratio[] = this.ratios;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const screenArea = width*height;
        const areasum = ratios.map(r=>r.row*r.col).reduce((a,b)=>a+b);
        const row = width * Math.sqrt(areasum/screenArea);
        const col = height * Math.sqrt(areasum/screenArea);
        console.log(row,col,row*col,areasum);
        const tree = badDragon(row,col,ratios);
        let rowmax = 0;//tree.row;
        let colmax = 0;//tree.col;
        for(const ratio of ratios){
            const row = ratio.row+ratio.x!
            const col = ratio.col+ratio.y!
            if(row > rowmax)rowmax = row;
            if(col > colmax)colmax = col;
        }
        console.log(ratios);
        for(let ratio of ratios){
            this.add("div",0,0,{
                backgroundColor: "#4444",
                borderRadius: "5px",
                position: "absolute",
                border: "solid 1px #000",
                boxSizing: "borderBox",
                width: `${ratio.row/rowmax*100}%`,
                height: `${ratio.col/colmax*100}%`,
                left: `${ratio.x!/rowmax*100}%`,
                top: `${ratio.y!/colmax*100}%`,
            });
        }
    }
}
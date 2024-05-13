import {CSS, ELEM} from "htmlgen";
import {goto} from "../router";
import {niceDragon, RatioArg, Ratio} from "../nice-dragon/nice";

const GAP = 20;

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
        const ratios: RatioArg[] = [{width: 400, height: 400, target: "#fff8"}, {row: 1, col: 2}, {row: 1, col: 1}, {row: 1, col: 1}, {row: 2, col: 2}, {width: 400, height: 150, target: "#8ff"}, {row: 2, col: 1}, {row: 3, col: 2},{row:1,col:1},{row:1,col:1}];
        //const ratios: RatioArg[] = [{row: 2, col: 2}, {row: 1, col: 2}, {row: 1, col: 1}, {row: 1, col: 1}, {row: 2, col: 2}, {row: 2, col: 1}, {row: 2, col: 1}, {row: 3, col: 2},{row:1,col:1},{row:1,col:1}];
        //const ratios: Ratio[] = [{row: 2, col: 1},{row:1,col:1},{row:1,col:1}];
        //const ratios: Ratio[] = new Array(100).fill(0).map(v=>({row: Math.floor(Math.random()*3+1), col: Math.floor(Math.random()*3+1)}));
        const tiles = niceDragon({
            width: window.innerWidth,
            height: window.innerHeight,
            ratios: ratios,
            sort: true,
            flip: false,
        });
        let rowmax = 0;// tree.row;
        let colmax = 0;// tree.col;
        for(const tile of tiles){
            const row = tile.row+tile.x!
            const col = tile.col+tile.y!
            if(row > rowmax)rowmax = row;
            if(col > colmax)colmax = col;
        }
        for(let tile of tiles){
            if(!tile.isTree){
                this.add("div",0,0,{
                    boxSizing: "borderBox",
                    display: "flex", 
                    position: "absolute",
                    width: `${tile.row/rowmax*100}%`,
                    height: `${tile.col/colmax*100}%`,
                    left: `${tile.x!/rowmax*100}%`,
                    top: `${tile.y!/colmax*100}%`,
                }).add("div",0,0,{
                    margin: `${GAP/2}px`,
                    flex: "1",
                    backgroundColor: (tile as Ratio).target || "#4444",
                    borderRadius: `${GAP/4}px`,
                });
            }else{
                this.add("div",0,0,{
                    boxSizing: "borderBox",
                    display: "flex", 
                    position: "absolute",
                    width: `${tile.row/rowmax*100}%`,
                    height: `${tile.col/colmax*100}%`,
                    left: `${tile.x!/rowmax*100}%`,
                    top: `${tile.y!/colmax*100}%`,
                }).add("div",0,0,{
                    margin: `${GAP/2}px`,
                    flex: "1",
                    backgroundColor: "#4442",
                    borderRadius: `${GAP/4}px`,
                });
            }
        }
    }
}


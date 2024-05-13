export type Ratio = {row: number, col: number, area?: number, isTree?: false, x?: number, y?: number, target?: any};
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

const baseDragon = function(row: number, col: number, ratios: Ratio[]): Tree | undefined{
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
        if(!res)return;
    }
    return tree;
};

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
};

const flipTiles = function(tree: Tree, depth: number){
    if(!tree.children)return tree;
    if(depth%2 === 0)tree.children.reverse();
    for(let child of tree.children){
        if(child.isTree)flipTiles(child,depth+1);
    }
};

export type RatioArg = {
    // either width, height, or col, row need to be set
    // wodth/row, height/col are mutually exclusive
    width?: number,
    height?: number,
    col?: number,
    row?: number,
    x?: number,
    y?: number,
    target?: any,
}

const niceDragonCore = function(
    row: number,
    col: number,
    ratios: Ratio[],
    sort: boolean,
    flip: boolean,
    ): (Ratio | Tree)[] {
    if(sort){
        ratios.sort((a,b)=>{
            if(a.area === undefined)a.area = a.row * a.col;
            if(b.area === undefined)b.area = b.row * b.col;
            return b.area - a.area;
        });
    }
    let tree: Tree | undefined;
    while(true){
        tree = baseDragon(row, col, ratios);
        if(tree)break;
        row++;
        tree = baseDragon(row, col, ratios);
        if(tree)break;
        col++;
    }
    if(flip)flipTiles(tree,1);
    updatePosition(tree);

    let res: (Ratio | Tree)[] = [...ratios];
    const traverse = (tree: Tree)=>{
        if(tree.children){
            for(let child of tree.children){
                if(child.isTree)traverse(child);
            }
            return;
        }
        res.push(tree);
    };
    traverse(tree);
    
    return res;
};

const pop1 = function(arr: any[]){
    let arr2 = [...arr];
    arr2.pop();
    return arr2;
};

export const niceDragon = function({
    width,
    height,
    ratios,
    sort = false,
    flip = true,
}:{
    width: number,
    height: number,
    ratios: RatioArg[],
    sort?: boolean,
    flip?: boolean,
}): (Ratio | Tree)[] {
    if(ratios.length === 0)return;
    const regularRatios: Ratio[] = [];
    // at this point col/row size is undetermined
    // need to solve the quadratic equation
    let x2 = 0;// second power
    let x1 = 0;// first power
    let x0 = 0;// zeroth power (just area)
    // summing up the area
    for(let ratio of ratios){
        x2 += (ratio.row || 0) * (ratio.col || 0);
        x1 += (ratio.row || 0) * (ratio.height || 0);
        x1 += (ratio.width || 0) * (ratio.col || 0);
        x0 += (ratio.width || 0) * (ratio.height || 0);
    }
    // quadratic == target area
    x0 -= width*height;
    // solve it
    const det = x1*x1-4*x2*x0;
    if(det < 0){
        // not enought area to fit the things through
        return niceDragon({width,height,ratios: pop1(ratios),sort,flip});
    }
    const span = (-x1+Math.sqrt(det))/(2*x2);
    console.log(span);
    // translate widths to rows/columns
    for(let ratio of ratios){
        regularRatios.push({
            row: ratio.row || Math.ceil(ratio.width/span),
            col: ratio.col || Math.ceil(ratio.height/span),
            target: ratio.target
        });
    }
    return niceDragonCore(Math.ceil(width/span), Math.ceil(height/span), regularRatios, sort, flip);
};
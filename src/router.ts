let app: any;

export const initRouter = function(main: any){
    app = main;
};


export const goto = function(page: string){
    app.route(page);
};

import {CSS, ELEM} from "htmlgen";
import logo404 from "/404.png";

console.log("common called");


CSS.add(`
body{
    background: linear-gradient(174deg, rgb(168 202 213) 0%, rgb(254 248 224) 100%);
    padding: 0px;
    font-family: Arial;
    color: #eee;
    font-size: 1.2em;
    margin: 0px;
    min-height: 100vh;
}

.stdbox{
    padding:1em;
    margin: 1em;
    box-shadow:0px 0px 3px #000;
    background-color:#333;
}
`);

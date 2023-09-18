import p5 from "p5";
import { POINTS } from "p5";
import db from './firebase.js';
import { playerRef, userID } from "./firebase.js";
import { onValue, push, ref, set, get } from "firebase/database";

const paths = [];
const currentPath = [];

const pencilColor = 'black';
const canvasColor = 'white';
const pencilSize = 5;

let pathsRef;
let allPlayersRef = ref(db, 'players');
let allPlayers;
let temp;

export function initCanvas(){
    new p5((p) => {
        
        p.setup = () => {
            p.createCanvas(p.windowWidth * 0.6, p.windowHeight * 0.6);
            p.background(canvasColor);
            //p.frameRate(5);

            onValue(allPlayersRef, (snapshot) => {
                allPlayers = Object.keys(snapshot.val());
                allPlayers.forEach((player) => {
                    temp = snapshot.val()[player].paths;
                    if(temp != undefined && player != userID){
                        //currentPath2.length = 0;
                        //currentPath2.push(Object.values(temp2));
                        paths.push(Object.values(temp));
                        //console.log(currentPath2);
                        console.log(Object.values(temp));
                    }
                });
                console.log(paths);

            })
        };

        p.draw = () => {
            if (p.mouseIsPressed) {
                const point = {
                    x: p.mouseX,
                    y: p.mouseY,
                    color: pencilColor,
                    size: pencilSize,
                };
                currentPath.push(point);

                pathsRef = ref(db, 'players/' + userID +'/paths');
                push(pathsRef, point);
            }
            
            paths.forEach((path) => {
                //console.log(path);
                p.beginShape(POINTS);
                path.forEach(({ x, y, color, size }) => {
                    //console.log(x, y, color, size);
                    p.vertex(x, y);
                    p.strokeWeight(size);
                    p.stroke(color);
                });
                p.endShape();
            });
            
            p.noFill();
        };

        p.mousePressed = () => {
            currentPath.length = 0;
            paths.push(currentPath);
        }
    });
}


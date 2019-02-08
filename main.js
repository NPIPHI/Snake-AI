window.addEventListener('resize', evt=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
function inti(){
    canvas = document.createElement('canvas');
    canvas.style.position='absolute';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.left='0px';
    canvas.style.top='0px';
    document.body.appendChild(canvas);
    fitGraph = new Graph(0,500,100,400,[]);
    ctx = canvas.getContext("2d");
    let n = Network.generate(7,3);
    n.compile();
    for(let i = 0; i < numSnakes; i++){
        snakes.push(new Snake(Math.floor(mWidth/2),Math.floor(mHeight/2),4,Math.floor((i%simWidth)*window.innerWidth/simWidth),Math.floor((i/simWidth))*window.innerWidth/simWidth,mWidth,mHeight, window.innerWidth/(simWidth*mWidth),n.clone()));
        snakes[snakes.length-1].network.compile();
    }
    loop();
}
function loop(){
    for(let af = 0; af < 1; af ++){
        let allDead = true;
        snakes.forEach((s)=>{
            if(!s.dead){
                s.update();
                allDead = false;
            }
        });
        if(allDead){
            let sorted = false;
            for(let i = snakes.length-1; i >= 0&&!sorted; i --){
                sorted = true;
                for(let j = 0; j < i; j++){
                    if(this.snakes[j].fitness<snakes[j+1].fitness){
                        let buf = snakes[j];
                        snakes[j] = snakes[j+1];
                        snakes[j+1] = buf;
                        sorted = false;
                    }
                }
            }
            fitGraph.addPoint(this.snakes[0].fitness);
            /*nets[0]=snakes[0].network;
            nets[1]=snakes[1].network;
            nets[2]=snakes[2].network;
            nets[3]=snakes[3].network;
            nets[4]=snakes[0].network.crossover(snakes[1].network);
            nets[5]=snakes[0].network.crossover(snakes[2].network);
            nets[6]=snakes[0].network.crossover(snakes[3].network);
            nets[7]=snakes[1].network.crossover(snakes[2].network);
            nets[8]=snakes[1].network.crossover(snakes[3].network);
            nets[9]=snakes[2].network.crossover(snakes[2].network);
            nets[4].mutate();
            nets[5].mutate();
            nets[6].mutate();
            nets[7].mutate();
            nets[8].mutate();
            nets[9].mutate();*/
            nets[0]=snakes[0].network.clone();
            nets[1]=snakes[0].network.clone();
            nets[2]=snakes[0].network.clone();
            nets[3]=snakes[0].network.clone();
            nets[4]=snakes[1].network.clone();
            nets[5]=snakes[1].network.clone();
            nets[6]=snakes[1].network.clone();
            nets[7]=snakes[2].network.clone();
            nets[8]=snakes[2].network.clone();
            nets[9]=snakes[3].network.clone();
        

            for(let i = 1; i < nets.length; i++){
                nets[i].mutate();
            }
            snakes = [];
            for(let i = 0; i < numSnakes; i++){
                snakes.push(new Snake(Math.floor(mWidth/2),Math.floor(mHeight/2),4,Math.floor((i%simWidth)*window.innerWidth/simWidth),Math.floor((i/simWidth))*window.innerWidth/simWidth,mWidth,mHeight, window.innerWidth/(simWidth*mWidth),nets[i]));
            }
            frameNum = 0;
        } else {
            frameNum ++;
        }
    }
    fitGraph.draw();
    snakes.forEach(s=>{
        s.draw();
    });
    //drawFitnessGraph(500,500,200,200);
    requestAnimationFrame(loop);
}
class Graph{
    constructor(x,y,width, height, dataPts){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dataPts = dataPts;
        this.max = (dataPts[0])?dataPts[0]:0;
        dataPts.forEach(e => {
            this.max = Math.max(this.max,e);
        });
    }
    addPoint(value){
        this.dataPts.push(value);
        this.max = Math.max(value, this.max);
        if(this.dataPts.length>100){
            for(let i = 0; i < 50; i++){
                this.dataPts[i]=Math.max(this.dataPts[i],this.dataPts[i+1]);
                this.dataPts.splice(i+1,1);
            }
        }
    }
    draw(){
        ctx.clearRect(this.x,this.y,this.width,this.height);
        ctx.beginPath();
        ctx.moveTo(this.x,this.y+this.height);
        for(let i = 0; i < this.dataPts.length; i ++){
            ctx.lineTo(this.x+Math.floor(this.width*i/this.dataPts.length), this.y+this.height-Math.floor(this.height*this.dataPts[i]/this.max));
        }
        ctx.stroke();
    }
}

var fitGraph;
var net;
var snakes = [];
var nets = [];
var canvas;
var ctx;
var numSnakes = 10;
var simWidth = 5;
var frameNum = 0;
var mWidth = 40;
var mHeight = 40;
inti();

class Snake{
    constructor(x,y,length, mapx, mapy, mapWidth, mapHeight, cellSize, network){
        this.frame = 0;
        this.x = x;            //0
        this.y = y;          //3    1
        this.direction = 0;     //2
        this.bufDir = this.direction;
        this.body = [];
        this.frameSinceFood = 0;
        this.extension = length;
        this.body.push({x: x, y: y});
        this.fitness = 0;
        this.network = network;
        this.map = {mapArray: new Array(mapWidth*mapHeight), x: mapx, y: mapy, width: mapWidth, height: mapHeight, cellSize: cellSize};
        this.fruit = {x: Math.floor(Math.random()*this.map.width), y: Math.floor(Math.random()*this.map.height), value: 5}
        this.map.mapArray[x+y*mapWidth] = 1;
    }
    networkUpdate(){
        let output = this.network.compute(this.getInputs());
        if(output[0]>output[1]&&output[0]>output[2]){
            this.direction--;
        }
        if(output[1]>output[0]&&output[1]>output[2]){
        }
        if(output[2]>output[1]&&output[2]>output[0]){
            this.direction++;
        }
        if(this.direction>3){
            this.direction-=4;
        }
        if(this.direction<0){
            this.direction+=4;
        }
    }
    playerUpdate(){
        if(kbrd.getKey(87)&&this.bufDir!=2){
            this.direction = 0;
        }
        if(kbrd.getKey(68)&&this.bufDir!=3){
            this.direction = 1;
        }
        if(kbrd.getKey(83)&&this.bufDir!=0){
            this.direction = 2;
        }
        if(kbrd.getKey(65)&&this.bufDir!=1){
            this.direction = 3;
        }
        this.update();
    }
    draw(){
        ctx.strokeRect(this.map.x,this.map.y,this.map.width*this.map.cellSize,this.map.height*this.map.cellSize);
        for(let i = 0; i < this.map.mapArray.length; i ++){
            ctx.fillStyle = (this.dead)?'red':'black';
            if(this.map.mapArray[i]) ctx.fillRect(this.map.x+(i%this.map.width)*this.map.cellSize, this.map.y+Math.floor(i/this.map.width)*this.map.cellSize, this.map.cellSize,this.map.cellSize);
        }
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.map.x+this.fruit.x*this.map.cellSize+1, this.map.y+this.fruit.y*this.map.cellSize+1, this.map.cellSize-2, this.map.cellSize-2);
    }
    update(){
        this.frame++;
        
        if(this.frame==1&&!this.dead){
            this.networkUpdate();
            this.move(this.direction);
            this.bufDir = this.direction;
            this.frameSinceFood++;
            this.fitness+=0.01;
            if(this.x == this.fruit.x&&this.y == this.fruit.y){
                this.extension += this.fruit.value;
                this.fruit.x = Math.floor(Math.random()*this.map.width);
                this.fruit.y = Math.floor(Math.random()*this.map.width);
                this.fitness+=30;
                this.frameSinceFood = 0;
            }
            if(this.frameSinceFood>300){
                this.die();
            }
            this.frame-=1;
        }
    }
    getInputs(){
        let ret = [];
        let top = ((this.y<=0)?1:this.map.mapArray[this.x+(this.y-1)*this.map.width])?1:0;
        let bottom = ((this.y+1>=this.map.height)?1:this.map.mapArray[this.x+(this.y+1)*this.map.width])?1:0;
        let left = ((this.x<=0)?1:this.map.mapArray[this.x-1+this.y*this.map.width])?1:0;
        let right = ((this.x+1>=this.map.width)?1:this.map.mapArray[this.x+1+this.y*this.map.width])?1:0;
        let ftop = (this.y<this.fruit.y)?1:0;
        let fbottom = (this.y>this.fruit.y)?1:0;
        let fleft = (this.x>this.fruit.x)?1:0;
        let fright = (this.x<this.fruit.x)?1:0;
        switch(this.direction){
            case 0:
                ret.push(left);
                ret.push(top);
                ret.push(right);
                ret.push(fleft);
                ret.push(ftop);
                ret.push(fright);
                ret.push(fbottom);
                break;
            case 1:
                ret.push(top);
                ret.push(right);
                ret.push(bottom);
                ret.push(ftop);
                ret.push(fright);
                ret.push(fbottom);
                ret.push(fleft);
                break;
            case 2: 
                ret.push(right);
                ret.push(bottom);
                ret.push(left);
                ret.push(fright);
                ret.push(fbottom);
                ret.push(fleft);
                ret.push(ftop);
                break;
            case 3:
                ret.push(bottom);
                ret.push(left);
                ret.push(top);
                ret.push(fbottom);
                ret.push(fleft);
                ret.push(ftop);
                ret.push(fright);
                break;
        }
        return ret;
    }
    move(dir){
        if(this.extension==0){
            this.map.mapArray[this.body[this.body.length-1].x+this.body[this.body.length-1].y*this.map.width]=0;
        } else {
            this.body.push(this.body[this.body.length-1]);
            this.extension--;
        }
        for(let i = this.body.length-1; i >=1; i --){
            this.body[i]=this.body[i-1];
        }
        this.body[0] = {x: this.x + ((dir==1||dir==3)?(dir==1)?1:-1:0), y: this.y+((dir==0||dir==2)?(dir==2)?1:-1:0)}
        this.x +=((dir==1||dir==3)?(dir==1)?1:-1:0);
        this.y +=((dir==0||dir==2)?(dir==2)?1:-1:0);
        if(this.map.mapArray[this.x+this.y*this.map.width]==1||this.x<0||this.y<0||this.x>=this.map.width||this.y>=this.map.width) this.die();
        this.map.mapArray[this.body[0].x+this.body[0].y*this.map.width] = 1;
    }
    die(){
        this.dead = true;
    }
}

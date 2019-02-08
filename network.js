class Network{
    constructor(inputs, outputs, nodes, connections){///inputs and outputs should be the index numbers of inputs and outputs
        this.inputIndexes = inputs;
        this.outputIndexes = outputs;
        this.nodes = nodes;
        this.connections = connections;
    }
    static generate(inputs, outputs){
        let nodes = [];
        let ins = [];
        let outs = [];
        let connections = [];
        for(let i = 0; i < inputs; i++){
            nodes.push(Node.newNode(0));
            ins.push(nodes[nodes.length-1].index);
        }
        for(let i = 0; i < outputs; i++){
            nodes.push(Node.newNode(1));
            outs.push(nodes[nodes.length-1].index);
        }
        nodes.forEach(n=>{
            n.bias = Math.random()-0.5;
        });
        return new Network(ins, outs, nodes, connections);
    }
    addConnection(entry,exit,weight){
        let con = Connection.newConnection(entry,exit,weight);
        let done = false;
        if(this.connections.length==0){
            this.connections.push(con);
        } else {
            for(let i = 0; i < this.connections.length && !done; i++){
                if(this.indexMap[this.connections[i].entry] < this.indexMap[entry]){
                    this.connections.splice(i,0,con);
                    done = true
                }
            }
        }
    }
    addNode(pos){
        let node = Node.newNode(pos);
        let done =false;
        for(let i = 0; i < this.nodes.length&&!done; i ++){
            if(this.nodes[i].pos<pos){
                this.nodes.splice(i,0,node);
                done = true;
            }
        }
        this.indexMap = this.getIndexMap();
        return node.index;
    }
    clone(){
        let nodes = [];
        let connections = [];
        this.nodes.forEach(node=>{
            nodes.push(node.clone());
        })
        this.connections.forEach(con=>{
            connections.push(con.clone());
        })
        let net = new Network(this.inputIndexes.slice(0), this.outputIndexes.slice(0),nodes,connections);
        net.indexMap = this.indexMap;
        return net;
    }
    compileConnections(){
        this.posSortNodes();
        this.indexMap = this.getIndexMap();
        for(let i = 0; i < this.connections.length; i++){
            if(!(this.indexMap[this.connections[i].entry]&&this.indexMap[this.connections[i].exit])){
                this.connections.splice(i,1);
                i--;
            }
        }
    }
    compile(){
        let front = 0;
        this.compileConnections();

        for(let i = 0; i < this.nodes.length; i ++){
            for(let j = front; j < this.connections.length; j++){
                if(this.connections[j].entry == this.nodes[i].index){
                    let buf = this.connections[j];
                    this.connections[j] = this.connections[front];
                    this.connections[front] = buf;
                    front++;
                }
            }
        }
    }
    compute(inputs){
        this.nodes.forEach(node=>{
            node.value = node.bias;
        })

        for(let i = 0; i < inputs.length; i++){
            this.nodes[this.indexMap[this.inputIndexes[i]]].value = inputs[i];
        }

        let node = -1;
        for(let i = 0; i < this.connections.length; i ++){
            if(node!=this.connections[i].entry){
                node = this.connections[i].entry;
                this.nodes[this.indexMap[this.connections[i].entry]].activate();
            }
            if(this.connections[i].on){
                this.nodes[this.indexMap[this.connections[i].exit]].value += this.nodes[this.indexMap[this.connections[i].entry]].value*this.connections[i].weight;
            }
        }

        let output = [];
        for(let i = 0; i < this.outputIndexes.length; i++){
            output.push(this.nodes[this.indexMap[this.outputIndexes[i]]].value);
        }
        return output;
    }
    getIndexMap(){
        let indexMap = [];

        for(let i = 0; i < this.nodes.length; i ++){
            indexMap[this.nodes[i].index] = i;
        }

        return indexMap;
    }
    posSortNodes(){
        let sorted = false;
        for(let i = this.nodes.length-1; i >0&&!sorted; i --){
            sorted = true;
            for(let j = 0; j < i; j++){
                if(this.nodes[j].pos>this.nodes[j+1].pos){
                    let buf = this.nodes[j];
                    this.nodes[j]=this.nodes[j+1];
                    this.nodes[j+1]=buf;
                    sorted = false;
                }
            }
        }
    }
    mutate(){
        if(Math.random()<0.5){
            if(this.connections.length){
                let switchIndex = Math.floor(Math.random()*this.connections.length);
                this.connections[switchIndex].weight+=Math.random()-0.5;
            }
        }
        if(Math.random()<0.5){ // turn on or off a connection
            if(this.nodes.length){
                let switchIndex = Math.floor(Math.random()*this.nodes.length);
                this.nodes[switchIndex].bias+=Math.random()-0.5;
            }
        }
        if(Math.random()<0.3){//add a connection between two unconnected nodes
            let connected = false;
            for(let enterNode = 0; enterNode < this.nodes.length&&!connected; enterNode++){
                for(let exitNode = enterNode+1; exitNode <this.nodes.length&&!connected; exitNode++){
                    if(this.nodes[this.indexMap[enterNode]].pos<this.nodes[this.indexMap[exitNode]].pos){
                        if(Math.random()<0.4){
                            let noCon = true;
                            for(let con = 0; con < this.connections.length&&noCon; con++){
                                noCon = !(this.connections[con].entry==enterNode&&this.connections[con].exit==exitNode);
                            }
                            if(noCon){
                                this.addConnection(this.nodes[enterNode].index,this.nodes[exitNode].index,Math.random()-0.5);
                                connected = true;
                            }
                        }
                    }
                }
            }
        } else if(Math.random()<0){//remove a node and its connections
            let deleteNode = Math.floor(Math.random()*this.nodes.length);
            let invalid = false;
            let nodeIndex = this.nodes[deleteNode].index;
            for(let i = 0; i < this.inputIndexes.length&&!invalid; i++){
                invalid = (nodeIndex==this.inputIndexes[i]);
            }
            for(let i = 0; i < this.outputIndexes.length&&!invalid; i++){
                invalid = (nodeIndex==this.outputIndexes[i]);
            }
            if(!invalid){
                this.nodes.splice(deleteNode,1);
                for(let i = 0; i < this.connections.length; i++){
                    if(this.connections[i].entry==nodeIndex||this.connections[i].exit==nodeIndex){
                        this.connections.splice(i,1);
                        i--;
                    }
                }
            }
        }
        if(Math.random()<0){//make a connection in to a new node;
            if(this.connections.length){
                this.indexMap = this.getIndexMap();
                let buildIndex = Math.floor(Math.random()*this.connections.length);
                let node = Node.newNode((this.nodes[this.indexMap[this.connections[buildIndex].entry]].pos + this.nodes[this.indexMap[this.connections[buildIndex].exit]].pos)/2);
                this.connections.push(Connection.newConnection(this.connections[buildIndex].entry,node.index,this.connections[buildIndex].weight));
                this.connections.push(Connection.newConnection(node.index, this.connections[buildIndex].exit,1));
                this.nodes.push(node);
                this.connections[buildIndex].on = false;
            }

        }
            
    }
    sortIndex(){
        let sorted = false;
        for(let i = this.nodes.length-1; i >0&&!sorted; i --){
            sorted = true;
            for(let j = 0; j < i; j++){
                if(this.nodes[j].index>this.nodes[j+1].index){
                    let buf = this.nodes[j];
                    this.nodes[j]=this.nodes[j+1];
                    this.nodes[j+1]=buf;
                    sorted = false;
                }
            }
        }
        console.log("bad");
        for(let i = this.connections.length-1; i >0&&!sorted; i --){
            sorted = true;
            for(let j = 0; j < i; j++){
                if(this.connections[j].index>this.connections[j+1].index){
                    let buf = this.connections[j];
                    this.connections[j]=this.connections[j+1];
                    this.connections[j+1]=buf;
                    sorted = false;
                }
            }
        }
    }
    crossover(net){
        this.sortIndex();
        net.sortIndex();
        let done = false;
        let thisTrack = 0;
        let otherTrack = 0;
        let nodes = [];
        let connections = [];
        while(!done){ //duplicate nodes
            if(thisTrack<this.nodes.length&&otherTrack<net.nodes.length){//if both node lists have not been gone through
                if(this.nodes[thisTrack].index==net.nodes[otherTrack].index){//if both lists have the same mutation
                    nodes.push(this.nodes[thisTrack].clone());
                    thisTrack++;
                    otherTrack++;
                } else if(this.nodes[thisTrack].index>net.nodes[otherTrack].index){//if the other list has a lower index number
                    if(Math.random()<0.5){
                        nodes.push(net.nodes[otherTrack].clone());
                        otherTrack++;
                    }
                } else { // if this node list has a lower index number
                    if(Math.random()<0.5){
                        nodes.push(this.nodes[thisTrack].clone());
                        thisTrack++;
                    }
                }
            } else if(thisTrack<this.nodes.length){//if this node list has not been gone through
                if(Math.random()<0.5){
                    nodes.push(this.nodes[thisTrack].clone());
                    thisTrack++;
                }
            } else if(otherTrack<net.nodes.length){//if the ohter list has not been gone through
                if(Math.random()<0.5){
                    nodes.push(net.nodes[otherTrack].clone());
                    otherTrack++;
                }
            } else done = true;
        }

        thisTrack = 0;
        otherTrack = 0;
        done = false;

        while(!done){ //duplicate connections
            if(thisTrack<this.connections.length&&otherTrack<net.connections.length){//if both node lists have not been gone through
                if(this.connections[thisTrack].index==net.connections[otherTrack].index){//if both lists have the same mutation
                    connections.push(this.connections[thisTrack].clone());
                    thisTrack++;
                    otherTrack++;
                } else if(this.connections[thisTrack].index>net.connections[otherTrack].index){//if the other list has a lower index number
                    if(Math.random()<0.5){
                        connections.push(net.connections[otherTrack].clone());
                        otherTrack++;
                    }
                } else { // if this node list has a lower index number
                    if(Math.random()<0.5){
                        connections.push(this.connections[thisTrack].clone());
                        thisTrack++;
                    }
                }
            } else if(thisTrack<this.connections.length){//if this node list has not been gone through
                if(Math.random()<0.5){
                    connections.push(this.connections[thisTrack].clone());
                    thisTrack++;
                }
            } else if(otherTrack<net.connections.length){//if the ohter list has not been gone through
                if(Math.random()<0.5){
                    connections.push(net.connections[otherTrack].clone());
                    otherTrack++;
                }
            } else done = true;
        }
        let returnNet = new Network(this.inputIndexes.slice(0),this.outputIndexes.slice(0),nodes,connections);
        returnNet.posSortNodes();
        returnNet.mutate();
        returnNet.compileConnections();
        return returnNet;
    }
}
class Node{
    constructor(index,bias, pos){//0 for middle, 1 for input, 2 for output
        this.index = index;
        this.bias = bias;
        this.func = sigmoid;
        this.pos = pos;
        this.value = 0;
    } 
    activate(){
        this.value = this.func(this.value);
    }
    clone(){
        return new Node(this.index, this.bias, this.pos);
    }
    static newNode(pos){
        return new Node(mutationTracker++,0, pos)
    }
}
class Connection{
    constructor(entry,exit,index,weight){
        this.entry = entry;
        this.exit = exit;
        this.index = index;
        this.weight = weight;
        this.on = true;
    }
    clone(){
        return new Connection(this.entry,this.exit,this.index,this.weight);
    }
    static newConnection(entry,exit,weight){
        return new Connection(entry, exit, mutationTracker++, weight);
    }
    toggle(){
        this.on = !this.on;
    }
}
function sigmoid(x){
    return 1/(1+Math.pow(Math.E,-x));
}
function linear(x){
    return x;
}
var mutationTracker = 0;
# Snake-AI
a genetic algorithm playing snake

## How it works

A genetic algorithm works by creating random mutation in a each member of a population and choosing the fittest members to survive and reproduce

This demo had 7 entry nodes and 3 output nodes.
The fitness is determined mosly by how many fruits the snake eats.
How long the snake lives increases the fitness slightly.
The network is given 7 inputs 4 for the direction of the fruit and 3 for if there is an obsticle in front, to the left, or to the right of the snake.
The output nodes correspond to turn left, go straignt, or turn right. 
The network can randomly change connection weights or add connections to nodes that do not have any.
Adding more nodes is also implmented but not enabled for this demo.

## How to use it

The speed starts at one cycle per frame.
Set the speed to 10000 cycles per frame and the network should learn how to play snake in a few seconds

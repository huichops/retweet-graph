import d3 from 'd3';
import graph from './exampleGraph.json';
// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

const width = 640,
    height = 480;


var svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height);



var force = d3.layout.force()
    .size([width, height])
    .nodes(graph.users)
    .links(graph.follows);

var link = svg.selectAll('.link')
    .data(graph.follows)
    .enter().append('line')
    .attr('class', 'link');


var node = svg.selectAll('.node')
    .data(graph.users)
    .enter().append('g')
    .attr('class', 'node');

node.append('circle')
    .attr('r', 20)
    .style('fill', (d) =>  `rgb(${Math.floor(color(d.followers_count));}, 50, 50)`; );

node.append('text')
    .attr('dx', 10)
    .attr('dy', '.35em')
    .text((d) => d.name);




force
  .charge(-1000)
  .gravity(0.3)
  .linkStrength(0.1)
  .linkDistance(width/2);

var color = d3.scale.linear()
      .domain([0, 360])
      .range([100, 255]);

force.on('tick', function() {

    // When this function executes, the force layout
    // calculations have concluded. The layout will
    // have set various properties in our nodes and
    // links objects that we can use to position them
    // within the SVG container.

    // First let's reposition the nodes. As the force
    // layout runs it updates the `x` and `y` properties
    // that define where the node should be centered.
    // To move the node, we set the appropriate SVG
    // attributes to their new values. We also have to
    // give the node a non-zero radius so that it's visible
    // in the container.

    node.attr('r', width/25)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr('fill', function(d) { 
        });

    // We also need to update positions of the links.
    // For those elements, the force layout sets the
    // `source` and `target` properties, specifying
    // `x` and `y` values in each case.

    link.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

});

force.start();

export default force;

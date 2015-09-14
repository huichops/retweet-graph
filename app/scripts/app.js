import d3 from 'd3';
import io from 'socket.io-client';

var socket = io('http://localhost:8080');



// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is



socket.on('graph', (graph) => {
  const width = 640,
      height = 480;

  console.log(graph);

  var svg = d3.select('#graph').append('svg')
      .attr('width', width)
      .attr('height', height);



  var force = d3.layout.force()
      .size([width, height])
      .charge(-1000)
      .gravity(0.3)
      .linkStrength(0.1)
      .linkDistance(width/2);


  var color = d3.scale.linear()
        .domain([0, graph.nodes.sort()[graph.nodes.length-1].followers_count])
        .range([100, 255]);

  console.log(graph);
  force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();
    
  var link = svg.selectAll('.link')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'link');


  var node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append('g')
    .attr('class', 'node');

  node.append('circle')
    .attr('r', 10)
    .style('fill', (d) => `rgb(${Math.floor(color(d.followers_count))}, 50, 50)` );

  node.append('text')
    .attr('dx', 10)
    .attr('dy', '.35em')
    .text((d) => d.screen_name);

  force.on('tick', function() {

    d3.selectAll('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    d3.selectAll('text')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);

    link.attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

  });
});

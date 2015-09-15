import d3 from 'd3';
import io from 'socket.io-client';

var socket = io('http://localhost:8080');

const width = 820,
    height = 520;

var svg;

var force = d3.layout.force()
    .size([width, height])
    .charge(-5000)
    .gravity(0.4)
    .linkStrength(0.1)
    .linkDistance(250);

var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip hidden')

var name = tooltip.append('h3')
    .attr('class', 'tooltip-username');

var description = tooltip.append('p')
    .attr('class', 'tooltip-description');

var form = document.querySelector('.link-form');

form.onsubmit = function(e) {
  var link = form.querySelector('#twitterLink').value;
  var id = link.match(/status\/(\d+)$/, link);
  console.log('Getting graph for', id);
  if (id) socket.emit('getGraph', id[1]);
  e.preventDefault();
}

socket.on('graph', (graph) => {

  if (svg) svg.remove();
  svg = d3.select('#graph').append('svg')
      .attr('width', width)
      .attr('height', height);

  console.log(graph);
  var sortedNodes = graph.nodes.sort((a, b) => a.followers_count - b.followers_count);
  var first = sortedNodes[0];
  var last = sortedNodes[sortedNodes.length-1];

  var radius = d3.scale.linear()
        .domain([first.followers_count, last.followers_count])
        .range([20, 100]);

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

  node.append('clipPath')
    .attr('id', (d) => d.screen_name)
  .append('circle')
    .attr('r', (d) => Math.floor(radius(d.followers_count), 10) )
    .style('fill', (d) => '#' + d.fill_color);

  node.append('svg:image')
      .attr('class', 'graph-img')
      .attr('xlink:href', (d) => d.avatar)
      .attr('clip-path', (d) => `url(#${d.screen_name})`)
      .attr('width', (d) => radius(d.followers_count) * 2 )
      .attr('height', (d) => radius(d.followers_count) * 2 );

  force.on('tick', function() {

    d3.selectAll('image')
      .attr('x', (d) => d.x - radius(d.followers_count))
      .attr('y', (d) => d.y - radius(d.followers_count))
      .on('mouseover', (d) => {
        console.log('over');
        tooltip.attr('class', 'tooltip visible');

        name.text(d.screen_name);
        description.text(d.description);
      })
      .on('mouseout', () => {
        tooltip.attr('class', 'tooltip hidden')
      })
      .on("mousemove", () => tooltip.style("top",
    (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px"));

    d3.selectAll('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)


    link.attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

  });
});

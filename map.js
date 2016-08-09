var image_ratio = 0.55;

//Map projection
var projection = d3.geoMercator()
    .scale(1981.1280740237403)
    .center([24.69431378639518,-28.676064358016077]) //projection center

//Generate paths based on projection
var path = d3.geoPath()
    .projection(projection);

//Create an SVG
var svg = d3.select("#container").append("svg")
    .attr("width", "100%")
    .attr("height", function(el) {
        return get_width(d3.select(this)) * image_ratio;
    });

//Group for the map features
var features = svg.append("g")
    .attr("class","features");

//Create choropleth scale
var color = d3.scaleQuantize()
    .domain([0,100])
    .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }));

//Create a tooltip, hidden at the start
var tooltip = d3.select("body").append("div").attr("class","tooltip");

d3.json("out.topojson",function(error,geodata) {
  if (error) return console.log(error); //unknown error, check the console

  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(topojson.feature(geodata,geodata.objects.muni_interactive).features) //generate features from TopoJSON
    .enter()
    .append("path")
    .each(function(d) {
        d.properties["perc_women"] = Math.round(d.properties.women_winners / d.properties.total_wards * 100)
    })
    .attr("d",path)
    .attr("class", function(d) { return (typeof color(d.properties.perc_women) == "string" ? color(d.properties.perc_women) : ""); })
    .on("mouseover",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip)
    .on("click",clicked)

});

// Add optional onClick events for features here
// d.properties contains the attributes (e.g. d.properties.name, d.properties.population)
function clicked(d,i) {

}


//Create a tooltip, hidden at the start
function showTooltip(d) {
  moveTooltip();
  console.log(d.properties)
  var html = [
    '<div class="heading">' + d.properties.municipality + '</div>',
    '<div class="line"></div>',
    '<div class="result">Total wards: ' + d.properties.total_wards + '</div>',
    '<div class="result">Women winners: ' + d.properties.women_winners + '</div>',
    '<div class="result">ANC women: ' + d.properties.anc_winners + '</div>',
    '<div class="result">DA women: ' + d.properties.da_winners + '</div>',
    '<div class="result">Other women: ' + d.properties.other_winners + '</div>',
    '<div class="result">Women won ' + d.properties.perc_women + '% of wards</div>'
  ].join("")
  if (d.properties.women_winners === null) 
      html = '<span class="heading">' + d.properties.municipality + '</span><br><span class="result">The winners in this municipality have not yet been announced</span>';

  tooltip.style("display","block")
      .html(html);
}

//Move the tooltip to track the mouse
function moveTooltip() {
    var offset = {x: 5, y: -25}
    var bbox = tooltip.node().getBoundingClientRect();
    var svg_width = get_width(d3.select("#container svg"));
    var svg_height = get_height(d3.select("#container svg"));

    if (d3.event.pageX > (svg_width - bbox.width) - 5) {
        offset.x = -bbox.width - 5;
    }
    if (d3.event.pageY > (svg_height - bbox.height)) {

        offset.y = -bbox.height - 5;
    }

  tooltip.style("top",(d3.event.pageY+offset.y)+"px")
      .style("left",(d3.event.pageX+offset.x)+"px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
  tooltip.style("display","none");
}

function get_width(el) {
    return el.node().getBoundingClientRect().width;
}

function get_height(el) {
    return el.node().getBoundingClientRect().height;
}

function sizeChange() {
    var svg = d3.select("#container svg");
    var width = get_width(svg);

    svg.select("g.features")
        .attr("transform", "scale(" + (width / initial_width) + ")")

    svg.attr("height", function(el) {
        return width * image_ratio;
    });
}

d3.select(window).on("resize", sizeChange);
var initial_width = get_width(svg);
sizeChange();


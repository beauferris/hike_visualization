let map_svg = d3.select("#map_container")
let legend_svg = d3.select("#legend_container")

d3.xml("/static/svg/helper.svg")
.then(data => {
  map_svg.node().append(data.documentElement)
});

function resetAll(data) {
    /* resets the color of all counties */
    map_svg.select("#Layer_1")
    .selectAll("path")
      .data(data)
      .attr("class", function(d) { 
	    return quantize(this.crime)
    });
}
var last_class = "";

function styleImportedSVG(data) {

    console.log("ayre")
   map_svg.select("#Layer_1").selectAll('path')
    .on('mouseover', function () {
    
       last_class = this.class; 

       d3.select(this)
        .attr("class", "highlight")
    })
    .on('mouseout',function(){
        d3.select(this)
        .attr("class", function(data){
            return quantize(data.crime)
        })
    })
    
}

var _data;
var last_active ="";

d3.csv("/static/csv/city.csv").then(function(data) {
   legend_svg
        .append("svg")
        .attr("id","legend")
        .attr({
            "width":200,
            "height":600,
        });
        styleImportedSVG(data)
  
        addNames(data);
        addColor(data);
        addLegend(data)
    
    
});


function addNames(data){
    d3.select("#Layer_1")
    .selectAll('text')
    .data(data)
    .enter()
    .append("text")
        .attr('x',function(d){return d.dx})
        .attr('y',function(d){return d.dy})
        .text(function(d){return d.area});
}

function addColor(data){
  
        map_svg
        .select("#Layer_1")
        .selectAll('path')
        .data(data)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr("crime",function(d) { 
                if(d.area == this.id) return d.crime
            })
            .attr("class",function(d) { 
                if(this.id==d.area) return quantize(d.crime) 
            })       
}


let hue = "g";

var quantize = d3.scaleQuantize()
    .domain([4000, 20000])
    .range(d3.range(8).map(function(i) { return hue + i + "-8"; }))


function addLegend(data){
  
  

    var legend = legend_svg.select("#legend")
    .selectAll('g.legend')
    .data(quantize.range())
    .enter()
    .append('g').attr('class','legendEntry')
 
    legend.append('rect')
        .attr("width", 15)
        .attr("height", 15)
        .attr('x', 0)
        .attr('y', function(d,i){
            return 105+i*25
        }).attr("class",function(d){
            return d;
        }).style("stroke", "black")
        .style("stroke-width", 1)
        .on("click", function(d)
        {
            addColor(data)
            map_svg.select("#Layer_1").selectAll("." + d).attr('class','highlight');
    });


    legend.append("text")
        .attr('x',20)
        .attr('y',function(d,i){return 120+i*25})
        .text(function(d,i) {
        var extent = quantize.invertExtent(d);
        //extent will be a two-element array, format it however you want:
            return extent[0]+" - " +extent[1]
    })
    
  
    console.log(quantize.invertExtent(3))
}

// let a = _data.filter(d=>d.s=="N")

    // let total =0;
    // let s = a.forEach((element) => {
    //     total = total+parseInt(element.data_2013)
    //     console.log(total)
    // });

    // // let s = a[0]['data_2013'].reduce((reducer,sum)=>reducer+sum,0)

    // console.log(s)    
    // addColor()
    // addNames()
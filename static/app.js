// set the dimensions and margins of the graph
var margin = {top: 50, right: 10, bottom: 10, left: 50},
    width = 700
    height = 300

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width)
    .attr("height",height)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// var grid = d3.select("#legend_container")
//     .append('div')
//     .attr('class','grid')

var buttons = d3.select("#legend_container")
    .append('div')
    .attr('class','buttons')


const tooltip = d3
  .select('#my_dataviz')
  .append('div')
  .attr('id','tooltip')
  .style('position', 'absolute')
  .style("background-color", "white")
  .style('padding', '5px')
  .style('display', 'none')
  .style('opacity',0)
  .style('border-style','solid')
  .style('border-color','grey')
  .style('border-width','1px');       

//addline("barrier_lake.csv")
//addline("yamnuska.csv")
//addline("jura_creek.csv")
addline("final.csv")

function addline(file){
d3.csv("/static/csv/"+file).then(function(data) {


  let nested = d3.nest()
      .key(d=>d.id)
      .entries(data)


  //nested = nested.filter( function(d){return d.key=="jura"} )

  let maxArr = []
  let maxIndex = []

  nested.forEach(n=>{
    maxArr.push(d3.max(d3.values(n)[1], d=>+d.elv))
  })

  let final_peak = []

  for(let y =0;y<nested.length;y++){
    let elv = nested[y].values
    let index = 0
     for(let i=0;i<elv.length;i++){
        //console.log(elv[i].elv)
         if(elv[i].elv == maxArr[y] ){
          // console.log(index)
          maxIndex.push(index)
          index =0
          break
        }else{
          final_peak.push(elv[i])
          index++
        }
     }
  }

  let nested_peak = d3.nest()
      .key(d=>d.id)
      .entries(final_peak)

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
      .domain([0,9])
    .range([ 0, width ]);
  
  // Add Y axis
  var y = d3.scaleLinear()
      .domain([1300,2000])
      .range([height, 0 ]);
  
  // buttons.selectAll('input')
  //   .data(nested)
  //   .enter()
  //   .append('label')
  //     .text(d=>d.key)
  //   .append('input')
  //     .property('checked',false)
  //     .attr("type", "checkbox")
  
   function update(){
      // For each check box:
      d3.selectAll(".checkbox").each(function(d){
        cb = d3.select(this);
        grp = cb.property("value")
        // If the box is check, I show the group
        if(cb.property("checked")){
          svg.selectAll("."+grp).style('opacity',1)
        // Otherwise I hide it
        }else{
          svg.selectAll("."+grp).style('opacity',0)
        }
      })
    }

   d3.selectAll(".checkbox").on("change",update);
  
  // const list = grid
  //     .selectAll('div')
  //     .data(nested)
  //     .enter()
  //     .append('div')
  //     .attr('class','s1')

  // const content = list
  //     .append('div')
  //     .attr('class', 'content')
      
  // content
  //     .append('text')
  //     .text(d=>d.key)

  const xGrid = d3.axisBottom()
      .scale(x)
      .tickFormat('')
      .ticks(20)
      .tickSizeInner(height)
  
  const yGrid = d3.axisLeft()
      .scale(y)
      .tickFormat('')
      .ticks(6)
      .tickSizeInner(-width-margin.left)

  const rightGrid = d3.axisBottom()
      .scale(x)
      .tickFormat('')
      .ticks(1)
      .tickSizeInner(height)

  svg.append('g')
      .attr('class', 'y-grid')
      .attr('opacity', 0.5)
      .call(yGrid)

  svg.append('g')
    .attr('class', 'x-grid')
    .attr('opacity', 0.5)
    .call(xGrid)

  svg.append('g')
    .attr('class', 'right-grid')
    .attr("transform","translate(749)")
    .attr('opacity', 0.5)
    .call(rightGrid)
  
  var line = d3.line()
    .curve(d3.curveBasis)
    .x(d => x(d.distance))
    .y(d => y(d.elv))
////////////////////////////////////////////////////////////////////// 

  //create line 2 peak 
  let peak_lines = svg.append('g')
    .attr('class','peak-lines')
  
  let peak_glines = peak_lines.selectAll('.peak-line-group')
    .data(nested_peak)
    .enter()
    .append('g')
    .attr('class', 'peak-line-group') 

  //create full path
  peak_glines.append("path")
    .attr('stroke','#69b3a2')
    .attr('class', 'peak_line')
    .attr("stroke-width", 6)
    .attr("fill", "none")
    .attr("d", d=> line(d.values))

  let peak_path = peak_glines
      .selectAll("path")
      // console.log(peak_path.nodes()[0].getTotalLength())    
      // console.log(peak_path.nodes()[1].getTotalLength())   
  
  nested.forEach((n,i)=>{
    n['peak'] = peak_path.nodes()[i].getTotalLength()
  })

  svg.selectAll('path').remove()
  ////////////////////////////////////////////////////////////////////
 
  let lines = svg.append('g')
    .attr('class','lines')
  
  let glines = lines.selectAll('.line-group')
    .data(nested)
    .enter()
    .append('g')
    .attr('class', 'line-group')


  //create full path
  glines.append("path")
    .attr('stroke','#69b3a2')
    .attr("stroke-width", 6)
    .attr("class",d=>d.key)
    .attr("fill", "none")
    .attr("d", d=> line(d.values))
    

  nested.forEach((n,i)=>{
    n['length'] = glines.selectAll('path').nodes()[i].getTotalLength()
  })
    
  let mouseG = svg.append('g')
    .attr('class', 'mouse-over-effects')

  mouseG.append('path')
    .data(nested)
    .attr('class', 'mouse-line')
    .style("stroke", "#A9A9A9")
    .style("stroke-width", 2)
    .style("opacity", 1)
   

  let mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(nested)
    .enter()
    .append('g')
    .attr('class', 'mouse-per-line')

  mousePerLine.append('circle')
    .attr('r', 4)
    .style('opacity',0)
    

  mouseG.append('rect')
    .attr('width', width+margin.left)
    .attr('height',height)
    .attr('border-right', 1)
    .style('opacity',0)

    .on('mouseover',()=>{
      d3.select(".mouse-line")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "1");
      // d3.selectAll("#tooltip")
      //   .style('display', 'block')
    })
    .on('mouseout',()=>{
      d3.select(".mouse-line")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "0");
      tooltip
        .style("opacity", "0")
    })
    .on('mousemove',mousemove)

  function mousemove(event){
    let m = d3.mouse(this)
      d3.selectAll('.mouse-per-line')
        .attr('transform', function (d,i) {
        
        let xDistance = x.invert(m[0])
        let bisect = d3.bisector(d=> d.distance).left; 
        let x0 = bisect(d.values, xDistance);
        let d0 = d.values[x0];
        
        

        d3.select(".mouse-line")
          .attr("d", function () {
            var data = "M" + x(d0.distance) + "," + (height);
            data += " " + x(d0.distance) + "," + 0;
            return data;
        });

      tooltip.html("Hike")
        .style('opacity',0.8)  
        .style('display', 'block')
        .style('left', d3.event.pageX + 20+'px')
        .style('top', d3.event.pageY - 20+'px')
        .style('font-size', "12px")
        .selectAll()
        .data(nested)
        .enter() // for each vehicle category, list out name and price of premium
        .append('div')
        .style('font-size', "12px")
        .html(d => {
          var xDistance = x.invert(m[0])
          var bisect = d3.bisector(function (d) { return d.distance; }).left
          var idx = bisect(d.values, xDistance)
          return d.key + ":" +Math.round(d.values[idx].elv).toString() +"m"
        })
        
        return `translate(${x(d0.distance)}, ${y(d0.elv)})`
    });
    
  }

//   //get total length of full path
//   // path = svg.selectAll("path") 
//   // let peakLength = path.node().getTotalLength();  
//   // let end_coord_x = path.node().getPointAtLength(peakLength).x
//   // let end_coord_y = path.node().getPointAtLength(peakLength).y

//   // let max_x = Math.round(d3.max(data,function(d) {return (d.distance)}))
//   // let max_y = Math.round(d3.max(data,function(d) {return (d.elv)}))
// //////////////////////////////////////////////////////////////////////
let path = glines.selectAll("path")
  //path animation      
  const transitionPath = d3
    .transition()
    .ease(d3.easeSin)
    .duration(3000)
    
  //animate path creation
  glines.attr("stroke-dashoffset", d=>d.length)
    .attr("stroke-dasharray", d=>d.length)
    .transition(transitionPath)
    .attr("stroke-dashoffset",function(d){
          //console.log(d.key)
          return  d.length - d.peak
    })
    .transition(transitionPath)
    .attr("stroke-dashoffset",0)
})
}

// @TODO: YOUR CODE HERE!
// Starter code from DABC 15.3.09.Solved
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(newsData, chosenXAxis) {
  // create scales
  // var xLinearScale = d3.scaleLinear()
  //   .domain([d3.min(newsData, d => d[chosenXAxis]) * 1,
  //     d3.max(newsData, d => d[chosenXAxis]) * 1
  //   ])
  //   .range([0, width]);
  var xdata = newsData.map(d => d[chosenXAxis]);
  // console.log("xdata", xdata);
  // console.log("xdata extent", d3.extent(xdata));
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(xdata))
    .range([0, width]);

  return xLinearScale.nice();

  // return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating x-scale var upon click on axis label
function yScale(newsData, chosenYAxis) {
    // create scales
    // var yLinearScale = d3.scaleLinear()
    //   .domain([d3.min(newsData, d => d[chosenYAxis]) * 1,
    //     d3.max(newsData, d => d[chosenYAxis]) * 1
    //   ])
    //   .range([height, 0]);
  
    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(newsData.map(d => d[chosenYAxis])))
      .range([height, 0]);
    return yLinearScale.nice();
  }

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]))
    .attr("cy", d => newYScale(d[chosenYaxis]));

  return circlesGroup;
}

// function used for updating stateLabelsGroup to transiiotn location of statelabels with circles
function renderStateLabels(stateLabelsGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

  stateLabelsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXaxis]))
    .attr("y", d => newYScale(d[chosenYaxis]));

  return stateLabelsGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%): ";
  } else if (chosenXAxis === "age") {
    var xlabel = "Age (Median): ";
  } else {
    var xlabel = "Household Income (Median): ";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obesity (%): ";
  } else if (chosenYAxis === "smokes") {
    var ylabel = "Smokers (%): ";
  } else { //"healthcare"
    var ylabel = "Has Healthcare (%): ";
  }

  // var formatDollars = new Intl.NumberFormat('en-US', {
  //   style: 'currency',
  //   currency: 'USD',
  // });

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    // .attr("class", "tooltip")
    // .attr("class", "d3-tip tooltip")
    // .classed("d3-tip", true)
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]} <br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(newsData, err) {
  if (err) throw err;

  // parse data
  newsData.forEach(function(data) {
    //   id	state	abbr	poverty	povertyMoe	age	ageMoe	income	incomeMoe	healthcare	healthcareLow	healthcareHigh	obesity	obesityLow	obesityHigh	smokes	smokesLow	smokesHigh
    data.id = +data.id;
    // data.state = data.state;
    data.poverty = +data.poverty;
    data.povertyMoe	= +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe	= +data.ageMoe;
    data.income	= +data.income;
    data.incomeMoe	= +data.incomeMoe;
    data.healthcare	= +data.healthcare;
    data.healthcareLow	= +data.healthcareLow;
    data.healthcareHigh	= +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow	= +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes	= +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });

  console.log("News Data: ", newsData);

  // xLinearScale function above csv import
  var xLinearScale = xScale(newsData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(newsData, chosenYAxis);
//   var yLinearScale = d3.scaleLinear()
//     .domain([0, d3.max(newsData, d => d.obesity)])
//     .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var radius = 13;
  var circlesGroup = chartGroup.append("g").selectAll("circle")
    .data(newsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", radius)
    .classed("stateCircle", true);

   // append initial state lables
   // Note 1: set "pointer-events": none on labels so to not interfere with mouse-over event on circles
   // Note 2: multiple ways to center text (e.g. using "dy" or "transform - tranlsate" attr)
   // settled on using "text-anchor": middle and "dominant-baseline": center in the d3Style.css file
   // Note 3 set font-sized based pn 80% of radius
  var stateLabelsGroup = chartGroup.append("g").selectAll("text")
    .data(newsData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("value", d => d.abbr)
    .attr("pointer-events", "none")
    .attr("font-size", 0.7 * radius)
    // .attr("dy", ".3em" )
    // .attr("transform", "translate(0, 3)")
    .text(d => d.abbr)
    .classed("stateText", true);


  // Create group for  3 x- axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  // Create group for  3 y- axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `rotate(-90), translate(${0 - (height / 2)}, ${ 0 - margin.left})`);

  var obesityLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

  var smokersLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokers (%)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Has Healthcare (%)");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(newsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x,y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates state labels with new x,y values
        stateLablesGroup = renderStateLabels(stateLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(newsData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates state labels with new x,y values
        stateLablesGroup = renderStateLabels(stateLabelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokersLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

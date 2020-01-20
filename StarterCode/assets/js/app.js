var svgWidth = 900;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append an SVG group
var chart = svg.append("g");

// Append a div to the body to create tooltips, assign it a class
d3.select(".chart").append("div").attr("class", "tooltip").style("opacity", 0);


d3.csv("data.csv", function(err, myData) {
  if (err) throw err;

  myData.forEach(function(data) {
    data.poverty = Number(data.poverty);
    data.healthcare = Number(data.healthcare);
    data.currentSmoker = Number(data.currentSmoker);
    data.age=Number(data.age)
  });

  console.log(myData);

  // Create scale functions
  var yLinearScale = d3.scaleLinear().range([height, 0]);

  var xLinearScale = d3.scaleLinear().range([0, width]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Variables store minimum and maximum values in a column in data.csv
  var xMin;
  var xMax;
  var yMax;


  function findMinAndMax(dataColumnX) {
    xMin = d3.min(myData, function(data) {
      return Number(data[dataColumnX]) 
    });

    xMax = d3.max(myData, function(data) {
      return Number(data[dataColumnX])
    });

    yMax = d3.max(myData, function(data) {
      return Number(data.poverty)
    });
  }

  // The default x-axis is 'obese'
  // Another axis can be assigned to the variable during an onclick event.
  var currentAxisLabelX = "poverty";


  // Call findMinAndMax() with default
  findMinAndMax(currentAxisLabelX);

  // Set domain of an axis to extend from min to max values of the data column
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);

  // Initializes tooltip
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    // Define position
    .offset([80, -60])
    .html(function(data) {
      var itemName = data.state;
      var itemEdu = Number(data.poverty);
      var itemInfo = Number(data[currentAxisLabelX]);
      var itemString;
      // Tooltip text depends on which axis is active
      if (currentAxisLabelX === "poverty") {
        itemString = "poverty: ";
      }
      else {
        itemString = "healthcare: ";
      }

    });

  // Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle")
    .data(myData)
    .enter()
    .append("circle")
    .attr("cx", function(data, index) {
      return xLinearScale(Number(data[currentAxisLabelX]));
    })
    .attr("cy", function(data, index) {
      return yLinearScale(Number(data.currentsmoker));
    })
    .attr("r", "12")
    .attr("fill", "lightblue")
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)});

  chart
    .selectAll("text")
    .data(myData)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("class","stateText")
    .style("fill", "white")
    .style("font", "10px sans-serif")
    .style("font-weight", "bold")
    .text(function(data) {
      return data.abbr;})
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)})
    .attr("x", function(data, index) {
      return xLinearScale(Number(data[currentAxisLabelX]));
    })
    .attr("y", function(data, index) {
      return yLinearScale(Number(data.age))+4;
    });

  // Append an SVG group for the x-axis, then display the x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    // The class name assigned here will be used for transition effects
    .attr("class", "x-axis")
    .call(bottomAxis);

  // Append a group for y-axis, then display it
  chart.append("g")
    .attr("class", "y-axis")
    .call(leftAxis);

  // Append x-axis labels
  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )
    .attr("class", "axis-text active")
    .attr("data-axis-name", "age");

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
    )
    // This axis label is inactive by default
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "smokes")
    .text("Current Smoker (%)");

  // Change an axis's status from inactive to active when clicked (if it was inactive)
  // Change the status of all active axes to inactive otherwise
  function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")
      // An alternative to .attr("class", <className>) method. Used to toggle classes.
      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
    writeAnalysis(currentAxisLabelX, currentAxisLabelY);
  }

  d3.selectAll(".axis-text").on("click", function() {
    // Assign a variable to current axis
    var clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    var isClickedSelectionInactive = clickedSelection.classed("inactive");
    // console.log("this axis is inactive", isClickedSelectionInactive)
    // Grab the data-attribute of the axis and assign it to a variable
    // e.g. if data-axisName is "poverty," var clickedAxis = "poverty"
    var clickedAxis = clickedSelection.attr("data-axis-name");

    // The onclick events below take place only if the x-axis is inactive
    // Clicking on an already active axis will therefore do nothing
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the variable currentAxisLabelX
      currentAxisLabelX = clickedAxis;
      // Call findMinAndMax() to define the min and max domain values.
      findMinAndMax(currentAxisLabelX);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        // .ease(d3.easeElastic)
        .duration(1800)
        .call(bottomAxis);

     
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("cx", function(data, index) {
            return xLinearScale(Number(data[currentAxisLabelX]));
          })
          .duration(1800);
      });

      d3.selectAll(".stateText").each(function() {
        d3
          .select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("x", function(data, index) {
            return xLinearScale(Number(data[currentAxisLabelX]));
          })
          .duration(1800);
      });


    }
  });
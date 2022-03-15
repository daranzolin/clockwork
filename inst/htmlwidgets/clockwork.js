HTMLWidgets.widget({

  name: 'clockwork',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    return {

      renderValue: function(opts) {

        let data = HTMLWidgets.dataframeToD3(opts.data);
        //console.log(data);
        let currentMin;
        let currentMax;
        let currentMean;
        let minMaxData;
        let radialMinMaxData;
        let width = opts.size;
        let height = opts.size;
        let cycle_label = opts.cycle_label;
        let textData = opts.show_cycle_stats ?  [cycle_label, "min: ", "max: ", "mean: "] : [cycle_label];
        let ticks = opts.x_ticks;
        let margin = 10;
        let innerRadius = width / 5;
        let outerRadius = (width / 2) - margin;
        let loopInterval = opts.loop_interval;
        let textClasses = ["currentCycle", "currentMin", "currentMax", "currentMean"];
        let currentCycle = opts.cycles[0];
        let n_cycles = opts.cycles.length;
        let i = 0;
        let active_line_color = opts.hasOwnProperty("active_line_color") ? opts.active_line_color : "#da4f81";
        let past_line_color = opts.hasOwnProperty("past_line_color") ? opts.past_line_color : "#ccc";
        let past_line_opacity = opts.hasOwnProperty("past_line_opacity") ? opts.past_line_opacity : 0.4;
        let grid_line_color = opts.hasOwnProperty("grid_line_color") ? opts.grid_line_color : "#000";
        // let background_fill = opts.hasOwnProperty("background_fill") ? opts.background_fill : "white";
        let x_axis_font_size = opts.hasOwnProperty("x_axis_font_size") ? opts.x_axis_font_size : 10;
        let y_axis_font_size = opts.hasOwnProperty("y_axis_font_size") ? opts.y_axis_font_size : 10;
        let inner_stats_font_size = opts.hasOwnProperty("inner_stats_font_size") ? opts.inner_stats_font_size : 12;
        let font_family = opts.hasOwnProperty("font_family") ? opts.font_family : "Arial";
        let stop_cycles;
        let data_x_extent;
        let xScale;
        let x_steps;
        let tick_marks;
        let palette = opts.palette;
        //let color = d3.scaleSequential(d3[palette]);
        let color = d3.scaleSequential(d3[palette]).domain(opts.domain)
        const svg = d3.select(el)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          //.attr("background-color", "black")
          .attr("viewBox", [-width / 2, -height / 2, width, height]);
          //.attr("preserveAspectRatio", "xMaxYMax meet");

        if (opts.xIsNumeric) {
          data_x_extent = d3.extent(data, d => d.xValue);
          x_steps = Math.ceil(data_x_extent[1]/ticks);
          tick_marks = d3.range(data_x_extent[0], data_x_extent[1] + 1, x_steps);
          xScale = d3.scaleLinear()
            .domain(d3.extent(data, (d, i) => i === 0 ? 1 : d.xValue + 1))
            .range([0, 2 * Math.PI]);

        } else {
          tick_marks = data.map(d => d.xValue).filter(onlyUnique)
          xScale = d3.scaleBand()
          .domain(data.map(d => d.xValue).filter(onlyUnique))
          .range([0, 2 * Math.PI]);
        }

      let xAxis = g => g
          .call(g => g.selectAll("g")
            .data(tick_marks)
            .enter().append("g")
              .call(g => g.append("path")
                  .attr("class", "spokes")
                  .attr("stroke", grid_line_color)
                  .attr("stroke-opacity", 0.2)
                  .attr("d", d => `
                    M${d3.pointRadial(xScale(d), innerRadius)}
                    L${d3.pointRadial(xScale(d), outerRadius)}
                  `)));

        let xAxisLabels = tick_marks.map(d => {
              let p = d3.pointRadial(xScale(d), innerRadius - 7);
              return {label: d,
                      x: p[0],
                      y: p[1]};
            });

        let yScale = d3.scaleLinear()
          .domain(d3.extent(data, d => d.yValue))
          .range([innerRadius, outerRadius]);

        let yAxis = g => g
          //.attr("text-anchor", "middle")
          //.attr("font-family", "sans-serif")
          .attr("font-size", `${y_axis_font_size}px`)
          .attr("font-family", font_family)
          .call(g => g.selectAll("g")
            .data(yScale.ticks(opts.y_ticks).reverse())
            .enter().append("g")
              .attr("fill", "none")
              .call(g => g.append("circle")
                  .attr("stroke", grid_line_color)
                  .attr("stroke-opacity", 0.2)
                  .attr("r", d => yScale(d)))
              .call(g => g.append("text")
                  .attr("y", d => -yScale(d))
                  .attr("stroke", "#fff")
                  .attr("font-size", `${y_axis_font_size}px`)
                  .attr("stroke-width", 5)
                  .text((d, i) => `${d.toFixed(0)}`)
                .clone(false)
                  .attr("y", d => yScale(d))
                .selectAll(function() { return [this, this.previousSibling]; })
                .clone(true)
                  .attr("fill", "currentColor")
                  .attr("stroke", "none")));

        let legend = g => g.append("g")
          .selectAll("g")
          .data(textData)
          .enter().append("g")
            .attr("transform", (d, i) => `translate(-60,${(i - (textData.length - 1) / 2) * 20})`)
            .call(g => g.append("text")
                .style("text-anchor", "left")
                .style("font-size", `${inner_stats_font_size}px`)
                .attr("font-family", font_family)
                .attr("class", (d, i) => textClasses[i])
                .attr("x", 25)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .text(d => d));

        let line = d3.lineRadial()
            .defined(d => d.yValue !== "NA")
            .curve(d3.curveLinearClosed)
            .angle(d => xScale(d.xValue));

        svg.append("g")
          .call(xAxis);

        svg.append("g")
          .call(yAxis);

        svg.append("g")
          .call(legend);

        svg.selectAll(".xAxisText")
          .data(xAxisLabels)
          .enter().append("text")
          .attr("x", d => d.x)
          .attr("y", d => d.y)
          .attr("text-anchor", "middle")
          .attr("font-size", `${x_axis_font_size}px`)
          .attr("font-family", font_family)
          .text(d => d.label);

        let ticker = d3.interval(e => {

          currentCycle = opts.cycles[i];

          if (i === n_cycles) {
            if (!opts.repeat_cycles) {
              ticker.stop();
              stop_cycles = true;
              currentCycle = "";
            }
            else {
              d3.selectAll(".lineclass").remove();
              i = 0;
              currentCycle = opts.cycles[i];
            }
          }

            d3.select(".currentCycle").text(d => d + currentCycle);

            let filtered_data = data.filter(d => d.cycle === currentCycle);
            let path = svg.append("path")
              .attr("class", "lineclass")
              .attr("fill", "none")
              .attr("stroke", color(d3.mean(filtered_data, d => d.yValue)))
              .attr("stroke-width", 1.5)
              .attr("d", line.radius(d => yScale(d.yValue))(filtered_data));

             let totalLength = path.node().getTotalLength();
                  path
                  .attr("stroke-dasharray", totalLength + " " + totalLength)
                  .attr("stroke-dashoffset", totalLength)
                  .transition()
                  .duration(loopInterval)
                  .ease(d3.easeLinear)
                  .attr("stroke-dashoffset", 0)
                  .on("end", function() {
                    d3.select(this)
                      .attr("opacity", past_line_opacity)
                      .attr("stroke", past_line_color);
                  });

            let minmax = d3.extent(filtered_data, d => d.yValue);
            currentMin = stop_cycles ? "" : minmax[0];
            currentMax = stop_cycles ? "" : minmax[1];
            currentMean = stop_cycles ? "" : Math.round(d3.mean(filtered_data, d => d.yValue));
            d3.select(".currentMin").text(d => d + currentMin);
            d3.select(".currentMax").text(d => d + currentMax);
            d3.select(".currentMean").text(d => d + currentMean);

            minMaxData = filtered_data.filter(d => d.yValue === currentMin || d.yValue === currentMax);
            radialMinMaxData = minMaxData.map(d => d3.pointRadial(xScale(d.xValue), innerRadius));
            i = i + 1;
            currentCycle = opts.cycles[i];

    }, loopInterval);

    },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});

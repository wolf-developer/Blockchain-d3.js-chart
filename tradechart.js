var svg, chart;

function tradeChart(config) {
    var parseDate = d3.timeParse("%s");

    d3.csv(config.data, ({ time, update_at, price }) => ({ date: parseDate(time), update_at: update_at, value: +price }))
        .then(d => chart(d));

    function chart(data) {
        data.sort((a, b) => a.date - b.date);

        var svg = d3.select(config.elemID),
            margin = { top: 15, right: -15, bottom: 15, left: 35 },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom;

        var x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([margin.left, width - margin.right])

        var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top])

        var xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("clip-path", "url(#clip)")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .tickSizeOuter(0));

        var yAxis = svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        var line = d3.line()
            .defined(d => !isNaN(d.value))
            .x(d => x(d.date))
            .y(d => y(d.value))

        var defs = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", margin.left)
            .attr("width", width - margin.right)
            .attr("height", height);

        var path = svg.append("path")
            .datum(data)
            .attr("class", "path")
            .attr("fill", "none")
            .attr("clip-path", "url(#clip)")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        svg.call(zoom);

        function zoom(svg) {

            var extent = [
                [margin.left, margin.top],
                [width - margin.right, height - margin.top]
            ];

            var zooming = d3.zoom()
                .scaleExtent([1, 3])
                .translateExtent(extent)
                .extent(extent)
                .on("zoom", zoomed);

            svg.call(zooming);

            function zoomed() {

                x.range([margin.left, width - margin.right]
                    .map(d => d3.event.transform.applyX(d)));

                svg.select(".path")
                    .attr("d", line);

                svg.select(".x-axis")
                    .call(d3.axisBottom(x)
                        .tickSizeOuter(0));
            }
        }

        svg.call(hover)

        function hover() {

            var bisect = d3.bisector(d => d.date).left,
                format = d3.format("+.0%"),
                dateFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S")

            var focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("line")
                .attr("stroke", "#666")
                .attr("stroke-width", 1)
                .attr("y1", -height + margin.top)
                .attr("y2", -margin.bottom);

            focus.append("circle")
                .attr("class", "circle")
                .attr("r", 5)
                .attr("dy", 5)
                .attr("stroke", "steelblue")
                .attr("fill", "#fff");

            focus.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".35em");

            var overlay = svg.append("rect")
                .attr("class", "overlay")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("width", width - margin.right - margin.left - 1)
                .attr("height", height - margin.bottom - margin.top)
                .on("mouseover", () => focus.style("display", null))
                .on("mouseout", () => focus.style("display", "none"))
                .on("mousemove", mousemove);

            function mousemove() {

                var x0 = x.invert(d3.mouse(this)[0]);

                var i = bisect(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                focus.select("line")
                    .attr("transform",
                        "translate(" + x(d.date) + "," + height + ")");

                focus.selectAll(".circle")
                    .attr("transform",
                        "translate(" + x(d.date) + "," + y(d.value) + ")");

                focus.select("text")
                    .attr("transform",
                        "translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
                    .text(dateFormat(d.date));
            }
        }
    }
}
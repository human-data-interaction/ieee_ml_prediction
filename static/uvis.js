
// Combined Space and Time Uncertainty
//https://bl.ocks.org/curran/raw/a479b91bba14d633487e/f3f9dee15b297a781b00d1483efe84d114f40ad8/

// Using Mike Bostock's Towards Reusable Charts Pattern
let uvis = {};
//http://blockbuilder.org/aendrew/6216809b022682bb8c247d37b9df32dc
uvis.barChart = function () {

    // All options that should be accessible to caller
    let
        margin = {
            top: 20,
            right: 50,
            bottom: 30,
            left: 20
        },
        width = 900,
        height = 200,
        barPadding = 1,
        data,
        fillColor = 'steelblue',
        barSpacing,
        barHeight,
        widthScale,
        colorScale,
        globalUncert,
        uvtype = '',
        yScale = d3.scaleBand(),
        yScale2 = d3.scaleBand(),
        xScale = d3.scaleLinear(),
        yValue,
        svg;

    function module(selection) {
        selection.each(function (_data) {
            // console.log(_data.length);
            barSpacing = height / _data.length;
            barHeight = barSpacing - barPadding;

            let maxValue = d3.max(_data, function (d) {
                return d.value;
            });
            widthScale = width / maxValue;
            data = _data;

            yValue = d => d.name;

            xScale.domain([0, d3.max(data, function (d) {
                return d.value
            })]).range([0, width]);

            // buildScales();

            normalChart(this);
            drawAxis();
        });
    }

    function normalChart(container) {

        svg = d3.select(container).append('svg')
            .attr('class', 'svgContainer')
            .attr('height', height + margin.bottom + margin.top)
            .attr('width', width + margin.right)
            .selectAll('rect')
            .data(data)
            .enter();

        let rect = svg.append('g');

       let  bars = rect.append('rect')
            .attr('y', function (d, i) {
                return i * barSpacing
            })
            .attr('height', barHeight)
            .attr('x', 0)
            .attr('width', function (d) {
                return d.value * widthScale
            })
            .style('fill', fillColor)

         let label = rect.append('text')
              .attr('class', 'label')
              .style('fill', 'white')
              .attr('x', 15)
              .attr('y', function (d, i) {
                return i * barSpacing + barHeight/2
                })
              .text(yValue);

        let gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("spreadMethod", "pad");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", fillColor)
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", 'white')
            .attr("stop-opacity", 1);

        // uncertainty scale
        //gradient
        if (uvtype === 'gradient') {
            rect.append('rect')
                .attr('y', function (d, i) {
                    return i * barSpacing
                })
                .attr('height', barHeight)
                .attr('x', function (d) {
                    return (d.value * widthScale) - ((globalUncert || d.uncert) / 2)
                })
                .attr('width', function (d) {
                    // console.log(d);
                    return globalUncert || d.uncert
                })
                .style("fill", "url(#gradient)");
        }
        //boxplot
        if (uvtype === 'boxplot') {

            rect.append("line")
                .attr("class", "range")
                .attr("x1", function (d) {
                    return d.value * widthScale - (globalUncert || d.uncert) / 2;
                })
                .attr("y1", function (d, i) {
                    return i * barSpacing + barHeight / 2;
                })
                .attr("x2", function (d) {
                    return d.value * widthScale + (globalUncert || d.uncert);
                })
                .attr("y2", function (d, i) {
                    return i * barSpacing + barHeight / 2;
                })
                .style("stroke", "black")
                .style("stroke-width", "3px");

            rect.append("line")
                .attr("class", "min")
                .attr("x1", function (d, i) {
                    return d.value * widthScale - (globalUncert || d.uncert) / 2;
                })
                .attr("y1", function (d, i) {
                    return i * barSpacing + barHeight / 2;
                })
                .attr("x2", function (d, i) {
                    return (d.value * widthScale - (globalUncert || d.uncert) / 2) - 3;
                })
                .attr("y2", function (d, i) {
                    return i * barSpacing + barHeight / 2;
                })
                .style("stroke", "black")
                .style("stroke-width", barHeight / 2 + "px");


            rect.append("line")
                .attr("class", "max")
                .attr("x1", function (d, i) {
                    return d.value * widthScale + (globalUncert || d.uncert) + 3;
                })
                .attr("y1", function (d, i) {
                    return i * barSpacing + barHeight / 2;
                })
                .attr("x2", function (d, i) {
                    return d.value * widthScale + (globalUncert || d.uncert);
                })
                .attr("y2", function (d, i) {
                    return i * barSpacing + barHeight / 2;
                })
                .style("stroke", "black")
                .style("stroke-width", barHeight / 2 + "px");

            //line start

            //line break
        }
    }

    function drawAxis(selection) {
        let xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("class", "axis x")
            .attr("transform", "translate(" + [0, height + 5] + ")")
            .call(xAxis);
    }

    module.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return module;
    };

    module.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return module;
    };

    module.barPadding = function (value) {
        if (!arguments.length) return barPadding;
        barPadding = value;
        return module;
    };

    module.fillColor = function (value) {
        if (!arguments.length) return fillColor;
        fillColor = value;
        return module;
    };

    module.uncertainty = function (value) {
        if (!arguments.length) return globalUncert;
        globalUncert = value;
        return module;
    };

    module.utype = function (value) {
        if (!arguments.length) return uvtype;
        uvtype = value;
        return module;
    };

    return module;
};
uvis.timelineChart = function () {
    // All options that should be accessible to caller
    let data,
        focus,
        context,
        svg,
        fillColor = 'steelblue',
        globalUncert,
        margin = {top: 20, right: 20, bottom: 90, left: 50},
        margin2 = {top: 230, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        height2 = 300 - margin2.top - margin2.bottom;

    let parseTime = d3.timeParse("%Y-%m-%d");

    let x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    let xAxis = d3.axisBottom(x).tickSize(0),
        xAxis2 = d3.axisBottom(x2).tickSize(0),
        yAxis = d3.axisLeft(y).tickSize(0);
    let xMin,
        xMax;

    let brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed);

    let zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    function module(selection) {
        selection.each(function (_data) {

            _data.forEach(type);

            xMin = d3.min(_data, function (d) {
                return d.sent_time;
            });

            xMax = d3.max(_data, function (d) {
                return d.sent_time;
            });


            var yMax = Math.max(20, d3.max(_data, function (d) {
                return d.messages_sent_in_day;
            }));
            // console.log(xMax.getMonth());

            // x.domain([xMin, new Date()]);
            x.domain([new Date(xMin.getFullYear() - 1, xMin.getMonth(), xMin.getDay()), new Date(xMax.getFullYear() + 1, xMax.getMonth(), xMax.getDay())]);
            y.domain([0, yMax]);
            x2.domain(x.domain());
            y2.domain(y.domain());

            data = _data;

            normalChart(this);

            function type(d) {
                d.sent_time = parseTime(d.sent_time);
                d.end_time = parseTime(d.end_time);
                return d;
            }
        });
    }

    function normalChart(container) {

        svg = d3.select(container).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


        // left gradient
        let leftgradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "left_gradient")
            .attr("spreadMethod", "pad");
        leftgradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", 'white')
            .attr("stop-opacity", 1);
        leftgradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", fillColor)
            .attr("stop-opacity", 1);

        //right gradient
        let rightgradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "right_gradient")
            .attr("spreadMethod", "pad");
        rightgradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", fillColor)
            .attr("stop-opacity", 1);
        rightgradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", 'white')
            .attr("stop-opacity", 1);


        // append scatter plot to main chart area
        // var messages = focus.append("g");
        // messages.attr("clip-path", "url(#clip)");
        // messages.selectAll("message")
        //     .data(data)
        //     .enter().append("circle")
        //     .attr('class', 'message')
        //     .attr("r", 4)
        //     .style("opacity", 0.4)
        //     .attr("cx", function (d) {
        //         return x(d.sent_time);
        //     })
        //     .attr("cy", function (d) {
        //         return y(d.messages_sent_in_day);
        //     });

        let barwidth = 5;

        //line test
        let lines = focus.append('g');
        lines.attr("clip-path", "url(#clip)");
        lines.selectAll('timepoint')
            .data(data)
            .enter()
            .each(function (d) {
                // if timepoint show circle, else show bar with edges
                if (d.end_time) {
                    let rect = d3.select(this);

                    rect.append('rect')
                        .attr('class', 'timepoint')
                        .attr('y', function (d, i) {
                            return y(d.messages_sent_in_day) - 5;
                        })
                        .attr('height', 10)
                        .attr('x', function (d) {
                            return x(d.sent_time) + barwidth;
                        })
                        .attr('width', function (d) {
                            return x(d.end_time) - x(d.sent_time);
                        })
                        // .style("opacity", 0.4)
                        .style('fill', fillColor);

                    //gradient uncertainty (if gradient uncertainty is chosen)
                    // left gradient
                    rect.append('rect')
                        .attr('class', 'left_uncertainty')
                        .attr('y', function (d, i) {
                            return y(d.messages_sent_in_day) - 5
                        })
                        .attr('height', 10)
                        .attr('x', function (d) {
                            return x(d.sent_time);
                        })
                        .attr('width', function (d) {
                            return globalUncert || d.uncert
                        })
                        .style("fill", "url(#left_gradient)");
                    //right gradient
                    rect.append('rect')
                        .attr('class', 'right_uncertainty')
                        .attr('y', function (d, i) {
                            return y(d.messages_sent_in_day) - 5
                        })
                        .attr('height', 10)
                        .attr('x', function (d) {
                            // return x(d.end_time) + x(d.sent_time)
                            return x(d.sent_time) + (x(d.end_time) - x(d.sent_time));
                        })
                        .attr('width', function (d) {
                            return globalUncert || d.uncert
                        })
                        .style("fill", "url(#right_gradient)");

                    //else use boxplot uncertainty

                } else {
                    d3.select(this)
                        .append("circle")
                        .attr('class', 'message')
                        .attr("r", 4)
                        // .style("opacity", 0.4)
                        .attr("cx", function (d) {
                            return x(d.sent_time);
                        })
                        .attr("cy", function (d) {
                            return y(d.messages_sent_in_day);
                        });
                    // .append('rect')
                    // .attr('class', 'timepoint')
                    // .attr('y', function (d, i) {
                    //     return 0
                    // })
                    // .attr('height', barwidth)
                    // .attr('x', function (d) {
                    //     return x(d.sent_time) + barwidth;
                    // })
                    // .attr('width', function (d) {
                    //     return barwidth
                    // })
                    // .attr('rx', 10)
                    // .style('fill', 'steelBlue');
                }
            });

        // .append('rect')
        // .attr('class','timepoint')
        // .attr('y', function (d, i) {
        //     return 0
        // })
        // .attr('height', barwidth)
        // .attr('x', function (d) {
        //     return x(d.sent_time) + barwidth;
        // })
        // .attr('width', function (d) {
        //     // return rect-span if endtime is true
        //     if(d.end_time){
        //         return x(d.end_time) - x(d.sent_time);
        //     }
        //     return barwidth
        // })
        // .attr('rx', 10)
        // .style('fill', 'steelBlue');

        focus.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        // Summary Stats
        focus.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Messages (in the day)");

        focus.append("text")
            .attr("x", width - margin.right)
            .attr("dy", "1em")
            .attr("text-anchor", "end")
            .text("Messages: " + num_messages(data, x));

        svg.append("text")
            .attr("transform",
                "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
                (height + margin.top + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Date");

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);

        // let d0 = xMin,
        //     d1 = xMax;

        // console.log(xMax)

        // Gratuitous intro zoom!
        svg.call(zoom).transition()
            .duration(1500)
            .call(zoom.transform, d3.zoomIdentity
                .scale(width / (x(xMax) - x(xMin)))
                .translate(-x(xMin), 0));

        // append scatter plot to brush chart area
        var messages = context.append("g");
        messages.attr("clip-path", "url(#clip)");
        messages.selectAll("message")
            .data(data)
            .enter().append("circle")
            .attr('class', 'messageContext')
            .attr("r", 3)
            .style("opacity", .6)
            .attr("cx", function (d) {
                return x2(d.sent_time);
            })
            .attr("cy", function (d) {
                return y2(d.messages_sent_in_day);
            });

        context.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());
    }

    //create brush function redraw scatterplot with selection
    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));

        focus.selectAll(".message")
            .attr("cx", function (d) {
                return x(d.sent_time);
            })
            .attr("cy", function (d) {
                return y(d.messages_sent_in_day);
            });

        //update all timepoints
        focus.selectAll(".timepoint")
            .attr("x", function (d) {
                return x(d.sent_time);
            })
            .attr("width", function (d) {
                if (d.end_time) {
                    return x(d.end_time) - x(d.sent_time);
                }
                return 20
                // return y(d.messages_sent_in_day);
            });

        focus.selectAll(".left_uncertainty")
            .attr('y', function (d, i) {
                return y(d.messages_sent_in_day) - 5
            })
            .attr('x', function (d) {
                return x(d.sent_time);
            });

        focus.selectAll(".right_uncertainty")
            .attr('y', function (d, i) {
                return y(d.messages_sent_in_day) - 5
            })
            .attr('x', function (d) {
                return x(d.sent_time) + (x(d.end_time) - x(d.sent_time))
            });


        focus.select(".x-axis").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));

        var e = d3.event.selection;
        var selectedMessages = focus.selectAll('.message').filter(function () {
            var xValue = this.getAttribute('cx');
            return e[0] <= xValue && xValue <= e[1];
        });
        console.log(selectedMessages.nodes().length);
    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());

        //update points
        focus.selectAll(".message")
            .attr("cx", function (d) {
                return x(d.sent_time);
            })
            .attr("cy", function (d) {
                return y(d.messages_sent_in_day);
            });

        //update all timepoints
        focus.selectAll(".timepoint")
            .attr("x", function (d) {
                return x(d.sent_time);
            })
            .attr("width", function (d) {
                if (d.end_time) {
                    return x(d.end_time) - x(d.sent_time);
                }
                return 20
                // return y(d.messages_sent_in_day);
            });

        focus.selectAll(".left_uncertainty")
            .attr('y', function (d, i) {
                return y(d.messages_sent_in_day) - 5
            })
            .attr('x', function (d) {
                return x(d.sent_time);
            });

        focus.selectAll(".right_uncertainty")
            .attr('y', function (d, i) {
                return y(d.messages_sent_in_day) - 5
            })
            .attr('x', function (d) {
                return x(d.sent_time) + (x(d.end_time) - x(d.sent_time))
            });

        focus.select(".x-axis").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    var num_messages = function (dataArray, domainRange) {
        return d3.sum(dataArray, function (d) {
            return d.sent_time >= domainRange.domain()[0] && d.sent_time <= domainRange.domain()[1];
        })
    };


    module.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return module;
    };

    module.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return module;
    };

    module.barPadding = function (value) {
        if (!arguments.length) return barPadding;
        barPadding = value;
        return module;
    };

    module.fillColor = function (value) {
        if (!arguments.length) return fillColor;
        fillColor = value;
        return module;
    };

    module.uncertainty = function (value) {
        if (!arguments.length) return globalUncert;
        globalUncert = value;
        return module;
    };


    module.standardDeviation = function(values){
        var avg = average(values);

        var squareDiffs = values.map(function(value){
            var diff = value - avg;
            var sqrDiff = diff * diff;
            return sqrDiff;
        });

        var avgSquareDiff = average(squareDiffs);

        var stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
    }

    function average(data){
        var sum = data.reduce(function(sum, value){
            return sum + value;
        }, 0);

        var avg = sum / data.length;
        return avg;
    }

    return module;
};


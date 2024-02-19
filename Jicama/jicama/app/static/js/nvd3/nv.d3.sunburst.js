// based on http://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad
nv.models.sunburst = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = 600
        , height = 600
        , mode = "count"
        , modes = {count: function(d) { return 1; }, value: function(d) { return d.value || d.size }, size: function(d) { return d.value || d.size }}
        , id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
        , container = null
        , color = nv.utils.defaultColor()
        , showLabels = false
        , labelFormat = function(d){if(mode === 'count'){return d.name + ' #' + d.value}else{return d.name + ' ' + (d.value || d.size)}}
        , labelThreshold = 0.02
        , sort = function(d1, d2){return d1.name > d2.name;}
        , key = function(d,i){
            if (d.parent !== undefined) {
                return d.name + '-' + d.parent.name + '-' + i;
            } else {
                return d.name;
            }
        }
        , groupColorByParent = true
        , duration = 500
        , dispatch = d3.dispatch('chartClick', 'elementClick', 'elementDblClick', 'elementMousemove', 'elementMouseover', 'elementMouseout', 'renderEnd');

    //============================================================
    // aux functions and setup
    //------------------------------------------------------------

    var x = d3.scale.linear().range([0, 2 * Math.PI]);
    var y = d3.scale.sqrt();

    var partition = d3.layout.partition().sort(sort);

    var node, availableWidth, availableHeight, radius;
    var prevPositions = {};

    var arc = d3.svg.arc()
        .startAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x))) })
        .endAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))) })
        .innerRadius(function(d) {return Math.max(0, y(d.y)) })
        .outerRadius(function(d) {return Math.max(0, y(d.y + d.dy)) });

    function rotationToAvoidUpsideDown(d) {
        var centerAngle = computeCenterAngle(d);
        if(centerAngle > 90){
            return 180;
        }
        else {
            return 0;
        }
    }

    function computeCenterAngle(d) {
        var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        var endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        var centerAngle = (((startAngle + endAngle) / 2) * (180 / Math.PI)) - 90;
        return centerAngle;
    }

    function computeNodePercentage(d) {
        var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        var endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        return (endAngle - startAngle) / (2 * Math.PI);
    }

    function labelThresholdMatched(d) {
        var startAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        var endAngle = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));

        var size = endAngle - startAngle;
        return size > labelThreshold;
    }

    // When zooming: interpolate the scales.
    function arcTweenZoom(e,i) {
        var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]),
        yd = d3.interpolate(y.domain(), [node.y, 1]),
        yr = d3.interpolate(y.range(), [node.y ? 20 : 0, radius]);

        if (i === 0) {
            return function() {return arc(e);}
        }
        else {
            return function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
                return arc(e);
            }
        };
    }

    function arcTweenUpdate(d) {
        var ipo = d3.interpolate({x: d.x0, dx: d.dx0, y: d.y0, dy: d.dy0}, d);

        return function (t) {
            var b = ipo(t);

            d.x0 = b.x;
            d.dx0 = b.dx;
            d.y0 = b.y;
            d.dy0 = b.dy;

            return arc(b);
        };
    }

    function updatePrevPosition(node) {
        var k = key(node);
        if(! prevPositions[k]) prevPositions[k] = {};
        var pP = prevPositions[k];
        pP.dx = node.dx;
        pP.x = node.x;
        pP.dy = node.dy;
        pP.y = node.y;
    }

    function storeRetrievePrevPositions(nodes) {
        nodes.forEach(function(n){
            var k = key(n);
            var pP = prevPositions[k];
            //console.log(k,n,pP);
            if( pP ){
                n.dx0 = pP.dx;
                n.x0 = pP.x;
                n.dy0 = pP.dy;
                n.y0 = pP.y;
            }
            else {
                n.dx0 = n.dx;
                n.x0 = n.x;
                n.dy0 = n.dy;
                n.y0 = n.y;
            }
            updatePrevPosition(n);
        });
    }

    function zoomClick(d) {
        var labels = container.selectAll('text')
        var path = container.selectAll('path')

        // fade out all text elements
        labels.transition().attr("opacity",0);

        // to allow reference to the new center node
        node = d;

        path.transition()
            .duration(duration)
            .attrTween("d", arcTweenZoom)
            .each('end', function(e) {
                // partially taken from here: http://bl.ocks.org/metmajer/5480307
                // check if the animated element's data e lies within the visible angle span given in d
                if(e.x >= d.x && e.x < (d.x + d.dx) ){
                    if(e.depth >= d.depth){
                        // get a selection of the associated text element
                        var parentNode = d3.select(this.parentNode);
                        var arcText = parentNode.select('text');

                        // fade in the text element and recalculate positions
                        arcText.transition().duration(duration)
                        .text( function(e){return labelFormat(e) })
                        .attr("opacity", function(d){
                            if(labelThresholdMatched(d)) {
                                return 1;
                            }
                            else {
                                return 0;
                            }
                        })
                        .attr("transform", function() {
                            var width = this.getBBox().width;
                            if(e.depth === 0)
                            return "translate(" + (width / 2 * - 1) + ",0)";
                            else if(e.depth === d.depth){
                                return "translate(" + (y(e.y) + 5) + ",0)";
                            }
                            else {
                                var centerAngle = computeCenterAngle(e);
                                var rotation = rotationToAvoidUpsideDown(e);
                                if (rotation === 0) {
                                    return 'rotate('+ centerAngle +')translate(' + (y(e.y) + 5) + ',0)';
                                }
                                else {
                                    return 'rotate('+ centerAngle +')translate(' + (y(e.y) + width + 5) + ',0)rotate(' + rotation + ')';
                                }
                            }
                        });
                    }
                }
            })
    }

    //============================================================
    // chart function
    //------------------------------------------------------------
    var renderWatch = nv.utils.renderWatch(dispatch);

    function chart(selection) {
        renderWatch.reset();

        selection.each(function(data) {
            container = d3.select(this);
            availableWidth = nv.utils.availableWidth(width, container, margin);
            availableHeight = nv.utils.availableHeight(height, container, margin);
            radius = Math.min(availableWidth, availableHeight) / 2;

            y.range([0, radius]);

            // Setup containers and skeleton of chart
            var wrap = container.select('g.nvd3.nv-wrap.nv-sunburst');
            if( !wrap[0][0] ) {
                wrap = container.append('g')
                    .attr('class', 'nvd3 nv-wrap nv-sunburst nv-chart-' + id)
                    .attr('transform', 'translate(' + ((availableWidth / 2) + margin.left + margin.right) + ',' + ((availableHeight / 2) + margin.top + margin.bottom) + ')');
            } else {
                wrap.attr('transform', 'translate(' + ((availableWidth / 2) + margin.left + margin.right) + ',' + ((availableHeight / 2) + margin.top + margin.bottom) + ')');
            }

            container.on('click', function (d, i) {
                dispatch.chartClick({
                    data: d,
                    index: i,
                    pos: d3.event,
                    id: id
                });
            });

            partition.value(modes[mode] || modes["count"]);

            //reverse the drawing order so that the labels of inner
            //arcs are drawn on top of the outer arcs.
            var nodes = partition.nodes(data[0]).reverse()

            storeRetrievePrevPositions(nodes);
            var cG = wrap.selectAll('.arc-container').data(nodes, key)

            //handle new datapoints
            var cGE = cG.enter()
                .append("g")
                .attr("class",'arc-container')

            cGE.append("path")
                .attr("d", arc)
                .style("fill", function (d) {
                    if (d.color) {
                        return d.color;
                    }
                    else if (groupColorByParent) {
                        return color((d.children ? d : d.parent).name);
                    }
                    else {
                        return color(d.name);
                    }
                })
                .style("stroke", "#FFF")
                .on("click", function(d,i){
                    zoomClick(d);
                    dispatch.elementClick({
                        data: d,
                        index: i
                    })
                })
                .on('mouseover', function(d,i){
                    d3.select(this).classed('hover', true).style('opacity', 0.8);
                    dispatch.elementMouseover({
                        data: d,
                        color: d3.select(this).style("fill"),
                        percent: computeNodePercentage(d)
                    });
                })
                .on('mouseout', function(d,i){
                    d3.select(this).classed('hover', false).style('opacity', 1);
                    dispatch.elementMouseout({
                        data: d
                    });
                })
                .on('mousemove', function(d,i){
                    dispatch.elementMousemove({
                        data: d
                    });
                });

            ///Iterating via each and selecting based on the this
            ///makes it work ... a cG.selectAll('path') doesn't.
            ///Without iteration the data (in the element) didn't update.
            cG.each(function(d){
                d3.select(this).select('path')
                    .transition()
                    .duration(duration)
                    .attrTween('d', arcTweenUpdate);
            });

            if(showLabels){
                //remove labels first and add them back
                cG.selectAll('text').remove();

                //this way labels are on top of newly added arcs
                cG.append('text')
                    .text( function(e){ return labelFormat(e)})
                    .transition()
                    .duration(duration)
                    .attr("opacity", function(d){
                        if(labelThresholdMatched(d)) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    })
                    .attr("transform", function(d) {
                        var width = this.getBBox().width;
                        if(d.depth === 0){
                            return "rotate(0)translate(" + (width / 2 * -1) + ",0)";
                        }
                        else {
                            var centerAngle = computeCenterAngle(d);
                            var rotation = rotationToAvoidUpsideDown(d);
                            if (rotation === 0) {
                                return 'rotate('+ centerAngle +')translate(' + (y(d.y) + 5) + ',0)';
                            }
                            else {
                                return 'rotate('+ centerAngle +')translate(' + (y(d.y) + width + 5) + ',0)rotate(' + rotation + ')';
                            }
                        }
                    });
            }

            //zoom out to the center when the data is updated.
            zoomClick(nodes[nodes.length - 1])


            //remove unmatched elements ...
            cG.exit()
                .transition()
                .duration(duration)
                .attr('opacity',0)
                .each('end',function(d){
                    var k = key(d);
                    prevPositions[k] = undefined;
                })
                .remove();
        });


        renderWatch.renderEnd('sunburst immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:      {get: function(){return width;}, set: function(_){width=_;}},
        height:     {get: function(){return height;}, set: function(_){height=_;}},
        mode:       {get: function(){return mode;}, set: function(_){mode=_;}},
        id:         {get: function(){return id;}, set: function(_){id=_;}},
        duration:   {get: function(){return duration;}, set: function(_){duration=_;}},
        groupColorByParent: {get: function(){return groupColorByParent;}, set: function(_){groupColorByParent=!!_;}},
        showLabels: {get: function(){return showLabels;}, set: function(_){showLabels=!!_}},
        labelFormat: {get: function(){return labelFormat;}, set: function(_){labelFormat=_}},
        labelThreshold: {get: function(){return labelThreshold;}, set: function(_){labelThreshold=_}},
        sort: {get: function(){return sort;}, set: function(_){sort=_}},
        key: {get: function(){return key;}, set: function(_){key=_}},
        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    != undefined ? _.top    : margin.top;
            margin.right  = _.right  != undefined ? _.right  : margin.right;
            margin.bottom = _.bottom != undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   != undefined ? _.left   : margin.left;
        }},
        color: {get: function(){return color;}, set: function(_){
            color=nv.utils.getColor(_);
        }}
    });

    nv.utils.initOptions(chart);
    return chart;
};
nv.models.sunburstChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var sunburst = nv.models.sunburst();
    var tooltip = nv.models.tooltip();

    var margin = {top: 30, right: 20, bottom: 20, left: 20}
        , width = null
        , height = null
        , color = nv.utils.defaultColor()
        , showTooltipPercent = false
        , id = Math.round(Math.random() * 100000)
        , defaultState = null
        , noData = null
        , duration = 250
        , dispatch = d3.dispatch('stateChange', 'changeState','renderEnd');


    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var renderWatch = nv.utils.renderWatch(dispatch);

    tooltip
        .duration(0)
        .headerEnabled(false)
        .valueFormatter(function(d){return d;});

    //============================================================
    // Chart function
    //------------------------------------------------------------

    function chart(selection) {
        renderWatch.reset();
        renderWatch.models(sunburst);

        selection.each(function(data) {
            var container = d3.select(this);

            nv.utils.initSVG(container);

            var availableWidth = nv.utils.availableWidth(width, container, margin);
            var availableHeight = nv.utils.availableHeight(height, container, margin);

            chart.update = function() {
                if (duration === 0) {
                    container.call(chart);
                } else {
                    container.transition().duration(duration).call(chart);
                }
            };
            chart.container = container;

            // Display No Data message if there's nothing to show.
            if (!data || !data.length) {
                nv.utils.noData(chart, container);
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            sunburst.width(availableWidth).height(availableHeight).margin(margin);
            container.call(sunburst);
        });

        renderWatch.renderEnd('sunburstChart immediate');
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    sunburst.dispatch.on('elementMouseover.tooltip', function(evt) {
        evt.series = {
            key: evt.data.name,
            value: (evt.data.value || evt.data.size),
            color: evt.color,
            percent: evt.percent
        };
        if (!showTooltipPercent) {
            delete evt.percent;
            delete evt.series.percent;
        }
        tooltip.data(evt).hidden(false);
    });

    sunburst.dispatch.on('elementMouseout.tooltip', function(evt) {
        tooltip.hidden(true);
    });

    sunburst.dispatch.on('elementMousemove.tooltip', function(evt) {
        tooltip();
    });

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.dispatch = dispatch;
    chart.sunburst = sunburst;
    chart.tooltip = tooltip;
    chart.options = nv.utils.optionsFunc.bind(chart);

    // use Object get/set functionality to map between vars and chart functions
    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        noData:             {get: function(){return noData;},               set: function(_){noData=_;}},
        defaultState:       {get: function(){return defaultState;},         set: function(_){defaultState=_;}},
        showTooltipPercent: {get: function(){return showTooltipPercent;},   set: function(_){showTooltipPercent=_;}},

        // options that require extra logic in the setter
        color: {get: function(){return color;}, set: function(_){
            color = _;
            sunburst.color(color);
        }},
        duration: {get: function(){return duration;}, set: function(_){
            duration = _;
            renderWatch.reset(duration);
            sunburst.duration(duration);
        }},
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
            sunburst.margin(margin);
        }}
    });
    nv.utils.inheritOptions(chart, sunburst);
    nv.utils.initOptions(chart);
    return chart;

};

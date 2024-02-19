nv.models.boxPlot = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 960,
        height = 500,
        id = Math.floor(Math.random() * 10000), // Create semi-unique ID in case user doesn't select one
        xScale = d3.scale.ordinal(),
        yScale = d3.scale.linear(),
        getX  = function(d) { return d.label }, // Default data model selectors.
        getQ1 = function(d) { return d.values.Q1 },
        getQ2 = function(d) { return d.values.Q2 },
        getQ3 = function(d) { return d.values.Q3 },
        getWl = function(d) { return d.values.whisker_low },
        getWh = function(d) { return d.values.whisker_high },
        getColor = function(d) { return d.color },
        getOlItems  = function(d) { return d.values.outliers },
        getOlValue = function(d, i, j) { return d },
        getOlLabel = function(d, i, j) { return d },
        getOlColor = function(d, i, j) { return undefined },
        color = nv.utils.defaultColor(),
        container = null,
        xDomain, xRange,
        yDomain, yRange,
        dispatch = d3.dispatch('elementMouseover', 'elementMouseout', 'elementMousemove', 'renderEnd'),
        duration = 250,
        maxBoxWidth = null;

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var xScale0, yScale0;
    var renderWatch = nv.utils.renderWatch(dispatch, duration);

    function chart(selection) {
        renderWatch.reset();
        selection.each(function(data) {
            var availableWidth = width - margin.left - margin.right,
                availableHeight = height - margin.top - margin.bottom;

            container = d3.select(this);
            nv.utils.initSVG(container);

            // Setup Scales
            xScale.domain(xDomain || data.map(function(d,i) { return getX(d,i); }))
                .rangeBands(xRange || [0, availableWidth], 0.1);

            // if we know yDomain, no need to calculate
            var yData = []
            if (!yDomain) {
                // (y-range is based on quartiles, whiskers and outliers)
                var values = [], yMin, yMax;
                data.forEach(function (d, i) {
                    var q1 = getQ1(d), q3 = getQ3(d), wl = getWl(d), wh = getWh(d);
                    var olItems = getOlItems(d);
                    if (olItems) {
                        olItems.forEach(function (e, i) {
                            values.push(getOlValue(e, i, undefined));
                        });
                    }
                    if (wl) { values.push(wl) }
                    if (q1) { values.push(q1) }
                    if (q3) { values.push(q3) }
                    if (wh) { values.push(wh) }
                });
                yMin = d3.min(values);
                yMax = d3.max(values);
                yData = [ yMin, yMax ] ;
            }

            yScale.domain(yDomain || yData);
            yScale.range(yRange || [availableHeight, 0]);

            //store old scales if they exist
            xScale0 = xScale0 || xScale;
            yScale0 = yScale0 || yScale.copy().range([yScale(0),yScale(0)]);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap');
            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var boxplots = wrap.selectAll('.nv-boxplot').data(function(d) { return d });
            var boxEnter = boxplots.enter().append('g').style('stroke-opacity', 1e-6).style('fill-opacity', 1e-6);
            boxplots
                .attr('class', 'nv-boxplot')
                .attr('transform', function(d,i,j) { return 'translate(' + (xScale(getX(d,i)) + xScale.rangeBand() * 0.05) + ', 0)'; })
                .classed('hover', function(d) { return d.hover });
            boxplots
                .watchTransition(renderWatch, 'nv-boxplot: boxplots')
                .style('stroke-opacity', 1)
                .style('fill-opacity', 0.75)
                .delay(function(d,i) { return i * duration / data.length })
                .attr('transform', function(d,i) {
                    return 'translate(' + (xScale(getX(d,i)) + xScale.rangeBand() * 0.05) + ', 0)';
                });
            boxplots.exit().remove();

            // ----- add the SVG elements for each boxPlot -----

            // conditionally append whisker lines
            boxEnter.each(function(d,i) {
                var box = d3.select(this);
                [getWl, getWh].forEach(function (f) {
                    if (f(d) !== undefined && f(d) !== null) {
                        var key = (f === getWl) ? 'low' : 'high';
                        box.append('line')
                          .style('stroke', getColor(d) || color(d,i))
                          .attr('class', 'nv-boxplot-whisker nv-boxplot-' + key);
                        box.append('line')
                          .style('stroke', getColor(d) || color(d,i))
                          .attr('class', 'nv-boxplot-tick nv-boxplot-' + key);
                    }
                });
            });

            var box_width = function() { return (maxBoxWidth === null ? xScale.rangeBand() * 0.9 : Math.min(75, xScale.rangeBand() * 0.9)); };
            var box_left  = function() { return xScale.rangeBand() * 0.45 - box_width()/2; };
            var box_right = function() { return xScale.rangeBand() * 0.45 + box_width()/2; };

            // update whisker lines and ticks
            [getWl, getWh].forEach(function (f) {
                var key = (f === getWl) ? 'low' : 'high';
                var endpoint = (f === getWl) ? getQ1 : getQ3;
                boxplots.select('line.nv-boxplot-whisker.nv-boxplot-' + key)
                  .watchTransition(renderWatch, 'nv-boxplot: boxplots')
                    .attr('x1', xScale.rangeBand() * 0.45 )
                    .attr('y1', function(d,i) { return yScale(f(d)); })
                    .attr('x2', xScale.rangeBand() * 0.45 )
                    .attr('y2', function(d,i) { return yScale(endpoint(d)); });
                boxplots.select('line.nv-boxplot-tick.nv-boxplot-' + key)
                  .watchTransition(renderWatch, 'nv-boxplot: boxplots')
                    .attr('x1', box_left )
                    .attr('y1', function(d,i) { return yScale(f(d)); })
                    .attr('x2', box_right )
                    .attr('y2', function(d,i) { return yScale(f(d)); });
            });

            [getWl, getWh].forEach(function (f) {
                var key = (f === getWl) ? 'low' : 'high';
                boxEnter.selectAll('.nv-boxplot-' + key)
                  .on('mouseover', function(d,i,j) {
                      d3.select(this).classed('hover', true);
                      dispatch.elementMouseover({
                          series: { key: f(d), color: getColor(d) || color(d,j) },
                          e: d3.event
                      });
                  })
                  .on('mouseout', function(d,i,j) {
                      d3.select(this).classed('hover', false);
                      dispatch.elementMouseout({
                          series: { key: f(d), color: getColor(d) || color(d,j) },
                          e: d3.event
                      });
                  })
                  .on('mousemove', function(d,i) {
                      dispatch.elementMousemove({e: d3.event});
                  });
            });

            // boxes
            boxEnter.append('rect')
                .attr('class', 'nv-boxplot-box')
                // tooltip events
                .on('mouseover', function(d,i) {
                    d3.select(this).classed('hover', true);
                    dispatch.elementMouseover({
                        key: getX(d),
                        value: getX(d),
                        series: [
                            { key: 'Q3', value: getQ3(d), color: getColor(d) || color(d,i) },
                            { key: 'Q2', value: getQ2(d), color: getColor(d) || color(d,i) },
                            { key: 'Q1', value: getQ1(d), color: getColor(d) || color(d,i) }
                        ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                })
                .on('mouseout', function(d,i) {
                    d3.select(this).classed('hover', false);
                    dispatch.elementMouseout({
                        key: getX(d),
                        value: getX(d),
                        series: [
                            { key: 'Q3', value: getQ3(d), color: getColor(d) || color(d,i) },
                            { key: 'Q2', value: getQ2(d), color: getColor(d) || color(d,i) },
                            { key: 'Q1', value: getQ1(d), color: getColor(d) || color(d,i) }
                        ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                })
                .on('mousemove', function(d,i) {
                    dispatch.elementMousemove({e: d3.event});
                });

            // box transitions
            boxplots.select('rect.nv-boxplot-box')
              .watchTransition(renderWatch, 'nv-boxplot: boxes')
                .attr('y', function(d,i) { return yScale(getQ3(d)); })
                .attr('width', box_width)
                .attr('x', box_left )
                .attr('height', function(d,i) { return Math.abs(yScale(getQ3(d)) - yScale(getQ1(d))) || 1 })
                .style('fill', function(d,i) { return getColor(d) || color(d,i) })
                .style('stroke', function(d,i) { return getColor(d) || color(d,i) });

            // median line
            boxEnter.append('line').attr('class', 'nv-boxplot-median');

            boxplots.select('line.nv-boxplot-median')
              .watchTransition(renderWatch, 'nv-boxplot: boxplots line')
                .attr('x1', box_left)
                .attr('y1', function(d,i) { return yScale(getQ2(d)); })
                .attr('x2', box_right)
                .attr('y2', function(d,i) { return yScale(getQ2(d)); });

            // outliers
            var outliers = boxplots.selectAll('.nv-boxplot-outlier').data(function(d) {
                return getOlItems(d) || [];
            });
            outliers.enter().append('circle')
                .style('fill', function(d,i,j) { return getOlColor(d,i,j) || color(d,j) })
                .style('stroke', function(d,i,j) { return getOlColor(d,i,j) || color(d,j) })
                .style('z-index', 9000)
                .on('mouseover', function(d,i,j) {
                    d3.select(this).classed('hover', true);
                    dispatch.elementMouseover({
                        series: { key: getOlLabel(d,i,j), color: getOlColor(d,i,j) || color(d,j) },
                        e: d3.event
                    });
                })
                .on('mouseout', function(d,i,j) {
                    d3.select(this).classed('hover', false);
                    dispatch.elementMouseout({
                        series: { key: getOlLabel(d,i,j), color: getOlColor(d,i,j) || color(d,j) },
                        e: d3.event
                    });
                })
                .on('mousemove', function(d,i) {
                    dispatch.elementMousemove({e: d3.event});
                });
            outliers.attr('class', 'nv-boxplot-outlier');
            outliers
              .watchTransition(renderWatch, 'nv-boxplot: nv-boxplot-outlier')
                .attr('cx', xScale.rangeBand() * 0.45)
                .attr('cy', function(d,i,j) { return yScale(getOlValue(d,i,j)); })
                .attr('r', '3');
            outliers.exit().remove();

            //store old scales for use in transitions on update
            xScale0 = xScale.copy();
            yScale0 = yScale.copy();
        });

        renderWatch.renderEnd('nv-boxplot immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:       {get: function(){return width;}, set: function(_){width=_;}},
        height:      {get: function(){return height;}, set: function(_){height=_;}},
        maxBoxWidth: {get: function(){return maxBoxWidth;}, set: function(_){maxBoxWidth=_;}},
        x:           {get: function(){return getX;}, set: function(_){getX=_;}},
        q1: {get: function(){return getQ1;}, set: function(_){getQ1=_;}},
        q2: {get: function(){return getQ2;}, set: function(_){getQ2=_;}},
        q3: {get: function(){return getQ3;}, set: function(_){getQ3=_;}},
        wl: {get: function(){return getWl;}, set: function(_){getWl=_;}},
        wh: {get: function(){return getWh;}, set: function(_){getWh=_;}},
        itemColor:    {get: function(){return getColor;}, set: function(_){getColor=_;}},
        outliers:     {get: function(){return getOlItems;}, set: function(_){getOlItems=_;}},
        outlierValue: {get: function(){return getOlValue;}, set: function(_){getOlValue=_;}},
        outlierLabel: {get: function(){return getOlLabel;}, set: function(_){getOlLabel=_;}},
        outlierColor: {get: function(){return getOlColor;}, set: function(_){getOlColor=_;}},
        xScale:  {get: function(){return xScale;}, set: function(_){xScale=_;}},
        yScale:  {get: function(){return yScale;}, set: function(_){yScale=_;}},
        xDomain: {get: function(){return xDomain;}, set: function(_){xDomain=_;}},
        yDomain: {get: function(){return yDomain;}, set: function(_){yDomain=_;}},
        xRange:  {get: function(){return xRange;}, set: function(_){xRange=_;}},
        yRange:  {get: function(){return yRange;}, set: function(_){yRange=_;}},
        id:          {get: function(){return id;}, set: function(_){id=_;}},
        // rectClass: {get: function(){return rectClass;}, set: function(_){rectClass=_;}},
        y: {
            get: function() {
                console.warn('BoxPlot \'y\' chart option is deprecated. Please use model overrides instead.');
                return {};
            },
            set: function(_) {
                console.warn('BoxPlot \'y\' chart option is deprecated. Please use model overrides instead.');
            }
        },
        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }},
        duration: {get: function(){return duration;}, set: function(_){
            duration = _;
            renderWatch.reset(duration);
        }}
    });

    nv.utils.initOptions(chart);

    return chart;
};
nv.models.boxPlotChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var boxplot = nv.models.boxPlot(),
        xAxis = nv.models.axis(),
        yAxis = nv.models.axis();

    var margin = {top: 15, right: 10, bottom: 50, left: 60},
        width = null,
        height = null,
        color = nv.utils.getColor(),
        showXAxis = true,
        showYAxis = true,
        rightAlignYAxis = false,
        staggerLabels = false,
        tooltip = nv.models.tooltip(),
        x, y,
        noData = 'No Data Available.',
        dispatch = d3.dispatch('beforeUpdate', 'renderEnd'),
        duration = 250;

    xAxis
        .orient('bottom')
        .showMaxMin(false)
        .tickFormat(function(d) { return d })
    ;
    yAxis
        .orient((rightAlignYAxis) ? 'right' : 'left')
        .tickFormat(d3.format(',.1f'))
    ;

    tooltip.duration(0);

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var renderWatch = nv.utils.renderWatch(dispatch, duration);

    function chart(selection) {
        renderWatch.reset();
        renderWatch.models(boxplot);
        if (showXAxis) renderWatch.models(xAxis);
        if (showYAxis) renderWatch.models(yAxis);

        selection.each(function(data) {
            var container = d3.select(this), that = this;
            nv.utils.initSVG(container);
            var availableWidth = (width  || parseInt(container.style('width')) || 960) - margin.left - margin.right;
            var availableHeight = (height || parseInt(container.style('height')) || 400) - margin.top - margin.bottom;

            chart.update = function() {
                dispatch.beforeUpdate();
                container.transition().duration(duration).call(chart);
            };
            chart.container = this;

            // TODO still need to find a way to validate quartile data presence using boxPlot callbacks.
            // Display No Data message if there's nothing to show. (quartiles required at minimum).
            if (!data || !data.length) {
                var noDataText = container.selectAll('.nv-noData').data([noData]);

                noDataText.enter().append('text')
                    .attr('class', 'nvd3 nv-noData')
                    .attr('dy', '-.7em')
                    .style('text-anchor', 'middle');

                noDataText
                    .attr('x', margin.left + availableWidth / 2)
                    .attr('y', margin.top + availableHeight / 2)
                    .text(function(d) { return d });

                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            // Setup Scales
            x = boxplot.xScale();
            y = boxplot.yScale().clamp(true);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-boxPlotWithAxes').data([data]);
            var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-boxPlotWithAxes').append('g');
            var defsEnter = gEnter.append('defs');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-x nv-axis');
            gEnter.append('g').attr('class', 'nv-y nv-axis')
                .append('g').attr('class', 'nv-zeroLine')
                .append('line');

            gEnter.append('g').attr('class', 'nv-barsWrap');
            g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            if (rightAlignYAxis) {
                g.select('.nv-y.nv-axis')
                    .attr('transform', 'translate(' + availableWidth + ',0)');
            }

            // Main Chart Component(s)
            boxplot.width(availableWidth).height(availableHeight);

            var barsWrap = g.select('.nv-barsWrap')
                .datum(data.filter(function(d) { return !d.disabled }))

            barsWrap.transition().call(boxplot);

            defsEnter.append('clipPath')
                .attr('id', 'nv-x-label-clip-' + boxplot.id())
                .append('rect');

            g.select('#nv-x-label-clip-' + boxplot.id() + ' rect')
                .attr('width', x.rangeBand() * (staggerLabels ? 2 : 1))
                .attr('height', 16)
                .attr('x', -x.rangeBand() / (staggerLabels ? 1 : 2 ));

            // Setup Axes
            if (showXAxis) {
                xAxis
                    .scale(x)
                    .ticks( nv.utils.calcTicksX(availableWidth/100, data) )
                    .tickSize(-availableHeight, 0);

                g.select('.nv-x.nv-axis').attr('transform', 'translate(0,' + y.range()[0] + ')');
                g.select('.nv-x.nv-axis').call(xAxis);

                var xTicks = g.select('.nv-x.nv-axis').selectAll('g');
                if (staggerLabels) {
                    xTicks
                        .selectAll('text')
                        .attr('transform', function(d,i,j) { return 'translate(0,' + (j % 2 === 0 ? '5' : '17') + ')' })
                }
            }

            if (showYAxis) {
                yAxis
                    .scale(y)
                    .ticks( Math.floor(availableHeight/36) ) // can't use nv.utils.calcTicksY with Object data
                    .tickSize( -availableWidth, 0);

                g.select('.nv-y.nv-axis').call(yAxis);
            }

            // Zero line
            g.select('.nv-zeroLine line')
                .attr('x1',0)
                .attr('x2',availableWidth)
                .attr('y1', y(0))
                .attr('y2', y(0))
            ;

            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------
        });

        renderWatch.renderEnd('nv-boxplot chart immediate');
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    boxplot.dispatch.on('elementMouseover.tooltip', function(evt) {
        tooltip.data(evt).hidden(false);
    });

    boxplot.dispatch.on('elementMouseout.tooltip', function(evt) {
        tooltip.data(evt).hidden(true);
    });

    boxplot.dispatch.on('elementMousemove.tooltip', function(evt) {
        tooltip();
    });

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.boxplot = boxplot;
    chart.xAxis = xAxis;
    chart.yAxis = yAxis;
    chart.tooltip = tooltip;

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:      {get: function(){return width;}, set: function(_){width=_;}},
        height:     {get: function(){return height;}, set: function(_){height=_;}},
        staggerLabels: {get: function(){return staggerLabels;}, set: function(_){staggerLabels=_;}},
        showXAxis: {get: function(){return showXAxis;}, set: function(_){showXAxis=_;}},
        showYAxis: {get: function(){return showYAxis;}, set: function(_){showYAxis=_;}},
        tooltipContent:    {get: function(){return tooltip;}, set: function(_){tooltip=_;}},
        noData:    {get: function(){return noData;}, set: function(_){noData=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        duration: {get: function(){return duration;}, set: function(_){
            duration = _;
            renderWatch.reset(duration);
            boxplot.duration(duration);
            xAxis.duration(duration);
            yAxis.duration(duration);
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
            boxplot.color(color);
        }},
        rightAlignYAxis: {get: function(){return rightAlignYAxis;}, set: function(_){
            rightAlignYAxis = _;
            yAxis.orient( (_) ? 'right' : 'left');
        }}
    });

    nv.utils.inheritOptions(chart, boxplot);
    nv.utils.initOptions(chart);

    return chart;
}

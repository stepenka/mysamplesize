// ohlcChart is just a historical chart with ohlc bars and some tweaks
nv.models.ohlcBarChart = function() {
    var chart = nv.models.historicalBarChart(nv.models.ohlcBar());

    // special default tooltip since we show multiple values per x
    chart.useInteractiveGuideline(true);
    chart.interactiveLayer.tooltip.contentGenerator(function(data) {
        // we assume only one series exists for this chart
        var d = data.series[0].data;
        // match line colors as defined in nv.d3.css
        var color = d.open < d.close ? "2ca02c" : "d62728";
        return '' +
            '<h3 style="color: #' + color + '">' + data.value + '</h3>' +
            '<table>' +
            '<tr><td>open:</td><td>' + chart.yAxis.tickFormat()(d.open) + '</td></tr>' +
            '<tr><td>close:</td><td>' + chart.yAxis.tickFormat()(d.close) + '</td></tr>' +
            '<tr><td>high</td><td>' + chart.yAxis.tickFormat()(d.high) + '</td></tr>' +
            '<tr><td>low:</td><td>' + chart.yAxis.tickFormat()(d.low) + '</td></tr>' +
            '</table>';
    });
    return chart;
};

nv.models.ohlcBar = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = null
        , height = null
        , id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
        , container = null
        , x = d3.scale.linear()
        , y = d3.scale.linear()
        , getX = function(d) { return d.x }
        , getY = function(d) { return d.y }
        , getOpen = function(d) { return d.open }
        , getClose = function(d) { return d.close }
        , getHigh = function(d) { return d.high }
        , getLow = function(d) { return d.low }
        , forceX = []
        , forceY = []
        , padData     = false // If true, adds half a data points width to front and back, for lining up a line chart with a bar chart
        , clipEdge = true
        , color = nv.utils.defaultColor()
        , interactive = false
        , xDomain
        , yDomain
        , xRange
        , yRange
        , dispatch = d3.dispatch('stateChange', 'changeState', 'renderEnd', 'chartClick', 'elementClick', 'elementDblClick', 'elementMouseover', 'elementMouseout', 'elementMousemove')
        ;

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    function chart(selection) {
        selection.each(function(data) {
            container = d3.select(this);
            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = nv.utils.availableHeight(height, container, margin);

            nv.utils.initSVG(container);

            // ohlc bar width.
            var w = (availableWidth / data[0].values.length) * .9;

            // Setup Scales
            x.domain(xDomain || d3.extent(data[0].values.map(getX).concat(forceX) ));

            if (padData)
                x.range(xRange || [availableWidth * .5 / data[0].values.length, availableWidth * (data[0].values.length - .5)  / data[0].values.length ]);
            else
                x.range(xRange || [5 + w/2, availableWidth - w/2 - 5]);

            y.domain(yDomain || [
                    d3.min(data[0].values.map(getLow).concat(forceY)),
                    d3.max(data[0].values.map(getHigh).concat(forceY))
                ]
            ).range(yRange || [availableHeight, 0]);

            // If scale's domain don't have a range, slightly adjust to make one... so a chart can show a single data point
            if (x.domain()[0] === x.domain()[1])
                x.domain()[0] ?
                    x.domain([x.domain()[0] - x.domain()[0] * 0.01, x.domain()[1] + x.domain()[1] * 0.01])
                    : x.domain([-1,1]);

            if (y.domain()[0] === y.domain()[1])
                y.domain()[0] ?
                    y.domain([y.domain()[0] + y.domain()[0] * 0.01, y.domain()[1] - y.domain()[1] * 0.01])
                    : y.domain([-1,1]);

            // Setup containers and skeleton of chart
            var wrap = d3.select(this).selectAll('g.nv-wrap.nv-ohlcBar').data([data[0].values]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-ohlcBar');
            var defsEnter = wrapEnter.append('defs');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-ticks');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            container
                .on('click', function(d,i) {
                    dispatch.chartClick({
                        data: d,
                        index: i,
                        pos: d3.event,
                        id: id
                    });
                });

            defsEnter.append('clipPath')
                .attr('id', 'nv-chart-clip-path-' + id)
                .append('rect');

            wrap.select('#nv-chart-clip-path-' + id + ' rect')
                .attr('width', availableWidth)
                .attr('height', availableHeight);

            g   .attr('clip-path', clipEdge ? 'url(#nv-chart-clip-path-' + id + ')' : '');

            var ticks = wrap.select('.nv-ticks').selectAll('.nv-tick')
                .data(function(d) { return d });
            ticks.exit().remove();

            ticks.enter().append('path')
                .attr('class', function(d,i,j) { return (getOpen(d,i) > getClose(d,i) ? 'nv-tick negative' : 'nv-tick positive') + ' nv-tick-' + j + '-' + i })
                .attr('d', function(d,i) {
                    return 'm0,0l0,'
                        + (y(getOpen(d,i))
                            - y(getHigh(d,i)))
                        + 'l'
                        + (-w/2)
                        + ',0l'
                        + (w/2)
                        + ',0l0,'
                        + (y(getLow(d,i)) - y(getOpen(d,i)))
                        + 'l0,'
                        + (y(getClose(d,i))
                            - y(getLow(d,i)))
                        + 'l'
                        + (w/2)
                        + ',0l'
                        + (-w/2)
                        + ',0z';
                })
                .attr('transform', function(d,i) { return 'translate(' + x(getX(d,i)) + ',' + y(getHigh(d,i)) + ')'; })
                .attr('fill', function(d,i) { return color[0]; })
                .attr('stroke', function(d,i) { return color[0]; })
                .attr('x', 0 )
                .attr('y', function(d,i) {  return y(Math.max(0, getY(d,i))) })
                .attr('height', function(d,i) { return Math.abs(y(getY(d,i)) - y(0)) });

            // the bar colors are controlled by CSS currently
            ticks.attr('class', function(d,i,j) {
                return (getOpen(d,i) > getClose(d,i) ? 'nv-tick negative' : 'nv-tick positive') + ' nv-tick-' + j + '-' + i;
            });

            d3.transition(ticks)
                .attr('transform', function(d,i) { return 'translate(' + x(getX(d,i)) + ',' + y(getHigh(d,i)) + ')'; })
                .attr('d', function(d,i) {
                    var w = (availableWidth / data[0].values.length) * .9;
                    return 'm0,0l0,'
                        + (y(getOpen(d,i))
                            - y(getHigh(d,i)))
                        + 'l'
                        + (-w/2)
                        + ',0l'
                        + (w/2)
                        + ',0l0,'
                        + (y(getLow(d,i))
                            - y(getOpen(d,i)))
                        + 'l0,'
                        + (y(getClose(d,i))
                            - y(getLow(d,i)))
                        + 'l'
                        + (w/2)
                        + ',0l'
                        + (-w/2)
                        + ',0z';
                });
        });

        return chart;
    }


    //Create methods to allow outside functions to highlight a specific bar.
    chart.highlightPoint = function(pointIndex, isHoverOver) {
        chart.clearHighlights();
        container.select(".nv-ohlcBar .nv-tick-0-" + pointIndex)
            .classed("hover", isHoverOver)
        ;
    };

    chart.clearHighlights = function() {
        container.select(".nv-ohlcBar .nv-tick.hover")
            .classed("hover", false)
        ;
    };

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:    {get: function(){return width;}, set: function(_){width=_;}},
        height:   {get: function(){return height;}, set: function(_){height=_;}},
        xScale:   {get: function(){return x;}, set: function(_){x=_;}},
        yScale:   {get: function(){return y;}, set: function(_){y=_;}},
        xDomain:  {get: function(){return xDomain;}, set: function(_){xDomain=_;}},
        yDomain:  {get: function(){return yDomain;}, set: function(_){yDomain=_;}},
        xRange:   {get: function(){return xRange;}, set: function(_){xRange=_;}},
        yRange:   {get: function(){return yRange;}, set: function(_){yRange=_;}},
        forceX:   {get: function(){return forceX;}, set: function(_){forceX=_;}},
        forceY:   {get: function(){return forceY;}, set: function(_){forceY=_;}},
        padData:  {get: function(){return padData;}, set: function(_){padData=_;}},
        clipEdge: {get: function(){return clipEdge;}, set: function(_){clipEdge=_;}},
        id:       {get: function(){return id;}, set: function(_){id=_;}},
        interactive: {get: function(){return interactive;}, set: function(_){interactive=_;}},

        x:     {get: function(){return getX;}, set: function(_){getX=_;}},
        y:     {get: function(){return getY;}, set: function(_){getY=_;}},
        open:  {get: function(){return getOpen();}, set: function(_){getOpen=_;}},
        close: {get: function(){return getClose();}, set: function(_){getClose=_;}},
        high:  {get: function(){return getHigh;}, set: function(_){getHigh=_;}},
        low:   {get: function(){return getLow;}, set: function(_){getLow=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    != undefined ? _.top    : margin.top;
            margin.right  = _.right  != undefined ? _.right  : margin.right;
            margin.bottom = _.bottom != undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   != undefined ? _.left   : margin.left;
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }}
    });

    nv.utils.initOptions(chart);
    return chart;
};


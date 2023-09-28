
nv.models.sparkline = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 2, right: 0, bottom: 2, left: 0}
        , width = 400
        , height = 32
        , container = null
        , animate = true
        , x = d3.scale.linear()
        , y = d3.scale.linear()
        , getX = function(d) { return d.x }
        , getY = function(d) { return d.y }
        , color = nv.utils.getColor(['#000'])
        , xDomain
        , yDomain
        , xRange
        , yRange
        , showMinMaxPoints = true
        , showCurrentPoint = true
        , dispatch = d3.dispatch('renderEnd')
        ;

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var renderWatch = nv.utils.renderWatch(dispatch);
    
    function chart(selection) {
        renderWatch.reset();
        selection.each(function(data) {
            var availableWidth = width - margin.left - margin.right,
                availableHeight = height - margin.top - margin.bottom;

            container = d3.select(this);
            nv.utils.initSVG(container);

            // Setup Scales
            x   .domain(xDomain || d3.extent(data, getX ))
                .range(xRange || [0, availableWidth]);

            y   .domain(yDomain || d3.extent(data, getY ))
                .range(yRange || [availableHeight, 0]);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-sparkline').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-sparkline');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

            var paths = wrap.selectAll('path')
                .data(function(d) { return [d] });
            paths.enter().append('path');
            paths.exit().remove();
            paths
                .style('stroke', function(d,i) { return d.color || color(d, i) })
                .attr('d', d3.svg.line()
                    .x(function(d,i) { return x(getX(d,i)) })
                    .y(function(d,i) { return y(getY(d,i)) })
            );

            // TODO: Add CURRENT data point (Need Min, Mac, Current / Most recent)
            var points = wrap.selectAll('circle.nv-point')
                .data(function(data) {
                    var yValues = data.map(function(d, i) { return getY(d,i); });
                    function pointIndex(index) {
                        if (index != -1) {
                            var result = data[index];
                            result.pointIndex = index;
                            return result;
                        } else {
                            return null;
                        }
                    }
                    var maxPoint = pointIndex(yValues.lastIndexOf(y.domain()[1])),
                        minPoint = pointIndex(yValues.indexOf(y.domain()[0])),
                        currentPoint = pointIndex(yValues.length - 1);
                    return [(showMinMaxPoints ? minPoint : null), (showMinMaxPoints ? maxPoint : null), (showCurrentPoint ? currentPoint : null)].filter(function (d) {return d != null;});
                });
            points.enter().append('circle');
            points.exit().remove();
            points
                .attr('cx', function(d,i) { return x(getX(d,d.pointIndex)) })
                .attr('cy', function(d,i) { return y(getY(d,d.pointIndex)) })
                .attr('r', 2)
                .attr('class', function(d,i) {
                    return getX(d, d.pointIndex) == x.domain()[1] ? 'nv-point nv-currentValue' :
                            getY(d, d.pointIndex) == y.domain()[0] ? 'nv-point nv-minValue' : 'nv-point nv-maxValue'
                });
        });
        
        renderWatch.renderEnd('sparkline immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:            {get: function(){return width;}, set: function(_){width=_;}},
        height:           {get: function(){return height;}, set: function(_){height=_;}},
        xDomain:          {get: function(){return xDomain;}, set: function(_){xDomain=_;}},
        yDomain:          {get: function(){return yDomain;}, set: function(_){yDomain=_;}},
        xRange:           {get: function(){return xRange;}, set: function(_){xRange=_;}},
        yRange:           {get: function(){return yRange;}, set: function(_){yRange=_;}},
        xScale:           {get: function(){return x;}, set: function(_){x=_;}},
        yScale:           {get: function(){return y;}, set: function(_){y=_;}},
        animate:          {get: function(){return animate;}, set: function(_){animate=_;}},
        showMinMaxPoints: {get: function(){return showMinMaxPoints;}, set: function(_){showMinMaxPoints=_;}},
        showCurrentPoint: {get: function(){return showCurrentPoint;}, set: function(_){showCurrentPoint=_;}},

        //functor options
        x: {get: function(){return getX;}, set: function(_){getX=d3.functor(_);}},
        y: {get: function(){return getY;}, set: function(_){getY=d3.functor(_);}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }}
    });

    chart.dispatch = dispatch;
    nv.utils.initOptions(chart);
    return chart;
};

nv.models.sparklinePlus = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var sparkline = nv.models.sparkline();

    var margin = {top: 15, right: 100, bottom: 10, left: 50}
        , width = null
        , height = null
        , x
        , y
        , index = []
        , paused = false
        , xTickFormat = d3.format(',r')
        , yTickFormat = d3.format(',.2f')
        , showLastValue = true
        , alignValue = true
        , rightAlignValue = false
        , noData = null
        , dispatch = d3.dispatch('renderEnd')
        ;
        
    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var renderWatch = nv.utils.renderWatch(dispatch);

    function chart(selection) {
        renderWatch.reset();
        renderWatch.models(sparkline);
        selection.each(function(data) {
            var container = d3.select(this);
            nv.utils.initSVG(container);

            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = nv.utils.availableHeight(height, container, margin);

            chart.update = function() { container.call(chart); };
            chart.container = this;

            // Display No Data message if there's nothing to show.
            if (!data || !data.length) {
                nv.utils.noData(chart, container)
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            var currentValue = sparkline.y()(data[data.length-1], data.length-1);

            // Setup Scales
            x = sparkline.xScale();
            y = sparkline.yScale();

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-sparklineplus').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-sparklineplus');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-sparklineWrap');
            gEnter.append('g').attr('class', 'nv-valueWrap');
            gEnter.append('g').attr('class', 'nv-hoverArea');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Main Chart Component(s)
            var sparklineWrap = g.select('.nv-sparklineWrap');

            sparkline.width(availableWidth).height(availableHeight);
            sparklineWrap.call(sparkline);

            if (showLastValue) {
                var valueWrap = g.select('.nv-valueWrap');
                var value = valueWrap.selectAll('.nv-currentValue')
                    .data([currentValue]);

                value.enter().append('text').attr('class', 'nv-currentValue')
                    .attr('dx', rightAlignValue ? -8 : 8)
                    .attr('dy', '.9em')
                    .style('text-anchor', rightAlignValue ? 'end' : 'start');

                value
                    .attr('x', availableWidth + (rightAlignValue ? margin.right : 0))
                    .attr('y', alignValue ? function (d) {
                        return y(d)
                    } : 0)
                    .style('fill', sparkline.color()(data[data.length - 1], data.length - 1))
                    .text(yTickFormat(currentValue));
            }

            gEnter.select('.nv-hoverArea').append('rect')
                .on('mousemove', sparklineHover)
                .on('click', function() { paused = !paused })
                .on('mouseout', function() { index = []; updateValueLine(); });

            g.select('.nv-hoverArea rect')
                .attr('transform', function(d) { return 'translate(' + -margin.left + ',' + -margin.top + ')' })
                .attr('width', availableWidth + margin.left + margin.right)
                .attr('height', availableHeight + margin.top);

            //index is currently global (within the chart), may or may not keep it that way
            function updateValueLine() {
                if (paused) return;

                var hoverValue = g.selectAll('.nv-hoverValue').data(index);

                var hoverEnter = hoverValue.enter()
                    .append('g').attr('class', 'nv-hoverValue')
                    .style('stroke-opacity', 0)
                    .style('fill-opacity', 0);

                hoverValue.exit()
                    .transition().duration(250)
                    .style('stroke-opacity', 0)
                    .style('fill-opacity', 0)
                    .remove();

                hoverValue
                    .attr('transform', function(d) { return 'translate(' + x(sparkline.x()(data[d],d)) + ',0)' })
                    .transition().duration(250)
                    .style('stroke-opacity', 1)
                    .style('fill-opacity', 1);

                if (!index.length) return;

                hoverEnter.append('line')
                    .attr('x1', 0)
                    .attr('y1', -margin.top)
                    .attr('x2', 0)
                    .attr('y2', availableHeight);

                hoverEnter.append('text').attr('class', 'nv-xValue')
                    .attr('x', -6)
                    .attr('y', -margin.top)
                    .attr('text-anchor', 'end')
                    .attr('dy', '.9em');

                g.select('.nv-hoverValue .nv-xValue')
                    .text(xTickFormat(sparkline.x()(data[index[0]], index[0])));

                hoverEnter.append('text').attr('class', 'nv-yValue')
                    .attr('x', 6)
                    .attr('y', -margin.top)
                    .attr('text-anchor', 'start')
                    .attr('dy', '.9em');

                g.select('.nv-hoverValue .nv-yValue')
                    .text(yTickFormat(sparkline.y()(data[index[0]], index[0])));
            }

            function sparklineHover() {
                if (paused) return;

                var pos = d3.mouse(this)[0] - margin.left;

                function getClosestIndex(data, x) {
                    var distance = Math.abs(sparkline.x()(data[0], 0) - x);
                    var closestIndex = 0;
                    for (var i = 0; i < data.length; i++){
                        if (Math.abs(sparkline.x()(data[i], i) - x) < distance) {
                            distance = Math.abs(sparkline.x()(data[i], i) - x);
                            closestIndex = i;
                        }
                    }
                    return closestIndex;
                }

                index = [getClosestIndex(data, Math.round(x.invert(pos)))];
                updateValueLine();
            }

        });
        renderWatch.renderEnd('sparklinePlus immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.dispatch = dispatch;
    chart.sparkline = sparkline;

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:           {get: function(){return width;}, set: function(_){width=_;}},
        height:          {get: function(){return height;}, set: function(_){height=_;}},
        xTickFormat:     {get: function(){return xTickFormat;}, set: function(_){xTickFormat=_;}},
        yTickFormat:     {get: function(){return yTickFormat;}, set: function(_){yTickFormat=_;}},
        showLastValue:   {get: function(){return showLastValue;}, set: function(_){showLastValue=_;}},
        alignValue:      {get: function(){return alignValue;}, set: function(_){alignValue=_;}},
        rightAlignValue: {get: function(){return rightAlignValue;}, set: function(_){rightAlignValue=_;}},
        noData:          {get: function(){return noData;}, set: function(_){noData=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }}
    });

    nv.utils.inheritOptions(chart, sparkline);
    nv.utils.initOptions(chart);

    return chart;
};

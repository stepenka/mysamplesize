// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/

nv.models.bullet = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , orient = 'left' // TODO top & bottom
        , reverse = false
        , ranges = function(d) { return d.ranges }
        , markers = function(d) { return d.markers ? d.markers : [] }
        , markerLines = function(d) { return d.markerLines ? d.markerLines : [0] }
        , measures = function(d) { return d.measures }
        , rangeLabels = function(d) { return d.rangeLabels ? d.rangeLabels : [] }
        , markerLabels = function(d) { return d.markerLabels ? d.markerLabels : []  }
        , markerLineLabels = function(d) { return d.markerLineLabels ? d.markerLineLabels : []  }
        , measureLabels = function(d) { return d.measureLabels ? d.measureLabels : []  }
        , forceX = [0] // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
        , width = 380
        , height = 30
        , container = null
        , tickFormat = null
        , color = nv.utils.getColor(['#1f77b4'])
        , dispatch = d3.dispatch('elementMouseover', 'elementMouseout', 'elementMousemove')
        , defaultRangeLabels = ["Maximum", "Mean", "Minimum"]
        , legacyRangeClassNames = ["Max", "Avg", "Min"]
        , duration = 1000
        ;

    function sortLabels(labels, values){
        var lz = labels.slice();
        labels.sort(function(a, b){
            var iA = lz.indexOf(a);
            var iB = lz.indexOf(b);
            return d3.descending(values[iA], values[iB]);
        });
    };

    function chart(selection) {
        selection.each(function(d, i) {
            var availableWidth = width - margin.left - margin.right,
                availableHeight = height - margin.top - margin.bottom;

            container = d3.select(this);
            nv.utils.initSVG(container);

            var rangez = ranges.call(this, d, i).slice(),
                markerz = markers.call(this, d, i).slice(),
                markerLinez = markerLines.call(this, d, i).slice(),
                measurez = measures.call(this, d, i).slice(),
                rangeLabelz = rangeLabels.call(this, d, i).slice(),
                markerLabelz = markerLabels.call(this, d, i).slice(),
                markerLineLabelz = markerLineLabels.call(this, d, i).slice(),
                measureLabelz = measureLabels.call(this, d, i).slice();

            // Sort labels according to their sorted values
            sortLabels(rangeLabelz, rangez);
            sortLabels(markerLabelz, markerz);
            sortLabels(markerLineLabelz, markerLinez);
            sortLabels(measureLabelz, measurez);

            // sort values descending
            rangez.sort(d3.descending);
            markerz.sort(d3.descending);
            markerLinez.sort(d3.descending);
            measurez.sort(d3.descending);

            // Setup Scales
            // Compute the new x-scale.
            var x1 = d3.scale.linear()
                .domain( d3.extent(d3.merge([forceX, rangez])) )
                .range(reverse ? [availableWidth, 0] : [0, availableWidth]);

            // Retrieve the old x-scale, if this is an update.
            var x0 = this.__chart__ || d3.scale.linear()
                .domain([0, Infinity])
                .range(x1.range());

            // Stash the new scale.
            this.__chart__ = x1;

            var rangeMin = d3.min(rangez), //rangez[2]
                rangeMax = d3.max(rangez), //rangez[0]
                rangeAvg = rangez[1];

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-bullet').data([d]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bullet');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            for(var i=0,il=rangez.length; i<il; i++){
                var rangeClassNames = 'nv-range nv-range'+i;
                if(i <= 2){
                    rangeClassNames = rangeClassNames + ' nv-range'+legacyRangeClassNames[i];
                }
                gEnter.append('rect').attr('class', rangeClassNames);
            }

            gEnter.append('rect').attr('class', 'nv-measure');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var w0 = function(d) { return Math.abs(x0(d) - x0(0)) }, // TODO: could optimize by precalculating x0(0) and x1(0)
                w1 = function(d) { return Math.abs(x1(d) - x1(0)) };
            var xp0 = function(d) { return d < 0 ? x0(d) : x0(0) },
                xp1 = function(d) { return d < 0 ? x1(d) : x1(0) };

            for(var i=0,il=rangez.length; i<il; i++){
                var range = rangez[i];
                g.select('rect.nv-range'+i)
                    .datum(range)
                    .attr('height', availableHeight)
                    .transition()
                    .duration(duration)
                    .attr('width', w1(range))
                    .attr('x', xp1(range))
            }

            g.select('rect.nv-measure')
                .style('fill', color)
                .attr('height', availableHeight / 3)
                .attr('y', availableHeight / 3)
                .on('mouseover', function() {
                    dispatch.elementMouseover({
                        value: measurez[0],
                        label: measureLabelz[0] || 'Current',
                        color: d3.select(this).style("fill")
                    })
                })
                .on('mousemove', function() {
                    dispatch.elementMousemove({
                        value: measurez[0],
                        label: measureLabelz[0] || 'Current',
                        color: d3.select(this).style("fill")
                    })
                })
                .on('mouseout', function() {
                    dispatch.elementMouseout({
                        value: measurez[0],
                        label: measureLabelz[0] || 'Current',
                        color: d3.select(this).style("fill")
                    })
                })
                .transition()
                .duration(duration)
                .attr('width', measurez < 0 ?
                    x1(0) - x1(measurez[0])
                    : x1(measurez[0]) - x1(0))
                .attr('x', xp1(measurez));

            var h3 =  availableHeight / 6;

            var markerData = markerz.map( function(marker, index) {
                return {value: marker, label: markerLabelz[index]}
            });
            gEnter
              .selectAll("path.nv-markerTriangle")
              .data(markerData)
              .enter()
              .append('path')
              .attr('class', 'nv-markerTriangle')
              .attr('d', 'M0,' + h3 + 'L' + h3 + ',' + (-h3) + ' ' + (-h3) + ',' + (-h3) + 'Z')
              .on('mouseover', function(d) {
                dispatch.elementMouseover({
                  value: d.value,
                  label: d.label || 'Previous',
                  color: d3.select(this).style("fill"),
                  pos: [x1(d.value), availableHeight/2]
                })

              })
              .on('mousemove', function(d) {
                  dispatch.elementMousemove({
                      value: d.value,
                      label: d.label || 'Previous',
                      color: d3.select(this).style("fill")
                  })
              })
              .on('mouseout', function(d, i) {
                  dispatch.elementMouseout({
                      value: d.value,
                      label: d.label || 'Previous',
                      color: d3.select(this).style("fill")
                  })
              });

            g.selectAll("path.nv-markerTriangle")
              .data(markerData)
              .transition()
              .duration(duration)
              .attr('transform', function(d) { return 'translate(' + x1(d.value) + ',' + (availableHeight / 2) + ')' });

            var markerLinesData = markerLinez.map( function(marker, index) {
                return {value: marker, label: markerLineLabelz[index]}
            });
            gEnter
              .selectAll("line.nv-markerLine")
              .data(markerLinesData)
              .enter()
              .append('line')
              .attr('cursor', '')
              .attr('class', 'nv-markerLine')
              .attr('x1', function(d) { return x1(d.value) })
              .attr('y1', '2')
              .attr('x2', function(d) { return x1(d.value) })
              .attr('y2', availableHeight - 2)
              .on('mouseover', function(d) {
                dispatch.elementMouseover({
                  value: d.value,
                  label: d.label || 'Previous',
                  color: d3.select(this).style("fill"),
                  pos: [x1(d.value), availableHeight/2]
                })

              })
              .on('mousemove', function(d) {
                  dispatch.elementMousemove({
                      value: d.value,
                      label: d.label || 'Previous',
                      color: d3.select(this).style("fill")
                  })
              })
              .on('mouseout', function(d, i) {
                  dispatch.elementMouseout({
                      value: d.value,
                      label: d.label || 'Previous',
                      color: d3.select(this).style("fill")
                  })
              });

            g.selectAll("line.nv-markerLine")
              .data(markerLinesData)
              .transition()
              .duration(duration)
              .attr('x1', function(d) { return x1(d.value) })
              .attr('x2', function(d) { return x1(d.value) });

            wrap.selectAll('.nv-range')
                .on('mouseover', function(d,i) {
                    var label = rangeLabelz[i] || defaultRangeLabels[i];
                    dispatch.elementMouseover({
                        value: d,
                        label: label,
                        color: d3.select(this).style("fill")
                    })
                })
                .on('mousemove', function() {
                    dispatch.elementMousemove({
                        value: measurez[0],
                        label: measureLabelz[0] || 'Previous',
                        color: d3.select(this).style("fill")
                    })
                })
                .on('mouseout', function(d,i) {
                    var label = rangeLabelz[i] || defaultRangeLabels[i];
                    dispatch.elementMouseout({
                        value: d,
                        label: label,
                        color: d3.select(this).style("fill")
                    })
                });
        });

        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        ranges:      {get: function(){return ranges;}, set: function(_){ranges=_;}}, // ranges (bad, satisfactory, good)
        markers:     {get: function(){return markers;}, set: function(_){markers=_;}}, // markers (previous, goal)
        measures: {get: function(){return measures;}, set: function(_){measures=_;}}, // measures (actual, forecast)
        forceX:      {get: function(){return forceX;}, set: function(_){forceX=_;}},
        width:    {get: function(){return width;}, set: function(_){width=_;}},
        height:    {get: function(){return height;}, set: function(_){height=_;}},
        tickFormat:    {get: function(){return tickFormat;}, set: function(_){tickFormat=_;}},
        duration:    {get: function(){return duration;}, set: function(_){duration=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        orient: {get: function(){return orient;}, set: function(_){ // left, right, top, bottom
            orient = _;
            reverse = orient == 'right' || orient == 'bottom';
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }}
    });

    nv.utils.initOptions(chart);
    return chart;
};



// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
nv.models.bulletChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var bullet = nv.models.bullet();
    var tooltip = nv.models.tooltip();

    var orient = 'left' // TODO top & bottom
        , reverse = false
        , margin = {top: 5, right: 40, bottom: 20, left: 120}
        , ranges = function(d) { return d.ranges }
        , markers = function(d) { return d.markers ? d.markers : [] }
        , measures = function(d) { return d.measures }
        , width = null
        , height = 55
        , tickFormat = null
        , ticks = null
        , noData = null
        , dispatch = d3.dispatch()
        ;

    tooltip
        .duration(0)
        .headerEnabled(false);

    function chart(selection) {
        selection.each(function(d, i) {
            var container = d3.select(this);
            nv.utils.initSVG(container);

            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = height - margin.top - margin.bottom,
                that = this;

            chart.update = function() { chart(selection) };
            chart.container = this;

            // Display No Data message if there's nothing to show.
            if (!d || !ranges.call(this, d, i)) {
                nv.utils.noData(chart, container)
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
                markerz = markers.call(this, d, i).slice().sort(d3.descending),
                measurez = measures.call(this, d, i).slice().sort(d3.descending);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-bulletChart').data([d]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bulletChart');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-bulletWrap');
            gEnter.append('g').attr('class', 'nv-titles');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Compute the new x-scale.
            var x1 = d3.scale.linear()
                .domain([0, Math.max(rangez[0], (markerz[0] || 0), measurez[0])])  // TODO: need to allow forceX and forceY, and xDomain, yDomain
                .range(reverse ? [availableWidth, 0] : [0, availableWidth]);

            // Retrieve the old x-scale, if this is an update.
            var x0 = this.__chart__ || d3.scale.linear()
                .domain([0, Infinity])
                .range(x1.range());

            // Stash the new scale.
            this.__chart__ = x1;

            var w0 = function(d) { return Math.abs(x0(d) - x0(0)) }, // TODO: could optimize by precalculating x0(0) and x1(0)
                w1 = function(d) { return Math.abs(x1(d) - x1(0)) };

            var title = gEnter.select('.nv-titles').append('g')
                .attr('text-anchor', 'end')
                .attr('transform', 'translate(-6,' + (height - margin.top - margin.bottom) / 2 + ')');
            title.append('text')
                .attr('class', 'nv-title')
                .text(function(d) { return d.title; });

            title.append('text')
                .attr('class', 'nv-subtitle')
                .attr('dy', '1em')
                .text(function(d) { return d.subtitle; });

            bullet
                .width(availableWidth)
                .height(availableHeight);

            var bulletWrap = g.select('.nv-bulletWrap');
            d3.transition(bulletWrap).call(bullet);

            // Compute the tick format.
            var format = tickFormat || x1.tickFormat( availableWidth / 100 );

            // Update the tick groups.
            var tick = g.selectAll('g.nv-tick')
                .data(x1.ticks( ticks ? ticks : (availableWidth / 50) ), function(d) {
                    return this.textContent || format(d);
                });

            // Initialize the ticks with the old scale, x0.
            var tickEnter = tick.enter().append('g')
                .attr('class', 'nv-tick')
                .attr('transform', function(d) { return 'translate(' + x0(d) + ',0)' })
                .style('opacity', 1e-6);

            tickEnter.append('line')
                .attr('y1', availableHeight)
                .attr('y2', availableHeight * 7 / 6);

            tickEnter.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1em')
                .attr('y', availableHeight * 7 / 6)
                .text(format);

            // Transition the updating ticks to the new scale, x1.
            var tickUpdate = d3.transition(tick)
                .transition()
                .duration(bullet.duration())
                .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
                .style('opacity', 1);

            tickUpdate.select('line')
                .attr('y1', availableHeight)
                .attr('y2', availableHeight * 7 / 6);

            tickUpdate.select('text')
                .attr('y', availableHeight * 7 / 6);

            // Transition the exiting ticks to the new scale, x1.
            d3.transition(tick.exit())
                .transition()
                .duration(bullet.duration())
                .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
                .style('opacity', 1e-6)
                .remove();
        });

        d3.timer.flush();
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    bullet.dispatch.on('elementMouseover.tooltip', function(evt) {
        evt['series'] = {
            key: evt.label,
            value: evt.value,
            color: evt.color
        };
        tooltip.data(evt).hidden(false);
    });

    bullet.dispatch.on('elementMouseout.tooltip', function(evt) {
        tooltip.hidden(true);
    });

    bullet.dispatch.on('elementMousemove.tooltip', function(evt) {
        tooltip();
    });

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.bullet = bullet;
    chart.dispatch = dispatch;
    chart.tooltip = tooltip;

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        ranges:      {get: function(){return ranges;}, set: function(_){ranges=_;}}, // ranges (bad, satisfactory, good)
        markers:     {get: function(){return markers;}, set: function(_){markers=_;}}, // markers (previous, goal)
        measures: {get: function(){return measures;}, set: function(_){measures=_;}}, // measures (actual, forecast)
        width:    {get: function(){return width;}, set: function(_){width=_;}},
        height:    {get: function(){return height;}, set: function(_){height=_;}},
        tickFormat:    {get: function(){return tickFormat;}, set: function(_){tickFormat=_;}},
        ticks:    {get: function(){return ticks;}, set: function(_){ticks=_;}},
        noData:    {get: function(){return noData;}, set: function(_){noData=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        orient: {get: function(){return orient;}, set: function(_){ // left, right, top, bottom
            orient = _;
            reverse = orient == 'right' || orient == 'bottom';
        }}
    });

    nv.utils.inheritOptions(chart, bullet);
    nv.utils.initOptions(chart);

    return chart;
};

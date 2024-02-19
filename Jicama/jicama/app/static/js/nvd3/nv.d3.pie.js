
nv.models.pie = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = 500
        , height = 500
        , getX = function(d) { return d.x }
        , getY = function(d) { return d.y }
        , id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
        , container = null
        , color = nv.utils.defaultColor()
        , valueFormat = d3.format(',.2f')
        , showLabels = true
        , labelsOutside = false
        , labelType = "key"
        , labelThreshold = .02 //if slice percentage is under this, don't show label
        , hideOverlapLabels = false //Hide labels that don't fit in slice
        , donut = false
        , title = false
        , growOnHover = true
        , titleOffset = 0
        , labelSunbeamLayout = false
        , startAngle = false
        , padAngle = false
        , endAngle = false
        , cornerRadius = 0
        , donutRatio = 0.5
        , duration = 250
        , arcsRadius = []
        , dispatch = d3.dispatch('chartClick', 'elementClick', 'elementDblClick', 'elementMouseover', 'elementMouseout', 'elementMousemove', 'renderEnd')
        ;

    var arcs = [];
    var arcsOver = [];

    //============================================================
    // chart function
    //------------------------------------------------------------

    var renderWatch = nv.utils.renderWatch(dispatch);

    function chart(selection) {
        renderWatch.reset();
        selection.each(function(data) {
            var availableWidth = width - margin.left - margin.right
                , availableHeight = height - margin.top - margin.bottom
                , radius = Math.min(availableWidth, availableHeight) / 2
                , arcsRadiusOuter = []
                , arcsRadiusInner = []
                ;

            container = d3.select(this)
            if (arcsRadius.length === 0) {
                var outer = radius - radius / 10;
                var inner = donutRatio * radius;
                for (var i = 0; i < data[0].length; i++) {
                    arcsRadiusOuter.push(outer);
                    arcsRadiusInner.push(inner);
                }
            } else {
                if(growOnHover){
                    arcsRadiusOuter = arcsRadius.map(function (d) { return (d.outer - d.outer / 10) * radius; });
                    arcsRadiusInner = arcsRadius.map(function (d) { return (d.inner - d.inner / 10) * radius; });
                    donutRatio = d3.min(arcsRadius.map(function (d) { return (d.inner - d.inner / 10); }));
                } else {
                    arcsRadiusOuter = arcsRadius.map(function (d) { return d.outer * radius; });
                    arcsRadiusInner = arcsRadius.map(function (d) { return d.inner * radius; });
                    donutRatio = d3.min(arcsRadius.map(function (d) { return d.inner; }));
                }
            }
            nv.utils.initSVG(container);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('.nv-wrap.nv-pie').data(data);
            var wrapEnter = wrap.enter().append('g').attr('class','nvd3 nv-wrap nv-pie nv-chart-' + id);
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');
            var g_pie = gEnter.append('g').attr('class', 'nv-pie');
            gEnter.append('g').attr('class', 'nv-pieLabels');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            g.select('.nv-pie').attr('transform', 'translate(' + availableWidth / 2 + ',' + availableHeight / 2 + ')');
            g.select('.nv-pieLabels').attr('transform', 'translate(' + availableWidth / 2 + ',' + availableHeight / 2 + ')');

            //
            container.on('click', function(d,i) {
                dispatch.chartClick({
                    data: d,
                    index: i,
                    pos: d3.event,
                    id: id
                });
            });

            arcs = [];
            arcsOver = [];
            for (var i = 0; i < data[0].length; i++) {

                var arc = d3.svg.arc().outerRadius(arcsRadiusOuter[i]);
                var arcOver = d3.svg.arc().outerRadius(arcsRadiusOuter[i] + 5);

                if (startAngle !== false) {
                    arc.startAngle(startAngle);
                    arcOver.startAngle(startAngle);
                }
                if (endAngle !== false) {
                    arc.endAngle(endAngle);
                    arcOver.endAngle(endAngle);
                }
                if (donut) {
                    arc.innerRadius(arcsRadiusInner[i]);
                    arcOver.innerRadius(arcsRadiusInner[i]);
                }

                if (arc.cornerRadius && cornerRadius) {
                    arc.cornerRadius(cornerRadius);
                    arcOver.cornerRadius(cornerRadius);
                }

                arcs.push(arc);
                arcsOver.push(arcOver);
            }

            // Setup the Pie chart and choose the data element
            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d.disabled ? 0 : getY(d) });

            // padAngle added in d3 3.5
            if (pie.padAngle && padAngle) {
                pie.padAngle(padAngle);
            }

            // if title is specified and donut, put it in the middle
            if (donut && title) {
                g_pie.append("text").attr('class', 'nv-pie-title');

                wrap.select('.nv-pie-title')
                    .style("text-anchor", "middle")
                    .text(function (d) {
                        return title;
                    })
                    .style("font-size", (Math.min(availableWidth, availableHeight)) * donutRatio * 2 / (title.length + 2) + "px")
                    .attr("dy", "0.35em") // trick to vertically center text
                    .attr('transform', function(d, i) {
                        return 'translate(0, '+ titleOffset + ')';
                    });
            }

            var slices = wrap.select('.nv-pie').selectAll('.nv-slice').data(pie);
            var pieLabels = wrap.select('.nv-pieLabels').selectAll('.nv-label').data(pie);

            slices.exit().remove();
            pieLabels.exit().remove();

            var ae = slices.enter().append('g');
            ae.attr('class', 'nv-slice');
            ae.on('mouseover', function(d, i) {
                d3.select(this).classed('hover', true);
                if (growOnHover) {
                    d3.select(this).select("path").transition()
                        .duration(70)
                        .attr("d", arcsOver[i]);
                }
                dispatch.elementMouseover({
                    data: d.data,
                    index: i,
                    color: d3.select(this).style("fill"),
                    percent: (d.endAngle - d.startAngle) / (2 * Math.PI)
                });
            });
            ae.on('mouseout', function(d, i) {
                d3.select(this).classed('hover', false);
                if (growOnHover) {
                    d3.select(this).select("path").transition()
                        .duration(50)
                        .attr("d", arcs[i]);
                }
                dispatch.elementMouseout({data: d.data, index: i});
            });
            ae.on('mousemove', function(d, i) {
                dispatch.elementMousemove({data: d.data, index: i});
            });
            ae.on('click', function(d, i) {
                var element = this;
                dispatch.elementClick({
                    data: d.data,
                    index: i,
                    color: d3.select(this).style("fill"),
                    event: d3.event,
                    element: element
                });
            });
            ae.on('dblclick', function(d, i) {
                dispatch.elementDblClick({
                    data: d.data,
                    index: i,
                    color: d3.select(this).style("fill")
                });
            });

            slices.attr('fill', function(d,i) { return color(d.data, i); });
            slices.attr('stroke', function(d,i) { return color(d.data, i); });

            var paths = ae.append('path').each(function(d) {
                this._current = d;
            });

            slices.select('path')
                .transition()
                .duration(duration)
                .attr('d', function (d, i) { return arcs[i](d); })
                .attrTween('d', arcTween);

            if (showLabels) {
                // This does the normal label
                var labelsArc = [];
                for (var i = 0; i < data[0].length; i++) {
                    labelsArc.push(arcs[i]);

                    if (labelsOutside) {
                        if (donut) {
                            labelsArc[i] = d3.svg.arc().outerRadius(arcs[i].outerRadius());
                            if (startAngle !== false) labelsArc[i].startAngle(startAngle);
                            if (endAngle !== false) labelsArc[i].endAngle(endAngle);
                        }
                    } else if (!donut) {
                            labelsArc[i].innerRadius(0);
                    }
                }

                pieLabels.enter().append("g").classed("nv-label",true).each(function(d,i) {
                    var group = d3.select(this);

                    group.attr('transform', function (d, i) {
                        if (labelSunbeamLayout) {
                            d.outerRadius = arcsRadiusOuter[i] + 10; // Set Outer Coordinate
                            d.innerRadius = arcsRadiusOuter[i] + 15; // Set Inner Coordinate
                            var rotateAngle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
                            if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                                rotateAngle -= 90;
                            } else {
                                rotateAngle += 90;
                            }
                            return 'translate(' + labelsArc[i].centroid(d) + ') rotate(' + rotateAngle + ')';
                        } else {
                            d.outerRadius = radius + 10; // Set Outer Coordinate
                            d.innerRadius = radius + 15; // Set Inner Coordinate
                            return 'translate(' + labelsArc[i].centroid(d) + ')'
                        }
                    });

                    group.append('rect')
                        .style('stroke', '#fff')
                        .style('fill', '#fff')
                        .attr("rx", 3)
                        .attr("ry", 3);

                    group.append('text')
                        .style('text-anchor', labelSunbeamLayout ? ((d.startAngle + d.endAngle) / 2 < Math.PI ? 'start' : 'end') : 'middle') //center the text on it's origin or begin/end if orthogonal aligned
                        .style('fill', '#000')
                });

                var labelLocationHash = {};
                var avgHeight = 14;
                var avgWidth = 140;
                var createHashKey = function(coordinates) {
                    return Math.floor(coordinates[0]/avgWidth) * avgWidth + ',' + Math.floor(coordinates[1]/avgHeight) * avgHeight;
                };
                var getSlicePercentage = function(d) {
                    return (d.endAngle - d.startAngle) / (2 * Math.PI);
                };

                pieLabels.watchTransition(renderWatch, 'pie labels').attr('transform', function (d, i) {
                    if (labelSunbeamLayout) {
                        d.outerRadius = arcsRadiusOuter[i] + 10; // Set Outer Coordinate
                        d.innerRadius = arcsRadiusOuter[i] + 15; // Set Inner Coordinate
                        var rotateAngle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
                        if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                            rotateAngle -= 90;
                        } else {
                            rotateAngle += 90;
                        }
                        return 'translate(' + labelsArc[i].centroid(d) + ') rotate(' + rotateAngle + ')';
                    } else {
                        d.outerRadius = radius + 10; // Set Outer Coordinate
                        d.innerRadius = radius + 15; // Set Inner Coordinate

                        /*
                        Overlapping pie labels are not good. What this attempts to do is, prevent overlapping.
                        Each label location is hashed, and if a hash collision occurs, we assume an overlap.
                        Adjust the label's y-position to remove the overlap.
                        */
                        var center = labelsArc[i].centroid(d);
                        var percent = getSlicePercentage(d);
                        if (d.value && percent >= labelThreshold) {
                            var hashKey = createHashKey(center);
                            if (labelLocationHash[hashKey]) {
                                center[1] -= avgHeight;
                            }
                            labelLocationHash[createHashKey(center)] = true;
                        }
                        return 'translate(' + center + ')'
                    }
                });

                pieLabels.select(".nv-label text")
                    .style('text-anchor', function(d,i) {
                        //center the text on it's origin or begin/end if orthogonal aligned
                        return labelSunbeamLayout ? ((d.startAngle + d.endAngle) / 2 < Math.PI ? 'start' : 'end') : 'middle';
                    })
                    .text(function(d, i) {
                        var percent = getSlicePercentage(d);
                        var label = '';
                        if (!d.value || percent < labelThreshold) return '';

                        if(typeof labelType === 'function') {
                            label = labelType(d, i, {
                                'key': getX(d.data),
                                'value': getY(d.data),
                                'percent': valueFormat(percent)
                            });
                        } else {
                            switch (labelType) {
                                case 'key':
                                    label = getX(d.data);
                                    break;
                                case 'value':
                                    label = valueFormat(getY(d.data));
                                    break;
                                case 'percent':
                                    label = d3.format('%')(percent);
                                    break;
                            }
                        }
                        return label;
                    })
                ;

                if (hideOverlapLabels) {
                    pieLabels
                        .each(function (d, i) {
                            if (!this.getBBox) return;
                            var bb = this.getBBox(),
                            center = labelsArc[i].centroid(d);
                            var topLeft = {
                              x : center[0] + bb.x,
                              y : center[1] + bb.y
                            };

                            var topRight = {
                              x : topLeft.x + bb.width,
                              y : topLeft.y
                            };

                            var bottomLeft = {
                              x : topLeft.x,
                              y : topLeft.y + bb.height
                            };

                            var bottomRight = {
                              x : topLeft.x + bb.width,
                              y : topLeft.y + bb.height
                            };

                            d.visible = nv.utils.pointIsInArc(topLeft, d, arc) &&
                            nv.utils.pointIsInArc(topRight, d, arc) &&
                            nv.utils.pointIsInArc(bottomLeft, d, arc) &&
                            nv.utils.pointIsInArc(bottomRight, d, arc);
                        })
                        .style('display', function (d) {
                            return d.visible ? null : 'none';
                        })
                    ;
                }

            }


            // Computes the angle of an arc, converting from radians to degrees.
            function angle(d) {
                var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                return a > 90 ? a - 180 : a;
            }

            function arcTween(a, idx) {
                a.endAngle = isNaN(a.endAngle) ? 0 : a.endAngle;
                a.startAngle = isNaN(a.startAngle) ? 0 : a.startAngle;
                if (!donut) a.innerRadius = 0;
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return arcs[idx](i(t));
                };
            }
        });

        renderWatch.renderEnd('pie immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        arcsRadius: { get: function () { return arcsRadius; }, set: function (_) { arcsRadius = _; } },
        width:      {get: function(){return width;}, set: function(_){width=_;}},
        height:     {get: function(){return height;}, set: function(_){height=_;}},
        showLabels: {get: function(){return showLabels;}, set: function(_){showLabels=_;}},
        title:      {get: function(){return title;}, set: function(_){title=_;}},
        titleOffset:    {get: function(){return titleOffset;}, set: function(_){titleOffset=_;}},
        labelThreshold: {get: function(){return labelThreshold;}, set: function(_){labelThreshold=_;}},
        hideOverlapLabels: {get: function(){return hideOverlapLabels;}, set: function(_){hideOverlapLabels=_;}},
        valueFormat:    {get: function(){return valueFormat;}, set: function(_){valueFormat=_;}},
        x:          {get: function(){return getX;}, set: function(_){getX=_;}},
        id:         {get: function(){return id;}, set: function(_){id=_;}},
        endAngle:   {get: function(){return endAngle;}, set: function(_){endAngle=_;}},
        startAngle: {get: function(){return startAngle;}, set: function(_){startAngle=_;}},
        padAngle:   {get: function(){return padAngle;}, set: function(_){padAngle=_;}},
        cornerRadius: {get: function(){return cornerRadius;}, set: function(_){cornerRadius=_;}},
        donutRatio:   {get: function(){return donutRatio;}, set: function(_){donutRatio=_;}},
        labelsOutside: {get: function(){return labelsOutside;}, set: function(_){labelsOutside=_;}},
        labelSunbeamLayout: {get: function(){return labelSunbeamLayout;}, set: function(_){labelSunbeamLayout=_;}},
        donut:              {get: function(){return donut;}, set: function(_){donut=_;}},
        growOnHover:        {get: function(){return growOnHover;}, set: function(_){growOnHover=_;}},

        // depreciated after 1.7.1
        pieLabelsOutside: {get: function(){return labelsOutside;}, set: function(_){
            labelsOutside=_;
            nv.deprecated('pieLabelsOutside', 'use labelsOutside instead');
        }},
        // depreciated after 1.7.1
        donutLabelsOutside: {get: function(){return labelsOutside;}, set: function(_){
            labelsOutside=_;
            nv.deprecated('donutLabelsOutside', 'use labelsOutside instead');
        }},
        // deprecated after 1.7.1
        labelFormat: {get: function(){ return valueFormat;}, set: function(_) {
            valueFormat=_;
            nv.deprecated('labelFormat','use valueFormat instead');
        }},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
            margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
            margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
            margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
        }},
        duration: {get: function(){return duration;}, set: function(_){
            duration = _;
            renderWatch.reset(duration);
        }},
        y: {get: function(){return getY;}, set: function(_){
            getY=d3.functor(_);
        }},
        color: {get: function(){return color;}, set: function(_){
            color=nv.utils.getColor(_);
        }},
        labelType:          {get: function(){return labelType;}, set: function(_){
            labelType= _ || 'key';
        }}
    });

    nv.utils.initOptions(chart);
    return chart;
};
nv.models.pieChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var pie = nv.models.pie();
    var legend = nv.models.legend();
    var tooltip = nv.models.tooltip();

    var margin = {top: 30, right: 20, bottom: 20, left: 20}
        , marginTop = null
        , width = null
        , height = null
        , showTooltipPercent = false
        , showLegend = true
        , legendPosition = "top"
        , color = nv.utils.defaultColor()
        , state = nv.utils.state()
        , defaultState = null
        , noData = null
        , duration = 250
        , dispatch = d3.dispatch('stateChange', 'changeState','renderEnd')
        ;

    tooltip
        .duration(0)
        .headerEnabled(false)
        .valueFormatter(function(d, i) {
            return pie.valueFormat()(d, i);
        });

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var renderWatch = nv.utils.renderWatch(dispatch);

    var stateGetter = function(data) {
        return function(){
            return {
                active: data.map(function(d) { return !d.disabled })
            };
        }
    };

    var stateSetter = function(data) {
        return function(state) {
            if (state.active !== undefined) {
                data.forEach(function (series, i) {
                    series.disabled = !state.active[i];
                });
            }
        }
    };

    //============================================================
    // Chart function
    //------------------------------------------------------------

    function chart(selection) {
        renderWatch.reset();
        renderWatch.models(pie);

        selection.each(function(data) {
            var container = d3.select(this);
            nv.utils.initSVG(container);

            var that = this;
            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = nv.utils.availableHeight(height, container, margin);

            chart.update = function() { container.transition().call(chart); };
            chart.container = this;

            state.setter(stateSetter(data), chart.update)
                .getter(stateGetter(data))
                .update();

            //set state.disabled
            state.disabled = data.map(function(d) { return !!d.disabled });

            if (!defaultState) {
                var key;
                defaultState = {};
                for (key in state) {
                    if (state[key] instanceof Array)
                        defaultState[key] = state[key].slice(0);
                    else
                        defaultState[key] = state[key];
                }
            }

            // Display No Data message if there's nothing to show.
            if (!data || !data.length) {
                nv.utils.noData(chart, container);
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-pieChart').data([data]);
            var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-pieChart').append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-pieWrap');
            gEnter.append('g').attr('class', 'nv-legendWrap');

            // Legend
            if (!showLegend) {
                g.select('.nv-legendWrap').selectAll('*').remove();
            } else {
                if (legendPosition === "top") {
                    legend.width( availableWidth ).key(pie.x());

                    wrap.select('.nv-legendWrap')
                        .datum(data)
                        .call(legend);

                    if (!marginTop && legend.height() !== margin.top) {
                        margin.top = legend.height();
                        availableHeight = nv.utils.availableHeight(height, container, margin);
                    }

                    wrap.select('.nv-legendWrap')
                        .attr('transform', 'translate(0,' + (-margin.top) +')');
                } else if (legendPosition === "right") {
                    var legendWidth = nv.models.legend().width();
                    if (availableWidth / 2 < legendWidth) {
                        legendWidth = (availableWidth / 2)
                    }
                    legend.height(availableHeight).key(pie.x());
                    legend.width(legendWidth);
                    availableWidth -= legend.width();

                    wrap.select('.nv-legendWrap')
                        .datum(data)
                        .call(legend)
                        .attr('transform', 'translate(' + (availableWidth) +',0)');
                } else if (legendPosition === "bottom") {
                    legend.width( availableWidth ).key(pie.x());
                    wrap.select('.nv-legendWrap')
                        .datum(data)
                        .call(legend);

                    margin.bottom = legend.height();
                    availableHeight = nv.utils.availableHeight(height, container, margin);
                    wrap.select('.nv-legendWrap')
                        .attr('transform', 'translate(0,' + availableHeight +')');
                }
            }
            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Main Chart Component(s)
            pie.width(availableWidth).height(availableHeight);
            var pieWrap = g.select('.nv-pieWrap').datum([data]);
            d3.transition(pieWrap).call(pie);

            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------

            legend.dispatch.on('stateChange', function(newState) {
                for (var key in newState) {
                    state[key] = newState[key];
                }
                dispatch.stateChange(state);
                chart.update();
            });

            // Update chart from a state object passed to event handler
            dispatch.on('changeState', function(e) {
                if (typeof e.disabled !== 'undefined') {
                    data.forEach(function(series,i) {
                        series.disabled = e.disabled[i];
                    });
                    state.disabled = e.disabled;
                }
                chart.update();
            });
        });

        renderWatch.renderEnd('pieChart immediate');
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    pie.dispatch.on('elementMouseover.tooltip', function(evt) {
        evt['series'] = {
            key: chart.x()(evt.data),
            value: chart.y()(evt.data),
            color: evt.color,
            percent: evt.percent
        };
        if (!showTooltipPercent) {
            delete evt.percent;
            delete evt.series.percent;
        }
        tooltip.data(evt).hidden(false);
    });

    pie.dispatch.on('elementMouseout.tooltip', function(evt) {
        tooltip.hidden(true);
    });

    pie.dispatch.on('elementMousemove.tooltip', function(evt) {
        tooltip();
    });

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.legend = legend;
    chart.dispatch = dispatch;
    chart.pie = pie;
    chart.tooltip = tooltip;
    chart.options = nv.utils.optionsFunc.bind(chart);

    // use Object get/set functionality to map between vars and chart functions
    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:              {get: function(){return width;},                set: function(_){width=_;}},
        height:             {get: function(){return height;},               set: function(_){height=_;}},
        noData:             {get: function(){return noData;},               set: function(_){noData=_;}},
        showTooltipPercent: {get: function(){return showTooltipPercent;},   set: function(_){showTooltipPercent=_;}},
        showLegend:         {get: function(){return showLegend;},           set: function(_){showLegend=_;}},
        legendPosition:     {get: function(){return legendPosition;},       set: function(_){legendPosition=_;}},
        defaultState:       {get: function(){return defaultState;},         set: function(_){defaultState=_;}},

        // options that require extra logic in the setter
        color: {get: function(){return color;}, set: function(_){
            color = _;
            legend.color(color);
            pie.color(color);
        }},
        duration: {get: function(){return duration;}, set: function(_){
            duration = _;
            renderWatch.reset(duration);
            pie.duration(duration);
        }},
        margin: {get: function(){return margin;}, set: function(_){
            if (_.top !== undefined) {
                margin.top = _.top;
                marginTop = _.top;
            }
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }}
    });
    nv.utils.inheritOptions(chart, pie);
    nv.utils.initOptions(chart);
    return chart;
};

nv.models.distribution = function() {
    "use strict";
    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = 400 //technically width or height depending on x or y....
        , size = 8
        , axis = 'x' // 'x' or 'y'... horizontal or vertical
        , getData = function(d) { return d[axis] }  // defaults d.x or d.y
        , color = nv.utils.defaultColor()
        , scale = d3.scale.linear()
        , domain
        , duration = 250
        , dispatch = d3.dispatch('renderEnd')
        ;

    //============================================================


    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var scale0;
    var renderWatch = nv.utils.renderWatch(dispatch, duration);

    //============================================================


    function chart(selection) {
        renderWatch.reset();
        selection.each(function(data) {
            var availableLength = width - (axis === 'x' ? margin.left + margin.right : margin.top + margin.bottom),
                naxis = axis == 'x' ? 'y' : 'x',
                container = d3.select(this);
            nv.utils.initSVG(container);

            //------------------------------------------------------------
            // Setup Scales

            scale0 = scale0 || scale;

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Setup containers and skeleton of chart

            var wrap = container.selectAll('g.nv-distribution').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-distribution');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

            //------------------------------------------------------------


            var distWrap = g.selectAll('g.nv-dist')
                .data(function(d) { return d }, function(d) { return d.key });

            distWrap.enter().append('g');
            distWrap
                .attr('class', function(d,i) { return 'nv-dist nv-series-' + i })
                .style('stroke', function(d,i) { return color(d, i) });

            var dist = distWrap.selectAll('line.nv-dist' + axis)
                .data(function(d) { return d.values })
            dist.enter().append('line')
                .attr(axis + '1', function(d,i) { return scale0(getData(d,i)) })
                .attr(axis + '2', function(d,i) { return scale0(getData(d,i)) })
            renderWatch.transition(distWrap.exit().selectAll('line.nv-dist' + axis), 'dist exit')
                // .transition()
                .attr(axis + '1', function(d,i) { return scale(getData(d,i)) })
                .attr(axis + '2', function(d,i) { return scale(getData(d,i)) })
                .style('stroke-opacity', 0)
                .remove();
            dist
                .attr('class', function(d,i) { return 'nv-dist' + axis + ' nv-dist' + axis + '-' + i })
                .attr(naxis + '1', 0)
                .attr(naxis + '2', size);
            renderWatch.transition(dist, 'dist')
                // .transition()
                .attr(axis + '1', function(d,i) { return scale(getData(d,i)) })
                .attr(axis + '2', function(d,i) { return scale(getData(d,i)) })


            scale0 = scale.copy();

        });
        renderWatch.renderEnd('distribution immediate');
        return chart;
    }


    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------
    chart.options = nv.utils.optionsFunc.bind(chart);
    chart.dispatch = dispatch;

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
        margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.axis = function(_) {
        if (!arguments.length) return axis;
        axis = _;
        return chart;
    };

    chart.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return chart;
    };

    chart.getData = function(_) {
        if (!arguments.length) return getData;
        getData = d3.functor(_);
        return chart;
    };

    chart.scale = function(_) {
        if (!arguments.length) return scale;
        scale = _;
        return chart;
    };

    chart.color = function(_) {
        if (!arguments.length) return color;
        color = nv.utils.getColor(_);
        return chart;
    };

    chart.duration = function(_) {
        if (!arguments.length) return duration;
        duration = _;
        renderWatch.reset(duration);
        return chart;
    };
    //============================================================


    return chart;
}
nv.models.distroPlot = function() {
    "use strict";

    // IMPROVEMENTS:
    // - cleanup tooltip to look like candlestick example (don't need color square for everything)
    // - extend y scale range to min/max data better visually
    // - tips of violins need to be cut off if very long
    // - transition from box to violin not great since box only has a few points, and violin has many - need to generate box with as many points as violin
    // - when providing colorGroup, should color boxes by either parent or child group category (e.g. isolator)

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
        getY  = function(d) { return d.value },
        getColor = function(d) { return d.color },
        getQ1 = function(d) { return d.values.q1 },
        getQ2 = function(d) { return d.values.q2 },
        getQ3 = function(d) { return d.values.q3 },
        getNl = function(d) { return (centralTendency == 'mean' ? getMean(d) : getQ2(d)) - d.values.notch },
        getNu = function(d) { return (centralTendency == 'mean' ? getMean(d) : getQ2(d)) + d.values.notch },
        getMean = function(d) { return d.values.mean },
        getWl = function(d) { return d.values.wl[whiskerDef] },
        getWh = function(d) { return d.values.wu[whiskerDef] },
        getMin = function(d) { return d.values.min },
        getMax = function(d) { return d.values.max },
        getDev = function(d) { return d.values.dev },
        getValsObj = function(d) { return d.values.observations; },
        getValsArr = function(d) { return d.values.observations.map(function(e) { return e.y }); },
        plotType, // type of background: 'box', 'violin', 'none'/false - default: 'box' - 'none' will activate random scatter automatically
        observationType = false, // type of observations to show: 'random', 'swarm', 'line', 'centered' - default: false (don't show any observations, even if an outlier)
        whiskerDef = 'iqr', // type of whisker to render: 'iqr', 'minmax', 'stddev' - default: iqr
        hideWhiskers = false,
        notchBox = false, // bool whether to notch box
        colorGroup = false, // if specified, each x-category will be split into groups, each colored
        centralTendency = false,
        showOnlyOutliers = true, // show only outliers in box plot
        jitter = 0.7, // faction of that jitter should take up in 'random' observationType, must be in range [0,1]; see jitterX(), default 0.7
        squash = true, // whether to remove the x-axis positions for empty data groups, default is true
        bandwidth = 'scott', // bandwidth for kde calculation, can be float or str, if str, must be one of scott or silverman
        clampViolin = true, // whether to clamp the "tails" of the violin; prevents long 0-density area
        resolution = 50,
        pointSize = 3,
        color = nv.utils.defaultColor(),
        container = null,
        xDomain, xRange,
        yDomain, yRange,
        dispatch = d3.dispatch('elementMouseover', 'elementMouseout', 'elementMousemove', 'renderEnd'),
        duration = 250,
        maxBoxWidth = null;

    //============================================================
    // Helper Functions
    //------------------------------------------------------------


    /* Returns the smaller of std(X, ddof=1) or normalized IQR(X) over axis 0.
     *
     * @param (list) x - input x formatted as a single list of values
     *
     * @return float
     *
     * Source: https://github.com/statsmodels/statsmodels/blob/master/statsmodels/nonparametric/bandwidths.py#L9
     */
    function select_sigma(x) {
        var sorted = x.sort(d3.ascending); // sort our dat
        var normalize = 1.349;
        var IQR = (d3.quantile(sorted, 0.75) - d3.quantile(sorted, 0.25))/normalize; // normalized IQR
        return d3.min([d3.deviation(sorted), IQR]);
    }

    /*
    Scott's Rule of Thumb

    Parameters
    ----------
    x : array-like
        Array for which to get the bandwidth
    type : string
           The type of estimate to use, must be one of scott or silverman

    Returns
    -------
    bw : float
        The estimate of the bandwidth

    Notes
    -----
    Returns 1.059 * A * n ** (-1/5.) where ::
       A = min(std(x, ddof=1), IQR/1.349)
       IQR = np.subtract.reduce(np.percentile(x, [75,25]))

    References
    ----------
    Scott, D.W. (1992) Multivariate Density Estimation: Theory, Practice, and
        Visualization.
     */
    function calcBandwidth(x, type) {

        if (typeof type === 'undefined') type = 'scott';

        // TODO: consider using https://github.com/jasondavies/science.js
        var A = select_sigma(x);
        var n = x.length;
        return type==='scott' ? Math.pow(1.059 * A * n, -0.2) : Math.pow(.9 * A * n, -0.2);
    }



    /*
     * Prep data for use with distroPlot by grouping data
     * by .x() option set by user and then calculating
     * count, sum, mean, q1, q2 (median), q3, lower whisker (wl)
     * upper whisker (wu), iqr, min, max, and standard dev.
     *
     * NOTE: preparing this data can be resource intensive, and
     *       is therefore only run once on plot load. It can
     *       manually be run by calling recalcData(). This should
     *       be re-run any time the axis accessors are changed or
     *       when bandwidth/resolution are updated.
     *
     * NOTE: this will also setup the individual vertical scales
     *       for the violins.
     *
     * @param (list) dat - input data formatted as list of objects,
     *   with an object key that must exist when accessed by getX()
     *
     * @return prepared data in the form for box plotType:
     * [{
     *    key : YY,
     *    values: {
     *      count: XX,
     *      sum: XX,
     *      mean: XX,
     *      q1: XX,
     *      q2: XX,
     *      q3: XX,
     *      wl: XX,
     *      wu: XX,
     *      iqr: XX,
     *      min: XX,
     *      max: XX,
     *      dev: XX,
     *      observations: [{y:XX,..},..],
     *      key: XX,
     *      kdeDat: XX,
     *      notch: XX,
     *    }
     *  },
     *  ...
     *  ]
     * for violin plotType:
     * [{
     *    key : YY,
     *    values: {
     *      original: [{y:XX,..},..]
     *    }
     *  },
     *  ...
     *  ]
     * where YY are those keys in dat that define the
     * x-axis and which are defined by .x()
     */
    function prepData(dat) {

        // helper function to calcuate the various boxplot stats
        function calcStats(g, xGroup) {

            // sort data by Y so we can calc quartiles
            var v = g.map(function(d) {
                if (colorGroup) allColorGroups.add(colorGroup(d)); // list of all colorGroups; used to set x-axis
                return getY(d);
            }).sort(d3.ascending);

            var q1 = d3.quantile(v, 0.25);
            var q3 = d3.quantile(v, 0.75);
            var iqr = q3 - q1;
            var upper = q3 + 1.5 * iqr;
            var lower = q1 - 1.5 * iqr;

            /* whisker definitions:
             *  - iqr: also known as Tukey boxplot, the lowest datum still within 1.5 IQR of the lower quartile, and the highest datum still within 1.5 IQR of the upper quartile
             *  - minmax: the minimum and maximum of all of the data
             *  - sttdev: one standard deviation above and below the mean of the data
             * Note that the central tendency type (median or mean) does not impact the whisker location
             */
            var wl = {iqr: d3.max([d3.min(v),  d3.min(v.filter(function(d) {return d > lower}))]), minmax: d3.min(v), stddev: d3.mean(v) - d3.deviation(v)};
            var wu = {iqr: d3.min([d3.max(v), d3.max(v.filter(function(d) {return d < upper}))]), minmax: d3.max(v), stddev: d3.mean(v) + d3.deviation(v)};
            var median = d3.median(v);
            var mean = d3.mean(v);
            var observations = [];


            // d3-beeswarm library must be externally loaded if being used
            // https://github.com/Kcnarf/d3-beeswarm
            if (typeof d3.beeswarm !== 'undefined') {
                observations = d3.beeswarm()
                    .data(g.map(function(e) { return getY(e); }))
                    .radius(pointSize+1)
                    .orientation('vertical')
                    .side('symmetric')
                    .distributeOn(function(e) { return yScale(e); })
                    .arrange()

                // add group info for tooltip
                observations.map(function(e,i) {
                    e.key = xGroup;
                    e.object_constancy = g[i].object_constancy;
                    e.isOutlier = (e.datum < wl.iqr || e.datum > wu.iqr) // add isOulier meta for proper class assignment
                    e.isOutlierStdDev = (e.datum < wl.stddev || e.datum > wu.stddev) // add isOulier meta for proper class assignment
                    e.randX = Math.random() * jitter * (Math.floor(Math.random()*2) == 1 ? 1 : -1) // calculate random x-position only once for each point
                })
            } else {
                v.forEach(function(e,i) {
                    observations.push({
                        object_constancy: e.object_constancy,
                        datum: e,
                        key: xGroup,
                        isOutlier: (e < wl.iqr || e > wu.iqr), // add isOulier meta for proper class assignment
                        isOutlierStdDev: (e < wl.stddev || e > wu.stddev), // add isOulier meta for proper class assignment
                        randX: Math.random() * jitter * (Math.floor(Math.random()*2) == 1 ? 1 : -1)
                    })
                })
            }


            // calculate bandwidth if no number is provided
            if(isNaN(parseFloat(bandwidth))) { // if not is float
                var bandwidthCalc;
                if (['scott','silverman'].indexOf(bandwidth) != -1) {
                    bandwidthCalc = calcBandwidth(v, bandwidth);
                } else {
                    bandwidthCalc = calcBandwidth(v); // calculate with default 'scott'
                }
            }
            var kde = kernelDensityEstimator(eKernel(bandwidthCalc), yScale.ticks(resolution));
            var kdeDat = clampViolin ? clampViolinKDE(kde(v), d3.extent(v)) : kde(v);


            // make a new vertical scale for each group
            var tmpScale = d3.scale.linear()
                .domain([0, d3.max(kdeDat, function (e) { return e.y;})])
                .clamp(true);
            yVScale.push(tmpScale);

            var reformat = {
                count: v.length,
                num_outlier: observations.filter(function (e) { return e.isOutlier; }).length,
                sum: d3.sum(v),
                mean: mean,
                q1: q1,
                q2: median,
                q3: q3,
                wl: wl,
                wu: wu,
                iqr: iqr,
                min: d3.min(v),
                max: d3.max(v),
                dev: d3.deviation(v),
                observations: observations,
                key: xGroup,
                kde: kdeDat,
                notch: 1.57 * iqr / Math.sqrt(v.length), // notch distance from mean/median
            };

            if (colorGroup) {reformatDatFlat.push({key: xGroup, values: reformat});}

            return reformat;
        }

        // assign a unique identifier for each point for object constancy
        // this makes updating data possible
        dat.forEach(function(d,i) { d.object_constancy = i + '_' + getY(d) + '_' + getX(d); })


        // TODO not DRY
        // couldn't find a conditional way of doing the key() grouping
        var formatted;
        if (!colorGroup) {
            formatted = d3.nest()
                .key(function(d) { return getX(d); })
                .rollup(function(v,i) {
                    return calcStats(v);
                })
                .entries(dat);
        } else {
            allColorGroups = d3.set() // reset
            var tmp = d3.nest()
                .key(function(d) { return getX(d); })
                .key(function(d) { return colorGroup(d); })
                .rollup(function(v) {
                    return calcStats(v, getX(v[0]));
                })
                .entries(dat);

            // generate a final list of all x & colorGroup combinations
            // this is used to properly set the x-axis domain
            allColorGroups = allColorGroups.values(); // convert from d3.set to list
            var xGroups = tmp.map(function(d) { return d.key; });
            var allGroups = [];
            for (var i = 0; i < xGroups.length; i++) {
                for (var j = 0; j < allColorGroups.length; j++) {
                    allGroups.push(xGroups[i] + '_' + allColorGroups[j]);
                }
            }
            allColorGroups = allGroups;

            // flatten the inner most level so that
            // the plot retains the same DOM structure
            // to allow for smooth updating between
            // all groups.
            formatted = [];
            tmp.forEach(function(d) {
                d.values.forEach(function(e) { e.key = d.key +'_'+e.key }) // generate a combo key so that each boxplot has a distinct x-position
                formatted.push.apply(formatted, d.values)
            });

        }
        return formatted;
    }

    // https://bl.ocks.org/mbostock/4341954
    function kernelDensityEstimator(kernel, X) {
        return function (sample) {
            return X.map(function(x) {
                var y = d3.mean(sample, function (v) {return kernel(x - v);});
                return {x:x, y:y};
            });
        };
    }

    /*
     * Limit whether the density extends past the extreme datapoints
     * of the violin.
     *
     * @param (list) kde - x & y kde cooridinates
     * @param (list) extent - min/max y-values used for clamping violing
     */
    function clampViolinKDE(kde, extent) {

        // this handles the case when all the x-values are equal
        // which means no kde could be properly calculated
        // just return the kde data so we can continue plotting successfully
        if (extent[0] === extent[1]) return kde;

        var clamped = kde.reduce(function(res, d) {
            if (d.x >= extent[0] && d.x <= extent[1]) res.push(d);
            return res;
        },[]);

        // add the extreme data points back in
        if (extent[0] < clamped[0].x) clamped.unshift({x:extent[0], y:clamped[0].y})
        if (extent[1] > clamped[clamped.length-1].x) clamped.push({x:extent[1], y:clamped[clamped.length-1].y})

        return clamped;

    }

    // https://bl.ocks.org/mbostock/4341954
    function eKernel(scale) {
        return function (u) {
            return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
        };
    }

    /**
     * Makes the svg polygon string for a boxplot in either a notched
     * or square version
     *
     * NOTE: this actually only draws the left half of the box, since
     * the shape is symmetric (and since this is how violins are drawn)
     * we can simply generate half the box and mirror it.
     *
     * @param boxLeft {float} - left position of box
     * @param notchLeft {float} - left position of notch
     * @param dat {obj} - box plot data that was run through prepDat, must contain
     *      data for Q1, median, Q2, notch upper and notch lower
     * @returns {string} A string in the proper format for a svg polygon
     */
    function makeNotchBox(boxLeft, notchLeft, boxCenter, dat) {

        var boxPoints;
        var y = centralTendency == 'mean' ? getMean(dat) : getQ2(dat); // if centralTendency is not specified, we still want to notch boxes on 'median'
        if (notchBox) {
            boxPoints = [
                    {x:boxCenter, y:yScale(getQ1(dat))},
                    {x:boxLeft, y:yScale(getQ1(dat))},
                    {x:boxLeft, y:yScale(getNl(dat))},
                    {x:notchLeft, y:yScale(y)},
                    {x:boxLeft, y:yScale(getNu(dat))},
                    {x:boxLeft, y:yScale(getQ3(dat))},
                    {x:boxCenter, y:yScale(getQ3(dat))},
                ];
        } else {
            boxPoints = [
                    {x:boxCenter, y:yScale(getQ1(dat))},
                    {x:boxLeft, y:yScale(getQ1(dat))},
                    {x:boxLeft, y:yScale(y)}, // repeated point so that transition between notched/regular more smooth
                    {x:boxLeft, y:yScale(y)},
                    {x:boxLeft, y:yScale(y)}, // repeated point so that transition between notched/regular more smooth
                    {x:boxLeft, y:yScale(getQ3(dat))},
                    {x:boxCenter, y:yScale(getQ3(dat))},
                ];
        }

        return boxPoints;
    }

    /**
     * Given an x-axis group, return the available color groups within it
     * provided that colorGroups is set, if not, x-axis group is returned
     */
    function getAvailableColorGroups(x) {
        if (!colorGroup) return x;
        var tmp = reformatDat.find(function(d) { return d.key == x });
        return tmp.values.map(function(d) { return d.key }).sort(d3.ascending);
    }

    // return true if point is an outlier
    function isOutlier(d) {
        return (whiskerDef == 'iqr' && d.isOutlier) || (whiskerDef == 'stddev' && d.isOutlierStdDev)
    }



    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var allColorGroups = d3.set()
    var yVScale = [], reformatDat, reformatDatFlat = [];
    var renderWatch = nv.utils.renderWatch(dispatch, duration);
    var availableWidth, availableHeight;


    function chart(selection) {
        renderWatch.reset();
        selection.each(function(data) {
            availableWidth = width - margin.left - margin.right,
            availableHeight = height - margin.top - margin.bottom;

            container = d3.select(this);
            nv.utils.initSVG(container);

            // Setup y-scale so that beeswarm layout can use it in prepData()
            yScale.domain(yDomain || d3.extent(data.map(function(d) { return getY(d)}))).nice()
                .range(yRange || [availableHeight, 0]);


            if (typeof reformatDat === 'undefined') reformatDat = prepData(data); // this prevents us from recalculating data all the time

            // Setup x-scale
            xScale.rangeBands(xRange || [0, availableWidth], 0.1)
                  .domain(xDomain || (colorGroup && !squash) ? allColorGroups : reformatDat.map(function(d) { return d.key }))

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap').data([reformatDat]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap');
            wrap.watchTransition(renderWatch, 'nv-wrap: wrap')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var areaEnter,
                distroplots = wrap.selectAll('.nv-distroplot-x-group')
                    .data(function(d) { return d; });

            // rebind new data
            // we don't rebuild individual x-axis groups so that we can update transition them
            // however the data associated with each x-axis group needs to be updated
            // so we manually update it here
            distroplots.each(function(d,i) {
                d3.select(this).selectAll('line.nv-distroplot-middle').datum(d);
            })

            areaEnter = distroplots.enter()
                .append('g')
                .attr('class', 'nv-distroplot-x-group')
                .style('stroke-opacity', 1e-6).style('fill-opacity', 1e-6)
                .style('fill', function(d,i) { return getColor(d) || color(d,i) })
                .style('stroke', function(d,i) { return getColor(d) || color(d,i) })

            distroplots.exit().remove();

            var rangeBand = function() { return xScale.rangeBand() };
            var areaWidth = function() { return d3.min([maxBoxWidth,rangeBand() * 0.9]); };
            var areaCenter = function() { return areaWidth()/2; };
            var areaLeft  = function() { return areaCenter() - areaWidth()/2; };
            var areaRight = function() { return areaCenter() + areaWidth()/2; };
            var tickLeft  = function() { return areaCenter() - areaWidth()/5; };
            var tickRight = function() { return areaCenter() + areaWidth()/5; };

            areaEnter.attr('transform', function(d) {
                    return 'translate(' + (xScale(d.key) + (rangeBand() - areaWidth()) * 0.5) + ', 0)';
                });

            distroplots
                .watchTransition(renderWatch, 'nv-distroplot-x-group: distroplots')
                .style('stroke-opacity', 1)
                .style('fill-opacity', 0.5)
                .attr('transform', function(d) {
                    return 'translate(' + (xScale(d.key) + (rangeBand() - areaWidth()) * 0.5) + ', 0)';
                });

            // set range for violin scale
            yVScale.map(function(d) { d.range([areaWidth()/2, 0]) });

            // ----- add the SVG elements for each plot type -----

            // scatter plot type
            if (!plotType) {
                showOnlyOutliers = false; // force all observations to be seen
                if (!observationType) observationType = 'random'
            }

            // conditionally append whisker lines
            areaEnter.each(function(d,i) {
                var box = d3.select(this);
                [getWl, getWh].forEach(function (f) {
                    var key = (f === getWl) ? 'low' : 'high';
                    box.append('line')
                      .style('opacity', function() { return !hideWhiskers ? '0' : '1' })
                      .attr('class', 'nv-distroplot-whisker nv-distroplot-' + key)
                    box.append('line')
                      .style('opacity', function() { return hideWhiskers ? '0' : '1' })
                      .attr('class', 'nv-distroplot-tick nv-distroplot-' + key)
                });
            });


            // update whisker lines and ticks
            [getWl, getWh].forEach(function (f) {
                var key = (f === getWl) ? 'low' : 'high';
                var endpoint = (f === getWl) ? getQ1 : getQ3;
                distroplots.select('line.nv-distroplot-whisker.nv-distroplot-' + key)
                  .watchTransition(renderWatch, 'nv-distroplot-x-group: distroplots')
                    .attr('x1', areaCenter())
                    .attr('y1', function(d) { return plotType!='violin' ? yScale(f(d)) : yScale(getQ2(d)); })
                    .attr('x2', areaCenter())
                    .attr('y2', function(d) { return plotType=='box' ? yScale(endpoint(d)) : yScale(getQ2(d)); })
                    .style('opacity', function() { return hideWhiskers ? '0' : '1' })
                distroplots.select('line.nv-distroplot-tick.nv-distroplot-' + key)
                  .watchTransition(renderWatch, 'nv-distroplot-x-group: distroplots')
                    .attr('x1', function(d) { return plotType!='violin' ? tickLeft() : areaCenter()} )
                    .attr('y1', function(d,i) { return plotType!='violin' ? yScale(f(d)) : yScale(getQ2(d)); })
                    .attr('x2', function(d) { return plotType!='violin' ? tickRight() : areaCenter()} )
                    .attr('y2', function(d,i) { return plotType!='violin' ? yScale(f(d)) : yScale(getQ2(d)); })
                    .style('opacity', function() { return hideWhiskers ? '0' : '1' })
            });

            [getWl, getWh].forEach(function (f) {
                var key = (f === getWl) ? 'low' : 'high';
                areaEnter.selectAll('.nv-distroplot-' + key)
                  .on('mouseover', function(d,i,j) {
                      d3.select(this.parentNode).selectAll('line.nv-distroplot-'+key).classed('hover',true);
                      dispatch.elementMouseover({
                          value: key == 'low' ? 'Lower whisker' : 'Upper whisker',
                          series: { key: f(d).toFixed(2), color: getColor(d) || color(d,j) },
                          e: d3.event
                      });
                  })
                  .on('mouseout', function(d,i,j) {
                      d3.select(this.parentNode).selectAll('line.nv-distroplot-'+key).classed('hover',false);
                      dispatch.elementMouseout({
                          value: key == 'low' ? 'Lower whisker' : 'Upper whisker',
                          series: { key: f(d).toFixed(2), color: getColor(d) || color(d,j) },
                          e: d3.event
                      });
                  })
                  .on('mousemove', function(d,i) {
                      dispatch.elementMousemove({e: d3.event});
                  });
            });

            // setup boxes as 4 parts: left-area, left-line, right-area, right-line,
            // this way we can transition to a violin
            areaEnter.each(function(d,i) {
                var violin = d3.select(this);

                ['left','right'].forEach(function(side) {
                    ['line','area'].forEach(function(d) {
                        violin.append('path')
                            .attr('class', 'nv-distribution-' + d + ' nv-distribution-' + side)
                            .attr("transform", "rotate(90,0,0)   translate(0," + (side == 'left' ? -areaWidth() : 0) + ")" + (side == 'left' ? '' : ' scale(1,-1)')); // rotate violin
                    })

                })

                areaEnter.selectAll('.nv-distribution-line')
                    .style('fill','none')
                areaEnter.selectAll('.nv-distribution-area')
                    .style('stroke','none')
                    .style('opacity',0.7)

            });

            // transitions
            distroplots.each(function(d,i) {
                var violin = d3.select(this);
                var objData = plotType == 'box' ? makeNotchBox(areaLeft(), tickLeft(), areaCenter(), d) : d.values.kde;

                violin.selectAll('path')
                    .datum(objData)

                var tmpScale = yVScale[i];

                var interp = plotType=='box' ? 'linear' : 'basis';

                if (plotType == 'box' || plotType == 'violin') {
                    ['left','right'].forEach(function(side) {

                        // line
                        distroplots.selectAll('.nv-distribution-line.nv-distribution-' + side)
                          //.watchTransition(renderWatch, 'nv-distribution-line: distroplots') // disable transition for now because it's jaring
                            .attr("d", d3.svg.line()
                                    .x(function(e) { return plotType=='box' ? e.y : yScale(e.x); })
                                    .y(function(e) { return plotType=='box' ? e.x : tmpScale(e.y) })
                                    .interpolate(interp)
                            )
                            .attr("transform", "rotate(90,0,0)   translate(0," + (side == 'left' ? -areaWidth() : 0) + ")" + (side == 'left' ? '' : ' scale(1,-1)')) // rotate violin
                            .style('opacity', !plotType ? '0' : '1');

                        // area
                        distroplots.selectAll('.nv-distribution-area.nv-distribution-' + side)
                          //.watchTransition(renderWatch, 'nv-distribution-line: distroplots') // disable transition for now because it's jaring
                            .attr("d", d3.svg.area()
                                    .x(function(e) { return plotType=='box' ? e.y : yScale(e.x); })
                                    .y(function(e) { return plotType=='box' ? e.x : tmpScale(e.y) })
                                    .y0(areaWidth()/2)
                                    .interpolate(interp)
                            )
                            .attr("transform", "rotate(90,0,0)   translate(0," + (side == 'left' ? -areaWidth() : 0) + ")" + (side == 'left' ? '' : ' scale(1,-1)')) // rotate violin
                            .style('opacity', !plotType ? '0' : '1');

                    })
                } else { // scatter type, hide areas
                    distroplots.selectAll('.nv-distribution-area')
                        .watchTransition(renderWatch, 'nv-distribution-area: distroplots')
                        .style('opacity', !plotType ? '0' : '1');

                    distroplots.selectAll('.nv-distribution-line')
                        .watchTransition(renderWatch, 'nv-distribution-line: distroplots')
                        .style('opacity', !plotType ? '0' : '1');
                }

            })

            // tooltip events
            distroplots.selectAll('path')
                .on('mouseover', function(d,i,j) {
                    d = d3.select(this.parentNode).datum(); // grab data from parent g
                    d3.select(this).classed('hover', true);
                    dispatch.elementMouseover({
                        key: d.key,
                        value: 'Group ' + d.key + ' stats',
                        series: [
                            { key: 'max', value: getMax(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'Q3', value: getQ3(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'Q2', value: getQ2(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'Q1', value: getQ1(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'min', value: getMin(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'mean', value: getMean(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'std. dev.', value: getDev(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'count', value: d.values.count, color: getColor(d) || color(d,j) },
                            { key: 'num. outliers', value: d.values.num_outlier, color: getColor(d) || color(d,j) },
                        ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                })
                .on('mouseout', function(d,i,j) {
                    d3.select(this).classed('hover', false);
                    d = d3.select(this.parentNode).datum(); // grab data from parent g
                    dispatch.elementMouseout({
                        key: d.key,
                        value: 'Group ' + d.key + ' stats',
                        series: [
                            { key: 'max', value: getMax(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'Q3', value: getQ3(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'Q2', value: getQ2(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'Q1', value: getQ1(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'min', value: getMin(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'mean', value: getMean(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'std. dev.', value: getDev(d).toFixed(2), color: getColor(d) || color(d,j) },
                            { key: 'count', value: d.values.count, color: getColor(d) || color(d,j) },
                            { key: 'num. outliers', value: d.values.num_outlier, color: getColor(d) || color(d,j) },
                        ],
                        data: d,
                        index: i,
                        e: d3.event
                    });
                })
                .on('mousemove', function(d,i) {
                    dispatch.elementMousemove({e: d3.event});
                });


            // median/mean line
            areaEnter.append('line')
                .attr('class', function(d) { return 'nv-distroplot-middle'})


            distroplots.selectAll('line.nv-distroplot-middle')
                .watchTransition(renderWatch, 'nv-distroplot-x-group: distroplots line')
                .attr('x1', notchBox ? tickLeft : plotType != 'violin' ? areaLeft : tickLeft())
                .attr('y1', function(d,i,j) { return centralTendency == 'mean' ? yScale(getMean(d)) : yScale(getQ2(d)); })
                .attr('x2', notchBox ? tickRight : plotType != 'violin' ? areaRight : tickRight())
                .attr('y2', function(d,i) { return centralTendency == 'mean' ? yScale(getMean(d)) : yScale(getQ2(d)); })
                .style('opacity', centralTendency ? '1' : '0');


            // tooltip
            distroplots.selectAll('.nv-distroplot-middle')
                .on('mouseover', function(d,i,j) {
                    if (d3.select(this).style('opacity') == 0) return; // don't show tooltip for hidden lines
                    var fillColor = d3.select(this.parentNode).style('fill'); // color set by parent g fill
                    d3.select(this).classed('hover', true);
                    dispatch.elementMouseover({
                        value: centralTendency == 'mean' ? 'Mean' : 'Median',
                        series: { key: centralTendency == 'mean' ? getMean(d).toFixed(2) : getQ2(d).toFixed(2), color: fillColor },
                        e: d3.event
                    });
                })
                .on('mouseout', function(d,i,j) {
                    if (d3.select(this).style('opacity') == 0) return; // don't show tooltip for hidden lines
                    d3.select(this).classed('hover', false);
                    var fillColor = d3.select(this.parentNode).style('fill'); // color set by parent g fill
                    dispatch.elementMouseout({
                        value: centralTendency == 'mean' ? 'Mean' : 'Median',
                        series: { key: centralTendency == 'mean' ? getMean(d).toFixed(2) : getQ2(d).toFixed(2), color: fillColor },
                        e: d3.event
                    });
                })
                .on('mousemove', function(d,i) {
                    dispatch.elementMousemove({e: d3.event});
                });


            // setup observations
            // create DOMs even if not requested (and hide them), so that
            // we can do transitions on them
            var obsWrap = distroplots.selectAll('g.nv-distroplot-observation')
                .data(function(d) { return getValsObj(d) }, function(d) {  return d.object_constancy; });

            var obsGroup = obsWrap.enter()
                .append('g')
                .attr('class', 'nv-distroplot-observation')

            obsGroup.append('circle')
                .style({'opacity': 0})

            obsGroup.append('line')
                .style('stroke-width', 1)
                .style({'stroke': d3.rgb(85, 85, 85), 'opacity': 0})

            obsWrap.exit().remove();
            obsWrap.attr('class', function(d) { return 'nv-distroplot-observation ' + (isOutlier(d) && plotType == 'box' ? 'nv-distroplot-outlier' : 'nv-distroplot-non-outlier')})

            // transition observations
            if (observationType == 'line') {
                distroplots.selectAll('g.nv-distroplot-observation line')
                  .watchTransition(renderWatch, 'nv-distrolot-x-group: nv-distoplot-observation')
                    .attr("x1", tickLeft() + areaWidth()/4)
                    .attr("x2", tickRight() - areaWidth()/4)
                    .attr('y1', function(d) { return yScale(d.datum)})
                    .attr('y2', function(d) { return yScale(d.datum)});
            } else {
                distroplots.selectAll('g.nv-distroplot-observation circle')
                  .watchTransition(renderWatch, 'nv-distroplot: nv-distroplot-observation')
                    .attr('cy', function(d) { return yScale(d.datum); })
                    .attr('r', pointSize);

                // NOTE: this update can be slow when re-sizing window when many point visible 
                // TODO: filter selection down to only visible points, no need to update x-position
                //       of the hidden points
                distroplots.selectAll('g.nv-distroplot-observation circle')
                  .watchTransition(renderWatch, 'nv-distroplot: nv-distroplot-observation')
                    .attr('cx', function(d) { return observationType == 'swarm' ? d.x + areaWidth()/2 : observationType == 'random' ? areaWidth()/2 + d.randX * areaWidth()/2 : areaWidth()/2; })

            }

            // set opacity on outliers/non-outliers
            // any circle/line entering has opacity 0
            if (observationType !== false) { // observationType is False when hidding all circle/lines
                if (!showOnlyOutliers) { // show all line/circle
                    distroplots.selectAll(observationType== 'line' ? 'line':'circle')
                      .watchTransition(renderWatch, 'nv-distroplot: nv-distroplot-observation')
                        .style('opacity',1)
                } else { // show only outliers
                    distroplots.selectAll('.nv-distroplot-outlier '+ (observationType== 'line' ? 'line':'circle'))
                      .watchTransition(renderWatch, 'nv-distroplot: nv-distroplot-observation')
                        .style('opacity',1)
                    distroplots.selectAll('.nv-distroplot-non-outlier '+ (observationType== 'line' ? 'line':'circle'))
                      .watchTransition(renderWatch, 'nv-distroplot: nv-distroplot-observation')
                        .style('opacity',0)
                }
            }

            // hide all other observations
            distroplots.selectAll('.nv-distroplot-observation' + (observationType=='line'?' circle':' line'))
              .watchTransition(renderWatch, 'nv-distroplot: nv-distoplot-observation')
                .style('opacity',0)

            // tooltip events for observations
            distroplots.selectAll('.nv-distroplot-observation')
                    .on('mouseover', function(d,i,j) {
                        var pt = d3.select(this);
                        if (showOnlyOutliers && plotType == 'box' && !isOutlier(d)) return; // don't show tooltip for hidden observation
                        var fillColor = d3.select(this.parentNode).style('fill'); // color set by parent g fill
                        pt.classed('hover', true);
                        dispatch.elementMouseover({
                            value: (plotType == 'box' && isOutlier(d)) ? 'Outlier' : 'Observation',
                            series: { key: d.datum.toFixed(2), color: fillColor },
                            e: d3.event
                        });
                    })
                    .on('mouseout', function(d,i,j) {
                        var pt = d3.select(this);
                        var fillColor = d3.select(this.parentNode).style('fill'); // color set by parent g fill
                        pt.classed('hover', false);
                        dispatch.elementMouseout({
                            value: (plotType == 'box' && isOutlier(d)) ? 'Outlier' : 'Observation',
                            series: { key: d.datum.toFixed(2), color: fillColor },
                            e: d3.event
                        });
                    })
                    .on('mousemove', function(d,i) {
                        dispatch.elementMousemove({e: d3.event});
                    });

        });

        renderWatch.renderEnd('nv-distroplot-x-group immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:            {get: function(){return width;}, set: function(_){width=_;}},
        height:           {get: function(){return height;}, set: function(_){height=_;}},
        maxBoxWidth:      {get: function(){return maxBoxWidth;}, set: function(_){maxBoxWidth=_;}},
        x:                {get: function(){return getX;}, set: function(_){getX=_;}},
        y:                {get: function(){return getY;}, set: function(_){getY=_;}},
        plotType:         {get: function(){return plotType;}, set: function(_){plotType=_;}}, // plotType of background: 'box', 'violin' - default: 'box'
        observationType:  {get: function(){return observationType;}, set: function(_){observationType=_;}}, // type of observations to show: 'random', 'swarm', 'line', 'point' - default: false (don't show observations)
        whiskerDef:       {get: function(){return whiskerDef;}, set: function(_){whiskerDef=_;}}, // type of whisker to render: 'iqr', 'minmax', 'stddev' - default: iqr
        notchBox:         {get: function(){return notchBox;}, set: function(_){notchBox=_;}}, // bool whether to notch box
        hideWhiskers:     {get: function(){return hideWhiskers;}, set: function(_){hideWhiskers=_;}},
        colorGroup:       {get: function(){return colorGroup;}, set: function(_){colorGroup=_;}}, // data key to use to set color group of each x-category - default: don't group
        centralTendency:       {get: function(){return centralTendency;}, set: function(_){centralTendency=_;}}, // add a mean or median line to the data - default: don't show, must be one of 'mean' or 'median'
        bandwidth:        {get: function(){return bandwidth;}, set: function(_){bandwidth=_;}}, // bandwidth for kde calculation, can be float or str, if str, must be one of scott or silverman
        clampViolin:           {get: function(){return clampViolin;}, set: function(_){clampViolin=_;}},
        resolution:       {get: function(){return resolution;}, set: function(_){resolution=_;}}, // resolution for kde calculation, default 50
        xScale:           {get: function(){return xScale;}, set: function(_){xScale=_;}},
        yScale:           {get: function(){return yScale;}, set: function(_){yScale=_;}},
        showOnlyOutliers: {get: function(){return showOnlyOutliers;}, set: function(_){showOnlyOutliers=_;}}, // show only outliers in box plot, default true
        jitter:           {get: function(){return jitter;}, set: function(_){jitter=_;}}, // faction of that jitter should take up in 'random' observationType, must be in range [0,1]; see jitterX(), default 0.7
        squash:           {get: function(){return squash;}, set: function(_){squash=_;}}, // whether to squash sparse distribution of color groups towards middle of x-axis position
        pointSize:     {get: function(){return pointSize;}, set: function(_){pointSize=_;}},
        xDomain: {get: function(){return xDomain;}, set: function(_){xDomain=_;}},
        yDomain: {get: function(){return yDomain;}, set: function(_){yDomain=_;}},
        xRange:  {get: function(){return xRange;}, set: function(_){xRange=_;}},
        yRange:  {get: function(){return yRange;}, set: function(_){yRange=_;}},
        recalcData:   {get: function() { reformatDat = prepData(container.datum()); } },
        itemColor:    {get: function(){return getColor;}, set: function(_){getColor=_;}},
        id:           {get: function(){return id;}, set: function(_){id=_;}},

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
nv.models.distroPlotChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var distroplot = nv.models.distroPlot(),
        xAxis = nv.models.axis(),
        yAxis = nv.models.axis()

    var margin = {top: 25, right: 10, bottom: 40, left: 60},
        width = null,
        height = null,
        color = nv.utils.getColor(),
        showXAxis = true,
        showYAxis = true,
        rightAlignYAxis = false,
        staggerLabels = false,
        xLabel = false,
        yLabel = false,
        tooltip = nv.models.tooltip(),
        x, y,
        noData = 'No Data Available.',
        dispatch = d3.dispatch('stateChange', 'beforeUpdate', 'renderEnd'),
        duration = 500;

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
    var colorGroup0, marginTop0 = margin.top, x0, y0, resolution0, bandwidth0, clampViolin0;
    var dataCache;


    // return true if data has changed somehow after
    // an .update() was called
    // works by comparing current data set to the
    // one previously cached
    // TODO - since we keep another version of the dataset
    // around for comparison, it doubles the memory usage :(
    function dataHasChanged(d) {
        if (arraysEqual(d, dataCache)) {
            return false;
        } else {
            dataCache = JSON.parse(JSON.stringify(d)) // deep copy
            return true;
        }
    }

    // return true if array of objects equivalent
    function arraysEqual(arr1, arr2) {
        if(arr1.length !== arr2.length) return false;

        for(var i = arr1.length; i--;) {
            if ('object_constancy' in arr1[i]) delete arr1[i].object_constancy
            if ('object_constancy' in arr2[i]) delete arr2[i].object_constancy

            if(!objectEquals(arr1[i], arr2[i])) {
                return false;
            }
        }

        return true;
    }

    // return true if objects are equivalent
    function objectEquals(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        return true;
    }


    function chart(selection) {
        renderWatch.reset();
        renderWatch.models(distroplot);
        if (showXAxis) renderWatch.models(xAxis);
        if (showYAxis) renderWatch.models(yAxis);

        selection.each(function(data) {
            var container = d3.select(this), that = this;
            nv.utils.initSVG(container);
            var availableWidth = (width  || parseInt(container.style('width')) || 960) - margin.left - margin.right;
            var availableHeight = (height || parseInt(container.style('height')) || 400) - margin.top - margin.bottom;

            if (typeof dataCache === 'undefined') {
                dataCache = JSON.parse(JSON.stringify(data)) // deep copy
            }

            chart.update = function() {
                dispatch.beforeUpdate();
                var opts = distroplot.options()
                if (colorGroup0 !== opts.colorGroup() || // recalc data when any of the axis accessors are changed
                    x0 !== opts.x() ||
                    y0 !== opts.y() ||
                    bandwidth0 !== opts.bandwidth() ||
                    resolution0 !== opts.resolution() ||
                    clampViolin0 !== opts.clampViolin() ||
                    dataHasChanged(data)
                ) {
                    distroplot.recalcData();
                }
                container.transition().duration(duration).call(chart);
            };
            chart.container = this;


            if (typeof d3.beeswarm !== 'function' && chart.options().observationType() == 'swarm') {
                var xPos = margin.left + availableWidth/2;
                noData = 'Please include the library https://github.com/Kcnarf/d3-beeswarm to use "swarm".'
                nv.utils.noData(chart, container);
                return chart;
            } else if (!data || !data.length) {
                nv.utils.noData(chart, container);
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            // Setup Scales
            x = distroplot.xScale();
            y = distroplot.yScale().clamp(true);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-distroPlot').data([data]);
            var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-distroPlot').append('g');
            var defsEnter = gEnter.append('defs');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-x nv-axis');
            gEnter.append('g').attr('class', 'nv-y nv-axis')
                .append('g').attr('class', 'nv-zeroLine')
                .append('line');

            gEnter.append('g').attr('class', 'nv-distroWrap');
            gEnter.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            g.watchTransition(renderWatch, 'nv-wrap: wrap')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            if (rightAlignYAxis) {
                g.select('.nv-y.nv-axis')
                    .attr('transform', 'translate(' + availableWidth + ',0)');
            }


            // Main Chart Component(s)
            distroplot.width(availableWidth).height(availableHeight);

            var distroWrap = g.select('.nv-distroWrap')
                .datum(data)

            distroWrap.transition().call(distroplot);

            defsEnter.append('clipPath')
                .attr('id', 'nv-x-label-clip-' + distroplot.id())
                .append('rect');

            g.select('#nv-x-label-clip-' + distroplot.id() + ' rect')
                .attr('width', x.rangeBand() * (staggerLabels ? 2 : 1))
                .attr('height', 16)
                .attr('x', -x.rangeBand() / (staggerLabels ? 1 : 2 ));

            // Setup Axes
            if (showXAxis) {
                xAxis
                    .scale(x)
                    .ticks( nv.utils.calcTicksX(availableWidth/100, data) )
                    .tickSize(-availableHeight, 0);

                g.select('.nv-x.nv-axis').attr('transform', 'translate(0,' + y.range()[0] + ')')
                g.select('.nv-x.nv-axis').call(xAxis);

                //g.select('.nv-x.nv-axis').select('.nv-axislabel')
                //    .style('font-size', d3.min([availableWidth * 0.05,20]) + 'px')

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

                //g.select('.nv-y.nv-axis').select('.nv-axislabel')
                //    .style('font-size', d3.min([availableHeight * 0.05,20]) + 'px')
            }




            // Zero line on chart bottom
            g.select('.nv-zeroLine line')
                .attr('x1',0)
                .attr('x2',availableWidth)
                .attr('y1', y(0))
                .attr('y2', y(0))
            ;

            // store original values so that we can
            // call 'recalcData()' if needed
            colorGroup0 = distroplot.options().colorGroup();
            x0 = distroplot.options().x();
            y0 = distroplot.options().y();
            bandwidth0 = distroplot.options().bandwidth();
            resolution0 = distroplot.options().resolution();
            clampViolin0 = distroplot.options().clampViolin();

            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------

        });

        renderWatch.renderEnd('nv-distroplot chart immediate');
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    distroplot.dispatch.on('elementMouseover.tooltip', function(evt) {
        tooltip.data(evt).hidden(false);
    });

    distroplot.dispatch.on('elementMouseout.tooltip', function(evt) {
        tooltip.data(evt).hidden(true);
    });

    distroplot.dispatch.on('elementMousemove.tooltip', function(evt) {
        tooltip();
    });

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.distroplot = distroplot;
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
        defaultState:    {get: function(){return defaultState;}, set: function(_){defaultState=_;}},

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
            distroplot.duration(duration);
            xAxis.duration(duration);
            yAxis.duration(duration);
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
            distroplot.color(color);
        }},
        rightAlignYAxis: {get: function(){return rightAlignYAxis;}, set: function(_){
            rightAlignYAxis = _;
            yAxis.orient( (_) ? 'right' : 'left');
        }},
        xLabel:  {get: function(){return xLabel;}, set: function(_){
            xLabel=_;
            xAxis.axisLabel(xLabel);
        }},
        yLabel:  {get: function(){return yLabel;}, set: function(_){
            yLabel=_;
            yAxis.axisLabel(yLabel);
        }},
    });


    nv.utils.inheritOptions(chart, distroplot);
    nv.utils.initOptions(chart);

    return chart;
};

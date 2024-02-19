
filenames= [
    "nv.d3.intro.js",
    "nv.d3.utils.js",
    "nv.d3.axis.js",
    "nv.d3.boxPlot.js",
    "nv.d3.boxPlot.grouped.js",
    #"nv.d3.bullet.js",
    #"nv.d3.candlestick.js",
    #"nv.d3.cumulativeLineChart.js",
    #"nv.d3.discreteBar.js",
    #"nv.d3.distribution.js",
    "nv.d3.focus.js",
    #"nv.d3.forceDirectedGraph.js",
    #"nv.d3.furiousLegend.js",
    #"nv.d3.heatMap.js",
    #"nv.d3.historicalBar.js",
    "nv.d3.legend.js",
    "nv.d3.line.js",
    #"nv.d3.linePlusBarChart.js",
    #"nv.d3.lineWithFocusChart.js",
    "nv.d3.multiBar.js",
    #"nv.d3.multiBarHorizontal.js",
    "nv.d3.multiChart.js",
    #"nv.d3.ohlc.js",
    #"nv.d3.parallelCoordinates.js",
    #"nv.d3.pie.js",
    #"nv.d3.sankey.js",
    "nv.d3.scatter.js",
    #"nv.d3.scatterChart.js",
    #"nv.d3.sparkline.js",
    "nv.d3.stackedArea.js",
    #"nv.d3.sunburst.js",
    "nv.d3.outro.js"
]
with open("../nv.d3.js", "w") as outfile:
    for fname in filenames:
        with open(fname) as infile:
            for line in infile:
                outfile.write(line)

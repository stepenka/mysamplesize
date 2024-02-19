nv.models.lineWithFocusChart = function() {
  return nv.models.lineChart()
    .margin({ bottom: 30 })
    .focusEnable( true );
};

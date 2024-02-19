(function() {
    'use strict';

    angular
        .module('tempestApp')
        .service('plotsService', [ plotsService]);

function plotsService() {
    
    // this is for data saving / loading when using data analysis
    this.dataIn = [];
    
    this.updateData = function(data) {
        this.dataIn = data;
    };
    
    // this is for the Help section
    this.help = {
        simPlotData: []
    };
 }    
})();
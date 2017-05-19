/**
 * Created by AStaege on 18.05.2017.
 */
$(function () {
    var App = {
        init: function(){
            console.log("any");
            var self = this;

            Quagga.init(this.state, function(err){
                if (err){
                    return self.handleError(err);
                }
                Quagga.start();
            });
        },
        handleError: function(err){
            console.log(err);
        },
        state: {
            inputStream: {
                type : "LiveStream",
                constraints: {
                    width: {min: 800},
                    height: {min: 600},
                    facingMode: "environment",
                    aspectRatio: {min: 1, max: 2}
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            decoder: {
                readers : [{
                    format: "ean_reader",
                    config: {}
                }, {
                    format: "code_39_reader",
                    config: {}
                }]
            },
            locate: true
        },
    };
    App.init();
});
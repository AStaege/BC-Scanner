// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

$$(document).cookie = "x-app=5kbts4hn5u8b3je6p24c2qaot6";

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function () {
    // run createContentPage func after link was clicked
    //$$('.create-page').on('click', function () {
    //    createContentPage();
    //});
    quaggerei();
});

myApp.onPageInit('services', function () {
    // run createContentPage func after link was clicked
    //$$('.create-page').on('click', function () {
    //    createContentPage();
    //});
    sendAjax();
});

// Callbacks to run specific code for specific pages, for example for About page:
var sendAjax = function () {
    var wholeUrl = "https://www.connox.de/shopsuite/warehouse/items/8718164877636?barcode=true";
    console.log("schicke ab");
    $.ajax({
        url: wholeUrl,
        success: function (result) {
            var stu = "es ist etwas zurück gekommen\n" + result;
            console.log(stu);
            $$("#responses").text(stu);
        },
        data: {
            barcode: true
        },
        error: function (err) {
            var st = "hat nicht geklappt\n" + err;
            console.log(st);
            $$("#responses").text(st);
        }
    });
    console.log("abgeschickt");
};

function quaggerei() {
    var App = {
        init: function () {
            var self = this;

            Quagga.init(this.state, function (err) {
                if (err) {
                    return self.handleError(err);
                }
                // TODO this is a onready callback func, but we never get here,
                // so seems to be stuck in init, though camera works (led on)
                App.attachListeners();
                Quagga.start();
            });
        },
        handleError: function (err) {
            console.log("hier gibts nen fehler: " + err);
        },
        attachListeners: function () {
            //var self = this;

            //self.initCameraSelection();
            $$(".controls").on("click", "button.stop", function (e) {
                e.preventDefault();
                Quagga.stop();
                //self._printCollectedResults();
            });
            $$(".navbar-inner").on("click", "a.back", function (e) {
                Quagga.stop();
            });

        },
        inputMapper: {
            inputStream: {
                constraints: function (value) {
                    if (/^(\d+)x(\d+)$/.test(value)) {
                        var values = value.split('x');
                        return {
                            width: {min: parseInt(values[0])},
                            height: {min: parseInt(values[1])}
                        };
                    }
                    return {
                        deviceId: value
                    };
                }
            },
            numOfWorkers: function (value) {
                return parseInt(value);
            },
            decoder: {
                readers: function (value) {
                    if (value === 'ean_extended') {
                        return [{
                            format: "ean_reader",
                            config: {
                                supplements: [
                                    'ean_5_reader', 'ean_2_reader'
                                ]
                            }
                        }];
                    }
                    return [{
                        format: value + "_reader",
                        config: {}
                    }];
                }
            }
        },
        state: {
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: {min: 1280},
                    height: {min: 720},
                    facingMode: "environment",
                    aspectRatio: {min: 1, max: 2}
                }
            },
            locator: {
                patchSize: "x-large",
                halfSample: true,
            },
            numOfWorkers: 4,
            decoder: {
                readers: [{
                    format: "code_39_reader",
                    config: {}
                }, {
                    format: "ean_reader",
                    config: {}
                }]
            },
            locate: true
        },
        lastResult: null
    };
    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: '#F00', lineWidth: 3});
            }
        }
    });
    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        var codeFormat = result.codeResult.format;
        $$("#rescode").text(codeFormat + ": " + code);
        // var wholeUrl = "https://www.connox.de/shopsuite/warehouse/items/" + code + "?barcode=true";
        // console.log("code: " + code);
        /*
         if (App.lastResult !== code) {
         App.lastResult = code;
         var $node = null, canvas = Quagga.canvas.dom.image;

         $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
         $node.find("img").attr("src", canvas.toDataURL());
         $node.find("h4.code").html(code);
         $("#result_strip ul.thumbnails").prepend($node);
         }
         */
    });
    App.init();
}

var dynamicPageIndex = 0;

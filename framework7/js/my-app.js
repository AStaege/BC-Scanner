// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    //$$('.create-page').on('click', function () {
    //    createContentPage();
    //});
    quaggerei();
});

function quaggerei (){
    var App = {
        init: function(){
            var self = this;

            Quagga.init(this.state, function(err){
                if (err){
                    return self.handleError(err);
                }
                // TODO this is a onready callback func, but we never get here,
                // so seems to be stuck in init, though camera works (led on)
                App.attachListeners();
                console.log("läuft");
                Quagga.start();
            });
        },
        handleError: function(err){
            console.log("hier gibts nen fehler: " + err);
        },
        attachListeners: function() {
            var self = this;

            //self.initCameraSelection();
            $$(".controls").on("click", "button.stop", function(e) {
                e.preventDefault();
                Quagga.stop();
                //self._printCollectedResults();
            });

            /* $(".controls .reader-config-group").on("change", "input, select", function(e) {
                e.preventDefault();
                var $target = $(e.target),
                    value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
                    name = $target.attr("name"),
                    state = self._convertNameToState(name);

                console.log("Value of "+ state + " changed to " + value);
                self.setState(state, value);
            });*/
        },
        initCameraSelection: function(){
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();
            console.log("initC");
            return Quagga.CameraAccess.enumerateVideoDevices()
                .then(function(devices) {
                    function pruneText(text) {
                        return text.length > 30 ? text.substr(0, 30) : text;
                    }
                    var $deviceSelection = document.getElementById("deviceSelection");
                    while ($deviceSelection.firstChild) {
                        $deviceSelection.removeChild($deviceSelection.firstChild);
                    }
                    devices.forEach(function(device) {
                        var $option = document.createElement("option");
                        $option.value = device.deviceId || device.id;
                        $option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
                        $option.selected = streamLabel === device.label;
                        $deviceSelection.appendChild($option);
                    });
                });
        },
        inputMapper: {
            inputStream: {
                constraints: function(value){
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
            numOfWorkers: function(value) {
                return parseInt(value);
            },
            decoder: {
                readers: function(value) {
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
                type : "LiveStream",
                constraints: {
                    width: {min: 1280},
                    height: {min: 720},
                    facingMode: "environment",
                    aspectRatio: {min: 1, max: 2}
                }
            },
            locator: {
                patchSize: "x-large",
                halfSample: true
            },
            numOfWorkers: 4,
            decoder: {
                readers : [{
                    format: "ean_reader",
                    config: {}
                },{
                    format: "code_39_reader",
                    config: {}
                }]
            },
            locate: true
        },
        lastResult: null
    };
    Quagga.onProcessed(function(result) {
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
    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;
        var codeFormat = result.codeResult.format;
        $$("#rescode").text(": " + code);
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
function createContentPage() {
    mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
    return;
}
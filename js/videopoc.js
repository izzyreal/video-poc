var spectrumAnalyserEnabled = true;

const fps = 30;
var previousFrameIndex = -1;
const scaleFrames = 20;
var tigers = [];
var audioSource;
var audioCtx;
var paths;
var refRect;
const frameCount = 60;

const initialRectSize = 100;
const maxRectSize = 400;
const rectDistance = 20;
const rectBorderRadius = 10;

const maxRectangleCount = 80;
const initialRectangleCount = 40;
var visibleRectangleCount = initialRectangleCount;

const maxTigerCount = 10;
const initialTigerCount = 1;
var visibleTigerCount = initialTigerCount;

var bonusMode = false;

function getVideo() {
    return document.getElementById(bonusMode ? 'video-bonus' : 'video');
}

let videopoc = {

    timerCallback: function () {
        var frameIndex = Math.floor(getVideo().currentTime * fps);

        if (frameIndex != previousFrameIndex) {
            this.drawFrame(frameIndex);
        }

        previousFrameIndex = frameIndex;

        let self = this;

        setTimeout(function () {
            self.timerCallback();
        }, 0);
    },

    doLoad: function () {
        this.finalCanvas = document.getElementById("final");
        this.finalCanvasContext = this.finalCanvas.getContext("2d");
        this.finalCanvasContext.imageSmoothingEnabled = false;
        let self = this;
        getVideo().addEventListener("play", function () {
            self.timerCallback();
        }, false);
    },

    drawFrame: function (frameIndex) {
        if (!paths) return;
        
        const video = getVideo();
        
        if (video.paused) return;

        for (var i = 0; i < visibleRectangleCount; i++) {
            var toAdd = (i > 40) ? 300 : 0;
            var toSubtract = (i > 40) ? 40 * rectDistance : 0;
            paths[i].position = new paper.Point(((frameIndex % frameCount) * 10) + (maxRectSize / 2) + toAdd, (maxRectSize / 2) + i * rectDistance - toSubtract);
            paths[i].rotate(3)
            paths[i].scale(1.04, 1.04);
            if (frameIndex % frameCount === 0 || paths[i].bounds.width > maxRectSize) {
                paths[i].bounds.width = initialRectSize;
                paths[i].bounds.height = initialRectSize;
            }
        }
        refRect.position = new paper.Point(((frameIndex % frameCount) * 10 + (initialRectSize / 2)), initialRectSize / 2);

        for (var i = 0; i < visibleTigerCount; i++) {
            if (tigers[i]) tigers[i].rotate(3);
        }

        this.finalCanvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        this.finalCanvasContext.drawImage(offscreen, 0, 0, video.videoWidth, video.videoHeight);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    videopoc.doLoad();
});

window.onload = function () {
    const offscreen = document.getElementById("offscreen");
    paper.setup(offscreen);
    paths = []
    for (var i = 0; i < maxRectangleCount; i++) {
        var rect = new paper.Rectangle(new paper.Point(0, i * rectDistance), new paper.Size(initialRectSize, initialRectSize))
        var path = new paper.Path.Rectangle(rect, new paper.Size(rectBorderRadius, rectBorderRadius));
        path.strokeColor = '#AA602099';
        path.strokeWidth = 10;
        path.fillColor = rainbow[i];
        path.opacity = 0.2;
        if (i >= initialRectangleCount) {
            path.visible = false;
        }
        paths.push(path);
    }

    refRect = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0, 0), new paper.Size(initialRectSize, initialRectSize)));
    refRect.strokeColor = '#FFFFFF';
    refRect.strokeWidth = 1;

    var url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/tiger.svg`
    if (maxTigerCount > 0) {
        paper.project.importSVG(url, function (item) {
            tiger = item
            tiger.scale(0.5)
            tiger.opacity = 0.7;
            tiger.position = new paper.Point(tiger.bounds.width / 2 + 1100, tiger.bounds.height / 2 + 300)
            if (initialTigerCount < 1) tiger.visible = false;
            tigers.push(tiger)

            for (var i = 1; i < maxTigerCount; i++) {
                var clone = item.clone(true);
                clone.position = new paper.Point(Math.floor(Math.random() * 1920), Math.floor(Math.random() * 1080))
                clone.scale((i + 1) * .515 * 0.32, (i + 1) * .515 * 0.32)
                if (i >= initialTigerCount) clone.visible = false;
                tigers.push(clone);
            }
        })
    }

    audioCtx = new AudioContext();
    var el = document.getElementById('audio');
    el.crossOrigin = 'anonymous';
    audioSource = audioCtx.createMediaElementSource(el);

    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    var canvas = document.getElementById("final");
    var canvasCtx = canvas.getContext("2d");

    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);
    var rainbowCounter = 0;

    function draw() {

        requestAnimationFrame(draw);
        if (!spectrumAnalyserEnabled || !bonusMode) return;
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.lineWidth = 2;
        var color = rainbow[rainbowCounter++];
        if (rainbowCounter == 80) rainbowCounter = 0;

        canvasCtx.strokeStyle = color + "50";

        canvasCtx.beginPath();

        var sliceWidth = canvas.width * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 150.0;
            var y = v * canvas.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        var height = 2500;
        canvasCtx.lineTo(canvas.width, height / 2);
        canvasCtx.stroke();

        var barWidth = (canvas.width / bufferLength) * 25;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            if (dataArray[i] < 130) continue;
            var value = dataArray[i] * 22;
            canvasCtx.fillStyle = 'rgba(255, ' + (10 + i) + ', 30, 0.3)';
            canvasCtx.fillRect(x, height - value / 2, barWidth, value);

            x += barWidth + 3;
            if (x > 1920) break;
        }

    }

    draw();
}

var size = 80;
var rainbow = new Array(size);

for (var i = 0; i < size; i++) {
    var red = sin_to_hex(i, 0 * Math.PI * 2 / 3); // 0   deg
    var blue = sin_to_hex(i, 1 * Math.PI * 2 / 3); // 120 deg
    var green = sin_to_hex(i, 2 * Math.PI * 2 / 3); // 240 deg

    rainbow[i] = "#" + red + green + blue;
}

function sin_to_hex(i, phase) {
    var sin = Math.sin(Math.PI / size * 2 * i + phase);
    var int = Math.floor(sin * 127) + 128;
    var hex = int.toString(16);

    return hex.length === 1 ? "0" + hex : hex;
}

document.querySelector('audio').addEventListener('play', function () {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(function () {
            let audio = document.getElementById('audio');
            audio.play();
        });
    } else {
        let audio = document.getElementById('audio');
        audio.play();
    }
});
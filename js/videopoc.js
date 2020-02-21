var spectrumAnalyserEnabled = true;

const fps = 30;
var previousFrameIndex = -1;
const rectSize = 100;
const scaleFrames = 20;
var tigers = [];
var audioSource;
var audioCtx;
var paths;
const frameCount = 60;

const maxRectangleCount = 80;
const initialRectangleCount = 40;
var visibleRectangleCount = initialRectangleCount;

const maxTigerCount = 10;
const initialTigerCount = 1;
var visibleTigerCount = initialTigerCount;

let videopoc = {

    timerCallback: function () {
        if (this.video.paused || this.video.ended) {
            return;
        }
        var frameIndex = Math.floor(this.video.currentTime * fps);

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
        this.video = document.getElementById("video");
        this.finalCanvas = document.getElementById("final");
        this.finalCanvasContext = this.finalCanvas.getContext("2d");
        let self = this;
        this.video.addEventListener("play", function () {
            self.width = self.video.videoWidth;
            self.height = self.video.videoHeight;
            self.timerCallback();
        }, false);
    },

    drawFrame: function (frameIndex) {
        if (!paths) return;
        this.finalCanvasContext.drawImage(this.video, 0, 0, this.width, this.height);
        for (var i = 0; i < visibleRectangleCount; i++) {
            var toAdd = (i > 40) ? 300 : 0;
            var toSubtract = (i > 40) ? 40 * 20 : 0;
            paths[i].position = new paper.Point(((frameIndex % frameCount) * 10) + (rectSize / 2) + toAdd, (rectSize / 2) + i * 20 - toSubtract);
            paths[i].rotate(3)
            paths[i].scale(1.04, 1.04);
            if (frameIndex % frameCount === 0 || paths[i].bounds.width > 400) {
                paths[i].bounds.width = rectSize;
                paths[i].bounds.height = rectSize;
            }
        }

        for (var i = 0; i < visibleTigerCount; i++) {
            if (tigers[i]) tigers[i].rotate(3);
        }
        this.finalCanvasContext.imageSmoothingEnabled = false;
        this.finalCanvasContext.drawImage(offscreen, 0, 0, this.width, this.height);
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
        var rect = new paper.Rectangle(new paper.Point(0, i * 20), new paper.Size(rectSize, rectSize))
        var path = new paper.Path.Rectangle(rect, new paper.Size(20, 20));
        path.strokeColor = '#AA602099';
        path.strokeWidth = 10;
        path.fillColor = rainbow[i];
        path.opacity = 0.2;
        if (i >= initialRectangleCount) {
            path.visible = false;
        }
        paths.push(path);
    }

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
        if (!spectrumAnalyserEnabled) return;
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
const fps = 30;
var previousFrameIndex = -1;
const rectSize = 100;
const scaleFrames = 20;
var tiger;
var clones = [];
var audioSource;
var audioCtx;
var paths;
const frameCount = 60;

let videopoc = {
  
    timerCallback: function() {
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
  
    doLoad: function() {
      this.video = document.getElementById("video");
      this.finalCanvas = document.getElementById("final");
      this.finalCanvasContext = this.finalCanvas.getContext("2d");
      let self = this;
      this.video.addEventListener("play", function() {
          self.width = self.video.videoWidth;
          self.height = self.video.videoHeight;
          self.timerCallback();
        }, false);
    },
  
    drawFrame: function(frameIndex) {
      if (!paths) return;
      this.finalCanvasContext.drawImage(this.video, 0, 0, this.width, this.height);
      for (var i = 0; i < 80; i++) {
        var toAdd = (i > 40) ? 300 : 0;
        var toSubtract = (i > 40) ? 40 * 20 : 0;
        paths[i].position = new paper.Point(((frameIndex % frameCount) * 10) + (rectSize / 2) + toAdd, (rectSize / 2) + i * 20 - toSubtract);
        if (i > 0) {
          paths[i].rotate(3)  
          paths[i].scale(1.04, 1.04);
          if (frameIndex % frameCount === 0 || paths[i].bounds.width > 400) {
            paths[i].bounds.width = rectSize;
            paths[i].bounds.height = rectSize;
          }
        };
      }
      if (tiger) tiger.rotate(3);
      for (var c of clones) {
        if (c) c.rotate(Math.random() * 10);
      }
      this.finalCanvasContext.imageSmoothingEnabled = false;
      this.finalCanvasContext.drawImage(offscreen, 0, 0, this.width, this.height);
    }
  };

document.addEventListener("DOMContentLoaded", () => {
  processor.doLoad();
});

window.onload = function() {
  const offscreen = document.getElementById("offscreen");
  paper.setup(offscreen);
  paths = []
  for (var i = 0; i < 80; i++) {
    var rect = new paper.Rectangle(new paper.Point(0, i * 20), new paper.Size(rectSize, rectSize))
    var path = new paper.Path.Rectangle(rect, new paper.Size(20, 20));
    // var path = new paper.Path.Rectangle(rect);
    path.strokeColor = '#AA602099';
    // path.strokeColor = '#AA6020';
    path.strokeWidth = 10;
    path.fillColor = rainbow[i];
    path.opacity = 0.1;
    // path.fillColor = '#337337'
    // path.strokeColor = 'white'
    paths.push(path);
  }

  var url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/tiger.svg`
  var url = `https://raw.githubusercontent.com/izzyreal/video-poc/master/apple.svg`
  paper.project.importSVG(url, function(item) {
    tiger = item
    tiger.scale(0.5)
    tiger.opacity = 0.7;
    tiger.position = new paper.Point(tiger.bounds.width/2 + 1100, tiger.bounds.height/2 + 300)
    
    for (var i = 0; i < 1; i++) {
      var clone = item.clone(true);
      clone.position = new paper.Point(Math.floor(Math.random() * 1920), Math.floor(Math.random() * 1080))
      clone.scale((i+1) * .515 * 0.32, (i+1) * .515 * 0.32)
      clones.push(clone);
    }
  })

  audioCtx = new AudioContext();
  var el = document.getElementById('audio-source');
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

    for(var i = 0; i < bufferLength; i++) {
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

var size    = 80;
var rainbow = new Array(size);

for (var i=0; i<size; i++) {
  var red   = sin_to_hex(i, 0 * Math.PI * 2/3); // 0   deg
  var blue  = sin_to_hex(i, 1 * Math.PI * 2/3); // 120 deg
  var green = sin_to_hex(i, 2 * Math.PI * 2/3); // 240 deg

  rainbow[i] = "#"+ red + green + blue;
}

function sin_to_hex(i, phase) {
  var sin = Math.sin(Math.PI / size * 2 * i + phase);
  var int = Math.floor(sin * 127) + 128;
  var hex = int.toString(16);

  return hex.length === 1 ? "0"+hex : hex;
}

document.querySelector('button').addEventListener('click', function() {
  audioCtx.resume().then(() => {
    console.log('Playback resumed successfully');
    var el = document.getElementById('audio-source');
    el.setAttribute("style", "visibility: hidden;");
    el = document.getElementById('button');
    el.setAttribute("style", "visibility: hidden;");
  });
});
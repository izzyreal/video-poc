

const times = [];

function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    let fps = times.length;
    const fpsString = String(fps);
    document.getElementById("fps-p").textContent = "fps:";
    document.getElementById("fps-p").textContent += 'fps: ' + fpsString.length >=2 ? '' : ' ' + fpsString;
    refreshLoop();
  });
}

refreshLoop();


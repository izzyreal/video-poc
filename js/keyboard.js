

document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'h':
            hideShow('help'); break;
        case 't':
            for (var i = 0; i < visibleTigerCount; i++) tigers[i].visible = !tigers[i].visible; break;
        case 's':
            spectrumAnalyserEnabled = !spectrumAnalyserEnabled; break;
        case 'o':
            for (var p of paths) {
                if (p.opacity === '1.0') {
                    p.opacity = '0.2';
                } else {
                    p.opacity = '1.0';
                }
            }
            break;
        case 'b':
            bonusMode = !bonusMode;
            hideShow('audio')
            break;
        case '1':
            if (visibleTigerCount == 0) return;
            visibleTigerCount -= 1;
            tigers[visibleTigerCount].visible = false;
            break;
        case '2':
            if (visibleTigerCount == maxTigerCount) return;
            tigers[visibleTigerCount].visible = true;
            visibleTigerCount += 1;
            break;
        case '3':
            if (visibleRectangleCount == 0) return;
            visibleRectangleCount -= 1;
            paths[visibleRectangleCount].visible = false;
            break;
        case '4':
            if (visibleRectangleCount == maxRectangleCount) return;
            paths[visibleRectangleCount].visible = true;
            visibleRectangleCount += 1;
            break;
    }
});

function hideShow(elementId) {
    let el = document.getElementById(elementId)
    let style = window.getComputedStyle(el)
    let newValue = style.visibility === 'hidden' ? 'visible' : 'hidden';
    el.style.visibility = newValue
}

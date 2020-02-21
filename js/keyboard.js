

document.addEventListener('keydown', function(event) {
    if (event.key === 'h') {
        hideShow('help');
    } else if (event.key === 't') {
        for (var t of tigers) t.visible = !t.visible;
    } else if (event.key === 's') {
        spectrumAnalyserEnabled = !spectrumAnalyserEnabled
    }
});

function hideShow(elementId) {
    let el = document.getElementById(elementId)
    let style = window.getComputedStyle(el)
    let newValue = style.visibility === 'hidden' ? 'visible' : 'hidden';
    el.style.visibility = newValue
}

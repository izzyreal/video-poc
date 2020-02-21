

document.addEventListener('keydown', function(event) {
    console.log(event);
    if (event.key === 'h') {
        hideShow('help');
    } else if (event.key === 't') {
        tiger.visible = !tiger.visible;
        for (var c of clones) c.visible = !c.visible;
    } else if (event.key === 's') {
        spectrumAnalyserEnabled = !spectrumAnalyserEnabled
    }
});

function hideShow(elementId) {
    let el = document.getElementById(elementId)
    let style = window.getComputedStyle(el)
    let newValue = style.display === 'none' ? 'block' : 'none';
    el.setAttribute('style', 'display: ' + newValue)
}

/* =========================================================
   Start
   ========================================================= */
function start() {
  const loading = document.getElementById('loading');

  if (typeof THREE === 'undefined') {
    loading.textContent = 'Three.js fehlt. Liegt lib/three.min.js neben index.html? Siehe lib/LIESMICH.txt.';
    return;
  }
  if (typeof THREE.OrbitControls !== 'function') {
    loading.textContent = 'OrbitControls fehlt. Liegt lib/OrbitControls.js neben index.html? Siehe lib/LIESMICH.txt.';
    return;
  }

  initScene(document.getElementById('canvas-container'));
  initSharedResources();
  // Bewusst ohne Gelände starten: der Nutzer lädt zuerst eine Datei.
  initUI();
  updateInfoBar();

  if (typeof GeoTIFF === 'undefined') {
    setFileStatus('dem', 'lib/geotiff.js fehlt – Geländeimport nicht möglich', 'err');
  }

  loading.style.display = 'none';

  // Beispieldatensatz, wenn die Adresse ?demo=1 enthält
  if (demoRequested()) loadDemo();

  function animate() {
    requestAnimationFrame(animate);
    updateControls();
    updatePointLabel();
    updateCompass();
    renderer.render(scene, camera);
  }
  animate();
}

try {
  start();
} catch (err) {
  const el = document.getElementById('loading');
  el.style.display = 'flex';
  el.textContent = 'Fehler beim Start: ' + err.message;
  if (typeof console !== 'undefined' && console.error) console.error(err);
}

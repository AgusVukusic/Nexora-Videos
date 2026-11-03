const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve(__dirname, 'results');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function makeCaseHtml(cfgKey, camCss, localTop, localBottom, title, outName) {
  const isBloque = cfgKey.includes('bloque');
  const hasPers = cfgKey.includes('con_personaje') || cfgKey.includes('pers');
  const lienzoTrans = isBloque
    ? (hasPers ? 'translate(0px, 230px) scale(0.860465)' : 'translate(0px, 360px) scale(1)')
    : (hasPers ? 'none' : 'translate(0px, 90px) scale(1)');

  const subStyle = isBloque
    ? 'left: 130px; top: 210px; width: 870px; height: 255px;'
    : 'left: 20px; width: 1040px; top: 1077px; height: 85px;';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1080px; height: 1920px; background: #0b0f19; overflow: hidden; position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  #root-container { width: 1080px; height: 1920px; position: absolute; }
  .absolute-fill { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  #capa-ui { z-index: 20; transform-origin: 540px 768px; transform: ${camCss}; }
  #lienzo { transform-origin: 540px 640px; transform: ${lienzoTrans}; }
  #content { position: absolute; left: 60px; top: ${localTop}px; width: 960px; height: ${localBottom - localTop}px; background: rgba(0, 200, 100, 0.25); border: 4px dashed #00c864; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px; font-weight: bold; }
  #content-left { position: absolute; left: 60px; top: ${localTop}px; width: 460px; height: ${960 - localTop}px; background: rgba(255, 200, 0, 0.35); border: 4px solid #ffc800; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: bold; }
  #subtitulos { position: absolute; z-index: 50; background: rgba(0, 120, 255, 0.4); border: 4px solid #0078ff; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px; font-weight: bold; ${subStyle} }
  #personaje { position: absolute; z-index: 44; left: 80px; width: 440px; top: 1262px; height: 658px; background: rgba(255, 60, 60, 0.35); border: 4px solid #ff3c3c; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px; font-weight: bold; }
  #hud { position: absolute; top: 40px; left: 60px; z-index: 100; color: #00ffcc; font-size: 34px; font-weight: bold; text-shadow: 0 2px 8px #000; }
  #hud-info { position: absolute; top: 90px; left: 60px; z-index: 100; color: #ffffff; font-size: 24px; opacity: 0.85; }
</style>
</head>
<body>
<div id="root-container">
  <div id="hud">${title}</div>
  <div id="hud-info">Validación Visual Chromium Headless — Etapa 41A.4</div>
  <div id="capa-ui" class="absolute-fill">
    <div id="lienzo" class="absolute-fill">
      <div id="content">Área de Composición (y &le; ${localBottom}px)</div>
      ${isBloque ? '<div id="content-left">Sector Izq (y &le; 960px)</div>' : ''}
    </div>
  </div>
  ${hasPers ? '<div id="personaje">SILUETA PERSONAJE (Y &ge; 1262px)</div>' : ''}
  <div id="subtitulos">SUBTÍTULOS</div>
</div>
</body>
</html>`;

  const htmlPath = path.resolve(outDir, outName + '.html');
  fs.writeFileSync(htmlPath, html);
  const shotPath = path.resolve(outDir, outName + '.png');
  const cmd = `"${CHROME}" --headless=new --window-size=1080,1920 --screenshot="${shotPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;
  execSync(cmd);
  console.log('Captura generada:', shotPath);
}

makeCaseHtml(
  'linea_con_personaje',
  'scale(1.12)',
  210,
  1040,
  'CASO 1: Línea c/Personaje en Travel-In (f=90, S=1.12)',
  'screenshot_case1_linea_travel_in'
);

makeCaseHtml(
  'bloque_con_personaje',
  'scale(1.15) translate(0px, -20px)',
  250,
  1040,
  'CASO 2: Bloque c/Personaje en Zoom-In (f=90, S=1.15, ty=-20)',
  'screenshot_case2_bloque_zoom_in'
);

makeCaseHtml(
  'bloque_con_personaje',
  'scale(1.12)',
  250,
  1040,
  'CASO 3: Bloque c/Personaje en Travel-In (f=90, S=1.12)',
  'screenshot_case3_bloque_travel_in'
);

console.log('Todas las capturas de inspección visual generadas con éxito.');

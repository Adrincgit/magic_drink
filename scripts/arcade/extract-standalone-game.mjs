import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const source=process.cwd(),target=path.resolve(process.argv[2]||'../hexy-lost-chorus');
if(target===source||target.startsWith(source+path.sep))throw Error('Choose a separate project folder.');
try{await fs.access(target);throw Error('Destination already exists; refusing to overwrite it.');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.mkdir(target,{recursive:true});
const copied=new Set(),code=new Map();
async function write(file,text){await fs.mkdir(path.dirname(path.join(target,file)),{recursive:true});await fs.writeFile(path.join(target,file),text);}
async function copy(file){if(copied.has(file))return;await fs.mkdir(path.dirname(path.join(target,file)),{recursive:true});await fs.copyFile(path.join(source,file),path.join(target,file));copied.add(file);}
async function list(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await list(p));else out.push(p);}return out;}
async function tree(dir,filter=()=>true){for(const p of await list(path.join(source,dir))){const rel=path.relative(source,p).replaceAll('\\','/');if(filter(rel))await copy(rel);}}
async function module(file){
 file=file.replaceAll('\\','/');if(code.has(file))return;
 let text=await fs.readFile(path.join(source,file),'utf8');
 if(file==='src/components/global/IllustratedMenu.jsx')text=text.replace(/^import \{ ArcadeWallet \}[^\n]+\n/m,'').replace(/  const destinations =[^\n]+/,"  const destinations = [['/', en ? 'Game title' : 'Título del juego']];").replace('    <ArcadeWallet en={en} />','');
 if(file==='src/data/variables.js')text="import {atom} from 'nanostores';\nexport const isEnglish=atom(typeof localStorage!=='undefined'&&localStorage.getItem('lang')==='en');\n";
 code.set(file,text);await write(file,text);copied.add(file);
 for(const m of text.matchAll(/(?:from\s*|import\s*\(?)["'](\.[^"']+)["']/g)){
  const base=path.resolve(source,path.dirname(file),m[1]);let found;
  for(const ext of ['', '.js','.jsx','.json','.css','.mjs'])try{if((await fs.stat(base+ext)).isFile()){found=path.relative(source,base+ext);break;}}catch{}
  if(found){if(/\.(jsx?|mjs|css)$/.test(found))await module(found);else await copy(found.replaceAll('\\','/'));}
 }
}
for(const dir of ['src/components/arcade/adventure','src/components/arcade/shared'])for(const f of await list(path.join(source,dir))){const rel=path.relative(source,f);if(/\.(jsx?|css)$/.test(f))await module(rel);else await copy(rel.replaceAll('\\','/'));}
await tree('public/arcade',p=>!p.includes('/for replace/')&&!p.includes('/references_temp/'));
const assetDirs=new Set();
for(const text of code.values())for(const m of text.matchAll(/["'`(](\/(?:image|fonts|icons)\/[^"'`)\s$]*)/g)){
 let p='public'+m[1].split('?')[0];
 try{const st=await fs.stat(path.join(source,p));if(st.isFile())await copy(p);else assetDirs.add(p);}catch{const dir=path.posix.dirname(p);try{if((await fs.stat(path.join(source,dir))).isDirectory())assetDirs.add(dir);}catch{}}
}
for(const dir of assetDirs)await tree(dir);
for(const f of ['Bakesoda.otf','InterVariable.woff2','OldPress.woff2','CatamaranRegular.woff2'])await copy('public/fonts/'+f);
await tree('scripts/arcade',p=>p!== 'scripts/arcade/extract-standalone-game.mjs');
await tree('context/arcade',p=>!(/\.(webm|mp4|pid)$|\/review\/|playback|(?:-log|tests)\.txt$/.test(p)));
await tree('public/arcade/references_temp');
const testFiles=(await fs.readdir(path.join(source,'tests'))).filter(f=>f.endsWith('.js'));
for(const f of testFiles){if(f==='arcade-visual-isolation.spec.js')continue;const text=await fs.readFile(path.join(source,'tests',f),'utf8');if(text.includes('components/arcade/')||text.includes("'/arcade")||f.startsWith('arcade-'))await copy('tests/'+f);}
await copy('tsconfig.json');
const installed=JSON.parse(await fs.readFile('package-lock.json','utf8')).packages;
const versions=names=>Object.fromEntries(names.map(n=>[n,installed['node_modules/'+n].version]));
await write('package.json',JSON.stringify({name:'hexy-lost-chorus',version:'0.1.0',private:true,type:'module',scripts:{dev:'astro dev',start:'astro dev',build:'astro check && astro build',preview:'astro preview',test:'playwright test','test:nightmare':'playwright test hexy-nightmare','review:duel':'node scripts/arcade/review-nightmare-clock.mjs'},dependencies:versions(['astro','@astrojs/react','react','react-dom','@nanostores/react','nanostores']),devDependencies:versions(['@astrojs/check','typescript','@types/react','@types/react-dom','@playwright/test','sharp'])},null,2)+'\n');
await write('astro.config.mjs',`import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({devToolbar:{enabled:false},server:{host:'127.0.0.1',port:4322},integrations:[react(),{name:'isolated-cache',hooks:{'astro:config:setup':({command,updateConfig})=>updateConfig({vite:{cacheDir:'node_modules/.vite-game/'+command}})}}],vite:{server:{strictPort:true,watch:{ignored:['**/context/**','**/tests/results/**','**/tests/artifacts/**','**/dist/**']}}}});
`);
const page=`---
import HexyAdventure from '../components/arcade/adventure/HexyAdventure.jsx';
import '../styles/game.css';
---
<!doctype html><html lang="es"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#171121"/><title>Hexy & the Lost Chorus</title><link rel="icon" href="/arcade/sprites/ui/magic-gem.webp"/></head><body><HexyAdventure client:load/><noscript>Activa JavaScript para jugar a Hexy &amp; the Lost Chorus.</noscript></body></html>
`;
await write('src/pages/index.astro',page);await write('src/pages/arcade.astro',page);
await write('src/styles/game.css',`@font-face{font-family:BakeSoda;src:url('/fonts/Bakesoda.otf') format('opentype');font-display:swap}
@font-face{font-family:Inter;src:url('/fonts/InterVariable.woff2') format('woff2');font-weight:100 900;font-display:swap}
@font-face{font-family:OldPress;src:url('/fonts/OldPress.woff2') format('woff2');font-display:swap}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#171121;color:#fff0c7;font-family:Inter,sans-serif}button,input{font:inherit}button{cursor:pointer}a{color:inherit}button:disabled{cursor:default}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #ffe4a1;outline-offset:3px}
`);
const config=await fs.readFile('playwright.config.js','utf8');await write('playwright.config.js',config.replace("process.env.MAGIC_DRINK_TEST_URL || 'http://localhost:4321'","process.env.HEXY_TEST_URL || 'http://localhost:4322'").replace("  outputDir:","  webServer: { command: 'npm run dev', url: 'http://localhost:4322', reuseExistingServer: !process.env.CI, timeout: 120000 },\n  outputDir:"));
// Historical review scripts used a fixed port. In this project they target
// the independent runtime; test imports and public paths remain compatible.
for(const dir of ['scripts/arcade','tests'])for(const p of await list(path.join(target,dir)))if(/\.(mjs|js)$/.test(p)){const t=await fs.readFile(p,'utf8');await fs.writeFile(p,t.replaceAll('http://localhost:4321','http://localhost:4322').replaceAll('http://127.0.0.1:4321','http://127.0.0.1:4322'));}
await write('.gitignore','node_modules/\ndist/\n.astro/\n.env*\n!.env.example\ntests/results/\ntests/artifacts/\ntest-results/\nplaywright-report/\n*.log\n*.pid\n');
await write('AGENTS.md',`# Hexy & the Lost Chorus

Proyecto independiente del videojuego. La fuente principal de trabajo está aquí; no importar archivos de Magic Drink ni crear enlaces a sus dependencias.

Leer src/components/arcade/adventure/AGENTS.md antes de cambiar combate, animaciones o arte. Conservar campañas, progreso, tienda, controles y audio. El portal de Magic Drink vive en otro proyecto.

Validar cambios de lógica con Playwright; cambios visuales con capturas y grabaciones decodificadas. Ejecutar npm run build y exigir cero errores. Servidor: puerto 4322. No introducir barras de vida enemigas.
`);
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await write('context/extraction.json',JSON.stringify({source,checkpoint:commit,created:new Date().toISOString(),includesUncommittedDuelFixes:true,copiedFiles:copied.size,entry:'/',compatibilityEntry:'/arcade',port:4322,sourceModules:[...code.keys()],additionalAssetDirectories:[...assetDirs]},null,2));
await write('README.md',`# Hexy & the Lost Chorus

Videojuego independiente: campañas, combate, sprites, música, tienda y herramientas de arte. Copia autónoma extraída de Magic Drink (checkpoint ${commit.slice(0,7)}), con la corrección del reloj y del contacto de rayos posterior al checkpoint.

## Desarrollo

\`\`\`powershell
npm ci
npm run dev
\`\`\`

Abrir http://localhost:4322. La ruta /arcade se conserva para las pruebas existentes. Este proyecto no depende de la carpeta magicdrink. El juego conserva el formato de sus partidas; el navegador almacena el progreso por origen, por lo que el puerto 4322 tiene su propio guardado.

## Comprobación

\`\`\`powershell
npm run build
npm run test:nightmare
npm run review:duel
\`\`\`

Código: src/components/arcade. Recursos: public/arcade y recursos de escenario referenciados en public/image. Pruebas: tests. Fuentes de arte, prompts y decisiones: context/arcade. Herramientas: scripts/arcade. Reglas visuales y de combate: src/components/arcade/adventure/AGENTS.md.

La extracción deja la versión del portal intacta. A partir de aquí, el desarrollo independiente se realiza en esta carpeta. No hay sincronización automática entre proyectos ni repositorio remoto configurado.
`);
console.log(JSON.stringify({target,copiedFiles:copied.size,sourceModules:code.size,additionalAssetDirectories:[...assetDirs]},null,2));

import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import {sanitizeAudioSettings} from '../src/components/arcade/shared/arcadeAudioSettings';

const folder='tests/artifacts/arcade/gamepad-and-audio/';
test.beforeEach(async({page})=>{page.runtimeErrors=[];page.on('pageerror',error=>page.runtimeErrors.push(error.message));});
test.afterEach(async({page})=>{expect(page.runtimeErrors).toEqual([]);});
async function setup(page){
 await page.addInitScript(()=>{
  window.virtualPad=null;
  Object.defineProperty(navigator,'getGamepads',{value:()=>{if(window.denyGamepads)throw new DOMException('Blocked','SecurityError');return[null,window.virtualPad];}});
  const createGain=AudioContext.prototype.createGain;window.arcadeGains=[];
  AudioContext.prototype.createGain=function(){const gain=createGain.call(this);window.arcadeGains.push(gain);return gain;};
 });
 await page.goto('/arcade');await openAdventureMenu(page);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});
}
async function connect(page,mapping='standard'){
 await page.evaluate(mapping=>{window.virtualPad={id:'Xbox test controller',index:1,connected:true,mapping,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};},mapping);
 await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state',mapping==='standard'?'connected':'unsupported');await page.waitForTimeout(80);
}
async function buttons(page,ids){await page.evaluate(ids=>{window.virtualPad.buttons.forEach((button,i)=>{button.pressed=ids.includes(i);button.value=button.pressed?1:0;});},ids);}
async function tap(page,id){await buttons(page,[id]);await page.waitForTimeout(90);await buttons(page,[]);await page.waitForTimeout(90);}
async function axes(page,x,y=0){await page.evaluate(([x,y])=>{window.virtualPad.axes[0]=x;window.virtualPad.axes[1]=y;},[x,y]);}
async function practice(page){await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.waitForTimeout(100);}
const number=async(page,key)=>Number(await page.locator('[data-adventure-canvas]').getAttribute('data-'+key));
async function range(page,key,value){await page.locator('[data-audio-volume='+key+']').evaluate((el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));},value);await expect(page.locator('[data-audio-volume='+key+']')).toHaveValue(String(value));}

test('audio preferences clamp invalid saves without losing independent zero volumes',()=>{
 expect(sanitizeAudioSettings({master:-4,music:NaN,effects:240,muted:'false'})).toEqual({master:0,music:70,effects:100,muted:false});
 expect(sanitizeAudioSettings({master:0,music:0,effects:0,muted:true})).toEqual({master:0,music:0,effects:0,muted:true});
 expect(sanitizeAudioSettings(null)).toEqual({master:70,music:70,effects:100,muted:false});
});

test('Xbox movement, diagonals, held aim and shield share input safely with the keyboard',async({page})=>{
 await setup(page);await practice(page);await connect(page);
 const x=await number(page,'player-x');await axes(page,.15);await page.waitForTimeout(200);expect(await number(page,'player-x')).toBeCloseTo(x,0);
 await axes(page,.8);await expect.poll(()=>number(page,'player-x')).toBeGreaterThan(x+30);await axes(page,0);await page.waitForTimeout(150);
 await buttons(page,[4]);await axes(page,.8,-.8);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-hold','true');const heldX=await number(page,'player-x');await page.waitForTimeout(180);expect(await number(page,'player-x')).toBeCloseTo(heldX,0);expect(await number(page,'aim')).toBeLessThan(0);
 await buttons(page,[4,6]);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-guard','true');
 await buttons(page,[]);await axes(page,0);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-guard','false');await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-hold','false');
 await page.keyboard.down('ArrowRight');await axes(page,-.8);await axes(page,0);const keyboardX=await number(page,'player-x');await expect.poll(()=>number(page,'player-x')).toBeGreaterThan(keyboardX+15);await page.keyboard.up('ArrowRight');
 await axes(page,-.8);await page.keyboard.down('ArrowLeft');await page.keyboard.up('ArrowLeft');const padX=await number(page,'player-x');await expect.poll(()=>number(page,'player-x')).toBeLessThan(padX-15);await axes(page,0);
 await buttons(page,[4,12,15]);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-hold','true');expect(await number(page,'aim')).toBeLessThan(0);await buttons(page,[]);
});

test('all face buttons, right trigger and RB reach real magic, jumps, dash and a single ultimate',async({page})=>{
 await setup(page);await practice(page);await connect(page);
 await buttons(page,[2]);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-pose',/stand-fire:/);await buttons(page,[]);await page.waitForTimeout(350);
 await buttons(page,[7]);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-pose',/stand-fire:/);await buttons(page,[]);
 await tap(page,3);await expect.poll(()=>page.getByRole('meter',{name:'Energía de magia'}).getAttribute('value')).not.toBe('100');
 await page.locator('[data-adventure-canvas]').evaluate(c=>{new MutationObserver(()=>{if(c.dataset.gliding==='true')c.dataset.glideObserved='true';}).observe(c,{attributes:true,attributeFilter:['data-gliding']});});
 await buttons(page,[0]);await page.waitForFunction(()=>document.querySelector('[data-adventure-canvas]').dataset.jumps==='1');await buttons(page,[]);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await buttons(page,[0]);await page.waitForFunction(()=>document.querySelector('[data-adventure-canvas]').dataset.jumps==='2');
 await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-glide-observed','true');await buttons(page,[]);
 await buttons(page,[1]);await page.waitForFunction(()=>document.querySelector('[data-adventure-canvas]').dataset.dash==='true');await buttons(page,[]);
 await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-dash','false');
 await expect.poll(async()=>Number(await page.getByRole('meter',{name:'Energía de magia'}).getAttribute('value'))).toBeGreaterThanOrEqual(90);
 await buttons(page,[5]);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-super-active','true');await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-super-active','false',{timeout:10000});
 expect(await number(page,'super-cooldown')).toBeGreaterThan(35);await page.waitForTimeout(200);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-super-active','false');await buttons(page,[]);
});

test('Menu and disconnect pause; reconnect and held buttons cannot resume or jump by themselves',async({page})=>{
 await setup(page);await practice(page);await connect(page);await tap(page,9);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');
 await buttons(page,[0]);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.waitForTimeout(250);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-jumps','0');await buttons(page,[]);
 await axes(page,.9);await expect.poll(()=>number(page,'player-x')).toBeGreaterThan(200);
 await page.evaluate(()=>{window.virtualPad=null;});await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state','disconnected');
 const x=await number(page,'player-x');await connect(page);await page.waitForTimeout(180);expect(await number(page,'player-x')).toBe(x);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');
 await tap(page,9);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(80);await tap(page,9);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
});

test('View enters the shop; A and B inspect and close products, and the controller changes audio sliders',async({page})=>{
 await setup(page);await practice(page);await connect(page);await axes(page,.8);await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.playerX)>318);await axes(page,0);await page.waitForTimeout(130);await tap(page,8);await expect(page.locator('[data-adventure-shop]')).toBeVisible();await page.waitForTimeout(100);
 await tap(page,0);await expect(page.locator('[data-item-popup]')).toBeVisible();await tap(page,1);await expect(page.locator('[data-item-popup]')).toHaveCount(0);
 await page.locator('[data-adventure-shop]').getByRole('button',{name:'Ajustes de audio y mando'}).click();await expect(page.locator('[data-adventure-settings]')).toBeVisible();
 await axes(page,0,.8);await page.waitForTimeout(80);await axes(page,0);await expect(page.locator('[data-audio-volume=master]')).toBeFocused();
 await axes(page,-.8);await expect(page.locator('[data-audio-volume=master]')).toHaveValue('65');await axes(page,0);await tap(page,1);await expect(page.locator('[data-adventure-settings]')).toHaveCount(0);await expect(page.locator('[data-adventure-shop]')).toBeVisible();
 await tap(page,1);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
});

for(const width of [1440,390])test(width+': audio mixer remains inside the game, pauses combat, and saves real music/effect levels',async({page})=>{
 await page.setViewportSize({width,height:900});await setup(page);await practice(page);
 await page.keyboard.press('KeyP');await page.locator('[data-open-settings]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');
 const frozen=await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame');await page.waitForTimeout(100);expect(await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame')).toBe(frozen);
 const bounds=await page.evaluate(()=>['[data-adventure-canvas]','[data-adventure-settings]'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};}));for(const key of ['x','y','width','height'])expect(Math.abs(bounds[0][key]-bounds[1][key])).toBeLessThan(1);
 await range(page,'master',100);await range(page,'music',100);await expect.poll(()=>page.locator('audio').evaluate(a=>a.volume)).toBe(1);
 await range(page,'master',40);await range(page,'music',60);await range(page,'effects',25);
 await expect.poll(()=>page.locator('audio').evaluate(a=>a.volume)).toBeCloseTo(.24,5);await expect.poll(()=>page.evaluate(()=>window.arcadeGains[0].gain.value)).toBeCloseTo(.07,3);
 await range(page,'music',0);await expect.poll(()=>page.locator('audio').evaluate(a=>a.volume)).toBe(0);await expect.poll(()=>page.evaluate(()=>window.arcadeGains[0].gain.value)).toBeCloseTo(.07,3);await range(page,'music',60);
 await range(page,'effects',0);await expect.poll(()=>page.locator('audio').evaluate(a=>a.volume)).toBeCloseTo(.24,5);await expect.poll(()=>page.evaluate(()=>window.arcadeGains[0].gain.value)).toBeCloseTo(0,3);await range(page,'effects',25);
 await page.getByRole('button',{name:'Probar sonido'}).click();await expect.poll(()=>page.evaluate(()=>window.arcadeGains.length)).toBeGreaterThan(1);
 await page.getByRole('button',{name:'Silenciar todo'}).click();await expect.poll(()=>page.locator('audio').evaluate(a=>a.volume)).toBe(0);await expect.poll(()=>page.evaluate(()=>window.arcadeGains[0].gain.value)).toBeCloseTo(0,3);
 await page.getByRole('button',{name:'Activar sonido'}).click();await expect.poll(()=>page.locator('audio').evaluate(a=>a.volume)).toBeCloseTo(.24,5);
 await page.getByRole('region',{name:'Aventura de Hexy',exact:true}).screenshot({path:folder+'audio-'+width+'.jpg'});
 await page.getByRole('button',{name:'Mando',exact:false}).filter({hasText:'Mando'}).click();await expect(page.locator('[data-controller-status]')).toHaveAttribute('data-controller-status','waiting');await page.getByRole('region',{name:'Aventura de Hexy',exact:true}).screenshot({path:folder+'controller-'+width+'.jpg'});
 await page.keyboard.press('Escape');await expect(page.locator('[data-adventure-settings]')).toHaveCount(0);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');
 await page.reload();await openAdventureMenu(page);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-open-settings]').click();for(const [key,value]of [['master','40'],['music','60'],['effects','25']])await expect(page.locator('[data-audio-volume='+key+']')).toHaveValue(value);
 await page.getByRole('button',{name:'Restablecer'}).click();await expect(page.locator('[data-audio-volume=master]')).toHaveValue('70');
});

test('unsupported controllers do not move Hexy; fullscreen settings stay in the canvas',async({page})=>{
 await setup(page);await practice(page);await connect(page,'');await axes(page,1);await buttons(page,[0,2]);const x=await number(page,'player-x');await page.waitForTimeout(200);expect(await number(page,'player-x')).toBe(x);
 await page.keyboard.press('KeyP');await page.locator('[data-open-settings]').click();await page.getByRole('button',{name:'Cambiar pantalla completa'}).click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);
 const b=await page.locator('[data-adventure-settings]').boundingBox();expect(b.y).toBeGreaterThanOrEqual(0);expect(b.y+b.height).toBeLessThanOrEqual(900);await page.screenshot({path:folder+'fullscreen.jpg'});
 await page.keyboard.press('Escape');await expect(page.locator('[data-adventure-settings]')).toHaveCount(0);
});

test('losing access to the controller clears held actions and leaves keyboard play available',async({page})=>{
 await setup(page);await practice(page);await connect(page);await buttons(page,[6]);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-guard','true');
 await page.evaluate(()=>{window.denyGamepads=true;});await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state','unavailable');
 await page.getByRole('button',{name:'Continuar ▶',exact:true}).click();await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-guard','false');
 const x=await number(page,'player-x');await page.keyboard.down('ArrowRight');await expect.poll(()=>number(page,'player-x')).toBeGreaterThan(x+20);await page.keyboard.up('ArrowRight');
});

test('a browser audio permission prompt stays clickable over settings and dismisses after activation',async({page})=>{
 await page.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return window.allowGameAudio?play.call(this):Promise.reject(new DOMException('A click is needed','NotAllowedError'));};});
 await setup(page);await practice(page);await expect(page.locator('[data-audio-unlock]')).toBeVisible();await page.keyboard.press('KeyP');await page.locator('[data-open-settings]').click();await expect(page.locator('[data-adventure-settings]')).toBeVisible();
 await page.evaluate(()=>{window.allowGameAudio=true;});await page.locator('[data-audio-unlock]').click();await expect(page.locator('[data-audio-unlock]')).toHaveCount(0);await expect.poll(()=>page.locator('audio').evaluate(a=>!a.paused)).toBe(true);
});

import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
import {sanitizeAudioSettings} from '../src/components/arcade/shared/arcadeAudioSettings';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
import {LOCAL_RESET_KEY} from '../src/components/arcade/shared/arcadeLocalReset';
const dir='tests/artifacts/arcade/shop-navigation/';
const save={version:1,economy:2,stars:1756,modSlots:3,modsOwned:['quick-cast','bright-spark','grand-flourish','lasting-magic','gentle-guard'],modsEquipped:['quick-cast','bright-spark','grand-flourish'],adventureUnlocked:4,adventureCleared:[0,1,2,3],found:['shore']};
async function setup(page,seed=save){
 await page.addInitScript(({seed,resetKey})=>{localStorage.setItem(resetKey,'done');if(!localStorage.getItem('magic-drink-arcade-v1'))localStorage.setItem('magic-drink-arcade-v1',JSON.stringify(seed));localStorage.setItem('magic-drink:arcade:illustrated-finish:v1',JSON.stringify({enabled:true,grain:0,chromatic:0,vignette:0}));window.pad={id:'Xbox fixture',mapping:'standard',index:0,connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.pad]});window.oscillators=[];const original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const osc=original.call(this);window.oscillators.push(osc);return osc;};},{seed,resetKey:LOCAL_RESET_KEY});
 await page.goto('/arcade');await openAdventureMenu(page);await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state','connected');
}
async function tap(page,id){await page.evaluate(id=>{window.pad.buttons[id]={pressed:true,value:1};},id);await page.waitForTimeout(100);await page.evaluate(()=>window.pad.buttons.forEach(b=>{b.pressed=false;b.value=0;}));await page.waitForTimeout(100);}
async function play(page){await page.locator('[data-insert-coin]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');}
async function shop(page){await play(page);await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');const before=await page.evaluate(()=>window.oscillators.length);await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();expect(await page.evaluate(()=>window.oscillators.length)).toBeGreaterThan(before);}
test('audio defaults, title score and effects gain are explicit',async({page})=>{
 expect(sanitizeAudioSettings(null)).toEqual({master:70,music:70,effects:100,muted:false});expect(sanitizeAudioSettings({master:0,music:0,effects:0}).master).toBe(0);
 expect(adventureMusic(0,'ready').src).toBe('/arcade/music/title.ogg');expect(adventureMusic(0,'playing').key).toBe('meadow');
 await setup(page);await expect(page.locator('audio')).toHaveAttribute('data-music-track','title');
 const decoded=await page.evaluate(async()=>{const ctx=new AudioContext(),b=await ctx.decodeAudioData(await(await fetch('/arcade/music/title.ogg')).arrayBuffer());await ctx.close();return{duration:b.duration,channels:b.numberOfChannels};});expect(decoded.duration).toBeGreaterThan(60);expect(decoded.channels).toBe(2);
 const boost=await page.evaluate(async()=>{const {EFFECTS_BOOST}=await import('/src/components/arcade/shared/audio/sounds.js');return EFFECTS_BOOST;});expect(boost).toBe(2.8);
});
test('Xbox selection changes the description without shifting the three-item shelf or drawing a rectangle',async({page})=>{
 await setup(page);await shop(page);const items=page.locator('[data-mod]');await expect(items).toHaveCount(3);const first=await items.evaluateAll(els=>els.map(e=>e.dataset.mod));await items.first().focus();
 for(let i=1;i<3;i++){await tap(page,15);await expect(page.locator('[data-shop-description]')).toHaveAttribute('data-shop-description',first[i]);expect(await items.evaluateAll(els=>els.map(e=>e.dataset.mod))).toEqual(first);expect(await items.nth(i).evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('none');}
 await page.getByRole('button',{name:'Página siguiente',exact:true}).click();const next=await items.evaluateAll(els=>els.map(e=>e.dataset.mod));expect(next.every(id=>!first.includes(id))).toBe(true);await expect(page.locator('[data-shop-description]')).toHaveAttribute('data-shop-description',next[0]);
 await page.screenshot({path:dir+'gamepad-shelf.jpg'});await tap(page,0);await expect(page.locator('[data-item-popup]')).toBeVisible();await tap(page,1);await expect(page.locator('[data-item-popup]')).toHaveCount(0);
 const separate=await page.evaluate(()=>{const a=document.querySelector('[data-miso-dialogue]').getBoundingClientRect(),b=document.querySelector('[data-shop-description]').getBoundingClientRect();return a.right<b.left||a.bottom<b.top;});expect(separate).toBe(true);
});
test('collection is a separate screen with paged charms and contained improvement details',async({page})=>{
 await setup(page);await shop(page);await page.locator('[data-shop-collection]').click();await expect(page.locator('[data-miso-dialogue]')).toHaveCount(0);await expect(page.getByAltText('Hexy eligiendo sus amuletos')).toBeVisible();await expect(page.locator('[data-collection-mod]')).toHaveCount(4);
 await page.getByRole('button',{name:'Más amuletos',exact:true}).click();await expect(page.locator('[data-collection-mod=gentle-guard]')).toBeVisible();await page.locator('[data-collection-mod=gentle-guard]').click();await expect(page.locator('[data-upgrade-mod=gentle-guard]')).toBeVisible();await page.locator('[data-upgrade-mod=gentle-guard]').click();await expect(page.locator('[data-item-popup]')).toContainText('10% menos');await page.screenshot({path:dir+'collection-upgrade.jpg'});
 await page.getByRole('button',{name:'Cerrar artículo',exact:true}).click();await page.getByRole('button',{name:'Amuletos anteriores',exact:true}).click();await page.screenshot({path:dir+'collection-final.jpg'});
});
test('pause sound runs once; music resumes only for audio editing and continues from its position',async({page})=>{
 await setup(page);await play(page);await expect.poll(()=>page.locator('audio').evaluate(e=>!e.paused)).toBe(true);const before=await page.evaluate(()=>window.oscillators.length);await page.keyboard.press('KeyP');await expect(page.getByRole('heading',{name:'PAUSA',exact:true})).toBeVisible();await expect.poll(()=>page.locator('audio').evaluate(e=>e.paused)).toBe(true);expect(await page.evaluate(()=>window.oscillators.length)).toBe(before+3);
 const time=await page.locator('audio').evaluate(e=>e.currentTime),frame=await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame');await page.locator('[data-open-settings]').click();await expect.poll(()=>page.locator('audio').evaluate(e=>!e.paused)).toBe(true);await expect.poll(()=>page.locator('audio').evaluate(e=>e.currentTime)).toBeGreaterThan(time);expect(await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame')).toBe(frame);
 await page.getByRole('button',{name:'Imagen ✦',exact:true}).click();await expect.poll(()=>page.locator('audio').evaluate(e=>e.paused)).toBe(true);await page.getByRole('button',{name:'Sonido ♫',exact:true}).click();await expect.poll(()=>page.locator('audio').evaluate(e=>!e.paused)).toBe(true);await page.getByRole('button',{name:'Cerrar ajustes',exact:true}).click();await expect.poll(()=>page.locator('audio').evaluate(e=>e.paused)).toBe(true);await page.screenshot({path:dir+'pause-final.jpg'});
});
test('explicit local reset clears wallet and charms while keeping completed chapters and a backup',async({page})=>{
 await setup(page);await page.goto('/arcade?reset=coins-charms');await expect(page).toHaveURL(/\/arcade$/);await openAdventureMenu(page);
 const result=await page.evaluate(()=>({save:JSON.parse(localStorage.getItem('magic-drink-arcade-v1')),backup:JSON.parse(localStorage.getItem('magic-drink-arcade-v1:before-loadout-reset'))}));expect(result.save.stars).toBe(0);expect(result.save.modsOwned).toEqual([]);expect(result.save.modSlots).toBe(1);expect(result.save.adventureCleared).toEqual([0,1,2,3]);expect(result.save.found).toEqual(['shore']);expect(result.backup.stars).toBe(1756);
 await page.reload();await openAdventureMenu(page);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).stars)).toBe(0);
});

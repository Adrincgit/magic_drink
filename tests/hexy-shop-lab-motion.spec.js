import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/arcade/shop-lab/';
test('real shop demo motion shows follower, beams, placement and spring boots',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await page.addInitScript(()=>{localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:2,economy:2,stars:0,adventureUnlocked:4}));});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();
 await page.evaluate(()=>{const chunks=[],c=document.querySelector('[data-shop-trial]');window.labRecorder=new MediaRecorder(c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});window.labRecorder.ondataavailable=e=>chunks.push(e.data);window.labRecorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='shop-lab.webm';a.click();};window.labRecorder.start();});
 for(const [name,id]of [['Echo','starter-8'],['Volt','starter-9'],['Jelly','starter-6'],['Honey','starter-10'],['Prism','starter-7'],['resorte','spring-boots'],['Orbit','starter-11']]){
  await page.getByRole('searchbox').fill(name);await page.locator('[data-mod='+id+']').click();if(id==='starter-7'||id==='starter-6')await page.getByLabel('Nivel de prueba',{exact:true}).selectOption('2');
  await page.waitForTimeout(650);await page.locator('[data-shop-trial]').screenshot({path:dir+id+'-early.png'});await page.waitForTimeout(950);await page.locator('[data-shop-trial]').screenshot({path:dir+id+'-middle.png'});await page.waitForTimeout(2200);await page.locator('[data-shop-trial]').screenshot({path:dir+id+'-late.png'});
 }
 const download=page.waitForEvent('download');await page.evaluate(()=>window.labRecorder.stop());await(await download).saveAs(dir+'shop-lab.webm');expect(errors).toEqual([]);
});

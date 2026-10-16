import {test,expect} from '@playwright/test';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
import {openAdventureMenu} from './arcade-input.helpers';

const makePad=(x=0,y=0,buttons=[])=>({id:'Xbox drift regression',index:0,connected:true,mapping:'standard',axes:[x,y,0,0],buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))});
const directions=input=>['left','right','up','down'].filter(key=>input[key]);

test('resting stick drift cannot walk, crouch or aim, even after intentional movement',()=>{
 for(const sign of [-1,1]){
  expect(directions(readAdventureGamepad(makePad(sign*.8,sign*.8)))).toHaveLength(2);
  for(const drift of [.34,.31,.28,.15,0,NaN])expect(directions(readAdventureGamepad(makePad(sign*drift,sign*drift)))).toEqual([]);
 }
});

test('intentional stick input and D-pad directions remain immediate',()=>{
 expect(directions(readAdventureGamepad(makePad(.6,-.6)))).toEqual(['right','up']);
 expect(directions(readAdventureGamepad(makePad(-.6,.6)))).toEqual(['left','down']);
 for(const [button,direction] of [[14,'left'],[15,'right'],[12,'up'],[13,'down']]){
  expect(directions(readAdventureGamepad(makePad(.3,-.3,[button])))).toEqual([direction]);
 }
 expect(readAdventureGamepad(makePad(.3,-.3,[0,2,3,6]))).toMatchObject({jump:true,attack:true,special:true,guard:true});
 expect(readAdventureGamepad({...makePad(),connected:false})).toBeNull();
});

async function setup(page){
 await page.addInitScript(()=>{
  window.driftPad={id:'Xbox drift regression',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
  Object.defineProperty(navigator,'getGamepads',{value:()=>[window.driftPad]});
 });
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state','connected');
 await page.waitForTimeout(150);
}
async function stick(page,x,y=0){await page.evaluate(([x,y])=>{window.driftPad.axes[0]=x;window.driftPad.axes[1]=y;},[x,y]);}
async function buttons(page,ids){await page.evaluate(ids=>{window.driftPad.buttons.forEach((button,i)=>{button.pressed=ids.includes(i);button.value=button.pressed?1:0;});},ids);}
const playerX=page=>page.locator('[data-adventure-canvas]').getAttribute('data-player-x').then(Number);
async function stationary(page,read=()=>playerX(page)){
 // Allow normal braking, then sample throughout the interval (not only endpoints).
 await page.waitForTimeout(250);const x=await read();
 for(let i=0;i<5;i++){await page.waitForTimeout(100);expect(Math.abs(await read()-x)).toBeLessThan(.5);}
}

test.beforeEach(async({page})=>{page.runtimeErrors=[];page.on('pageerror',error=>page.runtimeErrors.push(error.message));});
test.afterEach(async({page})=>{expect(page.runtimeErrors).toEqual([]);});

test('releasing the stick into drift stops Hexy before visiting the shop',async({page})=>{
 await setup(page);const x=await playerX(page);
 await stick(page,.29);await stationary(page);expect(await playerX(page)).toBe(x);
 await stick(page,.8);await expect.poll(()=>playerX(page)).toBeGreaterThan(x+35);
 await stick(page,.29);await stationary(page);
 await buttons(page,[14]);const right=await playerX(page);await expect.poll(()=>playerX(page)).toBeLessThan(right-20);
 await buttons(page,[]);await stationary(page);
 await stick(page,-.31,.31);await stationary(page);await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-crouch','false');
 await stick(page,0);await page.keyboard.down('ArrowRight');const keyboard=await playerX(page);
 await expect.poll(()=>playerX(page)).toBeGreaterThan(keyboard+20);await page.keyboard.up('ArrowRight');await stationary(page);
});

test('watching a moving demo and leaving controller practice cannot carry movement into the level',async({page})=>{
 // Observe the real trial simulation without adding test state to production code.
 await page.route('**/src/components/arcade/adventure/engine/adventureTrial.js*',async route=>{
  const response=await route.fetch();const source=await response.text();
  await route.fulfill({response,body:source.replace('stepAdventure(s,input,dt);','stepAdventure(s,input,dt);window.trialSnapshot={x:s.player.x,time:s.time,input:{...input}};')});
 });
 await setup(page);await stick(page,.8);
 await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);
 await stick(page,.29);await page.waitForTimeout(200);await page.keyboard.press('KeyE');
 await expect(page.locator('[data-adventure-shop]')).toBeVisible();
 const frame=await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame');
 await page.getByRole('searchbox').fill('Paso');await page.locator('[data-mod=swift-step]').click();
 await page.waitForFunction(()=>window.trialSnapshot?.input.right===true);
 expect(await page.locator('[data-adventure-canvas]').getAttribute('data-sim-frame')).toBe(frame);
 await page.locator('[data-trial-play]').click();
 const trialX=()=>page.evaluate(()=>window.trialSnapshot.x);
 await stationary(page,trialX);const start=await trialX();await stick(page,.8);
 await expect.poll(trialX).toBeGreaterThan(start+35);await stick(page,.29);await stationary(page,trialX);
 // Leave while practice is still active, including a held stick across the transition.
 await stick(page,.8);await page.locator('[data-shop-leave]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await stationary(page);await stick(page,.29);await stationary(page);
 const resumed=await playerX(page);await stick(page,.8);await expect.poll(()=>playerX(page)).toBeGreaterThan(resumed+30);
 await stick(page,.29);await stationary(page);
});

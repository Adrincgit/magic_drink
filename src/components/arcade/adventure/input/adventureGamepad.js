// W3C standard layout: Xbox A/B/X/Y, bumpers, triggers, View/Menu and D-pad.
import {getGamepadBindings} from './gamepadBindings';
// Stick directions become full-speed digital movement. Keep a generous neutral
// area for worn sticks, shared by gameplay and the shop trial. Read it afresh
// each poll so returning to this area always releases movement immediately.
export const GAMEPAD_DEAD_ZONE=.35;
export function readAdventureGamepad(pad,bindings=getGamepadBindings()){
 if(!pad||!pad.connected||pad.mapping!=='standard')return null;
 const button=i=>!!pad.buttons[i]?.pressed||(pad.buttons[i]?.value||0)>.5;
 const axis=i=>Number.isFinite(pad.axes[i])?pad.axes[i]:0;
 const x=axis(0),y=axis(1),left=button(14)||x< -GAMEPAD_DEAD_ZONE,right=button(15)||x>GAMEPAD_DEAD_ZONE,up=button(12)||y< -GAMEPAD_DEAD_ZONE,down=button(13)||y>GAMEPAD_DEAD_ZONE;
 return{left:left&&!right,right:right&&!left,up:up&&!down,down:down&&!up,...Object.fromEntries(Object.entries(bindings).map(([name,indices])=>[name,indices.some(button)])),pause:button(9),confirm:button(0),back:button(1),tabPrevious:button(4),tabNext:button(5)};
}
const controls=root=>[...root.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)')].filter(el=>!el.closest('[inert]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
function focusControl(root,element){
 root.querySelectorAll('[data-pad-focus]').forEach(el=>el.removeAttribute('data-pad-focus'));
 element.dataset.padFocus='true';element.focus({preventScroll:true});element.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
export function navigateGamepadMenu(root,action){
 if(!root)return;const items=controls(root);if(!items.length)return;
 const current=items.includes(document.activeElement)?document.activeElement:null;
 const preferred=items.find(el=>el.hasAttribute('data-pad-default'))||items.find(el=>el.matches('[data-insert-coin],[data-practice],[data-selected="true"]'))||items[0];
 if(action==='confirm'){const target=current||preferred;focusControl(root,target);if(target.matches('button,a,input[type=checkbox]'))target.click();return;}
 if(!['left','right','up','down'].includes(action))return;
 if(!current){focusControl(root,preferred);return;}
 if(current.matches('select')&&(action==='left'||action==='right')){const options=[...current.options].filter(o=>!o.disabled),at=options.findIndex(o=>o.value===current.value),next=options[Math.max(0,Math.min(options.length-1,at+(action==='right'?1:-1)))];if(next){Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(current,next.value);current.dispatchEvent(new Event('change',{bubbles:true}));}return;}
 if(current.matches('input[type=range]')&&(action==='left'||action==='right')){
  const value=Math.max(Number(current.min),Math.min(Number(current.max),Number(current.value)+(action==='right'?1:-1)*Number(current.step||1)));
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(current,String(value));current.dispatchEvent(new Event('input',{bubbles:true}));return;
 }
 if(current.hasAttribute('data-pad-row')){
  const ordered=items.filter(el=>el.hasAttribute('data-pad-row')),row=Number(current.dataset.padRow),column=Number(current.dataset.padColumn||0);
  if(action==='up'||action==='down'){
   const rows=[...new Set(ordered.map(el=>Number(el.dataset.padRow)))].sort((a,b)=>a-b),at=rows.indexOf(row),next=rows[at+(action==='down'?1:-1)];
   const choices=ordered.filter(el=>Number(el.dataset.padRow)===next),target=choices.find(el=>Number(el.dataset.padColumn||0)===column)||choices[0];if(target)focusControl(root,target);return;
  }
  const choices=ordered.filter(el=>Number(el.dataset.padRow)===row),at=choices.indexOf(current),target=choices[at+(action==='right'?1:-1)];if(target)focusControl(root,target);return;
 }
 const rect=current.getBoundingClientRect(),cx=rect.x+rect.width/2,cy=rect.y+rect.height/2,horizontal=action==='left'||action==='right',sign=action==='left'||action==='up'?-1:1;
 const choices=items.filter(el=>el!==current).map(el=>{const r=el.getBoundingClientRect(),dx=r.x+r.width/2-cx,dy=r.y+r.height/2-cy,along=(horizontal?dx:dy)*sign,across=Math.abs(horizontal?dy:dx);return{el,along,score:along+across*2.5};}).filter(q=>q.along>3).sort((a,b)=>a.score-b.score);
 if(choices[0])focusControl(root,choices[0].el);
}

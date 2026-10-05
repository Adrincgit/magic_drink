// W3C standard layout: Xbox A/B/X/Y, bumpers, triggers, View/Menu and D-pad.
export const GAMEPAD_DEAD_ZONE=.24;
export function readAdventureGamepad(pad){
 if(!pad||!pad.connected||pad.mapping!=='standard')return null;
 const button=i=>!!pad.buttons[i]?.pressed||(pad.buttons[i]?.value||0)>.5;
 const axis=i=>Number.isFinite(pad.axes[i])?pad.axes[i]:0;
 const x=axis(0),y=axis(1),left=button(14)||x< -GAMEPAD_DEAD_ZONE,right=button(15)||x>GAMEPAD_DEAD_ZONE,up=button(12)||y< -GAMEPAD_DEAD_ZONE,down=button(13)||y>GAMEPAD_DEAD_ZONE;
 return{left:left&&!right,right:right&&!left,up:up&&!down,down:down&&!up,jump:button(0),dash:button(1),attack:button(2)||button(7),special:button(3),hold:button(4),super:button(5),guard:button(6),interact:button(8),pause:button(9),confirm:button(0),back:button(1)};
}
const controls=root=>[...root.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')].filter(el=>!el.closest('[inert]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
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
 if(current.matches('input[type=range]')&&(action==='left'||action==='right')){
  const value=Math.max(Number(current.min),Math.min(Number(current.max),Number(current.value)+(action==='right'?1:-1)*Number(current.step||1)));
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(current,String(value));current.dispatchEvent(new Event('input',{bubbles:true}));return;
 }
 const rect=current.getBoundingClientRect(),cx=rect.x+rect.width/2,cy=rect.y+rect.height/2,horizontal=action==='left'||action==='right',sign=action==='left'||action==='up'?-1:1;
 const choices=items.filter(el=>el!==current).map(el=>{const r=el.getBoundingClientRect(),dx=r.x+r.width/2-cx,dy=r.y+r.height/2-cy,along=(horizontal?dx:dy)*sign,across=Math.abs(horizontal?dy:dx);return{el,along,score:along+across*2.5};}).filter(q=>q.along>3).sort((a,b)=>a.score-b.score);
 if(choices[0])focusControl(root,choices[0].el);
}

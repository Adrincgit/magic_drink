import {focusControl,navigateGamepadMenu} from './adventureGamepad';
const visible=el=>!el.disabled&&el.getClientRects().length&&!el.closest('[inert]');
const list=(root,selector)=>[...root.querySelectorAll(selector)].filter(visible);

// Stable regions avoid geometric dead ends in the scrolling catalog. Search
// remains optional: every product/action is reachable without typing.
export function navigateShopGamepad(root,action){
 if(action==='tabPrevious'||action==='tabNext'){
  root.dispatchEvent(new CustomEvent('shop-tab',{detail:action==='tabNext'?1:-1}));return;
 }
 const equipment=!!root.querySelector('[data-equipment-panel]');
 const groups={header:list(root,'header nav button'),tabs:list(root,'[role=tab]'),
  filters:list(root,equipment?'[data-collection-filter] button':'[data-catalog-filters] button'),
  catalog:list(root,equipment?'[data-equipment-category]':'[data-mod]'),
  details:list(root,equipment?'[data-equipment-mod]':'[data-buy-mod],[data-equip-mod],[data-upgrade-mod]'),
  trial:list(root,equipment?'[data-family-slot],[data-buy-category-slot],[data-fitting-actions] button':'[data-trial-playing] button,[data-trial-playing] select'),
  footer:list(root,'[data-open-family]')};
 const current=document.activeElement,zone=Object.keys(groups).find(k=>groups[k].includes(current));
 const preferred=group=>group.find(el=>el.matches('[data-trial-play]'))||group.find(el=>el.matches('[data-selected=true],[aria-pressed=true],[aria-selected=true]'))||group[0];
 const go=(name,index)=>{const group=groups[name],target=index===undefined?preferred(group):group[index];if(target)focusControl(root,target);};
 if(!zone){go('catalog');return;}
 if(action==='confirm'){navigateGamepadMenu(root,action);return;}
 if(!['left','right','up','down'].includes(action))return;
 if(current.matches('select')&&['left','right'].includes(action)){navigateGamepadMenu(root,action);return;}
 const group=groups[zone],at=group.indexOf(current),horizontal=['header','tabs','filters','footer'].includes(zone);
 const next=at+(['right','down'].includes(action)?1:-1);
 if(horizontal&&['left','right'].includes(action)||!horizontal&&['up','down'].includes(action)){
  if(group[next]){go(zone,next);return;}
 }
 if(action==='up'){if(zone==='footer')go('catalog');else if(zone!=='header')go(zone==='tabs'?'header':zone==='filters'?'tabs':equipment&&zone==='details'?'filters':'tabs');}
 if(action==='down'){if(zone==='header')go('tabs');else if(zone==='tabs')go(groups.filters.length?'filters':'catalog');else if(zone==='filters')go(equipment?'details':'catalog');else if(zone!=='footer')go('footer');}
 if(action==='right'&&!horizontal){if(zone==='catalog')go(groups.details.length?'details':'trial');else if(zone==='details')go('trial');}
 if(action==='left'&&!horizontal){if(zone==='trial')go(groups.details.length?'details':'catalog');else if(zone==='details')go('catalog');else if(zone==='catalog'&&equipment)go('filters');}
}

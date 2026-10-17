import {useState} from 'react';
import {MODS,MOD_CATEGORIES,modCategory,categoryUsed,categorySlotPrice,categorySlotRank,canExpandCategory,modDescription} from '../../engine/adventureMods';
import ModIcon from '../hud/AdventureModIcon';
import css from './adventureWorkshop.module.css';
export default function AdventureEquipment({save,en,category,setCategory,selected,select,busy,equip,expand,onShop,notice}){
 const [search,setSearch]=useState(''),[showAll,setShowAll]=useState(false);
 const t=(es,eng)=>en?eng:es,l=en?1:0,c=MOD_CATEGORIES.find(c=>c.id===category),slots=save.modCategorySlots,owned=save.modsOwned||[],equipped=save.modsEquipped||[];
 const current=MODS.find(m=>m.id===selected),mod=current&&modCategory(current)===category?current:MODS.find(m=>modCategory(m)===category&&owned.includes(m.id))||MODS.find(m=>modCategory(m)===category);
 const items=MODS.filter(m=>m.id!=='double-pocket'&&modCategory(m)===category&&(showAll||owned.includes(m.id))&&m.name[l].toLocaleLowerCase().includes(search.toLocaleLowerCase()));
 const fitted=equipped.filter(id=>modCategory(MODS.find(m=>m.id===id))===category),level=save.modLevels?.[mod.id]||1,cost=categorySlotPrice(category,slots[category]);
 return <div className={css.equipment} data-equipment-panel>
  <aside className={css.families}><h3>{t('Tu equipamiento','Your equipment')}</h3><p>{t('Un espacio inicial por familia. Amplía cada una a tu ritmo.','One starting slot per family. Expand each at your own pace.')}</p>
   {MOD_CATEGORIES.map(f=><button key={f.id} data-equipment-category={f.id} aria-pressed={category===f.id} onClick={()=>{setCategory(f.id);setSearch('');}}><b>{f.name[l]}</b><small>{f.hint[l]}</small><span>{categoryUsed(equipped,f.id)} / {slots[f.id]}</span></button>)}
   <p>{t('Dos espacios de Bebidas permiten guardar dos sabores y alternar con Q / R3. Máximo dos latas iniciales.','Two Drink slots unlock two flavors: swap with Q / R3. At most two starting cans.')}</p>
  </aside>
  <section className={css.collection}><div className={css.collectionTitle}><div><small>{t('COLECCIÓN','COLLECTION')}</small><h2>{c.name[l]}</h2></div><span>{items.length} {t('encantos','charms')}</span></div>
   <div className={css.collectionFilter} data-collection-filter><input type="search" aria-label={t('Buscar en equipamiento','Search equipment')} value={search} placeholder={t('Buscar en esta familia…','Search this family…')} onChange={e=>setSearch(e.target.value)}/><button aria-pressed={showAll} onClick={()=>setShowAll(!showAll)}>{showAll?t('Ver solo míos','Only owned'):t('Ver disponibles','Show available')}</button></div>
   <div className={css.equipmentCards}>{items.map(item=>{const lv=save.modLevels?.[item.id]||1,fit=equipped.includes(item.id),has=owned.includes(item.id);return <button key={item.id} data-equipment-mod={item.id} aria-pressed={mod.id===item.id} onFocus={()=>select(item)} onClick={()=>select(item)}><ModIcon mod={item} className={css.equipmentIcon}/><b>{item.name[l]}</b><span>{fit?t('Equipado','Equipped'):has?t('En colección','Owned'):t('En la tienda','In the shop')} {has?'· '+lv:''}</span><p>{modDescription(item,has?lv:1,en)}</p></button>;})}{!items.length&&<p className={css.emptyCollection}>{t('Aún no tienes encantos de esta familia. Puedes ver los disponibles y probarlos gratis en la tienda.','No charms in this family yet. Browse available ones and try them free in the shop.')}</p>}</div>
  </section>
  <aside className={css.fitting}><div><small>{t('ESPACIOS DE','SLOTS FOR')}</small><h3>{c.name[l]}</h3></div><div className={css.familySlots}>{Array.from({length:c.max},(_,i)=>{const item=MODS.find(m=>m.id===fitted[i]),open=i<slots[category];return <button key={i} data-family-slot={category+'-'+i} data-equipped-slot={item?.id||''} disabled={busy||!item} onClick={()=>equip(item)} aria-label={item?t('Quitar ','Unequip ')+item.name[l]:t('Espacio ','Slot ')+(i+1)}>{item?<><ModIcon mod={item} className={css.slotIcon}/><span>{item.name[l]}</span><i>×</i></>:<span>{open?t('Libre','Empty'):t('Por ampliar','Locked')}</span>}</button>;})}</div>
   {cost!==null&&<button className={css.expand} data-buy-category-slot={category} disabled={busy||!canExpandCategory(save,category)||save.stars<cost} onClick={()=>expand(category,slots[category])}>{t('Ampliar ','Expand ')}{c.name[l]} <b>{cost} ★</b></button>}
   {cost!==null&&!canExpandCategory(save,category)&&<small>{t('Disponible al alcanzar el tramo ','Available at chapter rank ')}{categorySlotRank(slots[category])+1}.</small>}
   <div className={css.fittingItem} data-fitting-actions><ModIcon mod={mod} className={css.fittingIcon}/><h3>{mod.name[l]}</h3><p>{modDescription(mod,level,en)}</p>
    {owned.includes(mod.id)?<button data-equip-mod={mod.id} disabled={busy||!equipped.includes(mod.id)&&(fitted.length>=slots[category]||mod.drink!==undefined&&!mod.timed&&equipped.filter(id=>id.startsWith('starter-')&&id!=='starter-12').length>=2)} onClick={()=>equip(mod)}>{equipped.includes(mod.id)?t('Guardar en colección','Unequip'):t('Equipar','Equip')}</button>:null}
    <button data-equipment-open-shop onClick={()=>onShop(mod)}>{t('Ver, probar y mejorar en tienda','View, try and upgrade in shop')}</button>
   </div><p className={css.equipmentNotice} role="status">{notice||t('Quita un encanto para liberar su espacio. Cambiar el equipo no regala munición.','Unequip a charm to free its slot. Changing equipment never grants ammo.')}</p>
  </aside>
 </div>;
}

import {useState} from 'react';
import {RIBBON_GUIDE,ribbonMoveName} from '../../engine/adventureRibbonCombos';
import css from './adventureWorkshop.module.css';
export default function RibbonComboGuide({en,stats,demo,onDemo}){
 const [keyboard,setKeyboard]=useState(false),lang=en?1:0,t=(es,eng)=>en?eng:es;
 return <div className={css.comboGuide} data-ribbon-guide>
  <div className={css.comboHeader}><b>{t('Danza de cinta · combos','Ribbon dance · combos')}</b><button onClick={()=>setKeyboard(!keyboard)}>{keyboard?t('Teclado','Keyboard'):'Xbox'} ⇄</button></div>
  <p>{t('Un toque por golpe. Enlaza durante el remate; las cargas salen al soltar.','One tap per strike. Link during recovery; charged moves fire on release.')}</p>
  <div className={css.comboReadout} data-ribbon-move>{stats.charge?t('Cargando · ','Charging · ')+Math.round(stats.charge*100)+'%':ribbonMoveName(stats.move,en)||t('Elige un combo para verlo','Choose a combo to watch')} <b>{stats.sequence?.toUpperCase().split('').join(' → ')}</b></div>
  <div className={css.comboList}>{RIBBON_GUIDE.map(q=><button key={q.id} data-demo-combo={q.id} aria-pressed={demo===q.id} onClick={()=>onDemo(q.id)} title={t('Ver demostración: ','Watch demo: ')+q.name[lang]}><kbd>{en?(keyboard?q.keys:q.pad).replace('Mantén','Hold').replace('suelta','release').replace('Espacio','Space'):keyboard?q.keys:q.pad}</kbd><b>{q.name[lang]}</b><small>{q.tip[lang]}</small></button>)}</div>
  <p>{keyboard?t('Espacio: salto giratorio · X: dash · V: cinta defensiva.','Space: spinning jump · X: dash · V: ribbon guard.'):t('A: salto giratorio · B: dash · LT: cinta defensiva.','A: spinning jump · B: dash · LT: ribbon guard.')}</p>
 </div>;
}

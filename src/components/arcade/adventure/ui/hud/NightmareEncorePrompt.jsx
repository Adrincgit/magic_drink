import css from './adventureClashPrompt.module.css';
export default function NightmareEncorePrompt({en,control,rightSide=false}){
 return <button className={css.doubleEncore} data-nightmare-boost data-hexy-right={rightSide} {...control} aria-label={en?'Use Double Encore':'Usar Encore doble'}>
  <b>{en?'DOUBLE ENCORE':'ENCORE DOBLE'}</b><span>{en?'Press ultimate again':'Pulsa ultimate otra vez'}</span>
 </button>;
}

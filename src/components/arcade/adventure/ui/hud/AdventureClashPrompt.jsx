import {clashInputHint} from '../../input/clashInput';
import css from './adventureClashPrompt.module.css';
export default function AdventureClashPrompt({input,en,control,pressed=false,escape=null}){
 return <button className={css.button} data-clash-tap={!escape||undefined} data-candy-escape={!!escape||undefined} data-pressed={pressed} aria-label={escape?(en?'Break free! Tap rapidly or move the stick':'¡Libérate! Pulsa rápido o mueve la palanca'):en?'Tap repeatedly to push your spell':'Pulsa repetidamente para empujar tu hechizo'} {...control}>
  {escape&&<span className={css.escapeLabel}><b>{en?'BREAK FREE!':'¡LIBÉRATE!'}</b><small>{en?'Tap fast / move stick':'Pulsa rápido / mueve la palanca'}</small></span>}
  <span className={css.illustration}><span className={css.key} data-clash-key>{clashInputHint(input)}</span></span>
 </button>;
}

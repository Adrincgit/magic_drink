import {clashInputHint} from '../../input/clashInput';
import css from './adventureClashPrompt.module.css';
export default function AdventureClashPrompt({input,en,control,pressed=false}){
 return <button className={css.button} data-clash-tap data-pressed={pressed} aria-label={en?'Tap repeatedly to push your spell':'Pulsa repetidamente para empujar tu hechizo'} {...control}>
  <span className={css.illustration}><span className={css.key} data-clash-key>{clashInputHint(input)}</span></span>
 </button>;
}

const clamp=n=>Math.max(0,Math.min(1,n));
export {nightmarePressureEffort as nightmareEffort} from './nightmarePressureActing';
export const nightmareWindFrame=(time,reduced=false)=>reduced?0:[0,1,2,1][Math.floor(time*14)%4];
export function nightmarePressureWave(age){
 let wave=0;for(const start of [2.4,5.2,9.4,13.3,17.6,21]){const t=(age-start)/1.5;if(t>0&&t<1)wave=Math.max(wave,Math.sin(t*Math.PI)**2);}return wave;
}
export function nightmareResistance(q,gentle=false){
 // The uncountered surge needs more taps than most players can sustain.
 // Tapping still buys time; the second ultimate restores the normal demand.
 const wave=nightmarePressureWave(q.contestAge),surge=q.bossBoost&&!q.hexyBoost?clamp(q.surgeAge/.7)*(gentle?.25:.34):0;
 const rally=q.finalSurgeAge!==undefined?Math.sin(Math.PI*clamp(q.finalSurgeAge/1.2))*(gentle?.105:.16):0;
 // The advancing front slows near Hexy, giving deliberate presses time to
 // brake it and reach Encore. It still reaches zero without input; there is
 // no invisible timer, frozen endpoint or automatic second-Encore victory.
 const braking=q.bossBoost&&!q.hexyBoost?.32+.68*clamp((q.pressure??.5)/.4):1;
 return((gentle?.095:.125)+wave*(gentle?.11:.18)+surge+rally)*braking;
}

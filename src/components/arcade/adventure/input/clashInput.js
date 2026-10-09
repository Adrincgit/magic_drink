export function clashInputHint(input={}){
 if(input.device==='touch')return 'TAP';
 if(input.device==='gamepad')return /dualsense|dualshock|playstation|054c/i.test(input.padName||'')?'□':/nintendo|switch|057e/i.test(input.padName||'')?'Y':'X';
 return input.key==='J'?'J':'Z';
}

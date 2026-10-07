export function bossHitFeedback(s,heavy=false){
 const b=s.boss;b.flash=heavy?.4:.3;b.flashDuration=b.flash;
 s.events.push(heavy?'bossHeavyHit':'bossHit');
}

// Keep every native piece registered while the whole boss pulses white.
// Reduced motion uses one steady highlight instead of alternating pulses.
export function bossHitFilter(b,reduced=false){
 if(!(b.flash>0))return 'none';
 const elapsed=Math.max(0,(b.flashDuration||.3)-b.flash);
 const bright=reduced||Math.floor(elapsed/.055)%2===0;
 return bright?'brightness(2.65) saturate(.28)':'brightness(1.18) saturate(1.2)';
}

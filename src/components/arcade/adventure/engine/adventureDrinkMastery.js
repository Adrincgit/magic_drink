export const drinkMastery=(s,kind)=>Math.max(1,Math.min(3,Number(s.modLevels?.['starter-'+kind])||1),s.weapon===kind&&s.drinkTier===2?2:1);

// The owner explicitly requested a fresh local playtest on 2026-10-06.
// Keep this request separate from the save schema and from production saves.
export const LOCAL_RESET_KEY='magic-drink-arcade:owner-reset:2026-10-06-stage-polish';
export function applyRequestedLocalReset(storage,saveKey,enabled){
 if(!enabled||storage.getItem(LOCAL_RESET_KEY))return false;
 storage.removeItem(saveKey);
 storage.removeItem(saveKey+':before-loadout-reset');
 storage.setItem(LOCAL_RESET_KEY,'done');
 return true;
}

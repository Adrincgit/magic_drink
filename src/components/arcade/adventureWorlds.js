// Art, sound and scenery belong to the chapter; combat geometry stays in LEVELS.
const art=name=>{const [world,part]=name.split('-');return '/arcade/maps/'+world+'/'+(part==='mid'?'midground':part||'background')+'.webp';};
const theme=(key,title,boss,bossTitle)=>({explore:{key,title},boss:{key:boss,title:bossTitle}});
export const WORLDS=[
 {key:'meadow',background:'/arcade/maps/meadow/background.webp',midground:null,farSpeed:.16,midSpeed:.4,
  terrain:'grass',surface:'#a0b56b',edge:'#5a693f',soil:['#ad805b','#5b434a'],accent:'#ffe3a4',ambient:'pollen',
  music:theme('meadow','Pasitos de estrella','troupe','¡Que no escape el globo!')},
 {key:'woods',background:art('woods'),midground:art('woods-mid'),farSpeed:.13,midSpeed:.37,
  terrain:'roots',surface:'#6b9978',edge:'#314f56',soil:['#726e56','#303948'],accent:'#ffcd77',ambient:'fireflies',
  music:theme('woods','Faroles a contratiempo','serio','La orden del director')},
 {key:'canopy',background:art('canopy'),midground:art('canopy-mid'),farSpeed:.11,midSpeed:.32,
  terrain:'branches',surface:'#aacb72',edge:'#47694a',soil:['#a17857','#60453f'],accent:'#eaf2aa',ambient:'leaves',
  music:theme('canopy','Un vals entre las hojas','alegre','Malabares sin red')},
 {key:'ring',background:art('ring'),midground:art('ring-mid'),farSpeed:.15,midSpeed:.42,
  terrain:'boards',surface:'#f9c16f',edge:'#71384c',soil:['#bc6c57','#67394b'],accent:'#ffdf9a',ambient:'bulbs',
  music:theme('ring','Tres pistas y una sonrisa','agresivo','¡Tiembla la pista!')},
 {key:'silence',background:art('silence'),midground:art('silence-mid'),farSpeed:.1,midSpeed:.3,
  terrain:'enchanted',surface:'#d6bcea',edge:'#665089',soil:['#66628f','#302740'],accent:'#b9ecff',ambient:'crystals',
  music:theme('silence','El secreto de las jaulas','muta','Que vuelva a cantar la noche')},
].map(world=>({...world,ground:world.key==='meadow'?'/arcade/maps/meadow/ground.webp':art(world.key+'-ground')}));

export function adventureMusic(index,phase,boss=false,won=false){
 if(phase==='shop')return{key:'shop',src:'/arcade/music/shop.ogg',loop:true,title:'Estrellitas en el bolsillo'};
 if(phase==='between'||phase==='result'){
  const key=phase==='between'||won?'victory':'gameover';
  return {key,src:'/arcade/music/jingles/'+key+'.ogg',loop:false,title:key==='victory'?'¡El coro está a salvo!':'La historia continúa'};
 }
 const track=WORLDS[index].music[boss?'boss':'explore'];
 // User-supplied, livelier arrangements. Original Oggs remain alongside them
 // for comparison; keep the logical track keys and all pause/mute behavior.
 const extension=['meadow','woods','troupe'].includes(track.key)?'mp3':'ogg';
 return {...track,src:'/arcade/music/'+(boss?'bosses/':'exploration/')+track.key+'.'+extension,loop:true};
}

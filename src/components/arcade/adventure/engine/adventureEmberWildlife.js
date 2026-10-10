import {groundY} from '../world/adventureTerrain';
export const WILDLIFE_CROSSINGS=[5100,6100,7050,8050,8950,9700];
export function resetEmberWildlife(at=0){return{animals:[],crossings:WILDLIFE_CROSSINGS.map(x=>({x,passed:x<at-350}))};}
export function stepEmberWildlife(s,dt){
 const env=s.emberEnvironment;if(!env||s.fortInside)return;
 env.wildlife??=resetEmberWildlife(s.player.x);const wildlife=env.wildlife;
 for(const q of wildlife.crossings)if(!q.passed&&s.player.x>=q.x-100){
  q.passed=true;if(s.player.x>q.x+500)continue;
  for(let i=0;i<3;i++)wildlife.animals.push({x:q.x+900+i*105,y:groundY(s.level.route,q.x+900+i*105),age:-i*.22,life:9,species:i===2?1:0,speed:i===2?265:245,stride:0});
 }
 for(const q of wildlife.animals){
  q.age+=dt;q.life-=dt;if(q.age<0)continue;
  const distance=q.speed*dt;q.x-=distance;q.stride+=distance;q.y=groundY(s.level.route,q.x);
 }
 wildlife.animals=wildlife.animals.filter(q=>q.life>0&&q.x>s.camera.x-220);
}

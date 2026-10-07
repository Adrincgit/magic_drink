import {ACTION_REGISTRATION} from './hexyActionAtlas';
// Body measurements exclude the wand and raised arms; feet stay at y=300.
export const HEXY_REGISTRATION={"aim:0":{"scale":1.07709,"x":-1.453},"aim:1":{"scale":1.07709,"x":-2.362},"aim:2":{"scale":1.07709,"x":-1.847},"aim:3":{"scale":1.07709,"x":-2.202},"aim:4":{"scale":1.26013,"x":-2.179},"aim:5":{"scale":1.26013,"x":-3.075},"aim:6":{"scale":1.26013,"x":-2.686},"aim:7":{"scale":1.26013,"x":-2.003},"stand-aim-down:0":{"scale":0.86925,"x":0.399},"stand-aim-down:1":{"scale":0.86925,"x":1.452},"stand-aim-down:2":{"scale":0.86925,"x":1.094},"stand-aim-down:3":{"scale":0.86925,"x":0.483},"crouch-fire:0":{"scale":0.94183,"x":0.01},"crouch-fire:1":{"scale":0.94183,"x":-0.029},"crouch-fire:2":{"scale":0.94183,"x":0.228},"crouch-fire:3":{"scale":0.94183,"x":0.448}};
// The second and fourth downward drawings were displaced 39px in their cells.
Object.assign(HEXY_REGISTRATION,{"aim-down:1":{scale:1,x:-39},"aim-down:3":{scale:1,x:-39}});
for(const sheet of ['air-super','air-super-release'])for(let i=0;i<4;i++)HEXY_REGISTRATION[sheet+':'+i]={scale:1,x:-15};
export const hexyRegistration=pose=>ACTION_REGISTRATION[pose.sheet+':'+pose.frame]||HEXY_REGISTRATION[pose.sheet+':'+pose.frame]||{scale:1,x:0};

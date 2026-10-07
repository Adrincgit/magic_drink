import {DRINKS} from '../../world/adventureLevels';
export default function AdventureModIcon({mod,className='',...props}){
 return mod.drink!==undefined||mod.image?<img className={className} src={mod.image||DRINKS[mod.drink].image} alt="" draggable="false" {...props}/>:<i className={className} style={{backgroundImage:'url(/arcade/sprites/ui/mod-charms.webp)',backgroundSize:'400% 100%',backgroundPosition:`${mod.icon*100/3}% 0`}} aria-hidden="true" {...props}/>;
}

import {DRINKS} from '../../world/adventureLevels';
export default function AdventureModIcon({mod,className='',...props}){
 return <img className={className} src={mod.image||(mod.drink!==undefined?DRINKS[mod.drink].image:`/arcade/sprites/ui/${mod.id}.webp`)} alt="" draggable="false" {...props}/>;
}

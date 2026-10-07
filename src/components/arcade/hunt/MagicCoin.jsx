import {useId} from 'react';
export default function MagicCoin({className=''}){
 const id=useId().replace(/:/g,'');
 return <svg className={className} viewBox="0 0 100 100" aria-hidden="true" data-magic-coin>
  <defs><linearGradient id={id+'gold'} x2=".8" y2="1"><stop stopColor="#fff1a5"/><stop offset=".48" stopColor="#ffd365"/><stop offset="1" stopColor="#cf852a"/></linearGradient><path id={id+'curve'} d="M18 62 Q50 95 82 62"/></defs>
  <circle cx="50" cy="52" r="46" fill="#8e4c26"/><circle cx="50" cy="48" r="44" fill={`url(#${id}gold)`} stroke="#6f3b2c" strokeWidth="3"/><circle cx="50" cy="48" r="37" fill="none" stroke="#fff0a2" strokeWidth="3"/>
  <path d="m50 15 9 18 20 3-15 15 4 20-18-10-18 10 4-20-15-15 20-3z" fill="#ffe997" stroke="#a9622e" strokeWidth="3" strokeLinejoin="round"/>
  <text fill="#7e412a" fontFamily="Inter,sans-serif" fontSize="10.5" fontWeight="800" letterSpacing=".2"><textPath href={`#${id}curve`} startOffset="50%" textAnchor="middle">Magic Drink</textPath></text>
  <path d="m18 33 3-6m5-7 5-3" stroke="#fff7c5" strokeWidth="4" strokeLinecap="round"/>
 </svg>;
}

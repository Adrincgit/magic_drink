// Opaque-component measurements used only to pack generated art.
export function components(data,w,h,accept){
 const seen=new Uint8Array(w*h),result=[];
 for(let i=0;i<w*h;i++){
  if(seen[i]||!accept(data,i*4,i%w,Math.floor(i/w)))continue;
  const queue=[i];seen[i]=1;let x0=w,y0=h,x1=0,y1=0;
  for(let j=0;j<queue.length;j++){
   const p=queue[j],x=p%w,y=Math.floor(p/w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const n of [x? p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1])if(n>=0&&!seen[n]&&accept(data,n*4,n%w,Math.floor(n/w))){seen[n]=1;queue.push(n);}
  }
  result.push({x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,count:queue.length,seed:i});
 }
 return result.sort((a,b)=>b.count-a.count);
}
export function landmarks(data,w,h){
 let hat=h,foot=0;const feet=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4;if(data[k+3]<160)continue;if(data[k+2]>data[k]*1.4&&data[k+2]>data[k+1]*1.12&&data[k+2]>40)hat=Math.min(hat,y);foot=Math.max(foot,y);}
 for(let y=foot-5;y<=foot;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>160)feet.push(x);
 // The raised wand also contains dark blue. Only the large blue hat region
 // defines body height; measuring the wand would shrink an overhead pose.
 const blue=components(data,w,h,(d,k)=>d[k+3]>160&&d[k+2]>d[k]*1.4&&d[k+2]>d[k+1]*1.12&&d[k+2]>40);
 if(blue.length)hat=blue[0].y;
 const skin=components(data,w,h,(d,k,x,y)=>d[k+3]>180&&d[k]>190&&d[k+1]>130&&d[k+2]<d[k+1]*.94&&y<hat+(foot-hat)*.6);
 const face=skin[0];
 // Gold star at the wand is on the right, or above the hat for vertical aim.
 const gold=components(data,w,h,(d,k)=>d[k+3]>150&&d[k]>190&&d[k+1]>135&&d[k+2]<90).filter(q=>q.count>40);
 return{hat,foot,feet:feet.reduce((a,b)=>a+b,0)/feet.length,face,gold};
}

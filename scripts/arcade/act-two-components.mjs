import sharp from 'sharp';
export async function spriteComponents(file){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width:w,height:h}=info,labels=new Int32Array(w*h),components=[];
 for(let start=0;start<labels.length;start++)if(!labels[start]&&data[start*4+3]>32){
  const id=components.length+1,queue=[start];labels[start]=id;let left=w,top=h,right=0,bottom=0,sx=0,sy=0;
  for(let i=0;i<queue.length;i++){const p=queue[i],x=p%w,y=Math.floor(p/w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);sx+=x;sy+=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!labels[j]&&data[j*4+3]>32){labels[j]=id;queue.push(j);}}
  }
  components.push({id,area:queue.length,left,top,width:right-left+1,height:bottom-top+1,cx:sx/queue.length,cy:sy/queue.length});
 }
 return{data,info,labels,components};
}

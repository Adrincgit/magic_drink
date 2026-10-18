let luminance,integral;
const histogram=new Uint32Array(256);

// Solid paper and ink, including broad shadows and the scenery's texture.
// Exposure follows the scene, so a night stage cannot collapse into black.
export function inkMangaFrame(pixels){
 const {data,width:w,height:h}=pixels,stride=w+1,count=w*h;
 if(luminance?.length!==count){luminance=new Float32Array(count);integral=new Float64Array(stride*(h+1));}
 integral.fill(0,0,stride);histogram.fill(0);
 for(let y=0;y<h;y++){
  let row=0;integral[(y+1)*stride]=0;
  for(let x=0;x<w;x++){
   const i=y*w+x,k=i*4,g=data[k]*.2126+data[k+1]*.7152+data[k+2]*.0722;
   luminance[i]=g;histogram[Math.floor(g)]++;row+=g;integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+row;
  }
 }
 let shadow=0,total=0;while(shadow<255&&(total+=histogram[shadow])<count*.24)shadow++;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,k=i*4,g=luminance[i],left=Math.max(0,x-7),right=Math.min(w,x+8),top=Math.max(0,y-7),bottom=Math.min(h,y+8);
  const mean=(integral[bottom*stride+right]-integral[top*stride+right]-integral[bottom*stride+left]+integral[top*stride+left])/((right-left)*(bottom-top));
  const value=g<=shadow||g<mean-(3+mean*.055)?0:255;
  data[k]=data[k+1]=data[k+2]=value;data[k+3]=255;
 }
 return pixels;
}

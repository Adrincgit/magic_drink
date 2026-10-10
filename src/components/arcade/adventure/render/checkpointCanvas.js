// The pole, star finial and base always come from the same measured frame.
// Only the cloth to the right of x=82 participates in the four-frame loop.
export function drawCheckpoint(c,img,frame,x,y,size){
 const cell=img.width/4,cut=82/256*cell,left=x-size/2,top=y-size*250/256;
 c.drawImage(img,0,0,cut,cell,left,top,size*cut/cell,size);
 c.save();c.beginPath();c.rect(left+size*cut/cell,top,size*(1-cut/cell),size);c.clip();
 c.drawImage(img,(frame%4)*cell+cut,0,cell-cut,cell,left+size*cut/cell,top,size*(1-cut/cell),size);
 c.restore();
}

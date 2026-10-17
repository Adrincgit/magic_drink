import {test,expect} from '@playwright/test';
test('painted electric energy fills the actual Hit poses, including gaps between limbs, with no background leaks',async({page})=>{
 await page.route('**/__electric_test',r=>r.fulfill({contentType:'text/html',body:'<body></body>'}));
 await page.goto('/__electric_test');
 const result=await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',{loadAdventureArt}=await import(base+'render/adventureCanvas.js'),{enemyDrawing}=await import(base+'render/adventureSprites.js'),{makeEnemy}=await import(base+'actors/enemies/adventureEnemies.js'),{electricPoseSprite}=await import(base+'render/electricPoseSprite.js'),{drawElectricAura}=await import(base+'render/electricEnemyCanvas.js');
  const art=await loadAdventureArt(),results=[];
  for(const type of [0,1,3,4,6,10,11,14,18,21,22,25,26,29,30,31]){
   const e=makeEnemy(100,480,type);e.elementHit={element:'electric',age:.3,life:.2};e.flash=0;
   const drawing=enemyDrawing(e),img=art[drawing.key],cell=img.width/4,source=document.createElement('canvas');source.width=source.height=256;const s=source.getContext('2d');s.drawImage(img,drawing.frame%4*cell,Math.floor(drawing.frame/4)*cell,cell,cell,0,0,256,256);
   const alpha=s.getImageData(0,0,256,256).data;let gaps=0,leaks=0;
   for(let phase=0;phase<4;phase++){
    const pose=electricPoseSprite(img,drawing.frame,art['feedback-electric-fill'],phase),pixels=pose.canvas.getContext('2d').getImageData(0,0,pose.canvas.width,pose.canvas.height).data,pad=pose.pad*256;
    for(let y=0;y<256;y++){
     let left=256,right=-1;for(let x=0;x<256;x++)if(alpha[(y*256+x)*4+3]>64){left=Math.min(left,x);right=Math.max(right,x);}
     for(let x=left;x<=right;x++){if(alpha[(y*256+x)*4+3]===0)gaps++;if(pixels[((y+pad)*pose.canvas.width+x+pad)*4+3]!==255)leaks++;}
    }
   }
   results.push({type,gaps,leaks});
  }
  const canvas=document.createElement('canvas');canvas.width=canvas.height=400;const c=canvas.getContext('2d'),e=makeEnemy(200,300,3),drawing={key:'juggler-actions',frame:10};
  const painted=[];for(const age of [.02,.1,.18]){c.clearRect(0,0,400,400);e.elementHit={element:'electric',age};drawElectricAura(c,e,drawing,art,false,200,300,160);painted.push(c.getImageData(0,0,400,400).data.some((v,i)=>i%4===3&&v>0));}
  return{results,painted};
 });
 expect(result.painted).toEqual([true,false,true]);
 for(const r of result.results){expect(r.leaks,'background leak for enemy '+r.type).toBe(0);expect(r.gaps,'transparent source gaps exercised for enemy '+r.type).toBeGreaterThan(0);}
});

import fs from 'node:fs/promises';
import sharp from 'sharp';
import {NIGHTMARE_PRESSURE_HEXY,NIGHTMARE_PRESSURE_PORTRAITS} from '../../src/components/arcade/adventure/actors/bosses/nightmarePressureRegistration.js';
const dir='context/arcade/nightmare-corners-v5',out='public/arcade/act-two/nightmare-corners-v5',packed=await sharp(out+'/hexy-portraits.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true}),points=[[500,700],[400,500],[300,500],[500,850],[100,800],[700,690],[950,500]],report=[];
for(const [i,name]of ['hexy-parallel','hexy-shock','hexy-support'].entries()){
 const {data,info}=await sharp(dir+'/sources/'+name+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true}),offset=i===2?32:0;
 for(const [x,y]of points){const p=(y*info.width+x)*4,q=((Math.floor(i/2)*1040+y+offset-330)*packed.info.width+i%2*1024+x)*4;if(data[p+3]<249)continue;
  if(!data.subarray(p,p+3).equals(packed.data.subarray(q,q+3))||packed.data[q+3]!==255)throw Error(name+' changed approved colour/opacity at '+x+','+y);
 }
 report.push({name,approvedOpaqueRGB:'unchanged'});
}
for(const [x,y]of [[900,70],[900,270],[500,0],[1000,0]])if(packed.data[(y*packed.info.width+x)*4+3]!==0)throw Error('Residual backdrop at '+x+','+y);
for(const [name,frames]of Object.entries(NIGHTMARE_PRESSURE_HEXY))for(const q of frames)if(!q.tip.every(Number.isFinite)||q.tip.some(n=>n<0||n>320))throw Error(name+' invalid star');
if(!NIGHTMARE_PRESSURE_PORTRAITS['hexy-portraits'].slice(8).every(q=>JSON.stringify(q)===JSON.stringify(NIGHTMARE_PRESSURE_PORTRAITS['hexy-portraits'][8])))throw Error('Support/strain/rally silhouette changes');
const result={report,backgroundSamples:'clear',starRegistration:'finite and within atlas',heldSupport:'same native drawing',portraitPixels:[packed.info.width,packed.info.height],note:'Anatomy and animation are verified from rendered output, not inferred by this check.'};await fs.writeFile(dir+'/art-check.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

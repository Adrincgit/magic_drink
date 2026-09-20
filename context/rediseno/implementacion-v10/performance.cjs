const { chromium } = require('@playwright/test');
const { writeFileSync } = require('node:fs');
(async () => {
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await page.goto('http://localhost:4321/',{waitUntil:'networkidle'});
    await page.waitForSelector('[data-journey][data-ready=true]');
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('[data-journey] img')].map(i=>{i.loading='eager';return i.decode();}));});
    await page.locator('[data-runway]').evaluate(el => scrollTo(0, (el.offsetHeight-el.querySelector('[data-stage]').offsetHeight)*.68));
    await page.waitForSelector('[data-garden-world][data-renderer=webgl]', {state:'attached'});
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(200);
    const session=await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate',{rate:4});
    const result=await page.evaluate(async()=>{
      const longTasks=[];
      const observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push(e.duration)));
      observer.observe({type:'longtask'});
      const runway=document.querySelector('[data-runway]');
      const stage=document.querySelector('[data-stage]');
      const distance=runway.offsetHeight-stage.offsetHeight;
      const deltas=[];
      let first=0,previous=0;
      await new Promise(resolve=>{
        function step(now){
          if(!first)first=now;
          if(previous)deltas.push(now-previous);
          previous=now;
          const elapsed=now-first;
          const fraction=Math.min(1,elapsed/3600);
          scrollTo({top:distance*fraction,behavior:'instant'});
          if(fraction<1)requestAnimationFrame(step);else resolve();
        }
        requestAnimationFrame(step);
      });
      observer.disconnect();
      const sorted=[...deltas].sort((a,b)=>a-b);
      const percentile=p=>Number(sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))].toFixed(2));
      return {frames:deltas.length,medianFrameMs:percentile(.5),p95FrameMs:percentile(.95),framesOver50ms:deltas.filter(x=>x>50).length,longTasks:longTasks.map(x=>Number(x.toFixed(2))),horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    const report={environment:'Headless Google Chrome, 390x844, DPR 2, touch emulation, CPU slowdown 4x. Local server, warm decoded images and preloaded WebGL garden. Not a physical phone or a network benchmark.',...result};
    writeFileSync('context/rediseno/implementacion-v10/performance.json',JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

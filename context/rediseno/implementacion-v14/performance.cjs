const { chromium } = require('@playwright/test');
const { writeFileSync } = require('node:fs');
(async () => {
  const cpuRate=process.argv.includes('--cpu=1') ? 1 : 4;
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await page.goto('http://localhost:4321/',{waitUntil:'networkidle'});
    await page.waitForSelector('[data-journey][data-ready=true][data-assets-ready=true]');
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('[data-journey] img')].map(i=>{i.loading='eager';return i.decode();}));});
    await page.locator('[data-runway]').evaluate(el => scrollTo({top:(el.offsetHeight-el.querySelector('[data-stage]').offsetHeight)*.3132,behavior:'instant'}));
    await page.getByRole('button',{name:'Reproducir No Brain, Just Vibes!'}).click();
    await page.locator('[data-runway]').evaluate(el => scrollTo(0, (el.offsetHeight-el.querySelector('[data-stage]').offsetHeight)*.49));
    await page.waitForSelector('[data-crowd-motion][data-renderer=webgl]', {state:'attached'});
    await page.locator('[data-runway]').evaluate(el => scrollTo(0, (el.offsetHeight-el.querySelector('[data-stage]').offsetHeight)*.68));
    await page.waitForSelector('[data-garden-world][data-renderer=webgl]', {state:'attached'});
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(200);
    const session=await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});
    await session.send('Performance.enable');
    const metricsBefore = Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
    const result=await page.evaluate(async()=>{
      const longTasks=[];
      const observer=new PerformanceObserver(list=>list.getEntries().forEach(e=>longTasks.push({durationMs:e.duration,progress:Math.max(0,(e.startTime-first)/3600)})));
      observer.observe({type:'longtask'});
      const runway=document.querySelector('[data-runway]');
      const stage=document.querySelector('[data-stage]');
      const distance=runway.offsetHeight-stage.offsetHeight;
      const deltas=[];
      const samples=[];
      let first=0,previous=0;
      await new Promise(resolve=>{
        function step(now){
          if(!first)first=now;
          if(previous)deltas.push(now-previous);
          previous=now;
          const elapsed=now-first;
          const fraction=Math.min(1,elapsed/3600);
          if(deltas.length) samples.push({delta:deltas[deltas.length-1],progress:fraction});
          scrollTo({top:distance*fraction,behavior:'instant'});
          if(fraction<1)requestAnimationFrame(step);else resolve();
        }
        requestAnimationFrame(step);
      });
      observer.disconnect();
      const sorted=[...deltas].sort((a,b)=>a-b);
      const percentile=p=>Number(sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))].toFixed(2));
      const phases=Object.fromEntries([['opening',0,.37],['festival',.37,.64],['garden',.64,.87],['interior',.87,1.01]].map(([name,start,end])=>{const ds=samples.filter(s=>s.progress>=start&&s.progress<end).map(s=>s.delta).sort((a,b)=>a-b);return[name,{frames:ds.length,p95Ms:Number(ds[Math.min(ds.length-1,Math.floor(ds.length*.95))]?.toFixed(2))}]}));
      return {frames:deltas.length,medianFrameMs:percentile(.5),p95FrameMs:percentile(.95),framesOver50ms:deltas.filter(x=>x>50).length,phases,longTasks,horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    const metricsAfter = Object.fromEntries((await session.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
    const mainThreadMs=Object.fromEntries(['ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration'].map(key=>[key,Number(((metricsAfter[key]-metricsBefore[key])*1000).toFixed(2))]));
    const report={environment:`Headless Google Chrome, 390x844, DPR 2, touch emulation, CPU slowdown ${cpuRate}x, music playing and audio-reactive stage. Local server, warm decoded images and preloaded WebGL water/garden/audience. Not a physical phone or a network benchmark.`,...result,mainThreadMs};
    writeFileSync(`context/rediseno/implementacion-v14/performance${cpuRate===1?'-native':''}.json`,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

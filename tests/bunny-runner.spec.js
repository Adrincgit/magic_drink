import { test, expect } from '@playwright/test';
import { createRun, jump, step } from '../src/components/arcade/runnerModel';
import { sanitizeSave } from '../src/components/arcade/arcadeStore';

test('repeated well timed jumps can complete every display width without losing a heart',()=>{
  for(const width of [640,720,960,1440])for(const gentle of [false,true]){
    const run=createRun(width,gentle);
    for(let frame=0;frame<7500&&!run.done;frame++){
      const obstacle=run.objects.find(o=>o.kind==='obstacle'&&o.x>=width*.2);
      const threshold=gentle?110:135;
      if(obstacle&&obstacle.x-width*.2<threshold&&run.y===0)jump(run);
      step(run,1/120);
    }
    expect(run.won).toBe(true);expect(run.time).toBe(60);expect(run.hearts).toBe(3);expect(run.stars).toBeGreaterThan(90);
  }
});
test('a missed obstacle costs only one heart and the third miss ends the run',()=>{
  const run=createRun();for(let f=0;f<7200&&!run.done;f++)step(run,1/120);
  expect(run.done).toBe(true);expect(run.won).toBe(false);expect(run.hearts).toBe(0);expect(run.time).toBeLessThan(20);
  const time=run.time;step(run,5);expect(run.time).toBe(time);
});
test('invalid saves cannot introduce duplicate friends, invalid equipment or negative money',()=>{
  const save=sanitizeSave({version:1,coins:-5,stars:Infinity,found:['shore','shore','bogus'],owned:['crown','crown'],equipped:'bogus',run:{id:42}});
  expect(save.coins).toBe(0);expect(save.stars).toBe(0);expect(save.found).toEqual(['shore']);expect(save.owned).toEqual(['plain','crown']);expect(save.equipped).toBe('plain');expect(save.run).toBe(null);
  expect(sanitizeSave(null).coins).toBe(1);
});

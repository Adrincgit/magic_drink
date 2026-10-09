import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
import {openLanding} from './landing.helpers';

const siteKey='magic-drink:illustrated-finish:v1';
const arcadeKey='magic-drink:arcade:illustrated-finish:v1';
const defaults={enabled:true,chromatic:55,grain:50,vignette:50,monochrome:false};
const savedSite={enabled:true,chromatic:10,grain:20,vignette:30,monochrome:false};
async function seed(page,site,arcade){
 await page.addInitScript(({siteKey,arcadeKey,site,arcade})=>{
  if(!localStorage.getItem(siteKey))localStorage.setItem(siteKey,JSON.stringify(site));
  if(arcade&&!localStorage.getItem(arcadeKey))localStorage.setItem(arcadeKey,JSON.stringify(arcade));
 },{siteKey,arcadeKey,site,arcade});
}
async function picture(page){
 await page.bringToFront();await page.goto('/arcade');await openAdventureMenu(page);
 await page.locator('[data-open-settings]').click();
 await page.getByRole('button',{name:/^Imagen/}).click();
}
async function slider(page,name,edge){
 const input=page.locator(`[data-visual-setting="${name}"]`);await input.focus();await input.press(edge);
}
const stored=(page,key)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);

test('first arcade visit uses its own defaults instead of inheriting the website finish',async({page})=>{
 const site={...savedSite,enabled:false,monochrome:true};await seed(page,site);
 await picture(page);
 await expect(page.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','true');
 await expect(page.locator('[data-monochrome-toggle]')).toHaveAttribute('aria-pressed','false');
 for(const name of ['chromatic','grain','vignette'])await expect(page.locator(`[data-visual-setting="${name}"]`)).toHaveValue(String(defaults[name]));
 expect(await stored(page,siteKey)).toEqual(site);
});

test('real visual controls persist for arcade and sync between games without changing the website in either direction',async({page,context})=>{
 const errors=[];context.on('page',p=>p.on('pageerror',error=>errors.push(error.message)));page.on('pageerror',error=>errors.push(error.message));
 await seed(page,savedSite,defaults);await picture(page);
 const site=await context.newPage();await openLanding(site);
 await site.locator('[data-journey-menu-trigger]').click();
 const menu=site.locator('[data-illustrated-menu]');
 await expect(menu.getByRole('slider',{name:'Aberración cromática'})).toHaveValue('10');

 await page.bringToFront();await page.locator('[data-monochrome-toggle]').click();
 for(const name of ['grain','chromatic','vignette'])await slider(page,name,'Home');
 await expect(page.locator('[data-finish-monochrome]')).toBeVisible();
 await expect(page.locator('[data-finish-lens]')).toBeHidden();
 await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state','paused');
 expect(await stored(page,arcadeKey)).toEqual({...defaults,grain:0,chromatic:0,vignette:0,monochrome:true});
 expect(await stored(page,siteKey)).toEqual(savedSite);
 await expect(menu.getByRole('slider',{name:'Grano de película'})).toHaveValue('20');
 await expect(site.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','true');
 await expect(site.locator('[data-finish-monochrome]')).toHaveCSS('backdrop-filter','grayscale(0)');
 await page.screenshot({path:'tests/artifacts/arcade/visual-isolation/arcade-monochrome.jpg'});

 const second=await context.newPage();await picture(second);
 await expect(second.locator('[data-monochrome-toggle]')).toHaveAttribute('aria-pressed','true');
 await expect(second.locator('[data-visual-setting="grain"]')).toHaveValue('0');
 await slider(second,'grain','End');
 await expect(page.locator('[data-visual-setting="grain"]')).toHaveValue('100');
 await expect(menu.getByRole('slider',{name:'Grano de película'})).toHaveValue('20');

 await site.bringToFront();await menu.getByRole('button',{name:/Acabado ilustrado/}).click();
 await expect(site.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','false');
 await expect(page.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','true');
 await expect(second.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','true');
 expect(await stored(page,arcadeKey)).toEqual({...defaults,grain:100,chromatic:0,vignette:0,monochrome:true});
 expect(await stored(site,siteKey)).toEqual({...savedSite,enabled:false});

 await page.bringToFront();await page.reload();await openAdventureMenu(page);
 await page.locator('[data-open-settings]').click();await page.getByRole('button',{name:/^Imagen/}).click();
 await expect(page.locator('[data-monochrome-toggle]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('[data-visual-setting="grain"]')).toHaveValue('100');
 await page.goto('/');await expect(page.locator('[data-journey]')).toHaveAttribute('data-assets-ready','true',{timeout:15000});
 await expect(page.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','false');
 expect(await stored(page,siteKey)).toEqual({...savedSite,enabled:false});
 await page.screenshot({path:'tests/artifacts/arcade/visual-isolation/website-after-arcade.jpg'});
 expect(errors).toEqual([]);
});

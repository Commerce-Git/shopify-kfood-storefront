import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url));
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'storefront-purchase-'));
const log = fs.openSync(path.join(output, 'server.log'), 'w');
// All upstream reads/writes are mocked; never inherit real credentials for this test server.
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', ...(process.env.PURCHASE_TEST_WEBPACK === '1' ? ['--webpack'] : []), '-p', '3021'], {
  cwd: root, stdio: ['ignore', log, log], env: { ...process.env,
    STOREFRONT_OFFLINE_CHECK: '1', NEXT_PUBLIC_STORE_LAUNCH_STATUS: 'live',
    NEXT_PUBLIC_SUPABASE_URL: 'https://zijvqethklunvydtqmak.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key', SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: 'blank-seoul-dev.myshopify.com', NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN: 'test-token',
    SHOPIFY_CLIENT_ID: 'test-client', SHOPIFY_CLIENT_SECRET: 'test-secret',
    NODE_OPTIONS: `--require ${JSON.stringify(fileURLToPath(new URL('./purchase-preload.cjs', import.meta.url)))}`,
  },
});
const stop = () => { server.kill('SIGTERM'); };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });
process.on('SIGTERM', () => { stop(); process.exit(143); });
for (let attempt = 0; attempt < 100; attempt++) {
  if (server.exitCode !== null) throw new Error(`Test server exited; see ${output}/server.log`);
  if (fs.readFileSync(path.join(output, 'server.log'), 'utf8').includes('Ready in')) break;
  await new Promise(resolve => setTimeout(resolve, 250));
  if (attempt === 99) throw new Error('Test server did not become ready');
}
console.log('Evidence directory:', output);
const require=createRequire(import.meta.url);const {graphql,variants}=require('./purchase-fixtures.cjs');
const browserPath = process.env.BROWSER_EXECUTABLE || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined);
const browser=await chromium.launch({executablePath:browserPath, headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const {user:accountUser,session:accountSession,order:accountOrder}=require('./account-fixtures.cjs');
let ordersMode='success';
let authMode='success';let emailAttempts=0;
const errors=[];let checkoutCalls=0;let checkoutMode='fail';
await context.route('**/*', async route=>{
 const url=route.request().url();
 if(url.includes('.myshopify.com/')&&url.includes('graphql.json')){
  const {query,variables}=route.request().postDataJSON();
  if(query.includes('CartCreate')){
   checkoutCalls++;
   await new Promise(r=>setTimeout(r,350));
   if(checkoutMode==='fail') return route.fulfill({status:503,body:'Unavailable'});
   const cart={id:'qa-cart',checkoutUrl:'https://checkout.example.com/c/qa',discountCodes:[],lines:{pageInfo:{hasNextPage:false},edges:variables.lines.map(l=>({node:{quantity:checkoutMode==='partial'?1:l.quantity,merchandise:{id:l.merchandiseId}}}))}};
   return route.fulfill({json:{data:{cartCreate:{cart,userErrors:[],warnings:checkoutMode==='warning'?[{message:'Requested quantity is no longer available.'}]:[]}}}});
  }
  return route.fulfill({json:graphql(query,variables)});
 }
 if(url.startsWith('https://checkout.example.com/')) return route.fulfill({contentType:'text/html',body:'<h1>Checkout destination fixture</h1>'});
 if(url.includes('.supabase.co/auth/v1/otp')){
  emailAttempts++;
  if(authMode==='email-failure')return route.fulfill({status:400,json:{code:'over_email_send_rate_limit',msg:'Please wait before trying again.'}});
  return route.fulfill({json:{}});
 }
 if(url.includes('.supabase.co/auth/v1/user'))return route.fulfill({json:accountUser});
 if(url.includes('.supabase.co/rest/v1/storefront_customers'))return route.fulfill({json:{id:accountUser.id,email:accountUser.email,first_name:'Fixture'}});
 if(url.includes('.supabase.co/'))return route.fulfill({json:[]});
 if(new URL(url).pathname==='/api/orders')return ordersMode==='fail'?route.fulfill({status:503,json:{error:'Fixture outage'}}):route.fulfill({json:{orders:[accountOrder],isSubscribed:false}});

 if(url.includes('/api/cart-companions'))return route.fulfill({json:{success:true,companions:[],artistsToFollow:[]}});
 if(url.includes('/api/review'))return route.fulfill({json:{reviews:[]}});
 if(url.includes('/api/views'))return route.fulfill({json:{success:true,views:1}});
 if(url.includes('/api/my-coupons'))return route.fulfill({json:{coupons:[]}});
 if(!url.startsWith('http://localhost:3021') && !url.startsWith('data:'))return route.abort();
 return route.continue();
});
const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
page.setDefaultTimeout(20_000);
const checks=[];
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
const cart=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('blank-seoul-cart')||'[]'));
async function goto(path){await page.goto('http://localhost:3021'+path);await page.waitForLoadState('networkidle');}
try{
await check('Failed callback explains retry without exposing provider details',async()=>{
 await goto('/auth/callback?error=access_denied&error_description=private-provider-details');
 await page.waitForURL('**/account/login?error=auth_failed');
 await page.getByRole('alert').filter({hasText:'couldn’t complete your sign-in'}).waitFor();
 assert.equal(await page.getByText('private-provider-details',{exact:false}).count(),0);
 await page.getByText('To find an order, sign in with the same email you used at checkout.',{exact:true}).waitFor();
});
await check('Google initiation failure is visible and email sign-in remains available',async()=>{
 await page.evaluate(()=>{window.restoreAuthDigest=crypto.subtle.digest.bind(crypto.subtle);crypto.subtle.digest=async()=>{throw new Error('Fixture crypto unavailable');};});
 await page.getByRole('button',{name:'Continue with Google',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'couldn’t connect to Google sign-in'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Continue with Google',exact:true}).isEnabled(),true);
 await page.evaluate(()=>{crypto.subtle.digest=window.restoreAuthDigest;delete window.restoreAuthDigest;});
 authMode='email-failure';
 await page.getByLabel('Email Address',{exact:true}).fill('buyer-fixture@example.com');
 await page.getByRole('button',{name:'Yes, Send My Access Link! ✉️',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Please wait before trying again.'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Yes, Send My Access Link! ✉️',exact:true}).isEnabled(),true);
 authMode='success';
 await page.getByRole('button',{name:'Yes, Send My Access Link! ✉️',exact:true}).click();
 await page.getByRole('heading',{name:'Check Your Email',exact:true}).waitFor();
 assert.equal(emailAttempts,2);
});
await check('Guest tracking link opens sign-in rather than claiming to send email',async()=>{
 await goto('/order-lookup');
 await page.getByRole('link',{name:'Sign in to track your order →',exact:true}).click();
 await page.waitForURL('**/account/login');
 assert.equal(emailAttempts,2);
});
await check('Home, wishlist and mobile product layout',async()=>{
 await goto('/'); await page.getByRole('heading',{level:1}).waitFor();
 await goto('/product/qa-pouch-1'); await page.getByRole('button',{name:'Save to wishlist',exact:true}).first().click();
 await goto('/product/qa-pouch-65'); await page.getByRole('button',{name:'Save to wishlist',exact:true}).first().click();
 await goto('/wishlist'); await page.getByRole('link',{name:'Review Pouch 65',exact:true}).waitFor();
 await goto('/product/qa-pouch-1');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(500);const overflow=await page.evaluate(()=>({width:innerWidth, scroll:document.documentElement.scrollWidth, offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right}))}));assert.ok(overflow.scroll<=overflow.width+1,JSON.stringify(overflow));await page.screenshot({path:path.join(output,`product-${width}.png`),fullPage:true});}
 await page.setViewportSize({width:390,height:844});
});
await check('Shop all pagination reaches product 65',async()=>{await goto('/collections');assert.equal(await page.locator('main h3').count(),48);await page.getByRole('link',{name:'Next products →'}).click();await page.getByRole('heading',{name:'Review Pouch 65',exact:true}).waitFor();assert.equal(await page.locator('main h3').count(),17);});
await check('Collection pagination and group category links',async()=>{await goto('/collections/bags-pouches');await page.getByRole('link',{name:'Next products →'}).click();await page.getByRole('heading',{name:'Review Pouch 65',exact:true}).waitFor();await goto('/collections/wear');await page.getByRole('navigation',{name:'Product categories'}).getByRole('link',{name:'Bags & Pouches'}).waitFor();});
await check('Search results, next page and empty result',async()=>{await goto('/search?q=pouch');await page.getByRole('link',{name:'Next results →'}).click();await page.getByRole('heading',{name:'Review Pouch 25',exact:true}).waitFor();await goto('/search?q=missing');await page.getByRole('heading',{name:'No matching products'}).waitFor();});
await check('Unavailable option combination never adds first variant',async()=>{await goto('/product/qa-pouch-1');await page.getByRole('button',{name:'M',exact:true}).click();await page.getByRole('button',{name:'Red',exact:true}).click();await page.getByText('This option combination is unavailable.',{exact:false}).waitFor();assert.equal(await page.locator('#buy-now-button').count(),0);});
await check('Available option add respects stock and stores selected price',async()=>{await page.getByRole('button',{name:'S',exact:true}).click();const add=page.locator('#buy-now-button');await add.waitFor();await page.waitForFunction(()=>!document.querySelector('#buy-now-button').disabled);await add.click();await page.getByRole('dialog').waitFor();assert.equal((await cart())[0].variantId,variants[2].id);assert.equal((await cart())[0].price,'42');assert.equal((await cart())[0].quantity,1);await page.keyboard.press('Escape');});
await check('Sold-out variant cannot be added',async()=>{await page.getByRole('button',{name:'Green',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#buy-now-button')?.textContent.includes('Sold Out'));assert.equal(await page.locator('#buy-now-button').isDisabled(),true);});
await check('Cart option change, quantity, and page reload',async()=>{await goto('/cart');const select=page.getByLabel('Change variant option');await select.waitFor();await select.selectOption(variants[0].id);await page.getByRole('button',{name:'Increase quantity',exact:true}).click();assert.equal((await cart())[0].quantity,2);await select.selectOption(variants[2].id);assert.equal((await cart())[0].quantity,1);assert.equal(await page.getByRole('button',{name:'Increase quantity',exact:true}).isDisabled(),true);await page.reload();await page.getByRole('heading',{name:'Your bag',exact:true}).waitFor();assert.equal((await cart())[0].price,'42.00');});
await check('320/390/768/1440 cart has no horizontal overflow',async()=>{for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(150);const size=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(size.scroll<=size.client+1,JSON.stringify({width,...size}));await page.screenshot({path:path.join(output, `cart-${width}.png`),fullPage:true});}});
await check('Checkout failure retains cart, duplicate clicks create one request',async()=>{await page.setViewportSize({width:390,height:844});const button=page.getByRole('button',{name:'Checkout →',exact:true});await button.evaluate(b=>{b.click();b.click();});await page.getByRole('alert').first().waitFor();assert.equal(checkoutCalls,1);assert.equal((await cart()).length,1);assert.equal(await button.isEnabled(),true);});
await check('Partial checkout adjustment keeps requested local quantities',async()=>{
 await page.getByLabel('Change variant option').selectOption(variants[0].id);
 await page.getByRole('button',{name:'Increase quantity',exact:true}).click();
 checkoutMode='partial';await page.getByRole('button',{name:'Checkout →',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Availability has changed'}).first().waitFor();
 assert.equal((await cart())[0].quantity,2);
});
await check('Shopify warnings preserve local cart',async()=>{checkoutMode='warning';await page.getByRole('button',{name:'Checkout →',exact:true}).click();await page.getByRole('alert').filter({hasText:'Requested quantity'}).first().waitFor();assert.equal((await cart()).length,1);});
await check('Accepted checkout redirects and back navigation restores bag',async()=>{checkoutMode='success';await page.getByRole('button',{name:'Checkout →',exact:true}).click();await page.waitForURL('https://checkout.example.com/c/qa');await page.goBack();await page.getByRole('button',{name:'Restore My Cart'}).click();await page.getByRole('heading',{name:'Your bag',exact:true}).waitFor();assert.equal((await cart()).length,1);});
await check('Removing last item returns accessible empty state',async()=>{await page.getByRole('button',{name:'Remove item',exact:true}).click();assert.equal((await cart()).length,0);await page.getByRole('heading',{name:'Your Blank Seoul Box is Waiting!'}).waitFor();});
await check('Account details ignore another account cache and recover after an order API failure',async()=>{
 const token=Buffer.from(JSON.stringify(accountSession)).toString('base64url');
 await context.addCookies([{name:'sb-zijvqethklunvydtqmak-auth-token',value:'base64-'+token,domain:'localhost',path:'/'}]);
 await page.evaluate(()=>localStorage.setItem('orders_other@example.com',JSON.stringify({orders:[{id:'gid://shopify/Order/999',name:'#PRIVATE-OTHER'}],timestamp:Date.now()})));
 await goto('/account/orders/'+encodeURIComponent('gid://shopify/Order/999'));
 await page.getByText('Order not found',{exact:true}).waitFor();
 assert.equal(await page.getByText('#PRIVATE-OTHER',{exact:false}).count(),0);
 assert.equal(await page.evaluate(()=>localStorage.getItem('orders_other@example.com')),null);
 ordersMode='fail';await goto('/account');await page.getByRole('alert').filter({hasText:'Could not load'}).waitFor();
 ordersMode='success';await page.getByRole('button',{name:'Try again',exact:true}).click();
 await page.getByText('#QA-123',{exact:false}).first().waitFor();
 await page.screenshot({path:path.join(output,'account-390.png'),fullPage:true});
 await goto('/account/orders/'+encodeURIComponent(accountOrder.id));
 await page.getByRole('heading',{name:'Order #QA-123'}).waitFor();
 await page.screenshot({path:path.join(output,'order-detail-390.png'),fullPage:true});
});
await check('Sign-out failure preserves the account and allows retry',async()=>{
 await goto('/account');
 await context.route('**/auth/v1/logout*',route=>route.fulfill({status:400,json:{message:'Fixture sign-out failure'}}));
 await page.getByRole('button',{name:'Sign Out',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Could not sign out'}).waitFor();
 await page.getByText('#QA-123',{exact:false}).first().waitFor();
 await context.route('**/auth/v1/logout*',route=>route.fulfill({status:204}));
 await page.getByRole('button',{name:'Sign Out',exact:true}).click();
 await page.waitForURL('**/account/login');
});
assert.deepEqual(errors,[]);
fs.writeFileSync(path.join(output, 'results.json'),JSON.stringify({passed:true,checks,errors,checkoutCalls},null,2));
}catch(error){await page.screenshot({path:path.join(output, 'failure.png'),fullPage:true});fs.writeFileSync(path.join(output, 'results.json'),JSON.stringify({passed:false,checks,errors,error:String(error)},null,2));throw error;}finally{await browser.close();stop();fs.closeSync(log);}

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import crypto from 'node:crypto';import ts from 'typescript';
import { prepareAccountStorage } from '../../lib/security/account-storage.ts';
import { aggregateArtistStatus, aggregateWmsStatus } from '../../lib/orders/status.ts';
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- The VM loads varying module exports for isolated route tests.
function load(file: string, stubs: Record<string, unknown> = {}, extras: Record<string, unknown> = {}): any {
  const mod = { exports: {} };const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,{module:mod,exports:mod.exports,URL,URLSearchParams,AbortSignal,setTimeout,process:{env:{NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN:'test.myshopify.com',SHOPIFY_CLIENT_ID:'test',SHOPIFY_CLIENT_SECRET:'test'}},console:{warn(){},error(){},log(){}},...extras,require:(name:string)=>{
    if(name in stubs)return stubs[name];if(name==='next/server')return {NextResponse:Response};if(name==='node:crypto')return crypto;
    if(name==='@/lib/errors')return {errorMessage:()=>''};
    if(name.startsWith('@/'))return load(name.slice(2)+'.ts',stubs,extras);
    if(name.startsWith('.'))return load(path.join(path.dirname(file),name)+'.ts',stubs,extras);
    throw new Error(name);
  }});return mod.exports;
}
const artists={'@/lib/artists':{getArtistSlug:(s:string)=>s.toLowerCase(),getArtistBySlug:()=>({})}};
const item=(id:number,vendor='maker',quantity=1)=>({node:{title:'Item',quantity,vendor,variantId:`gid://shopify/ProductVariant/${id}`,variant:null}});
const shipment=(id:number,quantity=1,status='success')=>({id,status,shipment_status:'in_transit',tracking_number:`T${id}`,tracking_company:'USPS',line_items:[{variant_id:id,quantity}]});
test('artist warehouse shipment is packaging, and least advanced row wins independent of row order',()=>{
  assert.equal(aggregateWmsStatus('UNFULFILLED',['shipped']),'packaging');
  assert.equal(aggregateArtistStatus(['received','pending']),'pending');assert.equal(aggregateArtistStatus(['pending','received']),'pending');
  assert.equal(aggregateWmsStatus('FULFILLED',['pending']),'shipped');
});
test('maker groups require actual full shipment and never borrow another maker tracking',()=>{
  const {splitOrderIntoVendorPackages:split}=load('lib/shopify/order-utils.ts',artists);
  const base={orderId:'1',lineItems:[item(1,'one'),item(2,'two')],artistStatusMap:{one:'shipped',two:'pending'},orderFulfillmentStatus:'PARTIALLY_FULFILLED',fulfillments:[shipment(1)],orderTracking:{number:'T1'}};
  let groups=split(base);assert.equal(groups[0].wmsStatus,'shipped');assert.equal(groups[1].wmsStatus,'placed');assert.equal(groups[1].tracking,null);
  groups=split({...base,lineItems:[item(1,'one',2)]});assert.equal(groups[0].wmsStatus,'packaging');assert.equal(groups[0].tracking,null);
  groups=split({...base,fulfillments:[shipment(1,1,'cancelled')]});assert.equal(groups[0].wmsStatus,'packaging');
  groups=split({...base,fulfillments:[{...shipment(1),shipment_status:'delivered'}]});assert.equal(groups[0].wmsStatus,'delivered');assert.equal(groups[1].wmsStatus,'placed');
});
test('account switch removes private legacy orders and previous saved preferences without deleting cart',()=>{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Minimal in-memory Storage implementation.
  const storage:any={orders_old:'private',blank_seoul_storage_owner:'A',blank_seoul_wishlist:'["A"]',blank_seoul_followed_artists:'["maker"]','blank-seoul-cart':'keep'};
  Object.defineProperties(storage,{getItem:{value:(k:string)=>storage[k]??null},setItem:{value:(k:string,v:string)=>storage[k]=v},removeItem:{value:(k:string)=>delete storage[k]}});
  prepareAccountStorage(storage,'B');assert.equal(storage.orders_old,undefined);assert.equal(storage.blank_seoul_wishlist,undefined);assert.equal(storage['blank-seoul-cart'],'keep');assert.equal(storage.blank_seoul_storage_owner,'B');
});
function adminClient(responses: (url:string, init:RequestInit)=>Promise<Response>) {
  const db={from:()=>({select:()=>({eq:()=>({single:async()=>({data:null})})}),upsert:async()=>({error:null})})};
  return load('lib/shopify/admin.ts',{'@/lib/supabase/admin':{supabaseAdmin:db}},{fetch:responses});
}
const rawOrder=(id:number,email='buyer@example.com')=>({id,email,admin_graphql_api_id:`gid://shopify/Order/${id}`,name:`#${id}`,processed_at:'2026-10-16',line_items:[],total_price:'33',currency:'USD',fulfillments:[]});
test('order history follows pages, verifies each email, and deduplicates returned orders',async()=>{
  const calls:string[]=[];const api=adminClient(async(url,init)=>{calls.push(url);assert.equal(init.cache,'no-store');assert.equal(init.redirect,'error');assert.ok(init.signal);
    if(url.includes('oauth'))return Response.json({access_token:'fake',expires_in:86400});
    if(url.includes('page_info='))return Response.json({orders:[rawOrder(1),rawOrder(21)]});
    return Response.json({orders:[rawOrder(1),rawOrder(2,'someone-else@example.com')]},{headers:{link:'<https://test.myshopify.com/admin/api/2025-10/orders.json?page_info=next>; rel="next"'}});
  });const orders=await api.getOrdersByEmail('Buyer@example.com');assert.equal(orders.length,2);assert.equal(orders[1].name,'#21');assert.equal(calls.length,3);
});
test('pagination cannot forward admin credentials to another host and query errors do not become empty results',async()=>{
  const api=adminClient(async(url)=>url.includes('oauth')?Response.json({access_token:'fake',expires_in:86400}):url.includes('graphql')?Response.json({errors:[{message:'failure'}]}):Response.json({orders:[]},{headers:{link:'<https://attacker.invalid/orders>; rel="next"'}}));
  await assert.rejects(api.getOrdersByEmail('buyer@example.com'),/pagination/);await assert.rejects(api.adminGraphQL('query Test'),/query failed/);
});
test('anonymous and unverified order requests do not acquire Shopify token or load orders',async()=>{
  for(const user of [null,{email:'buyer@example.com'}]){
    let calls=0;const api=load('app/api/orders/route.ts',{'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})}})},'@/lib/shopify/admin':{getOrdersByEmail:()=>{calls++;throw new Error('must not run')}},'@/lib/orders/enrichment':{},'@/lib/shopify/storefront':{},'@/lib/shopify/order-utils':{}});
    assert.equal((await api.GET()).status,401);assert.equal(calls,0);
  }
});

test('concurrent review submissions create one discount and save/send once', async () => {
  let discount: {title: string; endsAt: string} | null = null;
  let creations=0, emails=0, saved=false;
  const review={token:'private-review-token',rating:null,customer_email:'fixture@example.com',customer_name:'Fixture Buyer',token_expires_at:'2999-01-01'};
  const database={from:()=>({
    select:()=>({eq:()=>({single:async()=>({data:{...review},error:null})})}),
    update:()=>({eq:()=>({is:()=>({select:()=>({maybeSingle:async()=>{if(saved)return {data:null,error:null};saved=true;return {data:{id:1},error:null};}})})})}),
  })};
  const admin={adminGraphQL:async(query:string,variables:Record<string,unknown>)=>{
    if(query.includes('query ReviewDiscount'))return {data:{codeDiscountNodeByCode:discount?{codeDiscount:{...discount}}:null}};
    if(query.includes('mutation CreateDiscount')){
      if(discount)return {data:{discountCodeBasicCreate:{userErrors:[{message:'Code already exists'}]}}};
      creations++;discount={title:String(variables.title),endsAt:String(variables.endsAt)};
      return {data:{discountCodeBasicCreate:{codeDiscountNode:{id:'discount'},userErrors:[]}}};
    }throw new Error('Unexpected mutation');
  }};
  const api=load('app/api/review/route.ts',{'@/lib/supabase/admin':{supabaseAdmin:database},'@/lib/shopify/admin':admin,'@/emails':{sendCouponConfirmationEmail:async()=>{emails++;}},'@/lib/review-filter':{getReviewStatus:()=> 'approved'}});
  const request=()=>new Request('http://local/api/review',{method:'POST',body:JSON.stringify({token:review.token,rating:5,body:'Useful product.'})});
  const responses=await Promise.all([api.POST(request()),api.POST(request())]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(creations,1);assert.equal(emails,1);
});

test('expired review tokens and fractional ratings never issue discounts', async()=>{
  for(const scenario of [{expiry:'2000-01-01',rating:5,status:410},{expiry:'invalid',rating:5,status:410},{expiry:'2999-01-01',rating:2.5,status:400}]){
    const review={token_expires_at:scenario.expiry,rating:null};
    let calls=0;const db={from:()=>({select:()=>({eq:()=>({single:async()=>({data:review})})})})};
    const api=load('app/api/review/route.ts',{'@/lib/supabase/admin':{supabaseAdmin:db},'@/lib/shopify/review-discount':{ensureReviewDiscount:()=>{calls++;},reviewCouponCode:()=> 'code'},'@/emails':{},'@/lib/review-filter':{getReviewStatus:()=> 'approved'}});
    const result=await api.POST(new Request('http://local/api/review',{method:'POST',body:JSON.stringify({token:'fixture',rating:scenario.rating,body:'text'})}));
    assert.equal(result.status,scenario.status);assert.equal(calls,0);
  }
});

test('subscription forms verify identity and actual consent/tag writes before reporting success', async () => {
  for (const name of ['newsletter', 'waitlist']) {
    for (const mode of ['success', 'wrong-email', 'mutation-error', 'missing-create', 'create-conflict']) {
      let syncs = 0, mutations = 0;
      const api = load(`app/api/${name}/route.ts`, {
        '@/lib/shopify/admin': { adminGraphQL: async (query: string, variables: Record<string, unknown>) => {
          if (query.includes('query FindCustomer')) {
            assert.equal(variables.query, 'email:"buyer@example.com"');
            return { data: { customers: { edges: mode.startsWith('missing') || mode === 'create-conflict' ? [] : [{ node: { id: 'customer', email: mode === 'wrong-email' ? 'other@example.com' : 'buyer@example.com', tags: [name] } }] } } };
          }
          mutations++;
          if (query.includes('mutation Create')) return { data: { customerCreate: mode === 'create-conflict' ? { userErrors: [{ message: 'Email has already been taken' }] } : {} } };
          const input = variables.input as Record<string, unknown>;
          assert.equal(input.id, 'customer');
          assert.equal(input.tags, undefined); // tagsAdd preserves concurrently added tags.
          assert.equal((input.emailMarketingConsent as Record<string, unknown>).marketingState, 'SUBSCRIBED');
          return { data: { customerUpdate: { customer: { id: 'customer', emailMarketingConsent: { marketingState: 'SUBSCRIBED' } }, userErrors: mode === 'mutation-error' ? [{ message: 'failed' }] : [] }, tagsAdd: { node: { id: 'customer' }, userErrors: [] } } };
        } },
        '@/lib/supabase/admin': { supabaseAdmin: { from: () => ({ update: () => ({ eq: async () => { syncs++; return { error: null }; } }) }) } },
      });
      const response = await api.POST(new Request('http://local', { method: 'POST', body: JSON.stringify({ email: ' BUYER@example.com ' }) }));
      assert.equal(response.status, mode === 'success' ? 200 : mode === 'create-conflict' ? 400 : 502);
      assert.equal(syncs, mode === 'success' && name === 'newsletter' ? 1 : 0);
      if (mode === 'wrong-email') assert.equal(mutations, 0);
    }
  }
});

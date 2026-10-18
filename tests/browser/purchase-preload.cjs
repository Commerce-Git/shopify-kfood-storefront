/* Node --require preload must use CommonJS before Next starts. */
/* eslint-disable @typescript-eslint/no-require-imports */
const { graphql } = require('./purchase-fixtures.cjs');
const original = global.fetch;
global.fetch = async (input, init) => {
 const url = typeof input === 'string' ? input : input?.url || String(input);
 if (url.includes('.myshopify.com/') && url.includes('/graphql.json')) {
   const {query,variables} = JSON.parse(init?.body || '{}');
   return Response.json(graphql(query,variables));
 }
 if (url.includes('.supabase.co/auth/v1/user')) return Response.json(require('./account-fixtures.cjs').user);
 if (url.includes('.supabase.co/')) {
   if (init?.method && !['GET','HEAD'].includes(init.method)) throw new Error('Remote writes forbidden in local fixture review');
   return Response.json([], { headers:{'content-range':'0-0/0'} });
 }
 if (/^https?:/.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) throw new Error('Unmocked external request');
 return original(input,init);
};

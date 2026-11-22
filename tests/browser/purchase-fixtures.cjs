const image = { url: '/assets/blank_seoul_symbol.png', altText: 'Test pouch', width: 500, height: 500 };
function variant(id, color, size, qty, price) { return { id: `gid://shopify/ProductVariant/${id}`, title: `${color} / ${size}`, price: { amount: String(price), currencyCode: 'USD' }, compareAtPrice: null, selectedOptions: [{ name: 'Color', value: color }, { name: 'Size', value: size }], image, availableForSale: qty > 0, quantityAvailable: qty, currentlyNotInStock: false }; }
const variants = [variant(101, 'Blue', 'S', 5, 33), variant(102, 'Blue', 'M', 2, 40), variant(103, 'Red', 'S', 1, 42), variant(104, 'Green', 'S', 0, 44)];
const products = Array.from({length: 65}, (_,i) => ({ id: `gid://shopify/Product/${i+1}`, handle: `qa-pouch-${i+1}`, title: `Review Pouch ${i+1}`, description: 'Korean cotton pouch for local testing.', descriptionHtml: '<p>Korean cotton pouch for local testing.</p>', tags: ['material:Cotton'], vendor: 'QA Studio', productType: 'Bags & Pouches', availableForSale: true, images: {edges:[{node:image}]}, priceRange: {minVariantPrice:{amount:'33.00',currencyCode:'USD'},maxVariantPrice:{amount:'44.00',currencyCode:'USD'}}, variants:{pageInfo:{hasNextPage:false,endCursor:null},edges:variants.map(node=>({node}))} }));
function page(first=48, after, source=products) { const start=Number(after||0);const data=source.slice(start,start+first);return {pageInfo:{hasNextPage:start+first<source.length,endCursor:String(start+data.length)},edges:data.map((node,i)=>({cursor:String(start+i+1),node}))}; }
function graphql(query, variables={}) {
 if (query.includes('GetSavedProducts')) return {data:{nodes:variables.ids.map(id=>products.find(p=>p.id===id)||null)}};
 if (query.includes('GetVariantStock')) return {data:{node:variants.find(v=>v.id===variables.id)||null}};
 if (query.includes('GetProductByHandle')) {
   const product = structuredClone(products.find(p => p.handle === variables.handle) ?? null);
   if (product && variables.country === 'DE') {
     for (const {node} of product.variants.edges) node.price.amount = String(Number(node.price.amount) + 10);
     for (const price of Object.values(product.priceRange)) price.amount = String(Number(price.amount) + 10);
   }
   return {data:{product}};
 }
 if (query.includes('GetAllProducts')) return {data:{products:page(variables.first,variables.after)}};
 if (query.includes('GetCollectionByHandle')) return {data:{collection:{id:'collection',handle:variables.handle,title:'Bags & Pouches',description:'Collection',products:page(variables.first,variables.after,variables.handle==='bags-pouches'?products:[])}}};
 if (query.includes('ProductSuggestions') || query.includes('SearchProducts')) {
   const term = variables.query.trim().toLowerCase();
   const matches = products.filter(product =>
     [product.title, product.vendor, product.productType, ...product.tags].some(value => value.toLowerCase().includes(term))
   );
   if (query.includes('ProductSuggestions')) {
     return {data: {predictiveSearch: {products: matches.slice(0, 3).map(({handle, title}) => ({handle, title, featuredImage: image}))}}};
   }
   return {data: {search: {...page(variables.first, variables.after, matches), totalCount: matches.length}}};
 }
 if (query.includes('GetAllCollections')) return {data:{collections:{edges:[]}}};
 throw new Error('Unexpected fixture query: '+query.slice(0,70));
}
module.exports={graphql,products,variants};

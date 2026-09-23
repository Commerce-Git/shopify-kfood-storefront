# 소스 인벤토리 — 자동 수집

수집 시각(UTC): 2026-09-23T16:06:40.710224+00:00

경로·메서드·직접 DB/RPC 참조·가드 심볼을 정규식으로 수집했다. 주석·미사용 코드도 포함할 수 있고, 동적 참조·간접 호출·재수출은 누락할 수 있다. 모듈은 경로 기반 후보이며 보안 통과/실제 배포/구현 완료를 뜻하지 않는다. 전체 파일 해시·임포트·환경변수 이름·SQL 객체 후보는 `inventory.json`에 있다. 비밀값은 수집하지 않는다.

## storefront

루트: `/Users/junseoha/Downloads/blank-seoul-storefront`  
브랜치: `main` · HEAD: `fb92ec04384bb504511894b407f332cea3af96e2`

### 조사 시작 시 변경 상태

```text
M .gitignore
 M app/api/artists/broadcast/route.ts
 M app/api/artists/follow/route.ts
 M app/api/orders/route.ts
 M app/api/revalidate/route.ts
 M app/api/stock/route.ts
 M app/api/unsubscribe/route.ts
 M app/api/views/route.ts
 M app/api/webhooks/resend/route.ts
 M app/api/wishlist-products/route.ts
 M app/cart/page.tsx
 M app/components/BuyButton.tsx
 M app/components/CartProvider.tsx
 M app/components/NewsletterCTA.tsx
 M app/components/ProductGallery.tsx
 M app/components/Reviews.tsx
 M app/layout.tsx
 M app/product/[handle]/page.tsx
 M app/product/preview/page.tsx
 M app/sitemap.ts
 M app/unsubscribe/page.tsx
 M eslint.config.mjs
 M lib/hooks/useArtistFollow.ts
 M lib/hooks/useLaunchWaitlist.ts
 M lib/shopify/admin.ts
 M lib/shopify/api.ts
 M lib/shopify/order-utils.ts
 M lib/shopify/preview-adapter.ts
 M lib/shopify/queries.ts
 M lib/shopify/storefront.ts
 M next.config.ts
 M package.json
 M tsconfig.json
?? .agent-bridge/
?? app/fonts/
?? docs/PLATFORM_ANALYSIS_PLAN.md
?? docs/PROJECT_DIRECTION.md
?? docs/review/2026-09-24-fulfillment-review.md
?? lib/browser-storage.ts
?? lib/errors.ts
?? lib/hooks/useStoredValue.ts
?? scripts/agent-bridge-front.mjs
?? scripts/analysis/
?? scripts/build-offline.mjs
?? tests/agent-bridge-models.test.mjs
?? tests/unit/catalog-pagination-and-schema.test.ts
?? tests/unit/offline-regressions.test.ts
```

### 분류별 파일 수

| 분류 | 수 |
| --- | --- |
| api | 25 |
| page | 21 |
| script | 7 |
| source | 106 |
| sql | 15 |
| test | 4 |

### 페이지·라우트 전체 목록

| 파일 | 종류/HTTP 메서드 | 모듈 후보 | 직접 DB/RPC 참조 | 가드 심볼(판정 아님) |
| --- | --- | --- | --- | --- |
| app/about/page.tsx | page: 페이지 | M04 | — | — |
| app/account/login/page.tsx | page: 페이지 | M01 | — | — |
| app/account/orders/[id]/page.tsx | page: 페이지 | M05 | — | — |
| app/account/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/api/artists/broadcast/route.ts | api: POST | M10 | active_artist_drop_subscribers | — |
| app/api/artists/follow/route.ts | api: GET, POST | M10 | — | — |
| app/api/cancel-order/route.ts | api: POST | M08 | reviews, storefront_cancel_requests | getUser |
| app/api/cart-companions/route.ts | api: GET | M04 | — | — |
| app/api/clean-collections/route.ts | api: GET | M04 | — | — |
| app/api/cron/coupon-reminder/route.ts | api: GET | M11 | reviews | — |
| app/api/cron/send-review-request/route.ts | api: GET | M11 | reviews | — |
| app/api/feedback/route.ts | api: POST | M10 | customer_feedback | — |
| app/api/inquiries/[...path]/route.ts | api: GET, OPTIONS, POST | M10 | — | — |
| app/api/inquiries/route.ts | api: GET, OPTIONS, POST | M10 | — | — |
| app/api/inspect/route.ts | api: GET | UNCLASSIFIED | — | — |
| app/api/launch-waitlist/route.ts | api: GET, POST | M10 | — | — |
| app/api/my-coupons/route.ts | api: GET | M10 | reviews | getUser |
| app/api/newsletter/route.ts | api: POST | M10 | storefront_customers | — |
| app/api/orders/route.ts | api: GET | M05 | artist_orders, order_status_view | getUser |
| app/api/revalidate/route.ts | api: GET, POST | M11 | — | — |
| app/api/review/route.ts | api: GET, POST | M10 | reviews | — |
| app/api/stock/route.ts | api: GET | M06 | — | — |
| app/api/track-order/route.ts | api: POST | M07 | artist_orders, order_status_view | getUser |
| app/api/unsubscribe/route.ts | api: POST | M10 | customer_followed_artists, storefront_customers | — |
| app/api/views/route.ts | api: GET, POST | M10 | product_views | — |
| app/api/waitlist/route.ts | api: POST | M10 | — | — |
| app/api/webhooks/resend/route.ts | api: POST | M11 | customer_followed_artists, storefront_customers | — |
| app/api/wishlist-products/route.ts | api: GET | M10 | — | — |
| app/artists/[slug]/page.tsx | page: 페이지 | M04 | — | — |
| app/artists/page.tsx | page: 페이지 | M04 | — | — |
| app/auth/callback/route.ts | api: GET | M01 | storefront_customers | — |
| app/cart/page.tsx | page: 페이지 | M04 | — | — |
| app/collections/[handle]/page.tsx | page: 페이지 | M04 | — | — |
| app/collections/page.tsx | page: 페이지 | M04 | — | — |
| app/faq/page.tsx | page: 페이지 | M04 | — | — |
| app/order-lookup/page.tsx | page: 페이지 | M05 | — | — |
| app/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/policies/privacy/page.tsx | page: 페이지 | M04 | — | — |
| app/policies/returns/page.tsx | page: 페이지 | M08 | — | — |
| app/policies/shipping/page.tsx | page: 페이지 | M04 | — | — |
| app/policies/terms/page.tsx | page: 페이지 | M04 | — | — |
| app/product/[handle]/page.tsx | page: 페이지 | M03 | reviews | — |
| app/product/preview/page.tsx | page: 페이지 | M10 | — | — |
| app/review/page.tsx | page: 페이지 | M10 | — | — |
| app/unsubscribe/page.tsx | page: 페이지 | M10 | — | — |
| app/wishlist/page.tsx | page: 페이지 | M10 | — | — |

### SQL 파일 및 CREATE 객체 후보

| 파일 | 객체 후보 |
| --- | --- |
| scripts/create-product-views.sql | product_views |
| scripts/create-token-cache.sql | shopify_token_cache |
| supabase/migrations/002_create_reviews.sql | reviews |
| supabase/migrations/003_create_email_opt_out.sql | email_opt_out |
| supabase/migrations/004_create_customer_feedback.sql | customer_feedback |
| supabase/migrations/005_create_storefront_customers.sql | storefront_customers |
| supabase/migrations/006_create_storefront_cancel_requests.sql | storefront_cancel_requests |
| supabase/migrations/007_create_customer_wishlist.sql | customer_wishlist |
| supabase/migrations/007_optimize_disk_io_indexes.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/008_create_customer_followed_artists.sql | customer_followed_artists |
| supabase/migrations/009_optimize_customer_followed_artists.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/010_enhance_followed_artists_governance.sql | active_artist_drop_subscribers |
| supabase/migrations/20260428_create_reviews.sql | reviews |
| supabase/migrations/add_least_favorite.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/feedback_table.sql | feedback |

### 스크립트·테스트 목록

실행하지 않고 파일만 목록화했다. 특히 `test`라는 이름도 실제 DB·외부 서비스에 쓰기를 할 수 있으므로 실행 전 검사한다.

| 파일 | 분류 |
| --- | --- |
| scripts/agent-bridge-front.mjs | script |
| scripts/build-offline.mjs | script |
| scripts/dev-email.js | script |
| scripts/scrape-idus.js | script |
| scripts/test-review-email.ts | script |
| scripts/update-handles.js | script |
| scripts/verify-observability.ts | script |
| tests/agent-bridge-models.test.mjs | test |
| tests/unit/catalog-pagination-and-schema.test.ts | test |
| tests/unit/offline-regressions.test.ts | test |
| tests/unit/order-ownership.test.ts | test |

### DB/RPC 직접 참조 역색인

| 대상 | 참조 파일 |
| --- | --- |
| active_artist_drop_subscribers | app/api/artists/broadcast/route.ts |
| artist_accounts | lib/artists.ts |
| artist_orders | app/api/orders/route.ts, app/api/track-order/route.ts |
| customer_feedback | app/api/feedback/route.ts |
| customer_followed_artists | app/api/unsubscribe/route.ts, app/api/webhooks/resend/route.ts, lib/followed-artists.ts |
| customer_wishlist | lib/wishlist.ts |
| order_status_view | app/api/orders/route.ts, app/api/track-order/route.ts |
| product_views | app/api/views/route.ts |
| reviews | app/api/cancel-order/route.ts, app/api/cron/coupon-reminder/route.ts, app/api/cron/send-review-request/route.ts, app/api/my-coupons/route.ts, app/api/review/route.ts, app/product/[handle]/page.tsx |
| shopify_token_cache | lib/shopify/admin.ts |
| storefront_cancel_requests | app/api/cancel-order/route.ts |
| storefront_customers | app/api/newsletter/route.ts, app/api/unsubscribe/route.ts, app/api/webhooks/resend/route.ts, app/auth/callback/route.ts, app/components/AuthProvider.tsx |

## admin

루트: `/Users/junseoha/Downloads/blank-seoul-admin`  
브랜치: `dev` · HEAD: `0c9481346f68ca78e2c5f4223c9df639ae6f6727`

### 조사 시작 시 변경 상태

```text
M .gitignore
 M app/3pl/dashboard/components/wizard/WizardContext.tsx
 M app/3pl/dashboard/hooks/useInboundScanner.ts
 M app/api/3pl/inbound-sku/route.ts
 M app/api/3pl/pack-complete/route.ts
 M app/api/artist/inquiries/[token]/messages/route.ts
 M app/api/artist/inquiries/[token]/route.ts
 M app/api/artist/inquiries/upload/route.ts
 M app/api/inquiries/[token]/route.ts
 D doc/agent-bridge/COMMAND.md
 D doc/agent-bridge/README.md
 D doc/agent-bridge/REPORT.md
 M lib/3pl/inboundService.ts
 M lib/supabase/stock.ts
 M tests/unit/security-boundaries.test.ts
?? .agent-bridge/
?? .gemini/settings.json
?? doc/project_analysis_guide/
?? supabase/migrations/20260923_04_stock_and_inbound_hardening.sql
```

### 분류별 파일 수

| 분류 | 수 |
| --- | --- |
| api | 125 |
| page | 24 |
| script | 254 |
| source | 414 |
| sql | 66 |
| test | 1 |

### 페이지·라우트 전체 목록

| 파일 | 종류/HTTP 메서드 | 모듈 후보 | 직접 DB/RPC 참조 | 가드 심볼(판정 아님) |
| --- | --- | --- | --- | --- |
| app/3pl/dashboard/page.tsx | page: 페이지 | M07 | — | — |
| app/3pl/login/page.tsx | page: 페이지 | M01 | — | — |
| app/3pl/packing-slip/page.tsx | page: 페이지 | M07 | — | — |
| app/3pl/page.tsx | page: 페이지 | M07 | — | — |
| app/api/3pl/auth/route.ts | api: DELETE, GET, POST | M01 | accounts_3pl, settings | get3plToken |
| app/api/3pl/batch-submit/route.ts | api: POST | M07 | settings | get3plToken |
| app/api/3pl/crossdock-submit/route.ts | api: POST | M07 | settings | get3plToken |
| app/api/3pl/inbound-sku/route.ts | api: POST | M06 | — | get3plToken |
| app/api/3pl/inventory/route.ts | api: DELETE, GET, PATCH, POST | M06 | artist_orders, master_products, orders, warehouse_inventory | get3plToken |
| app/api/3pl/ledger/route.ts | api: GET | M06 | artist_orders, ems_history, orders | get3plToken |
| app/api/3pl/login/route.ts | api: POST | M01 | — | — |
| app/api/3pl/orders/route.ts | api: GET, POST, PUT | M07 | artist_orders, ems_history, master_products, orders, settings | get3plToken |
| app/api/3pl/orders/split/route.ts | api: POST | M07 | artist_orders, orders | get3plToken |
| app/api/3pl/pack-complete/route.ts | api: POST | M07 | artist_orders, ems_history, orders, packing_fulfillment_records, settings | get3plToken |
| app/api/3pl/packing-slip/route.ts | api: GET | M07 | artist_orders, orders | get3plToken |
| app/api/3pl/test-order/route.ts | api: DELETE, GET, POST | M07 | artist_orders, ems_history, orders | get3plToken |
| app/api/admin/hscode/recommend/route.ts | api: GET | M03 | — | requireAdmin |
| app/api/admin/hscode/validate/route.ts | api: POST | M03 | — | requireAdmin |
| app/api/admin/hscode/wizard/route.ts | api: GET, POST | M03 | — | requireAdmin |
| app/api/admin/orders/route.ts | api: GET, PATCH, PUT | M05 | artist_accounts, artist_orders, ems_history | requireAdmin |
| app/api/admin/popbill/balance/route.ts | api: GET | M09 | — | requireAdmin |
| app/api/admin/reconcile-shopify/route.ts | api: GET | UNCLASSIFIED | master_products | requireAdmin |
| app/api/admin/reorganize-collections/route.ts | api: GET | M04 | — | requireAdmin |
| app/api/admin/settlement/export/route.ts | api: GET | M09 | artist_accounts, artist_orders, tax_invoices | requireAdmin |
| app/api/admin/settlement/payouts/route.ts | api:  | M09 | — | — |
| app/api/admin/settlement/route.ts | api: GET | M09 | artist_accounts, artist_orders, tax_invoices | requireAdmin |
| app/api/admin/tax-invoices/reverse-issue/route.ts | api: POST | M09 | artist_accounts, tax_invoices | requireAdmin |
| app/api/admin/tax-invoices/route.ts | api: GET, PATCH, PUT | M09 | artist_accounts, artist_orders, tax_invoices | requireAdmin |
| app/api/apply-shopify-categories/route.ts | api: GET | M03 | master_products | — |
| app/api/artist/account/reset/route.ts | api: POST | M01 | artist_accounts | verifyArtistRequest |
| app/api/artist/account/route.ts | api: GET, PUT | M02 | artist_accounts | verifyArtistRequest |
| app/api/artist/auth/kakao-login/route.ts | api: GET | M01 | artist_accounts | getUser |
| app/api/artist/auth/logout/route.ts | api: POST | M01 | — | — |
| app/api/artist/check-name/route.ts | api: GET | UNCLASSIFIED | — | — |
| app/api/artist/create-account/route.ts | api: GET, POST, PUT | M02 | artist_accounts, master_products | verifyArtistRequest |
| app/api/artist/error-report/route.ts | api: POST | UNCLASSIFIED | — | — |
| app/api/artist/inquiries/[token]/messages/route.ts | api: POST | M10 | inquiry_messages, inquiry_threads | verifyArtistRequest |
| app/api/artist/inquiries/[token]/route.ts | api: GET | M10 | inquiry_messages, inquiry_threads | verifyArtistRequest |
| app/api/artist/inquiries/preview-translation/route.ts | api: POST | M10 | — | verifyArtistRequest |
| app/api/artist/inquiries/route.ts | api: GET, PATCH | M10 | inquiry_threads, mark_inquiry_messages_read() | verifyArtistRequest |
| app/api/artist/inquiries/upload/route.ts | api: POST | M10 | inquiry_threads | verifyArtistRequest |
| app/api/artist/inventory/bulk/route.ts | api: PUT | M03 | master_products | verifyArtistRequest |
| app/api/artist/invoices/route.ts | api: GET | M09 | artist_accounts, artist_orders, tax_invoices | verifyArtistRequest |
| app/api/artist/orders/route.ts | api: GET, PUT | M05 | artist_orders, master_products | verifyArtistRequest |
| app/api/artist/popbill/cert-url/route.ts | api: POST | M09 | artist_accounts | verifyArtistRequest |
| app/api/artist/popbill/invoice-viewer-url/route.ts | api: POST | M09 | artist_accounts | verifyArtistRequest |
| app/api/artist/popbill/join/route.ts | api: POST | M09 | artist_accounts | verifyArtistRequest |
| app/api/artist/popbill/sso-url/route.ts | api: POST | M09 | artist_accounts | verifyArtistRequest |
| app/api/artist/popbill/status/route.ts | api: GET | M09 | artist_accounts, settlement_orders, tax_invoices | verifyArtistRequest |
| app/api/artist/products/delete/route.ts | api: DELETE | M03 | master_products | verifyArtistRequest |
| app/api/artist/products/register/route.ts | api: PATCH, POST | M03 | artist_accounts, master_products | verifyArtistRequest |
| app/api/artist/products/route.ts | api: GET | M03 | master_products | verifyArtistRequest |
| app/api/artist/products/submit/route.ts | api: POST, PUT | M03 | artist_accounts, master_products | verifyArtistRequest |
| app/api/artist/profile/route.ts | api: DELETE, GET, POST | M02 | artist_accounts | verifyArtistRequest |
| app/api/artist/request-rename/route.ts | api: DELETE, GET, POST | M02 | artist_accounts, artist_rename_requests | verifyArtistRequest |
| app/api/artist/request-review/route.ts | api: POST | M10 | artist_accounts, master_products | getUser |
| app/api/artist/send-otp/route.ts | api: POST | M01 | artist_accounts, email_verifications | — |
| app/api/artist/settlements/route.ts | api: GET | M09 | artist_accounts, artist_orders | verifyArtistRequest |
| app/api/artist/tax-invoices/route.ts | api: GET, PUT | M09 | artist_accounts, artist_orders, tax_invoices | verifyArtistRequest |
| app/api/artist/terms-agree/route.ts | api: POST | M02 | artist_accounts | verifyArtistRequest |
| app/api/artist/test-email/route.ts | api: POST | M12 | — | verifyArtistRequest |
| app/api/artist/update/route.ts | api: PUT | M03 | master_products | verifyArtistRequest |
| app/api/artist/upload/route.ts | api: DELETE, POST | UNCLASSIFIED | master_products | verifyArtistRequest |
| app/api/artist/upload-ticket/route.ts | api: POST | UNCLASSIFIED | master_products | verifyArtistRequest |
| app/api/artist/verify-bank-account/route.ts | api: POST | M02 | — | — |
| app/api/artist/verify-business/route.ts | api: POST | M02 | — | — |
| app/api/artist/verify-otp/route.ts | api: POST | M01 | email_verifications | — |
| app/api/artists/route.ts | api: GET | M04 | master_products | — |
| app/api/auth/callback/route.ts | api: GET | M01 | artist_accounts | — |
| app/api/cleanup-legacy-shopify-collections/route.ts | api: GET | M04 | — | — |
| app/api/create-and-assign-shopify-collections/route.ts | api: GET | M04 | master_products | — |
| app/api/cron/auto-pipeline/route.ts | api: POST | M11 | ems_history, settings | requireCronSecret |
| app/api/cron/process-sync-jobs/route.ts | api: GET, POST | M11 | sync_jobs | requireCronSecret |
| app/api/cron/send-artist-emails/route.ts | api: GET, POST | M11 | artist_accounts, artist_orders, master_products, settings | requireAdmin, requireCronSecret |
| app/api/errors/route.ts | api: GET, PUT | M12 | artist_error_reports | — |
| app/api/inquiries/[token]/messages/route.ts | api: OPTIONS, POST | M10 | inquiry_messages, inquiry_threads | — |
| app/api/inquiries/[token]/route.ts | api: GET, OPTIONS | M10 | inquiry_messages, inquiry_threads, mark_inquiry_messages_read() | — |
| app/api/inquiries/route.ts | api: OPTIONS, POST | M10 | artist_accounts, inquiry_messages, inquiry_threads | — |
| app/api/manage/accounts-3pl/route.ts | api: DELETE, GET, POST, PUT | M03 | accounts_3pl | requireAdmin |
| app/api/manage/approve-product/route.ts | api: PUT | M03 | master_products | requireAdmin |
| app/api/manage/artist-options/route.ts | api: GET | M03 | artist_accounts | requireAdmin |
| app/api/manage/artists/delete/route.ts | api: DELETE, GET, POST | M03 | artist_accounts, artist_orders, artist_rename_requests, master_products | requireAdmin |
| app/api/manage/artists/profile/route.ts | api: POST | M03 | artist_accounts | requireAdmin |
| app/api/manage/artists/rename/route.ts | api: GET, POST | M02 | artist_accounts, artist_orders, master_products | requireAdmin |
| app/api/manage/artists/rename-requests/count/route.ts | api: GET | M02 | artist_rename_requests | requireAdmin |
| app/api/manage/artists/rename-requests/route.ts | api: GET, POST | M02 | artist_accounts, artist_orders, artist_rename_requests, master_products | requireAdmin |
| app/api/manage/auto-categorize/route.ts | api: POST | M03 | master_products | requireAdmin |
| app/api/manage/export-catalog/route.ts | api: GET, POST | M03 | master_products | requireAdmin |
| app/api/manage/inquiries/preview-translation/route.ts | api: POST | M10 | — | requireAdmin |
| app/api/manage/inquiries/route.ts | api: GET, PATCH | M10 | inquiry_threads, mark_inquiry_messages_read() | requireAdmin |
| app/api/manage/items/route.ts | api: GET | M03 | master_products | requireAdmin |
| app/api/manage/recalculate-margins/route.ts | api: POST | M03 | master_products | requireAdmin |
| app/api/manage/update/route.ts | api: PUT | M03 | master_products | requireAdmin |
| app/api/manage/update-hscodes/route.ts | api: GET | M03 | master_products | requireAdmin |
| app/api/manage/verify-epost-hscode/route.ts | api: POST | M07 | — | requireAdmin |
| app/api/orders/cleanup/route.ts | api: DELETE, GET | M05 | artist_orders, ems_history, orders, pn_requests | — |
| app/api/orders/route.ts | api: GET | M05 | artist_orders, ems_history | — |
| app/api/orders/seed/route.ts | api: POST | M05 | — | — |
| app/api/pipeline/ems-build/route.ts | api: POST | M07 | — | — |
| app/api/pipeline/ems-submit/route.ts | api: POST | M07 | — | — |
| app/api/pipeline/pn-generate/route.ts | api: POST | M12 | settings | — |
| app/api/procurement/inventory/route.ts | api: GET, POST | M03 | inventory_settings | — |
| app/api/procurement/inventory-settings/route.ts | api: POST | M03 | inventory_settings | — |
| app/api/procurement/purchase-orders/route.ts | api: GET, PATCH, POST | M05 | purchase_order_items, purchase_orders | — |
| app/api/procurement/vendors/route.ts | api: GET, POST | M03 | vendors | — |
| app/api/products/route.ts | api: GET | M03 | — | — |
| app/api/proxy-image/route.ts | api: GET | M12 | — | — |
| app/api/seed-test-data/route.ts | api: GET | UNCLASSIFIED | — | — |
| app/api/settings/route.ts | api: GET, POST | M12 | settings | — |
| app/api/shopify/register/route.ts | api: POST | UNCLASSIFIED | master_products | — |
| app/api/shopify/sync/route.ts | api: GET | M11 | master_products | — |
| app/api/shopify/sync-bulk/route.ts | api: POST | M11 | master_products | — |
| app/api/shopify/sync-media/route.ts | api: POST | M11 | master_products | — |
| app/api/shopify/sync-orders/route.ts | api: POST | M11 | artist_orders | — |
| app/api/shopify/sync-product/route.ts | api: POST | M11 | master_products | — |
| app/api/shopify/unpublish/route.ts | api: POST | UNCLASSIFIED | master_products | — |
| app/api/shopify/webhook/inventory/route.ts | api: POST | M11 | master_products | verifyShopifyWebhook |
| app/api/shopify/webhook/orders/route.ts | api: POST | M11 | artist_orders, master_products | verifyShopifyWebhook |
| app/api/shopify/webhook/orders-cancel/route.ts | api: POST | M08 | artist_orders, orders | verifyShopifyWebhook |
| app/api/shopify/webhook/orders-delete/route.ts | api: POST | M08 | artist_orders, ems_history, orders, pn_requests | verifyShopifyWebhook |
| app/api/shopify/webhook/products/route.ts | api: POST | M11 | master_products | verifyShopifyWebhook |
| app/api/shopify/webhook/refunds/route.ts | api: POST | M08 | apply_shopify_refund() | verifyShopifyWebhook |
| app/api/sourcing/items/route.ts | api: DELETE, GET, POST | M03 | artist_orders, master_products | — |
| app/api/tax-invoice/webhook/route.ts | api: POST | M09 | tax_invoices | — |
| app/api/test/alimtalk/route.ts | api: DELETE, GET, POST | M12 | notification_logs | — |
| app/api/test/epost/route.ts | api: POST | M07 | — | — |
| app/api/test/set-inventory-zero/route.ts | api: POST | M12 | master_products | — |
| app/api/vendor/[token]/route.ts | api: GET, PATCH | M03 | purchase_orders | — |
| app/api/webhooks/17track/route.ts | api: GET, POST | M11 | ems_history | — |
| app/artist/dashboard/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/artist/join/page.tsx | page: 페이지 | M02 | — | — |
| app/artist/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/errors/page.tsx | page: 페이지 | M12 | — | — |
| app/login/page.tsx | page: 페이지 | M01 | — | — |
| app/manage/accounts-3pl/page.tsx | page: 페이지 | M03 | — | — |
| app/manage/accounts-artist/page.tsx | page: 페이지 | M02 | — | — |
| app/manage/inquiries/page.tsx | page: 페이지 | M10 | — | — |
| app/manage/page.tsx | page: 페이지 | M03 | — | — |
| app/orders/page.tsx | page: 페이지 | M05 | — | — |
| app/overseas-entity/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/privacy/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/procurement/page.tsx | page: 페이지 | M03 | — | — |
| app/settlement/page.tsx | page: 페이지 | M09 | — | — |
| app/terms/page.tsx | page: 페이지 | UNCLASSIFIED | — | — |
| app/test/alimtalk/page.tsx | page: 페이지 | M12 | — | — |
| app/test/epost/page.tsx | page: 페이지 | M07 | — | — |
| app/test/page.tsx | page: 페이지 | M12 | — | — |
| app/vendor/[token]/page.tsx | page: 페이지 | M03 | — | — |

### SQL 파일 및 CREATE 객체 후보

| 파일 | 객체 후보 |
| --- | --- |
| lib/supabase/migrations/20260724_add_missing_master_products_columns.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260724_create_artists_and_master_products.sql | public.artists, public.master_products |
| lib/supabase/migrations/20260729_add_sub_category_to_master_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260729_bulk_update_model_a_taxonomy.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_add_shopify_meta_to_master_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_bulk_update_all_52_products_model_a.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_bulk_update_option_a_all_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_fill_fresh_unsent_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_fill_real_unsent_products_only.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_fill_unsent_products_data.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_fill_unsent_products_data_v2.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_update_5_unregistered_master_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260730_update_filtered_dump_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260801_drop_sourcing_items_category.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260803_drop_manage_code.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260807_add_sourcing_category.sql | ALTER/정책/데이터 등; 원문 확인 |
| lib/supabase/migrations/20260818_artist_product_registration.sql | ALTER/정책/데이터 등; 원문 확인 |
| scripts/add-read-at.sql | ALTER/정책/데이터 등; 원문 확인 |
| scripts/create-ems-history.sql | public.ems_history |
| scripts/create-inquiries-schema.sql | public.inquiry_messages, public.inquiry_threads |
| scripts/create-settings.sql | public.settings |
| scripts/enable-rls.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/add-delivery-tracking.sql | public.order_status_view |
| supabase/add_customs_title.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/add_rack_location.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260824_add_terms_agreed_at.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260824_consolidated_production_migration.sql | public.artist_rename_requests, public.email_verifications |
| supabase/migrations/20260824_create_artist_rename_requests.sql | artist_rename_requests |
| supabase/migrations/20260824_create_email_verifications.sql | public.email_verifications |
| supabase/migrations/20260824_sync_all_missing_test_columns.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260825_add_artist_name_en.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260825_add_artist_profile_avatar.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260825_add_artist_rename_requests_en.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260825_seed_artist_name_en.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260825_unique_sku_prefix.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260831_create_hscode_master.sql | hscode_master |
| supabase/migrations/20260901_add_artist_legal_and_tax_columns.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260903_add_opening_date_and_auth_uid.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260903_self_serve_rename_setup.sql | public.artist_rename_requests |
| supabase/migrations/20260907_optimize_disk_io_indexes.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260909_add_artist_en_to_master_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260911_optimize_3pl_disk_io_indexes.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260913_scale_10k_phase1_indexes.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260913_scale_10k_phase2_sync_queue.sql | public.claim_sync_jobs, public.sync_jobs |
| supabase/migrations/20260913_scale_10k_phase3_catalog_perf.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260915_add_artist_and_actual_weight_columns.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260915_add_tpl_stock_quantity_to_master_products.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260915_drop_legacy_artist_orders_columns.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260915_option_b_drop_legacy_weight_grams.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260916_create_inventory_adjustments.sql | public.inventory_adjustments |
| supabase/migrations/20260918_scale_10k_inventory_batch.sql | public.release_worker_lease, public.sync_worker_leases, public.try_acquire_worker_lease |
| supabase/migrations/20260922_add_artist_and_attachments_to_inquiries.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260922_add_inquiry_performance_indexes.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260922_create_inquiries_schema.sql | public.inquiry_messages, public.inquiry_threads |
| supabase/migrations/20260923_01_add_security_tables.sql | public.adjust_warehouse_stock, public.count_inquiry_message, public.tpl_sessions, public.warehouse_inventory |
| supabase/migrations/20260923_02_revoke_direct_access.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/20260923_03_close_remaining_access_and_stock.sql | public.apply_warehouse_stock_change, public.mark_inquiry_messages_read |
| supabase/migrations/20260923_04_stock_and_inbound_hardening.sql | public.apply_warehouse_batch_stock_change, public.apply_warehouse_stock_change, public.packing_fulfillment_records, public.tpl_inbound_requests |
| supabase/migrations/20260923_hardening_refunds.sql | public.apply_shopify_refund, public.processed_refunds |
| supabase/migrations/add_artist_indexes.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/migrations/add_onboarding_status.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/multi_warehouse_setup.sql | public.warehouse_inventory, public.warehouse_transactions |
| supabase/remove_ds_remnants.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/setup.sql | public.batches, public.orders, public.products, public.skipped_orders |
| supabase/update_pn_requests.sql | ALTER/정책/데이터 등; 원문 확인 |
| supabase/update_pn_requests2.sql | ALTER/정책/데이터 등; 원문 확인 |

### 스크립트·테스트 목록

실행하지 않고 파일만 목록화했다. 특히 `test`라는 이름도 실제 DB·외부 서비스에 쓰기를 할 수 있으므로 실행 전 검사한다.

| 파일 | 분류 |
| --- | --- |
| scripts/add-3pl-columns.js | script |
| scripts/add-markets.ts | script |
| scripts/add-read-at.js | script |
| scripts/add-remaining-products.ts | script |
| scripts/add-shipping-zones.ts | script |
| scripts/add-tpl-stock-column.js | script |
| scripts/apply-inquiries-migration.ts | script |
| scripts/apply-legal-columns.js | script |
| scripts/apply-opening-date-migration.ts | script |
| scripts/apply-shopify-11-collections.ts | script |
| scripts/apply-weight-verification-migration.ts | script |
| scripts/archived-routes/admin/backfill-customs-title/route.ts | script |
| scripts/archived-routes/admin/drop-sourcing-category/route.ts | script |
| scripts/archived-routes/admin/fix-hscode-7117909000/route.ts | script |
| scripts/archived-routes/admin/inspect-hip/route.ts | script |
| scripts/archived-routes/admin/inspect-live-schema/route.ts | script |
| scripts/archived-routes/admin/inspect-sourcing-schema/route.ts | script |
| scripts/archived-routes/admin/migrate-dual-stock/route.ts | script |
| scripts/archived-routes/admin/migrate-manage-code/route.ts | script |
| scripts/archived-routes/admin/migrate-sku-prefix/route.ts | script |
| scripts/archived-routes/admin/test-manage-code/route.ts | script |
| scripts/archived-routes/admin/test-query/route.ts | script |
| scripts/archived-routes/admin/test-sync-bulk/route.ts | script |
| scripts/archived-routes/admin/test-sync-ok/route.ts | script |
| scripts/archived-routes/admin/trace-sync/route.ts | script |
| scripts/archived-routes/auto-fill-unsent-items/route.ts | script |
| scripts/archived-routes/check-test-data/route.ts | script |
| scripts/archived-routes/debug/route.ts | script |
| scripts/archived-routes/fill-unsent/route.ts | script |
| scripts/archived-routes/find-valid-epost-hscodes/route.ts | script |
| scripts/archived-routes/find-valid-epost-hscodes-hair/route.ts | script |
| scripts/archived-routes/heal-thumbnails/route.ts | script |
| scripts/archived-routes/inspect-hsk/route.ts | script |
| scripts/archived-routes/inspect-shopify/route.ts | script |
| scripts/archived-routes/manage/sync-dump/route.ts | script |
| scripts/archived-routes/manage/sync-dump-run/route.ts | script |
| scripts/archived-routes/report-error/route.ts | script |
| scripts/archived-routes/temp-sync-dump/route.ts | script |
| scripts/archived-routes/test-epost-hsk/route.ts | script |
| scripts/audit-category-hscode-status.ts | script |
| scripts/audit_hscode_precision.ts | script |
| scripts/audit_multinational_hscode.ts | script |
| scripts/auto-categorize-direct.js | script |
| scripts/backfill-inventory-ids.ts | script |
| scripts/backup-pre-launch-full.ts | script |
| scripts/backup-shopify-products.ts | script |
| scripts/check-all-handles.ts | script |
| scripts/check-and-publish-collections.ts | script |
| scripts/check-collections.ts | script |
| scripts/check-content.ts | script |
| scripts/check-current-products.ts | script |
| scripts/check-db-schema-direct.ts | script |
| scripts/check-db-scratch.js | script |
| scripts/check-descriptions.ts | script |
| scripts/check-handles.ts | script |
| scripts/check-improvements.ts | script |
| scripts/check-inv-input.ts | script |
| scripts/check-inv-schema.ts | script |
| scripts/check-inventory-and-collections.ts | script |
| scripts/check-markets.ts | script |
| scripts/check-pouch-images.ts | script |
| scripts/check-pouch.js | script |
| scripts/check-publications.ts | script |
| scripts/check-read-at.js | script |
| scripts/check-remaining-issues.ts | script |
| scripts/check-schema.ts | script |
| scripts/check-schema2.ts | script |
| scripts/check-shopify-markets.ts | script |
| scripts/check-test-data.ts | script |
| scripts/check-variant-mutation.ts | script |
| scripts/check_artist.js | script |
| scripts/check_db_thumbnails.js | script |
| scripts/check_manage_code_type.js | script |
| scripts/clean-databases-for-launch.ts | script |
| scripts/clean-legacy-cvr.ts | script |
| scripts/clean-operations-sandbox.ts | script |
| scripts/clean-pending-blob.ts | script |
| scripts/clean-shopify-store.ts | script |
| scripts/cleanup-draft-artists.ts | script |
| scripts/cleanup-expired-attachments.ts | script |
| scripts/cleanup-markets.ts | script |
| scripts/cleanup.ts | script |
| scripts/cleanup_shopify.js | script |
| scripts/cli.ts | script |
| scripts/create-collections.ts | script |
| scripts/create-kbeauty-collection.ts | script |
| scripts/create-new-collections.ts | script |
| scripts/create-test-artist.ts | script |
| scripts/db-backup.ts | script |
| scripts/debug-orders.ts | script |
| scripts/deep-audit-wizard-photo-module.ts | script |
| scripts/deep-onboarding-ux-audit.js | script |
| scripts/deep-precision-lifecycle-audit.ts | script |
| scripts/deep-refactor-forensic-audit.ts | script |
| scripts/delete-gifts-under-30.ts | script |
| scripts/delete-old-collections.ts | script |
| scripts/delete-products.ts | script |
| scripts/delete-uncontactable.ts | script |
| scripts/dev-prod.js | script |
| scripts/direct-insert.js | script |
| scripts/drain-sync-queue.ts | script |
| scripts/export_titles.ts | script |
| scripts/fetch_titles.ts | script |
| scripts/find_order_info.js | script |
| scripts/fix-channel.ts | script |
| scripts/fix-inventory-and-type.ts | script |
| scripts/fix-jangbinyeo.ts | script |
| scripts/fix-jangbinyeo2.ts | script |
| scripts/fix_coaster_hscode.ts | script |
| scripts/fix_gom_sku.js | script |
| scripts/get_all_tables.js | script |
| scripts/get_products.js | script |
| scripts/import-final-products.ts | script |
| scripts/import-sample-products.ts | script |
| scripts/import_hscode_master.js | script |
| scripts/inspect-artists.ts | script |
| scripts/inspect-db-comparison.ts | script |
| scripts/inspect-pre-launch.ts | script |
| scripts/inspect-product-titles.js | script |
| scripts/inspect-schema.ts | script |
| scripts/inspect-test.ts | script |
| scripts/inspect_db.js | script |
| scripts/inspect_db_tables.js | script |
| scripts/inspect_supabase_db.js | script |
| scripts/master-inbound-outbound-precision-audit.ts | script |
| scripts/md-to-pdf-offline.js | script |
| scripts/migrate-inquiries-artist-columns.ts | script |
| scripts/migrate-products-to-11-categories.ts | script |
| scripts/migrate-skus.ts | script |
| scripts/migrate-storage-to-cdn.ts | script |
| scripts/migrate_artist_manage_codes.js | script |
| scripts/migrate_artist_orders.js | script |
| scripts/organize.js | script |
| scripts/publish-all-channels.ts | script |
| scripts/publish-products.ts | script |
| scripts/query-checkout-settings.ts | script |
| scripts/query_shopify_publications.js | script |
| scripts/real-epost-test-standalone.js | script |
| scripts/register_webhooks.js | script |
| scripts/remove-canada-zone.ts | script |
| scripts/rename-shipping-methods.ts | script |
| scripts/reorganize-single-collection.ts | script |
| scripts/research-catalog.ts | script |
| scripts/restore-pre-launch-backup.ts | script |
| scripts/restore-shopify-products.ts | script |
| scripts/round-prices.ts | script |
| scripts/sanitize-coupled-stock.ts | script |
| scripts/scan-prod-db.ts | script |
| scripts/scrape-idus-images.ts | script |
| scripts/search-taxonomy.ts | script |
| scripts/seed-operations-sandbox.ts | script |
| scripts/seed-test-data.ts | script |
| scripts/set-all-inventory-zero.ts | script |
| scripts/set-inventory-zero.ts | script |
| scripts/setup-shipping.ts | script |
| scripts/setup-shopify-collections.ts | script |
| scripts/sync-11-master-collections-shopify.ts | script |
| scripts/sync-all-shopify-vendors.ts | script |
| scripts/sync-category-unification.ts | script |
| scripts/sync_categories_to_master.js | script |
| scripts/test-all-categories-expansion-audit.ts | script |
| scripts/test-coherence-check.ts | script |
| scripts/test-comprehensive-system-audit.ts | script |
| scripts/test-customs-edge-cases.ts | script |
| scripts/test-db-integration-e2e.ts | script |
| scripts/test-db-update.js | script |
| scripts/test-delivery-tracking.ts | script |
| scripts/test-dispatch-to-packing-transition.ts | script |
| scripts/test-epost-all-hscodes.ts | script |
| scripts/test-epost-operational-products.ts | script |
| scripts/test-epost-scenarios.js | script |
| scripts/test-epost-scenarios.ts | script |
| scripts/test-excel-edge-cases.ts | script |
| scripts/test-exhaustive-v61-audit.tsx | script |
| scripts/test-full-lifecycle-audit.ts | script |
| scripts/test-hairpin-category-audit.ts | script |
| scripts/test-headless-components.tsx | script |
| scripts/test-inbound-state-aware-audit.ts | script |
| scripts/test-inquiry-engine.ts | script |
| scripts/test-inquiry-lifecycle.ts | script |
| scripts/test-ip-query.js | script |
| scripts/test-keyring-trial-e2e-audit.ts | script |
| scripts/test-kpacket-mapping.ts | script |
| scripts/test-ledger-api.ts | script |
| scripts/test-live-db-integration.ts | script |
| scripts/test-live-epost-all-countries.ts | script |
| scripts/test-logistics-audit.ts | script |
| scripts/test-modal-lifting-review.tsx | script |
| scripts/test-modal-wizard-simulation.ts | script |
| scripts/test-operations-scenarios.ts | script |
| scripts/test-packing-batch-and-toggle-audit.ts | script |
| scripts/test-policy-and-implementation-audit.ts | script |
| scripts/test-popbill-error-fix.ts | script |
| scripts/test-popbill-fallback-fix.ts | script |
| scripts/test-popbill-reverse-issuance.ts | script |
| scripts/test-precision-category-audit.ts | script |
| scripts/test-preview-onboarding-flow.ts | script |
| scripts/test-print-on-pack-precision-audit.ts | script |
| scripts/test-quarantine-desk-workflow.ts | script |
| scripts/test-refactor-modals.tsx | script |
| scripts/test-refactor-precision-audit.ts | script |
| scripts/test-scale-10k-deep-audit.ts | script |
| scripts/test-scale-10k-inventory.ts | script |
| scripts/test-self-healing-query.ts | script |
| scripts/test-self-serve-rename.ts | script |
| scripts/test-settlement-excel-export.ts | script |
| scripts/test-settlement-refactoring-deep.ts | script |
| scripts/test-settlement-testmode-ui.ts | script |
| scripts/test-shipped-only-inbound-protection.ts | script |
| scripts/test-shopify-batch-inventory.ts | script |
| scripts/test-split-fulfillment-grouping.ts | script |
| scripts/test-stock-adjustment.ts | script |
| scripts/test-stock-inspect.js | script |
| scripts/test-stock-isolation-audit.ts | script |
| scripts/test-sync-bulk.js | script |
| scripts/test-sync-bulk.ts | script |
| scripts/test-v6-onboarding-audit.js | script |
| scripts/test-v7-deep-runtime-audit.ts | script |
| scripts/test-v7-onboarding-funnel.tsx | script |
| scripts/test-v8-wizard-guide.tsx | script |
| scripts/test-v9-streamlined-guide.tsx | script |
| scripts/test-webhook-mock.ts | script |
| scripts/test-weight-verification-e2e.ts | script |
| scripts/test-wizard-e2e.ts | script |
| scripts/test-wizard-render-lifecycle.tsx | script |
| scripts/test-wizard-resolver.ts | script |
| scripts/test_solapi_send.js | script |
| scripts/test_update_category.js | script |
| scripts/update-artist-tags.ts | script |
| scripts/update-handles.ts | script |
| scripts/update-product-content.ts | script |
| scripts/update-seo.ts | script |
| scripts/update-taxonomy.ts | script |
| scripts/update-us-shipping.ts | script |
| scripts/update-vendor-to-artist.ts | script |
| scripts/update-vendor.ts | script |
| scripts/update_all_titles_en.ts | script |
| scripts/update_hs_codes.js | script |
| scripts/update_titles_en.ts | script |
| scripts/upload-idus-images.ts | script |
| scripts/utils/check-shopify-settings.ts | script |
| scripts/utils/check_db.js | script |
| scripts/utils/clean_root.js | script |
| scripts/utils/update_skus.js | script |
| scripts/verify-all-system-integrity.ts | script |
| scripts/verify-clean-slate.ts | script |
| scripts/verify-db-schema.ts | script |
| scripts/verify-inquiries-db.ts | script |
| scripts/verify-option-b-live-db.ts | script |
| scripts/verify-order-lifecycle-states.ts | script |
| scripts/verify-placeholder-text-updates.mjs | script |
| scripts/verify-placeholder-text-updates.ts | script |
| scripts/verify-wizard-photo-refactoring.ts | script |
| scripts/view-products.ts | script |
| tests/unit/security-boundaries.test.ts | test |

### DB/RPC 직접 참조 역색인

| 대상 | 참조 파일 |
| --- | --- |
| accounts_3pl | app/api/3pl/auth/route.ts, app/api/manage/accounts-3pl/route.ts, lib/3pl/auth.ts, lib/3pl/login.ts |
| apply_shopify_refund() | app/api/shopify/webhook/refunds/route.ts |
| apply_warehouse_batch_stock_change() | lib/supabase/stock.ts |
| apply_warehouse_stock_change() | lib/supabase/stock.ts |
| artist_accounts | app/api/admin/orders/route.ts, app/api/admin/settlement/export/route.ts, app/api/admin/settlement/route.ts, app/api/admin/tax-invoices/reverse-issue/route.ts, app/api/admin/tax-invoices/route.ts, app/api/artist/account/reset/route.ts, app/api/artist/account/route.ts, app/api/artist/auth/kakao-login/route.ts, app/api/artist/create-account/route.ts, app/api/artist/invoices/route.ts, app/api/artist/popbill/cert-url/route.ts, app/api/artist/popbill/invoice-viewer-url/route.ts, app/api/artist/popbill/join/route.ts, app/api/artist/popbill/sso-url/route.ts, app/api/artist/popbill/status/route.ts, app/api/artist/products/register/route.ts, app/api/artist/products/submit/route.ts, app/api/artist/profile/route.ts, app/api/artist/request-rename/route.ts, app/api/artist/request-review/route.ts, app/api/artist/send-otp/route.ts, app/api/artist/settlements/route.ts, app/api/artist/tax-invoices/route.ts, app/api/artist/terms-agree/route.ts, app/api/auth/callback/route.ts, app/api/cron/send-artist-emails/route.ts, app/api/inquiries/route.ts, app/api/manage/artist-options/route.ts, app/api/manage/artists/delete/route.ts, app/api/manage/artists/profile/route.ts, app/api/manage/artists/rename/route.ts, app/api/manage/artists/rename-requests/route.ts, lib/security/artistAuth.ts, lib/services/artistCascadeSync.ts, lib/shopify/sync-artist.ts, lib/utils/artistNameCache.ts, lib/utils/sku-prefix.ts |
| artist_error_reports | app/api/errors/route.ts |
| artist_orders | app/api/3pl/inventory/route.ts, app/api/3pl/ledger/route.ts, app/api/3pl/orders/check_db.ts, app/api/3pl/orders/route.ts, app/api/3pl/orders/split/route.ts, app/api/3pl/pack-complete/route.ts, app/api/3pl/packing-slip/route.ts, app/api/3pl/test-order/route.ts, app/api/admin/orders/route.ts, app/api/admin/settlement/export/route.ts, app/api/admin/settlement/route.ts, app/api/admin/tax-invoices/route.ts, app/api/artist/invoices/route.ts, app/api/artist/orders/route.ts, app/api/artist/settlements/route.ts, app/api/artist/tax-invoices/route.ts, app/api/cron/send-artist-emails/route.ts, app/api/manage/artists/delete/route.ts, app/api/manage/artists/rename/route.ts, app/api/manage/artists/rename-requests/route.ts, app/api/orders/cleanup/route.ts, app/api/orders/route.ts, app/api/shopify/sync-orders/route.ts, app/api/shopify/webhook/orders/route.ts, app/api/shopify/webhook/orders-cancel/route.ts, app/api/shopify/webhook/orders-delete/route.ts, app/api/sourcing/items/route.ts, lib/3pl/epostService.ts, lib/3pl/inboundService.ts, lib/services/artistCascadeSync.ts, lib/shopify/seed.ts |
| artist_rename_requests | app/api/artist/request-rename/route.ts, app/api/manage/artists/delete/route.ts, app/api/manage/artists/rename-requests/count/route.ts, app/api/manage/artists/rename-requests/route.ts |
| batches | lib/pipeline/shared/batch-manager.ts |
| claim_sync_jobs() | lib/queue/syncQueue.ts |
| email_verifications | app/api/artist/send-otp/route.ts, app/api/artist/verify-otp/route.ts |
| ems_history | app/api/3pl/ledger/route.ts, app/api/3pl/orders/route.ts, app/api/3pl/pack-complete/route.ts, app/api/3pl/test-order/route.ts, app/api/admin/orders/route.ts, app/api/cron/auto-pipeline/route.ts, app/api/orders/cleanup/route.ts, app/api/orders/route.ts, app/api/shopify/webhook/orders-delete/route.ts, app/api/webhooks/17track/route.ts, lib/3pl/epostService.ts, lib/pipeline/shared/order-manager.ts |
| ems_storage | lib/pipeline/modules/ems-builder/index.ts |
| hscode_master | lib/hscode/hscodeDb.ts |
| inquiry_messages | app/api/artist/inquiries/[token]/messages/route.ts, app/api/artist/inquiries/[token]/route.ts, app/api/inquiries/[token]/messages/route.ts, app/api/inquiries/[token]/route.ts, app/api/inquiries/route.ts, lib/inquiries/notificationManager.ts |
| inquiry_threads | app/api/artist/inquiries/[token]/messages/route.ts, app/api/artist/inquiries/[token]/route.ts, app/api/artist/inquiries/route.ts, app/api/artist/inquiries/upload/route.ts, app/api/inquiries/[token]/messages/route.ts, app/api/inquiries/[token]/route.ts, app/api/inquiries/route.ts, app/api/manage/inquiries/route.ts, lib/inquiries/notificationManager.ts |
| inventory_settings | app/api/procurement/inventory/route.ts, app/api/procurement/inventory-settings/route.ts, lib/procurement/auto-order.ts |
| mark_inquiry_messages_read() | app/api/artist/inquiries/route.ts, app/api/inquiries/[token]/route.ts, app/api/manage/inquiries/route.ts |
| master_products | app/api/3pl/inventory/route.ts, app/api/3pl/orders/route.ts, app/api/admin/reconcile-shopify/route.ts, app/api/apply-shopify-categories/route.ts, app/api/artist/create-account/route.ts, app/api/artist/inventory/bulk/route.ts, app/api/artist/orders/route.ts, app/api/artist/products/delete/route.ts, app/api/artist/products/register/route.ts, app/api/artist/products/route.ts, app/api/artist/products/submit/route.ts, app/api/artist/request-review/route.ts, app/api/artist/update/route.ts, app/api/artist/upload/route.ts, app/api/artist/upload-ticket/route.ts, app/api/artists/route.ts, app/api/create-and-assign-shopify-collections/route.ts, app/api/cron/send-artist-emails/route.ts, app/api/manage/approve-product/route.ts, app/api/manage/artists/delete/route.ts, app/api/manage/artists/rename/route.ts, app/api/manage/artists/rename-requests/route.ts, app/api/manage/auto-categorize/route.ts, app/api/manage/export-catalog/route.ts, app/api/manage/items/route.ts, app/api/manage/recalculate-margins/route.ts, app/api/manage/update/route.ts, app/api/manage/update-hscodes/route.ts, app/api/shopify/register/route.ts, app/api/shopify/sync/route.ts, app/api/shopify/sync-bulk/route.ts, app/api/shopify/sync-media/route.ts, app/api/shopify/sync-product/route.ts, app/api/shopify/unpublish/route.ts, app/api/shopify/webhook/inventory/route.ts, app/api/shopify/webhook/orders/route.ts, app/api/shopify/webhook/products/route.ts, app/api/sourcing/items/route.ts, app/api/test/set-inventory-zero/route.ts, lib/3pl/inboundService.ts, lib/pipeline/shared/product-store.ts, lib/queue/shopifySyncWorker.ts, lib/services/artistCascadeSync.ts, lib/shopify/publishProduct.ts, lib/shopify/sync-artist.ts, lib/shopify/sync-customs.ts, lib/supabase/stock.ts |
| notification_logs | app/api/test/alimtalk/route.ts, lib/notifications/popbillKakao.ts |
| orders | app/api/3pl/inventory/route.ts, app/api/3pl/ledger/route.ts, app/api/3pl/orders/route.ts, app/api/3pl/orders/split/route.ts, app/api/3pl/pack-complete/route.ts, app/api/3pl/packing-slip/route.ts, app/api/3pl/test-order/route.ts, app/api/orders/cleanup/route.ts, app/api/shopify/webhook/orders-cancel/route.ts, app/api/shopify/webhook/orders-delete/route.ts, lib/3pl/epostService.ts, lib/3pl/inboundService.ts, lib/pipeline/shared/batch-manager.ts, lib/pipeline/shared/order-manager.ts, lib/shopify/seed.ts |
| packing_fulfillment_records | app/api/3pl/pack-complete/route.ts |
| pn_requests | app/api/orders/cleanup/route.ts, app/api/shopify/webhook/orders-delete/route.ts, lib/pipeline/modules/pn-generator/index.ts |
| products | lib/pipeline/shared/product-store.ts |
| purchase_order_items | app/api/procurement/purchase-orders/route.ts, lib/procurement/auto-order.ts |
| purchase_orders | app/api/procurement/purchase-orders/route.ts, app/api/vendor/[token]/route.ts, lib/procurement/auto-order.ts |
| release_worker_lease() | lib/queue/shopifySyncWorker.ts |
| settings | app/api/3pl/auth/route.ts, app/api/3pl/batch-submit/route.ts, app/api/3pl/crossdock-submit/route.ts, app/api/3pl/orders/route.ts, app/api/3pl/pack-complete/route.ts, app/api/cron/auto-pipeline/route.ts, app/api/cron/send-artist-emails/route.ts, app/api/pipeline/pn-generate/route.ts, app/api/settings/route.ts |
| settlement_orders | app/api/artist/popbill/status/route.ts |
| skipped_orders | lib/pipeline/shared/batch-manager.ts |
| sourcing_items | app/api/3pl/orders/check_db.ts |
| sync_jobs | app/api/cron/process-sync-jobs/route.ts, lib/queue/syncQueue.ts |
| tax_invoices | app/api/admin/settlement/export/route.ts, app/api/admin/settlement/route.ts, app/api/admin/tax-invoices/reverse-issue/route.ts, app/api/admin/tax-invoices/route.ts, app/api/artist/invoices/route.ts, app/api/artist/popbill/status/route.ts, app/api/artist/tax-invoices/route.ts, app/api/tax-invoice/webhook/route.ts, lib/services/popbill/client.ts |
| tpl_inbound_requests | lib/3pl/inboundService.ts |
| tpl_sessions | lib/3pl/auth.ts |
| try_acquire_worker_lease() | lib/queue/shopifySyncWorker.ts |
| vendors | app/api/procurement/vendors/route.ts |
| warehouse_inventory | app/api/3pl/inventory/route.ts |


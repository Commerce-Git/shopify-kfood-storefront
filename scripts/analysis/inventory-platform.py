"""Read-only source inventory; writes Markdown/JSON only to --output.

No project code is imported, credentials read, SQL executed, or network used.
Regex matches are navigation evidence, not runtime reachability/security proof.
"""
import argparse
import hashlib
import json
import re
import subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


def module_for(path):
    s = path.lower()
    rules = [
        ('M09', ['settlement', 'invoice', 'popbill', 'tax-invoice']),
        ('M08', ['refund', 'cancel-order', 'orders-cancel', 'orders-delete', 'policies/returns']),
        ('M01', ['auth', 'security', 'login', 'otp', 'account/reset']),
        ('M06', ['inbound', '/stock', '/3pl/inventory', '/3pl/ledger', 'quarantine']),
        ('M07', ['/3pl', 'epost', 'ems-', 'tracking', 'track-order', 'suborder', 'fulfillment', 'pn-generator']),
        ('M11', ['webhook', '/queue', '/cron', 'sync', 'revalidate']),
        ('M02', ['artist/profile', 'artist/account', 'artist/join', 'create-account', 'verify-bank', 'verify-business', 'terms-agree', 'rename', 'accounts-artist']),
        ('M10', ['inquir', 'review', 'newsletter', 'waitlist', 'feedback', 'coupon', 'wishlist', 'follow', 'broadcast', 'unsubscribe', '/email', 'resend', '/views']),
        ('M05', ['order', 'pipeline/shared/order']),
        ('M03', ['product', 'categor', 'pricing', 'artist/update', 'artist/inventory', '/manage', 'hscode', 'sourcing', 'procurement', '/vendor', 'options']),
        ('M04', ['cart', 'collection', '/artists', 'shopify/storefront', 'policies', '/about', '/faq', 'shopify/queries']),
        ('M12', ['settings', '/errors', '/test', 'pipeline', 'supabase', 'config', 'proxy', 'middleware']),
    ]
    return next((mid for mid, terms in rules if any(term in s for term in terms)), 'UNCLASSIFIED')


def collect(root):
    files = []
    for folder in ['app', 'lib', 'scripts', 'supabase', 'tests', 'types', '.github/workflows']:
        base = root / folder
        if base.exists():
            files.extend(p for p in base.rglob('*') if p.is_file() and p.suffix in {'.ts', '.tsx', '.js', '.mjs', '.sql', '.yml', '.yaml'})
    files.extend(root / n for n in ['proxy.ts', 'middleware.ts', 'next.config.ts', 'vercel.json', 'package.json', '.agent-bridge/pipeline.config.json'] if (root / n).is_file())
    rows = []
    for p in sorted(set(files)):
        s = p.read_text(errors='replace')
        path = str(p.relative_to(root))
        app = path.startswith('app/')
        kind = ('api' if app and p.name == 'route.ts' else
                'page' if app and p.name == 'page.tsx' else
                'sql' if p.suffix == '.sql' else
                'script' if path.startswith('scripts/') else
                'test' if path.startswith('tests/') else 'source')
        def matches(pattern):
            return sorted(set(re.findall(pattern, s)))
        tables = matches(r'\.from\(\s*[\'"]([a-zA-Z_][a-zA-Z_0-9]*)[\'"]\s*\)')
        rpcs = matches(r'\.rpc\(\s*[\'"]([a-zA-Z_][a-zA-Z_0-9]*)[\'"]')
        methods = matches(r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b|export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b')
        methods = sorted({v for pair in methods for v in pair if v})
        rows.append(dict(path=path, kind=kind, module=module_for(path), lines=len(s.splitlines()), sha256=hashlib.sha256(p.read_bytes()).hexdigest(), methods=methods, tables=tables, rpcs=rpcs,
            guards=matches(r'\b(requireAdmin|verifyArtistRequest|get3plToken|verifyShopifyWebhook|requireCronSecret|verifyOrderOwnership|assertOrderOwnership|getUser)\b'),
            env_names=matches(r'process\.env\.([A-Z][A-Z_0-9]+)'),
            imports=matches(r'(?:from\s+|import\s*\()([\'"]@/[^\'"]+[\'"])'),
            sql_objects=matches(r'(?i)create\s+(?:or\s+replace\s+)?(?:table|function|view)\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_][a-zA-Z_0-9.]*)') if kind == 'sql' else []))
    def git(*args):
        return subprocess.run(['git', '-C', str(root), *args], capture_output=True, text=True, check=True).stdout.strip()
    return dict(root=str(root), branch=git('branch','--show-current'), head=git('rev-parse','HEAD'), status=git('status','--short'), files=rows)


def cell(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--storefront', type=Path, required=True)
    parser.add_argument('--admin', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    data = dict(generated_at=datetime.now(timezone.utc).isoformat(), projects={name:collect(path.resolve()) for name,path in [('storefront',args.storefront),('admin',args.admin)]})
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output/'inventory.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    out = ['# 소스 인벤토리 — 자동 수집', '', f"수집 시각(UTC): {data['generated_at']}", '', '경로·메서드·직접 DB/RPC 참조·가드 심볼을 정규식으로 수집했다. 주석·미사용 코드도 포함할 수 있고, 동적 참조·간접 호출·재수출은 누락할 수 있다. 모듈은 경로 기반 후보이며 보안 통과/실제 배포/구현 완료를 뜻하지 않는다. 전체 파일 해시·임포트·환경변수 이름·SQL 객체 후보는 `inventory.json`에 있다. 비밀값은 수집하지 않는다.', '']
    for name, project in data['projects'].items():
        out += [f'## {name}', '', f"루트: `{project['root']}`  ", f"브랜치: `{project['branch']}` · HEAD: `{project['head']}`", '', '### 조사 시작 시 변경 상태', '', '```text', project['status'], '```', '', '### 분류별 파일 수', '', '| 분류 | 수 |', '| --- | --- |']
        out += [f'| {k} | {v} |' for k,v in sorted(Counter(r['kind'] for r in project['files']).items())]
        out += ['', '### 페이지·라우트 전체 목록', '', '| 파일 | 종류/HTTP 메서드 | 모듈 후보 | 직접 DB/RPC 참조 | 가드 심볼(판정 아님) |', '| --- | --- | --- | --- | --- |']
        for r in project['files']:
            if r['kind'] in ['api','page']:
                refs=', '.join(r['tables']+[x+'()' for x in r['rpcs']]) or '—'
                out.append('| '+' | '.join(map(cell,[r['path'],r['kind']+': '+(', '.join(r['methods']) if r['kind']=='api' else '페이지'),r['module'],refs,', '.join(r['guards']) or '—']))+' |')
        out += ['', '### SQL 파일 및 CREATE 객체 후보', '', '| 파일 | 객체 후보 |', '| --- | --- |']
        out += [f"| {cell(r['path'])} | {cell(', '.join(r['sql_objects']) or 'ALTER/정책/데이터 등; 원문 확인')} |" for r in project['files'] if r['kind']=='sql']
        out += ['', '### 스크립트·테스트 목록', '', '실행하지 않고 파일만 목록화했다. 특히 `test`라는 이름도 실제 DB·외부 서비스에 쓰기를 할 수 있으므로 실행 전 검사한다.', '', '| 파일 | 분류 |', '| --- | --- |']
        out += [f"| {r['path']} | {r['kind']} |" for r in project['files'] if r['kind'] in ['script','test']]
        out += ['', '### DB/RPC 직접 참조 역색인', '', '| 대상 | 참조 파일 |', '| --- | --- |']
        refs={}
        for r in project['files']:
            if r['kind'] in ['script','test','sql']: continue
            for target in r['tables']+[x+'()' for x in r['rpcs']]: refs.setdefault(target,[]).append(r['path'])
        out += [f"| {t} | {cell(', '.join(paths))} |" for t,paths in sorted(refs.items())]
        out += ['']
    (args.output/'SOURCE_INVENTORY.md').write_text('\n'.join(out)+'\n')
    for name,p in data['projects'].items(): print(name,dict(Counter(r['kind'] for r in p['files'])))


if __name__ == '__main__':
    main()

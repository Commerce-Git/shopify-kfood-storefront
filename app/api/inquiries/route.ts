import { NextRequest } from 'next/server';
import { proxyInquiryRequest } from './proxyHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return proxyInquiryRequest(req, '');
}

export async function POST(req: NextRequest) {
  return proxyInquiryRequest(req, '');
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

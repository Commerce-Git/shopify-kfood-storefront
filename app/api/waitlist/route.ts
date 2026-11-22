import { subscribeCustomer } from '@/lib/shopify/subscription';

export function POST(request: Request) {
  return subscribeCustomer(request, 'waitlist');
}

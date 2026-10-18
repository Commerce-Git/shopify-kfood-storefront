export type OrderProgress = 'placed' | 'crafting' | 'packaging' | 'shipped' | 'delivered';

// Artist "shipped" means sent to our warehouse, not to the buyer.
export function aggregateArtistStatus(statuses: string[]): string {
  const stages = ['pending', 'confirmed', 'shipped', 'received', 'delivered'];
  const active = statuses.filter(status => status !== 'cancelled');
  if (!active.length) return 'pending';
  return active.reduce((least, status) => {
    const known = stages.includes(status) ? status : 'pending';
    return stages.indexOf(known) < stages.indexOf(least) ? known : least;
  }, 'delivered');
}

export function aggregateWmsStatus(shopifyStatus: string, artistStatuses: string[] = [], deliveryStatus?: string | null): OrderProgress {
  if (deliveryStatus === 'delivered') return 'delivered';
  if (shopifyStatus === 'FULFILLED') return 'shipped';
  const status = aggregateArtistStatus(artistStatuses);
  if (status === 'confirmed') return 'crafting';
  if (['shipped', 'received'].includes(status)) return 'packaging';
  if (status === 'delivered') return 'delivered';
  return 'placed';
}

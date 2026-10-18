/** Remove legacy private order caches and prevent one account's saved items merging into another. */
export function prepareAccountStorage(storage: Storage, userId: string | null) {
  try {
    for (const key of Object.keys(storage)) if (key.startsWith('orders_')) storage.removeItem(key);
    const previous = storage.getItem('blank_seoul_storage_owner');
    if (previous && previous !== userId) {
      storage.removeItem('blank_seoul_wishlist');
      storage.removeItem('blank_seoul_followed_artists');
    }
    if (userId) storage.setItem('blank_seoul_storage_owner', userId);
    else storage.removeItem('blank_seoul_storage_owner');
  } catch { /* Storage access may be disabled; authentication must still work. */ }
}

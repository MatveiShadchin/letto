import { revalidatePath } from 'next/cache';

export function revalidateProductPages() {
  revalidatePath('/');
  revalidatePath('/catalog');
}

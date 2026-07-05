import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { OurAdvantages } from '@/components/OurAdvantages';
import { getHomePageData } from '@/lib/products-server';
import { getProductImageUrl } from '@/lib/product-image-url';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { featuredProduct, gridProducts } = await getHomePageData();
  const featuredImageUrl = featuredProduct
    ? getProductImageUrl(featuredProduct.image_url, 400, 400)
    : null;

  return (
    <>
      {featuredImageUrl ? (
        <link rel="preload" as="image" href={featuredImageUrl} />
      ) : null}
      <Hero featuredProduct={featuredProduct} />
      <ProductGrid products={gridProducts} />
      <OurAdvantages />
    </>
  );
}

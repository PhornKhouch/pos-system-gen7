import React from 'react';
import { Link } from 'react-router-dom';
import { HomeHero } from '../components/HomeHero';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductSection } from '../components/ProductSection';
import { useHomeData } from '../hooks/useHomeData';
import { STORE_ROUTES } from '../../storeConfig';
import '../homepage.css';

const PRODUCT_LIMIT = 8;

export function HomePage() {
  const { categories, products, loading, error, reload } = useHomeData();

  return (
    <div className="home-page">
      <HomeHero />
      <CategoryGrid categories={categories} />
      <ProductSection
        title="New arrivals"
        action={<Link to={STORE_ROUTES.SHOP}>See all {products.length || ''} →</Link>}
        products={products.slice(0, PRODUCT_LIMIT)}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyText="No products available yet."
      />
    </div>
  );
}

export default HomePage;

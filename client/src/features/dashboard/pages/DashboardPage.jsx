import React from 'react';
import { StatsGrid } from '../components/StatsGrid';
import { ActivityFeed } from '../components/ActivityFeed';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name || 'Administrator'}. Here is your operations overview.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/products')}
          rightIcon={<ArrowRight size={16} />}
        >
          View Product Catalog
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <StatsGrid />
        <ActivityFeed />
      </div>
    </div>
  );
}

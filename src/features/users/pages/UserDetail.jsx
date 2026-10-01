import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common/Button/Button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/routes/routeConfig';

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header
        title={`User Details #${id}`}
        subtitle="View and edit profile details"
        action={
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.USERS)}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Users
          </Button>
        }
      />
      <div className="card">
        <p>Viewing details for user ID: <strong>{id}</strong></p>
      </div>
    </div>
  );
}

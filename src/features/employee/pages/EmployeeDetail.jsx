import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/common/Button/Button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/routes/routeConfig';

export function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header
        title={`Employee Profile #${id}`}
        subtitle="Staff record and compensation information"
        action={
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Directory
          </Button>
        }
      />
      <div className="card">
        <p>Viewing profile for employee ID: <strong>{id}</strong></p>
      </div>
    </div>
  );
}

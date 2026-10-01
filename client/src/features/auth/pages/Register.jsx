import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <RegisterForm />
    </div>
  );
}

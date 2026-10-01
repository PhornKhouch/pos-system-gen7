import React from 'react';
import { LoginForm } from '../components/LoginForm';

export function Login() {
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
      <LoginForm />
    </div>
  );
}

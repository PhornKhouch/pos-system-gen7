import React from 'react';
import { Button as AntdButton } from 'antd';

export function Button({
  children,
  variant = 'primary',
  size = 'middle',
  isLoading = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  icon = null,
  className = '',
  type,
  danger = false,
  ...props
}) {
  // Map custom variant to Antd type
  let antdType = type;
  if (!antdType) {
    if (variant === 'primary') antdType = 'primary';
    else if (variant === 'secondary' || variant === 'default') antdType = 'default';
    else if (variant === 'ghost') antdType = 'text';
    else if (variant === 'dashed') antdType = 'dashed';
    else if (variant === 'link') antdType = 'link';
    else antdType = 'default';
  }

  const isDanger = danger || variant === 'danger';
  const antdSize = size === 'md' ? 'middle' : size;

  return (
    <AntdButton
      type={antdType}
      size={antdSize}
      loading={isLoading || loading}
      disabled={disabled}
      danger={isDanger}
      icon={leftIcon || icon}
      className={className}
      {...props}
    >
      {children}
      {rightIcon && <span style={{ marginLeft: 6 }}>{rightIcon}</span>}
    </AntdButton>
  );
}

export default Button;

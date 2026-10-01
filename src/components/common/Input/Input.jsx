import React, { forwardRef } from 'react';
import { Input as AntdInput } from 'antd';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    prefix,
    type = 'text',
    className = '',
    containerClassName = '',
    style = {},
    ...props
  },
  ref
) {
  const resolvedPrefix = prefix || (Icon ? <Icon style={{ color: '#8c8c8c' }} /> : null);

  const renderInput = () => {
    if (type === 'password') {
      return (
        <AntdInput.Password
          ref={ref}
          prefix={resolvedPrefix}
          status={error ? 'error' : ''}
          className={className}
          style={style}
          {...props}
        />
      );
    }
    if (type === 'textarea') {
      return (
        <AntdInput.TextArea
          ref={ref}
          status={error ? 'error' : ''}
          className={className}
          style={style}
          {...props}
        />
      );
    }
    return (
      <AntdInput
        ref={ref}
        type={type}
        prefix={resolvedPrefix}
        status={error ? 'error' : ''}
        className={className}
        style={style}
        {...props}
      />
    );
  };

  return (
    <div className={`input-wrapper ${containerClassName}`.trim()} style={{ width: '100%' }}>
      {label && (
        <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500 }}>
          {label}
        </label>
      )}
      {renderInput()}
      {error && (
        <div style={{ color: '#ff4d4f', fontSize: '0.78rem', marginTop: 4 }}>
          {error}
        </div>
      )}
      {!error && helperText && (
        <div style={{ color: '#8c8c8c', fontSize: '0.78rem', marginTop: 4 }}>
          {helperText}
        </div>
      )}
    </div>
  );
});

export default Input;

import React from 'react';
import { Modal as AntdModal } from 'antd';

export function Modal({
  isOpen,
  open,
  onClose,
  onCancel,
  title,
  children,
  maxWidth,
  width = 540,
  footer = null,
  ...props
}) {
  const isVisible = open !== undefined ? open : isOpen;
  const handleCancel = onCancel || onClose;

  return (
    <AntdModal
      open={isVisible}
      onCancel={handleCancel}
      title={title}
      width={maxWidth || width}
      footer={footer}
      destroyOnClose
      centered
      {...props}
    >
      <div style={{ paddingTop: 12 }}>{children}</div>
    </AntdModal>
  );
}

export default Modal;

import React, { useState } from 'react';
import { Card, Alert } from 'antd';
import { useAttributes } from '../hooks/useAttributes';
import { AttributeTable } from '../components/AttributeTable';
import { AttributeFormModal } from '../components/AttributeFormModal';
import { AttributeFilter } from '../components/AttributeFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { useNotification } from '@/hooks/useNotification';

export function Attribute() {
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();

  const {
    attributes,
    total,
    loading,
    submitting,
    error,
    refetch,
    addAttribute,
    editAttribute,
    removeAttribute,
  } = useAttributes({
    search: debouncedSearch,
    active: status,
  });

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setSelectedAttribute(null);
    open();
  };

  // Open modal for Edit
  const handleOpenEditModal = (attribute) => {
    setSelectedAttribute(attribute);
    open();
  };

  // Close modal and reset selection
  const handleCloseModal = () => {
    close();
    setSelectedAttribute(null);
  };

  // Submit Handler for Create or Edit
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedAttribute && selectedAttribute.attribute_id) {
        const res = await editAttribute(selectedAttribute.attribute_id, formData);
        notifySuccess('Success', res?.message || 'Attribute updated successfully!');
      } else {
        const res = await addAttribute(formData);
        notifySuccess('Success', res?.message || 'Attribute created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      notifyError('Error', err.message || 'Operation failed. Please try again.');
    }
  };

  // Delete Handler
  const handleDeleteAttribute = async (id) => {
    try {
      const res = await removeAttribute(id);
      notifySuccess('Deleted', res?.message || 'Attribute deleted successfully!');
    } catch (err) {
      notifyError('Error', err.message || 'Failed to delete attribute.');
    }
  };

  return (
    <div className="attribute-management-container">
      {/* Error Banner if API error occurs */}
      {error && (
        <Alert
          type="error"
          message="Failed to load attributes"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}


      {/* Filter and Actions Bar */}
      <AttributeFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onRefresh={refetch}
        onAddClick={handleOpenCreateModal}
        loading={loading}
        totalCount={total}
      />

      {/* Attributes Table */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <AttributeTable
          attributes={attributes}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteAttribute}
        />
      </Card>

      {/* Create / Edit Modal */}
      <AttributeFormModal
        open={isOpen}
        attribute={selectedAttribute}
        loading={submitting}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  );
}

export default Attribute;

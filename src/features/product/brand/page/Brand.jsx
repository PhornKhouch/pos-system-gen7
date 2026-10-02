import React, { useState } from 'react';
import { Card, Alert } from 'antd';
import { useBrands } from '../hooks/useBrands';
import { BrandTable } from '../components/BrandTable';
import { BrandFormModal } from '../components/BrandFormModal';
import { BrandFilter } from '../components/BrandFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { useNotification } from '@/hooks/useNotification';

export function Brand() {
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();

  const {
    brands,
    total,
    loading,
    submitting,
    error,
    refetch,
    addBrand,
    editBrand,
    removeBrand,
  } = useBrands({
    search: debouncedSearch,
    active: status,
  });

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setSelectedBrand(null);
    open();
  };

  // Open modal for Edit
  const handleOpenEditModal = (brand) => {
    setSelectedBrand(brand);
    open();
  };

  // Close modal and reset selected brand
  const handleCloseModal = () => {
    close();
    setSelectedBrand(null);
  };

  // Submit Handler for Create or Edit
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedBrand && selectedBrand.brand_id) {
        const res = await editBrand(selectedBrand.brand_id, formData);
        notifySuccess('Success', res?.message || 'Brand updated successfully!');
      } else {
        const res = await addBrand(formData);
        notifySuccess('Success', res?.message || 'Brand created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      notifyError('Error', err.message || 'Operation failed. Please try again.');
    }
  };

  // Delete Handler
  const handleDeleteBrand = async (id) => {
    try {
      const res = await removeBrand(id);
      notifySuccess('Deleted', res?.message || 'Brand deleted successfully!');
    } catch (err) {
      notifyError('Error', err.message || 'Failed to delete brand.');
    }
  };

  return (
    <div className="brand-management-container">
      {/* Error Banner if API error occurs */}
      {error && (
        <Alert
          type="error"
          message="Failed to load brands"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filter and Actions Bar */}
      <BrandFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onRefresh={refetch}
        onAddClick={handleOpenCreateModal}
        loading={loading}
        totalCount={total}
      />

      {/* Brands Table */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <BrandTable
          brands={brands}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteBrand}
        />
      </Card>

      {/* Create / Edit Modal */}
      <BrandFormModal
        open={isOpen}
        brand={selectedBrand}
        loading={submitting}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  );
}

export default Brand;

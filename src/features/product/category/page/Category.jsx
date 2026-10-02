import React, { useState } from 'react';
import { Card, Alert } from 'antd';
import { useCategories } from '../hooks/useCategories';
import { CategoryTable } from '../components/CategoryTable';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { CategoryFilter } from '../components/CategoryFilter';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { useNotification } from '@/hooks/useNotification';

export function Category() {
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();

  const {
    categories,
    total,
    loading,
    submitting,
    error,
    refetch,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories({
    search: debouncedSearch,
    active: status,
  });

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    open();
  };

  // Open modal for Edit
  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    open();
  };

  // Close modal and reset selected category
  const handleCloseModal = () => {
    close();
    setSelectedCategory(null);
  };

  // Submit Handler for Create or Edit
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCategory && selectedCategory.category_id) {
        const res = await editCategory(selectedCategory.category_id, formData);
        notifySuccess('Success', res?.message || 'Category updated successfully!');
      } else {
        const res = await addCategory(formData);
        notifySuccess('Success', res?.message || 'Category created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      notifyError('Error', err.message || 'Operation failed. Please try again.');
    }
  };

  // Delete Handler
  const handleDeleteCategory = async (id) => {
    try {
      const res = await removeCategory(id);
      notifySuccess('Deleted', res?.message || 'Category deleted successfully!');
    } catch (err) {
      notifyError('Error', err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="category-management-container">
      {/* Error Banner if API error occurs */}
      {error && (
        <Alert
          type="error"
          message="Failed to load categories"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filter and Actions Bar */}
      <CategoryFilter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onRefresh={refetch}
        onAddClick={handleOpenCreateModal}
        loading={loading}
        totalCount={total}
      />

      {/* Categories Table */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <CategoryTable
          categories={categories}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteCategory}
        />
      </Card>

      {/* Create / Edit Modal */}
      <CategoryFormModal
        open={isOpen}
        category={selectedCategory}
        loading={submitting}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  );
}

export default Category;


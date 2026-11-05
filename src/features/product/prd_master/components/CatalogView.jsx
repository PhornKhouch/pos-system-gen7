import React, { useState } from 'react';
import { Card, Alert } from 'antd';
import { useProducts } from '../hooks/useProducts';
import { ProductTable } from './ProductTable';
import { ProductFormModal } from './ProductFormModal';
import { ProductFilter } from './ProductFilter';
import { ProductImageModal } from './ProductImageModal';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { useNotification } from '@/hooks/useNotification';

export function CatalogView() {
  const { notifySuccess, notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [brandId, setBrandId] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageProduct, setImageProduct] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { isOpen, open, close } = useModal();

  const {
    products,
    total,
    loading,
    submitting,
    error,
    refetch,
    addProduct,
    editProduct,
    removeProduct,
  } = useProducts({
    search: debouncedSearch,
    category_id: categoryId,
    brand_id: brandId,
    active: status,
  });

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setSelectedProduct(null);
    open();
  };

  // Open modal for Edit
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    open();
  };

  // Close modal and reset selection
  const handleCloseModal = () => {
    close();
    setSelectedProduct(null);
  };

  // Submit Handler for Create or Edit
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedProduct && selectedProduct.product_id) {
        const res = await editProduct(selectedProduct.product_id, formData);
        notifySuccess('Success', res?.message || 'Product updated successfully!');
      } else {
        const res = await addProduct(formData);
        notifySuccess('Success', res?.message || 'Product created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      notifyError('Error', err.message || 'Operation failed. Please try again.');
    }
  };

  // Delete Handler
  const handleDeleteProduct = async (id) => {
    try {
      const res = await removeProduct(id);
      notifySuccess('Deleted', res?.message || 'Product deleted successfully!');
    } catch (err) {
      notifyError('Error', err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="catalog-view-container">
      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message="Failed to load products"
          description={error}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filter and Actions Bar (No card stats) */}
      <ProductFilter
        search={search}
        onSearchChange={setSearch}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        brandId={brandId}
        onBrandChange={setBrandId}
        status={status}
        onStatusChange={setStatus}
        onRefresh={refetch}
        onAddClick={handleOpenCreateModal}
        loading={loading}
        totalCount={total}
      />

      {/* Products Table */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteProduct}
          onManageImages={setImageProduct}
        />
      </Card>

      {/* Product Images (multi upload by product_id) */}
      <ProductImageModal
        open={!!imageProduct}
        product={imageProduct}
        onCancel={() => setImageProduct(null)}
      />

      {/* Create / Edit Modal */}
      <ProductFormModal
        open={isOpen}
        product={selectedProduct}
        loading={submitting}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseModal}
      />
    </div>
  );
}

export default CatalogView;

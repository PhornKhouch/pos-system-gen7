import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Upload, Button, Image, Tag, Tooltip, Popconfirm, Empty, Spin, Input, Typography, message } from 'antd';
import {
  InboxOutlined,
  CloudUploadOutlined,
  StarOutlined,
  StarFilled,
  DeleteOutlined,
} from '@ant-design/icons';
import { productImageApi } from '../services/productImageApi';
import { getAssetUrl } from '@/utils/imageUtils';

const { Dragger } = Upload;
const { Text } = Typography;

const MAX_FILES = 10;
const MAX_SIZE_MB = 10;

export function ProductImageModal({ open, product, onCancel }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [imageAlt, setImageAlt] = useState('');

  const productId = product?.product_id;

  const fetchImages = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await productImageApi.getImagesByProduct(productId);
      setImages(res?.list || []);
    } catch (err) {
      message.error(err.message || 'Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (open) {
      setFileList([]);
      setImageAlt('');
      fetchImages();
    }
  }, [open, fetchImages]);

  const beforeUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error(`${file.name} is not an image file`);
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(`${file.name} must be smaller than ${MAX_SIZE_MB}MB`);
      return Upload.LIST_IGNORE;
    }
    // Keep file locally, upload manually on button click
    return false;
  };

  const handleUpload = async () => {
    if (fileList.length === 0) return;
    setUploading(true);
    try {
      const files = fileList.map((f) => f.originFileObj || f);
      const res = await productImageApi.uploadImages(productId, files, imageAlt);
      message.success(res?.message || 'Images uploaded successfully');
      setFileList([]);
      setImageAlt('');
      await fetchImages();
    } catch (err) {
      message.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await productImageApi.setPrimary(imageId);
      message.success('Primary image updated');
      await fetchImages();
    } catch (err) {
      message.error(err.message || 'Failed to set primary image');
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await productImageApi.deleteImage(imageId);
      message.success('Image deleted');
      await fetchImages();
    } catch (err) {
      message.error(err.message || 'Failed to delete image');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
      destroyOnHidden
      title={
        <div>
          <div style={{ fontWeight: 700 }}>Product Images</div>
          {product && (
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              {product.product_name} · SKU: {product.sku} · ID: {product.product_id}
            </Text>
          )}
        </div>
      }
    >
      {/* Upload Area */}
      <Dragger
        multiple
        accept="image/*"
        maxCount={MAX_FILES}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={({ fileList: newList }) => setFileList(newList.slice(0, MAX_FILES))}
        listType="picture"
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag images here</p>
        <p className="ant-upload-hint">
          Up to {MAX_FILES} images per upload, max {MAX_SIZE_MB}MB each (JPEG, PNG, WEBP, GIF, SVG)
        </p>
      </Dragger>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Input
          placeholder="Alt text (optional)"
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
          disabled={uploading}
        />
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          loading={uploading}
          disabled={fileList.length === 0}
          onClick={handleUpload}
        >
          Upload {fileList.length > 0 ? `(${fileList.length})` : ''}
        </Button>
      </div>

      {/* Existing Images */}
      <div style={{ marginTop: 24, marginBottom: 8, fontWeight: 600 }}>
        Uploaded images ({images.length})
      </div>
      <Spin spinning={loading}>
        {images.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No images for this product yet" />
        ) : (
          <Image.PreviewGroup>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 12,
              }}
            >
              {images.map((img) => (
                <div
                  key={img.image_id}
                  style={{
                    border: img.is_primary ? '2px solid #1677ff' : '1px solid var(--border-subtle, #f0f0f0)',
                    borderRadius: 8,
                    padding: 6,
                    position: 'relative',
                  }}
                >
                  {img.is_primary && (
                    <Tag color="blue" style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, margin: 0 }}>
                      Primary
                    </Tag>
                  )}
                  <Image
                    src={getAssetUrl(img.image_url)}
                    alt={img.image_alt || img.image_name}
                    width="100%"
                    height={110}
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text ellipsis style={{ fontSize: 11, maxWidth: 70 }} title={img.image_name}>
                      {img.image_name}
                    </Text>
                    <div>
                      <Tooltip title={img.is_primary ? 'Primary image' : 'Set as primary'}>
                        <Button
                          type="text"
                          size="small"
                          disabled={img.is_primary}
                          icon={img.is_primary ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                          onClick={() => handleSetPrimary(img.image_id)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Delete image"
                        description="Are you sure you want to delete this image?"
                        onConfirm={() => handleDelete(img.image_id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        )}
      </Spin>
    </Modal>
  );
}

export default ProductImageModal;

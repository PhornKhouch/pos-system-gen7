import { productMasterApi } from '@/features/product/prd_master/services/productMasterApi';
import { productImageApi } from '@/features/product/prd_master/services/productImageApi';
import { categoryApi } from '@/features/product/category/services/categoryApi';

/**
 * Storefront API Service
 * Reads the public catalogue endpoints and maps them to the shape the customer site uses:
 * - Categories: /api/v1/category/getall
 * - Products: /api/v1/productmaster/getall
 */
export const storefrontApi = {
  /**
   * @returns {Promise<Array<{ id: number, name: string }>>} Active categories
   */
  getCategories: async () => {
    const res = await categoryApi.getCategories({ active: 1 });
    const list = (res && res.list) || (Array.isArray(res) ? res : []);
    return list.map((cat) => ({
      id: cat.category_id,
      name: cat.category_name,
    }));
  },

  /**
   * @param {{ search?: string, category_id?: number|string }} params
   * @returns {Promise<Array>} Active products, newest first
   */
  getProducts: async (params = {}) => {
    const res = await productMasterApi.getProducts({ active: 1, ...params });
    const list = (res && res.list) || (Array.isArray(res) ? res : []);
    return list.map(mapProduct);
  },

  /**
   * Single product with its gallery (product_image rows linked by product_id)
   * - Product: /api/v1/productmaster/getone/:id
   * - Images: /api/v1/productimage/getbyproduct/:id
   * @returns {Promise<Object|null>} null when the product is missing or inactive
   */
  getProduct: async (id) => {
    const [productRes, imageRes] = await Promise.all([
      productMasterApi.getProductById(id),
      productImageApi.getImagesByProduct(id).catch(() => null),
    ]);
    const p = productRes?.data;
    if (!p || !(p.active === 1 || p.active === true)) return null;

    // Primary image first, then display_order; fall back to the master image column
    const gallery = [...(imageRes?.list || p.images || [])]
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order)
      .map((img) => ({ id: img.image_id, url: img.image_url, alt: img.image_alt || img.image_name || p.product_name }));
    if (!gallery.length && p.image) {
      gallery.push({ id: 'master', url: p.image, alt: p.product_name });
    }

    return {
      ...mapProduct(p),
      barcode: p.barcode || '',
      description: p.description || '',
      attributeName: p.attribute?.attribute_name || '',
      attributeValue: p.attribute?.attribute_value || '',
      images: gallery,
    };
  },
};

function mapProduct(p) {
  return {
    id: p.product_id,
    name: p.product_name,
    sku: p.sku,
    price: parseFloat(p.price) || 0,
    stock: p.quantity_stock != null ? parseInt(p.quantity_stock, 10) : 0,
    image: p.image || null,
    categoryId: p.category_id,
    categoryName: p.category?.category_name || '',
    brandId: p.brand_id,
    brandName: p.brand?.brand_name || '',
  };
}

export default storefrontApi;

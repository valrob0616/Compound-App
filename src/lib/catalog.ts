import catalog from '@/data/products.json';
import type { CategoryId, Product } from '@/types';

const products = catalog.products as Product[];

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function productsForCategory(category: CategoryId): Product[] {
  return products.filter((product) => product.category === category || product.category === 'both');
}

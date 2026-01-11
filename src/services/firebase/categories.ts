// ============================================
// Custom Categories Firestore Operations
// ============================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, isDevMode } from './config';
import { CustomCategory, NewCustomCategory } from '@/types';

// ============================================
// Mock Data for Development Mode
// ============================================

let mockCategories: CustomCategory[] = [];

// ============================================
// CRUD Operations
// ============================================

/**
 * Add a new custom category
 */
export const addCustomCategory = async (
  userId: string,
  category: NewCustomCategory
): Promise<string> => {
  if (isDevMode) {
    const newCategory: CustomCategory = {
      id: `custom-${Date.now()}`,
      userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      order: mockCategories.length + 100, // Custom categories start at 100
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    mockCategories.push(newCategory);
    return newCategory.id;
  }

  const categoriesRef = collection(db, 'users', userId, 'customCategories');

  // Get current count to set order
  const snapshot = await getDocs(categoriesRef);
  const order = snapshot.size + 100; // Custom categories start at 100

  const docRef = await addDoc(categoriesRef, {
    userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    type: category.type,
    order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
};

/**
 * Get all custom categories for a user
 */
export const getCustomCategories = async (userId: string): Promise<CustomCategory[]> => {
  if (isDevMode) {
    return mockCategories.filter((c) => c.userId === userId);
  }

  const categoriesRef = collection(db, 'users', userId, 'customCategories');
  const q = query(categoriesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CustomCategory[];
};

/**
 * Update a custom category
 */
export const updateCustomCategory = async (
  userId: string,
  categoryId: string,
  updates: Partial<NewCustomCategory>
): Promise<void> => {
  if (isDevMode) {
    const index = mockCategories.findIndex((c) => c.id === categoryId);
    if (index !== -1) {
      mockCategories[index] = {
        ...mockCategories[index],
        ...updates,
        updatedAt: Timestamp.now(),
      };
    }
    return;
  }

  const categoryRef = doc(db, 'users', userId, 'customCategories', categoryId);
  await updateDoc(categoryRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Soft delete a custom category (marks as deleted but preserves data for display)
 */
export const deleteCustomCategory = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  if (isDevMode) {
    const index = mockCategories.findIndex((c) => c.id === categoryId);
    if (index !== -1) {
      mockCategories[index] = {
        ...mockCategories[index],
        isDeleted: true,
        updatedAt: Timestamp.now(),
      };
    }
    return;
  }

  const categoryRef = doc(db, 'users', userId, 'customCategories', categoryId);
  await updateDoc(categoryRef, {
    isDeleted: true,
    updatedAt: Timestamp.now(),
  });
};

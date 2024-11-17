import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const dbService = {
  // Create a document
  async create(collectionName: string, id: string, data: DocumentData) {
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, data);
      return id;
    } catch (error) {
      throw error;
    }
  },

  // Read a document
  async get(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      throw error;
    }
  },

  // Update a document
  async update(collectionName: string, id: string, data: Partial<DocumentData>) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw error;
    }
  },

  // Delete a document
  async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    }
  },

  // Query documents
  async query(collectionName: string, field: string, operator: any, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Get all documents in a collection
  async getAll(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
};

'use client';

import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import type { InventoryAsset } from './definitions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type AssetIdentifier = {
  ams_asset_id?: string[];
  asset_description?: string;
  end_user?: string;
};

/**
 * Finds assets in a module's inventory based on a given identifier.
 */
export async function findAsset(
  db: Firestore,
  moduleSlug: string,
  identifier: AssetIdentifier
): Promise<InventoryAsset[]> {
  const collectionRef = collection(db, `modules/${moduleSlug}/inventory_list`);
  let q;

  // Build the query based on the provided identifier.
  if (identifier.ams_asset_id && identifier.ams_asset_id.length > 0) {
    // Firestore 'in' queries are limited to 30 elements.
    const ids = identifier.ams_asset_id.slice(0, 30);
    q = query(collectionRef, where('ams_asset_id', 'in', ids));
  } else if (identifier.asset_description) {
    q = query(collectionRef, where('asset_description', '==', identifier.asset_description));
  } else if (identifier.end_user) {
    q = query(collectionRef, where('end_user', '==', identifier.end_user));
  } else {
    // No valid identifier provided
    return [];
  }

  try {
    const querySnapshot = await getDocs(q);
    const assets: InventoryAsset[] = [];
    querySnapshot.forEach((doc) => {
      assets.push({ id: doc.id, ...doc.data() } as InventoryAsset);
    });
    return assets;
  } catch (error) {
    console.error('Error finding asset:', error);
    return [];
  }
}

/**
 * Moves an asset from a source module to a destination module in Firestore.
 * Uses a batch write for atomicity.
 */
export async function moveAsset(
  db: Firestore,
  sourceSlug: string,
  destSlug: string,
  assets: InventoryAsset[]
): Promise<{ success: boolean; error?: string }> {
  if (!assets || assets.length === 0) {
    return { success: false, error: 'No assets provided to move.' };
  }

  const batch = writeBatch(db);
  const destCollectionRef = collection(db, `modules/${destSlug}/inventory_list`);

  for (const asset of assets) {
      const { id, ...assetData } = asset;
      if (!id) {
          return { success: false, error: 'One of the assets is missing an ID.' };
      }
      const sourceDocRef = doc(db, 'modules', sourceSlug, 'inventory_list', id);
      const newDestDocRef = doc(destCollectionRef); // Let Firestore generate a new ID in the destination

      batch.delete(sourceDocRef);
      batch.set(newDestDocRef, assetData);
  }


  try {
    await batch.commit();
    return { success: true };
  } catch (serverError: any) {
    console.error('Error moving asset:', serverError);
    const permissionError = new FirestorePermissionError({
      path: `from modules/${sourceSlug}/inventory_list to modules/${destSlug}/inventory_list`,
      operation: 'write',
    });
    errorEmitter.emit('permission-error', permissionError);
    return { success: false, error: serverError.message || 'An unknown error occurred.' };
  }
}

/**
 * Permanently deletes an asset from a module's inventory in Firestore.
 */
export async function deleteAsset(
  db: Firestore,
  moduleSlug: string,
  assetId: string
): Promise<{ success: boolean; error?: string }> {
  if (!assetId) {
    return { success: false, error: 'Asset is missing an ID.' };
  }

  const assetRef = doc(db, 'modules', moduleSlug, 'inventory_list', assetId);

  try {
    await deleteDoc(assetRef);
    return { success: true };
  } catch (serverError: any) {
    console.error('Error deleting asset:', serverError);
    const permissionError = new FirestorePermissionError({
      path: assetRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    return { success: false, error: serverError.message || 'An unknown error occurred.' };
  }
}

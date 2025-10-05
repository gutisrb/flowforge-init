import { WizardData } from '@/contexts/WizardContext';

const DB_NAME = 'WizardDrafts';
const STORE_NAME = 'drafts';
const DRAFT_KEY = 'current-draft';

let dbInstance: IDBDatabase | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveWizardDraft = async (data: WizardData): Promise<void> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const serialized = {
      formData: data.formData,
      clipCount: data.clipCount,
      currentStep: data.currentStep,
      slots: await Promise.all(
        data.slots.map(async (slot) => ({
          id: slot.id,
          mode: slot.mode,
          images: await Promise.all(
            slot.images.map(async (file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
              data: await file.arrayBuffer(),
            }))
          ),
        }))
      ),
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(serialized, DRAFT_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save wizard draft:', error);
    throw error;
  }
};

export const loadWizardDraft = async (): Promise<WizardData | null> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    const data = await new Promise<any>((resolve, reject) => {
      const request = store.get(DRAFT_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!data) return null;

    const slots = await Promise.all(
      data.slots.map(async (slot: any) => ({
        id: slot.id,
        mode: slot.mode,
        images: await Promise.all(
          slot.images.map(async (img: any) => {
            const blob = new Blob([img.data], { type: img.type });
            return new File([blob], img.name, {
              type: img.type,
              lastModified: img.lastModified,
            });
          })
        ),
      }))
    );

    return {
      formData: data.formData,
      clipCount: data.clipCount,
      currentStep: data.currentStep,
      slots,
    };
  } catch (error) {
    console.error('Failed to load wizard draft:', error);
    return null;
  }
};

export const clearWizardDraft = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(DRAFT_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear wizard draft:', error);
    throw error;
  }
};

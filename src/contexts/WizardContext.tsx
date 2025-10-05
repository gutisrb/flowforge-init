import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { SlotData } from '@/components/ImageSlots';

export interface FormData {
  title: string;
  price: string;
  location: string;
  size?: string;
  beds?: string;
  baths?: string;
  sprat?: string;
  extras?: string;
}

export interface WizardData {
  formData: FormData;
  slots: SlotData[];
  clipCount: 5 | 6;
  currentStep: 1 | 2 | 3;
}

interface WizardContextType {
  wizardData: WizardData;
  setWizardData: (data: WizardData | ((prev: WizardData) => WizardData)) => void;
  updateFormData: (data: FormData) => void;
  updateSlots: (slots: SlotData[]) => void;
  updateClipCount: (count: 5 | 6) => void;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  resetWizard: () => void;
}

const STORAGE_KEY = 'wizard-draft';

const defaultWizardData: WizardData = {
  formData: { title: '', price: '', location: '' },
  slots: Array.from({ length: 5 }, (_, i) => ({
    id: `slot-${i}`,
    mode: 'image-to-video' as const,
    images: []
  })),
  clipCount: 5 as const,
  currentStep: 1,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const serializeWizardData = async (data: WizardData): Promise<string> => {
  const serialized = {
    formData: data.formData,
    clipCount: data.clipCount,
    currentStep: data.currentStep,
    slots: await Promise.all(data.slots.map(async (slot) => ({
      id: slot.id,
      mode: slot.mode,
      images: await Promise.all(slot.images.map(async (file) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: base64
        };
      }))
    })))
  };
  return JSON.stringify(serialized);
};

const deserializeWizardData = async (json: string): Promise<WizardData> => {
  const parsed = JSON.parse(json);
  const slots = await Promise.all(parsed.slots.map(async (slot: any) => ({
    id: slot.id,
    mode: slot.mode,
    images: await Promise.all(slot.images.map(async (img: any) => {
      const response = await fetch(img.data);
      const blob = await response.blob();
      return new File([blob], img.name, { type: img.type, lastModified: img.lastModified });
    }))
  })));

  return {
    formData: parsed.formData,
    clipCount: parsed.clipCount,
    currentStep: parsed.currentStep,
    slots
  };
};

export function WizardProvider({ children }: { children: ReactNode }) {
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const restoreData = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const restored = await deserializeWizardData(stored);
          setWizardData(restored);
        }
      } catch (error) {
        console.error('Failed to restore wizard data:', error);
      } finally {
        setIsRestored(true);
      }
    };
    restoreData();
  }, []);

  useEffect(() => {
    if (!isRestored) return;

    const saveData = async () => {
      try {
        const serialized = await serializeWizardData(wizardData);
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch (error) {
        console.error('Failed to save wizard data:', error);
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [wizardData, isRestored]);

  const updateFormData = (data: FormData) => {
    setWizardData(prev => ({ ...prev, formData: data }));
  };

  const updateSlots = (slots: SlotData[]) => {
    setWizardData(prev => ({ ...prev, slots }));
  };

  const updateClipCount = (count: 5 | 6) => {
    setWizardData(prev => {
      const newSlots = Array.from({ length: count }, (_, i) => {
        // Keep existing slot if it exists, otherwise create new one
        return prev.slots[i] || {
          id: `slot-${i}`,
          mode: 'image-to-video' as const,
          images: []
        };
      });
      
      return { 
        ...prev, 
        clipCount: count,
        slots: newSlots
      };
    });
  };

  const setCurrentStep = (step: 1 | 2 | 3) => {
    setWizardData(prev => ({ ...prev, currentStep: step }));
  };

  const resetWizard = () => {
    setWizardData(defaultWizardData);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WizardContext.Provider value={{
      wizardData,
      setWizardData,
      updateFormData,
      updateSlots,
      updateClipCount,
      setCurrentStep,
      resetWizard
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

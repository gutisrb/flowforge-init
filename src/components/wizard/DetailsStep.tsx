// src/components/wizard/DetailsStep.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormData = {
  title: string;
  price: string;
  location: string;
  size?: string;
  beds?: string;
  baths?: string;
  sprat?: string;
  extras?: string;
};

interface DetailsStepProps {
  formData: FormData;
  updateFormData: (data: FormData) => void; // <-- we use only this to change fields
  nextStep: () => void;
  canProceed: boolean;
  isLoading?: boolean;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  updateFormData,
  nextStep,
  canProceed,
  isLoading = false,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Update the full formData object; no external onChange prop required
    updateFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) nextStep();
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-card border border-border">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <Label htmlFor="title" className="text-13 text-muted-foreground mb-2 block">Naslov</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="npr. Trosoban stan, Vračar"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="price" className="text-13 text-muted-foreground mb-2 block">Cena</Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="npr. 245.000 €"
            className="h-11"
          />
        </div>

        <div className="md:col-span-2 border-t border-border/30 pt-6">
          <Label htmlFor="location" className="text-13 text-muted-foreground mb-2 block">Lokacija</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="npr. Vračar, Beograd"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="size" className="text-13 text-muted-foreground mb-2 block">Površina (m²)</Label>
          <Input
            id="size"
            name="size"
            value={formData.size || ""}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="beds" className="text-13 text-muted-foreground mb-2 block">Spavaće sobe</Label>
          <Input
            id="beds"
            name="beds"
            value={formData.beds || ""}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="baths" className="text-13 text-muted-foreground mb-2 block">Kupatila</Label>
          <Input
            id="baths"
            name="baths"
            value={formData.baths || ""}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="sprat" className="text-13 text-muted-foreground mb-2 block">Sprat</Label>
          <Input
            id="sprat"
            name="sprat"
            value={formData.sprat || ""}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div className="md:col-span-2 border-t border-border/30 pt-6">
          <Label htmlFor="extras" className="text-13 text-muted-foreground mb-2 block">Dodatno</Label>
          <Input
            id="extras"
            name="extras"
            value={formData.extras || ""}
            onChange={handleChange}
            placeholder="npr. Garaža, terasa, lift…"
            className="h-11"
          />
          <p className="text-13 text-muted-foreground/70 mt-1">Garaža, terasa, lift ili druge značajne karakteristike</p>
        </div>
      </form>
    </div>
  );
};

export { DetailsStep };
export default DetailsStep;

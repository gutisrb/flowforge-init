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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="title">Naslov</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="npr. Trosoban stan, Vračar"
        />
      </div>

      <div>
        <Label htmlFor="price">Cena</Label>
        <Input
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="npr. 245.000 €"
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="location">Lokacija</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="npr. Vračar, Beograd"
        />
      </div>

      <div>
        <Label htmlFor="size">Površina (m²)</Label>
        <Input
          id="size"
          name="size"
          value={formData.size || ""}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="beds">Spavaće sobe</Label>
        <Input
          id="beds"
          name="beds"
          value={formData.beds || ""}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="baths">Kupatila</Label>
        <Input
          id="baths"
          name="baths"
          value={formData.baths || ""}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="sprat">Sprat</Label>
        <Input
          id="sprat"
          name="sprat"
          value={formData.sprat || ""}
          onChange={handleChange}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="extras">Dodatno</Label>
        <Input
          id="extras"
          name="extras"
          value={formData.extras || ""}
          onChange={handleChange}
          placeholder="npr. Garaža, terasa, lift…"
        />
      </div>

      <div className="md:col-span-2 mt-2 flex justify-end">
        <Button type="submit" disabled={!canProceed || isLoading}>
          {isLoading ? "Sačuvavam…" : "Dalje"}
        </Button>
      </div>
    </form>
  );
};

export { DetailsStep };
export default DetailsStep;

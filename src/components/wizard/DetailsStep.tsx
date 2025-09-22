import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { FormData } from "@/components/VideoWizard";

const detailsSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  price: z.string().min(1, "Cena je obavezna"),
  location: z.string().min(1, "Lokacija je obavezna"),
  size: z.string().optional(),
  beds: z.string().optional(),
  baths: z.string().optional(),
  sprat: z.string().optional(),
  extras: z.string().optional(),
});

interface DetailsStepProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  onNext: () => void;
  canProceed: boolean;
}

export const DetailsStep = ({ formData, onChange, onNext, canProceed }: DetailsStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: formData,
  });

  // Watch for changes and update parent
  const watchedData = watch();
  
  // Update parent whenever form data changes (excluding onChange from deps to prevent infinite loop)
  React.useEffect(() => {
    onChange(watchedData);
  }, [watchedData]);

  const onSubmit = (data: FormData) => {
    onChange(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-heading-2 text-text-primary">
          Detalji o nekretnini
        </h2>
        <p className="text-body text-text-muted">
          Popunite osnovne informacije koje će se koristiti u videu
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Required fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-base font-semibold">
              Naslov <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="npr. Moderan trosoban stan u centru Beograda"
              className="mt-2"
            />
            <p className="text-sm text-text-subtle mt-1">
              Opišite nekretninu jasno i privlačno
            </p>
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-base font-semibold">
                Cena <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                {...register("price")}
                placeholder="npr. 180.000€"
                className="mt-2"
              />
              <p className="text-sm text-text-subtle mt-1">
                Unesite prodajnu cenu
              </p>
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="text-base font-semibold">
                Lokacija <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="npr. Vračar, Beograd"
                className="mt-2"
              />
              <p className="text-sm text-text-subtle mt-1">
                Grad ili opština
              </p>
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional details */}
        <div className="space-y-4">
          <h3 className="text-heading-3 text-text-primary border-t pt-4">
            Dodatni detalji
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size" className="text-base font-semibold">
                Površina (m²)
              </Label>
              <Input
                id="size"
                {...register("size")}
                placeholder="npr. 65"
                className="mt-2"
              />
              <p className="text-sm text-text-subtle mt-1">
                Ukupna kvadratura
              </p>
            </div>

            <div>
              <Label htmlFor="beds" className="text-base font-semibold">
                Sobe
              </Label>
              <Input
                id="beds"
                {...register("beds")}
                placeholder="npr. 3"
                className="mt-2"
              />
              <p className="text-sm text-text-subtle mt-1">
                Broj spavaćih soba
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baths" className="text-base font-semibold">
                Kupatila
              </Label>
              <Input
                id="baths"
                {...register("baths")}
                placeholder="npr. 1"
                className="mt-2"
              />
              <p className="text-sm text-text-subtle mt-1">
                Broj kupatila
              </p>
            </div>

            <div>
              <Label htmlFor="sprat" className="text-base font-semibold">
                Sprat
              </Label>
              <Input
                id="sprat"
                {...register("sprat")}
                placeholder="npr. 3/5"
                className="mt-2"
              />
              <p className="text-sm text-text-subtle mt-1">
                Koji sprat od ukupno
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="extras" className="text-base font-semibold">
              Dodatni komentar
            </Label>
            <Textarea
              id="extras"
              {...register("extras")}
              placeholder="npr. Terasa sa pogledom, parking, lift, klima, renoviran..."
              className="mt-2 min-h-[80px] resize-none"
            />
            <p className="text-sm text-text-subtle mt-1">
              Izdvojite ono što čini ovu nekretninu posebnom
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button
            type="submit"
            disabled={!canProceed}
            className="gradient-accent text-white px-8"
          >
            Sledeći korak
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
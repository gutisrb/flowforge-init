import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, AlertCircle } from "lucide-react";

const listingSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  price: z.string().min(1, "Cena je obavezna"),
  location: z.string().min(1, "Lokacija je obavezna"),
  size: z.string().optional(),
  beds: z.string().optional(),
  baths: z.string().optional(),
  sprat: z.string().optional(),
  extras: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;


interface ListingFormProps {
  onSubmit: (data: ListingFormData) => void;
  isLoading: boolean;
  isValid: boolean;
  totalImages: number;
  formErrors: string[];
}

export function ListingForm({ onSubmit, isLoading, isValid, totalImages, formErrors }: ListingFormProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });

  const formData = watch();
  
  const getValidationTooltip = () => {
    const issues = [];
    if (!formData?.title) issues.push("Naslov");
    if (!formData?.price) issues.push("Cena");
    if (!formData?.location) issues.push("Lokacija");
    if (totalImages < 5) issues.push(`${5 - totalImages} više fotografija`);
    
    if (issues.length === 0) return "";
    return `Potrebno: ${issues.join(", ")}`;
  };

  const onFormSubmit = (data: ListingFormData) => {
    onSubmit(data);
  };

  return (
    <TooltipProvider>
      <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/40 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg p-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Informacije o nekretnini
          </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Naslov <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Unesite naslov oglasa"
            className="mt-1"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price" className="text-sm font-medium">
            Cena <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            {...register("price")}
            placeholder="Unesite cenu (€ ili RSD)"
            className="mt-1"
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location" className="text-sm font-medium">
            Lokacija <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Unesite lokaciju"
            className="mt-1"
          />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size" className="text-sm font-medium">
              Površina m²
            </Label>
            <Input
              id="size"
              {...register("size")}
              placeholder="Unesite površinu"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="beds" className="text-sm font-medium">
              Sobe
            </Label>
            <Input
              id="beds"
              {...register("beds")}
              placeholder="Broj soba"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="baths" className="text-sm font-medium">
              Kupatila
            </Label>
            <Input
              id="baths"
              {...register("baths")}
              placeholder="Broj kupatila"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="sprat" className="text-sm font-medium">
              Sprat
            </Label>
            <Input
              id="sprat"
              {...register("sprat")}
              placeholder="Na kom spratu"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="extras" className="text-sm font-medium">
            Dodatno (opciono)
          </Label>
          <Textarea
            id="extras"
            {...register("extras")}
            placeholder="Opišite šta je posebno kod ovog stana (terasa, parking, lift, klima, itd.)"
            className="mt-1 min-h-[80px]"
          />
        </div>
      </div>

          {!isValid ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    type="button"
                    disabled={true}
                    className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                    size="lg"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Generiši profesionalni video
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{getValidationTooltip()}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Generisanje u toku…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generiši profesionalni video
                </>
              )}
            </Button>
          )}
        </form>
      </div>
    </TooltipProvider>
  );
}
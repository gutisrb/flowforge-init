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
    if (totalImages < 6) issues.push(`${6 - totalImages} više fotografija`);
    
    if (issues.length === 0) return "";
    return `Potrebno: ${issues.join(", ")}`;
  };

  const onFormSubmit = (data: ListingFormData) => {
    onSubmit(data);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Informacije o nekretnini
            </h2>
            <p className="text-sm text-gray-600">
              Popunite osnovne informacije o vašoj nekretnini
            </p>
          </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Naslov <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Unesite naslov oglasa"
            className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price" className="text-sm font-medium text-gray-700">
            Cena <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            {...register("price")}
            placeholder="Unesite cenu (€)"
            className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location" className="text-sm font-medium text-gray-700">
            Lokacija <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Unesite lokaciju"
            className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.location && (
            <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size" className="text-sm font-medium text-gray-700">
              Površina m²
            </Label>
            <Input
              id="size"
              {...register("size")}
              placeholder="Unesite površinu"
              className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div>
            <Label htmlFor="beds" className="text-sm font-medium text-gray-700">
              Sobe
            </Label>
            <Input
              id="beds"
              {...register("beds")}
              placeholder="Broj soba"
              className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="baths" className="text-sm font-medium text-gray-700">
              Kupatila
            </Label>
            <Input
              id="baths"
              {...register("baths")}
              placeholder="Broj kupatila"
              className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div>
            <Label htmlFor="sprat" className="text-sm font-medium text-gray-700">
              Sprat
            </Label>
            <Input
              id="sprat"
              {...register("sprat")}
              placeholder="Na kom spratu"
              className="mt-1 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="extras" className="text-sm font-medium text-gray-700">
            Šta je posebno kod ovog stana?
          </Label>
          <Textarea
            id="extras"
            {...register("extras")}
            placeholder="Opišite šta čini ovaj stan posebnim: terasa sa pogledom, parking, lift, klima, renoviran, itd."
            className="mt-1 min-h-[100px] resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Izdvojite detalje koji će privući pažnju kupaca
          </p>
        </div>
      </div>

          {!isValid ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    type="button"
                    disabled={true}
                    className="w-full bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    size="lg"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Generiši
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-700 shadow-lg">
                <p className="text-sm">{getValidationTooltip()}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 font-medium"
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
                  Generiši
                </>
              )}
            </Button>
          )}
        </form>
      </div>
    </TooltipProvider>
  );
}
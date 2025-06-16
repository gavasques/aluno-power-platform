import { useState, useEffect } from "react";
import { Product, ProductChannels, ProductDescriptions } from "@/types/product";
import { toast } from "@/hooks/use-toast";

interface UseEditProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
}

export const useEditProductForm = ({ product, onSave }: UseEditProductFormProps) => {
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedProduct(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setEditedProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDescriptionsChange = (descriptions: ProductDescriptions) => {
    setEditedProduct(prev => ({
      ...prev,
      descriptions
    }));
  };

  const handleChannelToggle = (channelType: keyof ProductChannels) => {
    setEditedProduct(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelType]: {
          ...prev.channels[channelType]!,
          enabled: !prev.channels[channelType]!.enabled
        }
      }
    }));
  };

  const handleChannelInputChange = (channelType: keyof ProductChannels, field: string, value: number | string) => {
    setEditedProduct(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelType]: {
          ...prev.channels[channelType]!,
          [field]: value
        }
      }
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 3MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedProduct(prev => ({ 
          ...prev, 
          photo: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editedProduct.name || !editedProduct.brand || !editedProduct.supplierId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, marca e fornecedor.",
        variant: "destructive"
      });
      return;
    }

    onSave(editedProduct);
    toast({
      title: "Produto atualizado",
      description: "As alterações foram salvas com sucesso."
    });
  };

  return {
    editedProduct,
    handleInputChange,
    handleChannelToggle,
    handleChannelInputChange,
    handlePhotoUpload,
    handleDescriptionsChange,
    handleSave,
  };
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProductChannels } from "@/types/product";
import { useProducts } from "@/contexts/ProductContext";

export const useProductForm = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  
  const [productData, setProductData] = useState({
    name: "",
    photo: "",
    ean: "",
    dimensions: { length: 0, width: 0, height: 0 },
    weight: 0,
    brand: "",
    category: "",
    supplierId: "",
    ncm: "",
    costItem: 0,
    packCost: 0,
    taxPercent: 0
  });

  const [channels, setChannels] = useState<ProductChannels>({
    sitePropio: {
      enabled: false,
      commissionPct: 0,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      salePrice: 0,
      gatewayPct: 0
    },
    amazonFBM: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonFBAOnSite: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonDBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonFBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      inboundFreight: 0,
      prepCenter: 0,
      salePrice: 0
    },
    mlME1: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      salePrice: 0
    },
    mlFlex: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      flexRevenue: 0,
      salePrice: 0
    },
    mlEnvios: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    mlFull: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      inboundFreight: 0,
      prepCenter: 0,
      salePrice: 0
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProductData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setProductData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleChannelToggle = (channelType: keyof ProductChannels) => {
    setChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        enabled: !prev[channelType]!.enabled
      }
    }));
  };

  const handleChannelInputChange = (channelType: keyof ProductChannels, field: string, value: number) => {
    setChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        [field]: value
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
        setProductData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Validação básica
    if (!productData.name || !productData.brand || !productData.supplierId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, marca e fornecedor.",
        variant: "destructive"
      });
      return;
    }

    // Criar o produto usando o contexto
    addProduct({
      ...productData,
      channels
    });

    toast({
      title: "Produto salvo",
      description: "O produto foi cadastrado com sucesso."
    });
    
    navigate("/minha-area/produtos");
  };

  return {
    productData,
    channels,
    handleInputChange,
    handleChannelToggle,
    handleChannelInputChange,
    handlePhotoUpload,
    handleSubmit,
    navigate
  };
};

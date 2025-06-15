import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProductChannels, ProductSupplier } from "@/types/product";
import { useProducts } from "@/contexts/ProductContext";

export const useProductForm = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  
  const [productData, setProductData] = useState({
    name: "",
    photo: "",
    sku: "",
    internalCode: "",
    ean: "",
    dimensions: { length: 0, width: 0, height: 0 },
    weight: 0,
    brand: "",
    category: "",
    supplierId: "",
    supplierProductCode: "",
    ncm: "",
    costItem: 0,
    packCost: 0,
    taxPercent: 0
  });

  const [productSuppliers, setProductSuppliers] = useState<ProductSupplier[]>([]);

  const [channels, setChannels] = useState<ProductChannels>({
    sitePropio: {
      enabled: false,
      commissionPct: 0,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      salePrice: 0,
      gatewayPct: 0,
      productCode: ""
    },
    amazonFBM: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      averageFreightIfFree: 0,
      salePrice: 0,
      productCode: ""
    },
    amazonFBAOnSite: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      averageFreightIfFree: 0,
      salePrice: 0,
      productCode: ""
    },
    amazonDBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      averageFreightIfFree: 0,
      salePrice: 0,
      productCode: ""
    },
    amazonFBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      inboundFreight: 0,
      outboundFreight: 0,
      prepCenter: 0,
      salePrice: 0,
      productCode: "",
      fnsku: ""
    },
    mlME1: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      averageFreightIfFree: 0,
      salePrice: 0,
      productCode: ""
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
      salePrice: 0,
      productCode: ""
    },
    mlEnvios: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0,
      productCode: ""
    },
    mlFull: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      inboundFreight: 0,
      outboundFreight: 0,
      prepCenter: 0,
      salePrice: 0,
      productCode: ""
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

  const handleChannelInputChange = (channelType: keyof ProductChannels, field: string, value: number | string) => {
    setChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        [field]: value
      }
    }));
  };

  const handleSuppliersChange = (suppliers: ProductSupplier[]) => {
    setProductSuppliers(suppliers);
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

    // Criar o produto usando o contexto - incluindo a propriedade active e os novos campos
    addProduct({
      ...productData,
      suppliers: productSuppliers,
      channels,
      active: true
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
    productSuppliers,
    handleInputChange,
    handleChannelToggle,
    handleChannelInputChange,
    handleSuppliersChange,
    handlePhotoUpload,
    handleSubmit,
    navigate
  };
};

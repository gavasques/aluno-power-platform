
import { Product } from "@/types/product";
import { useMemo } from "react";

interface ProductTechSpecsProps {
  product: Product;
}

export const ProductTechSpecs = ({ product }: ProductTechSpecsProps) => {
  const volumeM3 = useMemo(() => {
    const { length, width, height } = product.dimensions;
    if (!length || !width || !height) return 0;
    const volumeCm3 = length * width * height;
    return volumeCm3 / 1000000;
  }, [product.dimensions]);

  const volumeCm3 = useMemo(() => volumeM3 * 1000000, [volumeM3]);
  const pesoCubado167 = useMemo(() => volumeM3 * 167, [volumeM3]);
  const pesoCubado300 = useMemo(() => volumeM3 * 300, [volumeM3]);

  return (
    <>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Dimensões (C×L×A)</label>
        <p>{product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Peso</label>
        <p>{product.weight} kg</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Volume</label>
        <p>{volumeCm3.toLocaleString('pt-BR')} cm³ ({volumeM3.toFixed(6)} m³)</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Peso Cubado (167)</label>
        <p>{pesoCubado167.toFixed(2)} kg</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Peso Cubado (300)</label>
        <p>{pesoCubado300.toFixed(2)} kg</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
        <p>{new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
      </div>
    </>
  );
};

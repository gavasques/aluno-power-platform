import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart,
  Info,
  Store
} from "lucide-react";
import { ChannelsEditor } from "@/components/product/ChannelsEditor";

interface ProductChannelsTabProps {
  form: UseFormReturn<any>;
}

export default function ProductChannelsTab({ form }: ProductChannelsTabProps) {
  const [showChannelsEditor, setShowChannelsEditor] = useState(false);
  const productId = form.getValues("id");
  
  console.log("🔍 [PRODUCT CHANNELS TAB] productId:", productId);
  console.log("🔍 [PRODUCT CHANNELS TAB] form values:", form.getValues());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Canais de Venda
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure os canais onde o produto será vendido. Ative apenas os canais que você utiliza e configure os preços e taxas específicas de cada um.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button
              onClick={() => setShowChannelsEditor(true)}
              size="lg"
              className="gap-2"
            >
              <Store className="h-5 w-5" />
              Configurar Canais de Venda
            </Button>
          </div>

          {/* Use o mesmo componente ChannelsEditor usado na lista de produtos */}
          {showChannelsEditor && productId && (
            <ChannelsEditor
              productId={productId.toString()}
              isOpen={showChannelsEditor}
              onClose={() => setShowChannelsEditor(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
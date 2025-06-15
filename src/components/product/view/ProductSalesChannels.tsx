
import { Product } from "@/types/product";
import { ChannelDetails } from "../ChannelDetails";

const channelNames = {
  sitePropio: "Site Próprio",
  amazonFBM: "Amazon FBM",
  amazonFBAOnSite: "Amazon FBA On Site",
  amazonDBA: "Amazon DBA",
  amazonFBA: "Amazon FBA",
  mlME1: "ML ME1",
  mlFlex: "ML Flex",
  mlEnvios: "ML Envios",
  mlFull: "ML Full"
};

interface ProductSalesChannelsProps {
  product: Product;
  onEditChannels?: () => void;
}

export const ProductSalesChannels = ({ product, onEditChannels }: ProductSalesChannelsProps) => {
  return (
    <div className="space-y-3">
      {Object.entries(product.channels).map(([channelKey, channel]) => {
        if (!channel) return null;
        
        return (
          <ChannelDetails
            key={channelKey}
            product={product}
            channelKey={channelKey as keyof typeof product.channels}
            channelName={channelNames[channelKey as keyof typeof channelNames]}
            channel={channel}
            onEditChannel={() => onEditChannels?.()}
          />
        );
      })}
    </div>
  );
};

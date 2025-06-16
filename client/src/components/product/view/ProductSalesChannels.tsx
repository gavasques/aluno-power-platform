import { Product } from "@/types/product";
import { ChannelDetails } from "../ChannelDetails";
import { channelNames } from "@/config/channels";

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

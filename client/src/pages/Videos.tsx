import { VideosSection } from "@/components/youtube/VideosSection";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

const Videos = () => {
  return (
    <PermissionGuard featureCode="content.videos">
      <div className="container mx-auto p-6 max-w-7xl">
        <VideosSection />
      </div>
    </PermissionGuard>
  );
};

export default Videos;
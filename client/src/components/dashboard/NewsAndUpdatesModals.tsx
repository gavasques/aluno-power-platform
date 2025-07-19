import React, { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface NewsAndUpdatesModalsProps {
  selectedNews: any;
  selectedUpdate: any;
  newsModalOpen: boolean;
  updateModalOpen: boolean;
  setNewsModalOpen: (open: boolean) => void;
  setUpdateModalOpen: (open: boolean) => void;
  formatCreatedDate: (dateString: string) => string;
}

const NewsAndUpdatesModals: React.FC<NewsAndUpdatesModalsProps> = ({
  selectedNews,
  selectedUpdate,
  newsModalOpen,
  updateModalOpen,
  setNewsModalOpen,
  setUpdateModalOpen,
  formatCreatedDate,
}) => {
  return (
    <>
      {/* Modal para Notícias */}
      <Dialog open={newsModalOpen} onOpenChange={setNewsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-gray-900 mb-2 pr-4">
                      {selectedNews.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedNews.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {selectedNews.category}
                        </Badge>
                      )}
                      {selectedNews.isFeatured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Destaque
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatCreatedDate(selectedNews.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedNews.imageUrl && (
                <div className="mb-6">
                  <img 
                    src={selectedNews.imageUrl} 
                    alt={selectedNews.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose max-w-none">
                {selectedNews.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">{selectedNews.summary}</p>
                  </div>
                )}
                
                <div className="text-gray-700 whitespace-pre-wrap">
                  {selectedNews.content}
                </div>
              </div>

              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Novidades */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedUpdate && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-gray-900 mb-2 pr-4">
                      {selectedUpdate.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedUpdate.version && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {selectedUpdate.version}
                        </Badge>
                      )}
                      <Badge 
                        variant="secondary" 
                        className={`${
                          selectedUpdate.type === 'feature' ? 'bg-blue-100 text-blue-800' :
                          selectedUpdate.type === 'bugfix' ? 'bg-red-100 text-red-800' :
                          selectedUpdate.type === 'improvement' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedUpdate.type || 'Feature'}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={`${
                          selectedUpdate.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          selectedUpdate.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedUpdate.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedUpdate.priority || 'Normal'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatCreatedDate(selectedUpdate.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="prose max-w-none">
                {selectedUpdate.summary && (
                  <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                    <p className="text-gray-700 font-medium">{selectedUpdate.summary}</p>
                  </div>
                )}
                
                <div className="text-gray-700 whitespace-pre-wrap">
                  {selectedUpdate.content}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(NewsAndUpdatesModals);
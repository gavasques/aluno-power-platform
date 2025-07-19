import { Link } from 'wouter';

interface FooterProps {
  className?: string;
  variant?: 'login' | 'internal';
}

export function Footer({ className = '', variant = 'internal' }: FooterProps) {
  const baseStyles = variant === 'login' 
    ? 'text-center py-6 text-sm text-gray-600 dark:text-gray-400' 
    : 'border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-8 mt-auto';

  const containerStyles = variant === 'login' 
    ? '' 
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <footer className={`${baseStyles} ${className}`}>
      <div className={containerStyles}>
        {variant === 'internal' && (
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Core Guilherme Vasques - Liberdade Virtual LTDA
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/termos-de-uso">
                <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Termos de Uso
                </a>
              </Link>
              <Link href="/politica-de-privacidade">
                <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Política de Privacidade
                </a>
              </Link>
            </div>
          </div>
        )}
        
        {variant === 'login' && (
          <div className="space-y-2">
            <p className="text-gray-500 dark:text-gray-400">
              © 2025 Core Guilherme Vasques - Liberdade Virtual LTDA
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/termos-de-uso">
                <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm underline">
                  Termos de Uso
                </a>
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/politica-de-privacidade">
                <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm underline">
                  Política de Privacidade
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
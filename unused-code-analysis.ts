/**
 * Script de Análise de Código Não Utilizado
 * Identifica elementos que podem ser removidos para melhorar manutenibilidade
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

interface UnusedCodeReport {
  unusedComponents: string[];
  unusedHooks: string[];
  unusedImports: string[];
  unusedState: string[];
  backupFiles: string[];
  commentedCode: string[];
  duplicateComponents: string[];
}

class UnusedCodeAnalyzer {
  private srcPath = './client/src';
  private report: UnusedCodeReport = {
    unusedComponents: [],
    unusedHooks: [],
    unusedImports: [],
    unusedState: [],
    backupFiles: [],
    commentedCode: [],
    duplicateComponents: []
  };

  private getAllFiles(dir: string, ext: string[] = ['.tsx', '.ts']): string[] {
    const files: string[] = [];
    
    const scan = (currentDir: string) => {
      try {
        const items = readdirSync(currentDir);
        for (const item of items) {
          const fullPath = join(currentDir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scan(fullPath);
          } else if (stat.isFile() && ext.some(e => item.endsWith(e))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Erro ao ler diretório ${currentDir}:`, error);
      }
    };
    
    scan(dir);
    return files;
  }

  private readFileContent(filePath: string): string {
    try {
      return readFileSync(filePath, 'utf8');
    } catch {
      return '';
    }
  }

  public analyzeBackupFiles(): void {
    const allFiles = this.getAllFiles(this.srcPath);
    
    this.report.backupFiles = allFiles.filter(file => 
      file.includes('.backup') || 
      file.includes('.old') || 
      file.includes('Backup') ||
      file.includes('Old.tsx') ||
      file.includes('Old.ts')
    );
  }

  public analyzeUnusedComponents(): void {
    const componentFiles = this.getAllFiles(this.srcPath)
      .filter(file => file.includes('/components/') && file.endsWith('.tsx'));
    
    const allFileContents = this.getAllFiles(this.srcPath)
      .map(file => this.readFileContent(file))
      .join('\n');

    for (const componentFile of componentFiles) {
      const content = this.readFileContent(componentFile);
      const componentName = this.extractComponentName(content);
      
      if (componentName && !this.isComponentUsed(componentName, allFileContents, componentFile)) {
        this.report.unusedComponents.push(`${componentFile} (${componentName})`);
      }
    }
  }

  private extractComponentName(content: string): string | null {
    // Procura por export default function, export function, export const
    const patterns = [
      /export\s+default\s+function\s+(\w+)/,
      /export\s+function\s+(\w+)/,
      /export\s+const\s+(\w+)\s*[:=]/,
      /function\s+(\w+).*\{\s*return\s+</
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  private isComponentUsed(componentName: string, allContents: string, componentFile: string): boolean {
    // Remove o próprio arquivo da busca
    const contentsWithoutSelf = allContents.replace(this.readFileContent(componentFile), '');
    
    // Procura por importações e uso do componente
    const usagePatterns = [
      new RegExp(`import.*${componentName}.*from`, 'g'),
      new RegExp(`<${componentName}[\\s/>]`, 'g'),
      new RegExp(`${componentName}\\(`, 'g'),
      new RegExp(`\\b${componentName}\\b`, 'g')
    ];

    return usagePatterns.some(pattern => pattern.test(contentsWithoutSelf));
  }

  public analyzeUnusedHooks(): void {
    const hookFiles = this.getAllFiles(this.srcPath)
      .filter(file => file.includes('/hooks/') && file.endsWith('.ts'));
    
    const allFileContents = this.getAllFiles(this.srcPath)
      .map(file => this.readFileContent(file))
      .join('\n');

    for (const hookFile of hookFiles) {
      const content = this.readFileContent(hookFile);
      const hookName = this.extractHookName(content);
      
      if (hookName && !this.isHookUsed(hookName, allFileContents, hookFile)) {
        this.report.unusedHooks.push(`${hookFile} (${hookName})`);
      }
    }
  }

  private extractHookName(content: string): string | null {
    const patterns = [
      /export\s+function\s+(use\w+)/,
      /export\s+const\s+(use\w+)\s*[:=]/,
      /export\s+\{\s*(use\w+)\s*\}/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  private isHookUsed(hookName: string, allContents: string, hookFile: string): boolean {
    const contentsWithoutSelf = allContents.replace(this.readFileContent(hookFile), '');
    
    const usagePatterns = [
      new RegExp(`import.*${hookName}.*from`, 'g'),
      new RegExp(`const.*=.*${hookName}\\(`, 'g'),
      new RegExp(`\\b${hookName}\\(`, 'g')
    ];

    return usagePatterns.some(pattern => pattern.test(contentsWithoutSelf));
  }

  public analyzeCommentedCode(): void {
    const allFiles = this.getAllFiles(this.srcPath);
    
    for (const file of allFiles) {
      const content = this.readFileContent(file);
      const lines = content.split('\n');
      
      let commentedCodeBlocks: string[] = [];
      let currentBlock = '';
      let inCommentBlock = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detecta blocos de código comentado suspeitos
        if (line.startsWith('//') && this.looksLikeCommentedCode(line)) {
          if (!inCommentBlock) {
            inCommentBlock = true;
            currentBlock = `${file}:${i + 1}\n`;
          }
          currentBlock += line + '\n';
        } else if (inCommentBlock && !line.startsWith('//')) {
          inCommentBlock = false;
          if (currentBlock.split('\n').length > 3) { // Só considera blocos com 3+ linhas
            commentedCodeBlocks.push(currentBlock);
          }
          currentBlock = '';
        }
      }
      
      if (commentedCodeBlocks.length > 0) {
        this.report.commentedCode.push(...commentedCodeBlocks);
      }
    }
  }

  private looksLikeCommentedCode(line: string): boolean {
    const codePatterns = [
      /\/\/\s*(const|let|var|function|export|import|return|if|for|while)\s/,
      /\/\/\s*\w+\.\w+\(/,
      /\/\/\s*<\w+/,
      /\/\/\s*\}\s*$/,
      /\/\/\s*\w+\s*[:=]/
    ];

    return codePatterns.some(pattern => pattern.test(line));
  }

  public analyzeDuplicateComponents(): void {
    const componentFiles = this.getAllFiles(this.srcPath)
      .filter(file => file.endsWith('.tsx'));
    
    const componentMap = new Map<string, string[]>();
    
    for (const file of componentFiles) {
      const content = this.readFileContent(file);
      const componentName = this.extractComponentName(content);
      
      if (componentName) {
        if (!componentMap.has(componentName)) {
          componentMap.set(componentName, []);
        }
        componentMap.get(componentName)!.push(file);
      }
    }
    
    // Identifica componentes com nomes duplicados
    for (const [name, files] of componentMap.entries()) {
      if (files.length > 1) {
        this.report.duplicateComponents.push(`${name}: ${files.join(', ')}`);
      }
    }
  }

  public generateReport(): UnusedCodeReport {
    console.log('🔍 Analisando arquivos de backup...');
    this.analyzeBackupFiles();
    
    console.log('🔍 Analisando componentes não utilizados...');
    this.analyzeUnusedComponents();
    
    console.log('🔍 Analisando hooks não utilizados...');
    this.analyzeUnusedHooks();
    
    console.log('🔍 Analisando código comentado...');
    this.analyzeCommentedCode();
    
    console.log('🔍 Analisando componentes duplicados...');
    this.analyzeDuplicateComponents();
    
    return this.report;
  }

  public printReport(): void {
    const report = this.generateReport();
    
    console.log('\n📊 RELATÓRIO DE CÓDIGO NÃO UTILIZADO\n');
    console.log('================================\n');
    
    if (report.backupFiles.length > 0) {
      console.log('🗄️ ARQUIVOS DE BACKUP ENCONTRADOS:');
      report.backupFiles.forEach(file => console.log(`   ${file}`));
      console.log('');
    }
    
    if (report.unusedComponents.length > 0) {
      console.log('🧩 COMPONENTES POTENCIALMENTE NÃO UTILIZADOS:');
      report.unusedComponents.forEach(comp => console.log(`   ${comp}`));
      console.log('');
    }
    
    if (report.unusedHooks.length > 0) {
      console.log('🪝 HOOKS POTENCIALMENTE NÃO UTILIZADOS:');
      report.unusedHooks.forEach(hook => console.log(`   ${hook}`));
      console.log('');
    }
    
    if (report.duplicateComponents.length > 0) {
      console.log('🔄 COMPONENTES COM NOMES DUPLICADOS:');
      report.duplicateComponents.forEach(dup => console.log(`   ${dup}`));
      console.log('');
    }
    
    if (report.commentedCode.length > 0) {
      console.log('💬 BLOCOS DE CÓDIGO COMENTADO SUSPEITOS:');
      report.commentedCode.slice(0, 5).forEach(block => {
        console.log(`   ${block.split('\n')[0]}`);
      });
      if (report.commentedCode.length > 5) {
        console.log(`   ... e mais ${report.commentedCode.length - 5} blocos`);
      }
      console.log('');
    }
    
    console.log('📈 RESUMO:');
    console.log(`   • ${report.backupFiles.length} arquivos de backup`);
    console.log(`   • ${report.unusedComponents.length} componentes potencialmente não utilizados`);
    console.log(`   • ${report.unusedHooks.length} hooks potencialmente não utilizados`);
    console.log(`   • ${report.duplicateComponents.length} componentes com nomes duplicados`);
    console.log(`   • ${report.commentedCode.length} blocos de código comentado`);
    console.log('');
  }
}

// Executar análise
if (require.main === module) {
  const analyzer = new UnusedCodeAnalyzer();
  analyzer.printReport();
}

export { UnusedCodeAnalyzer, UnusedCodeReport };
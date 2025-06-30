import { useState, useCallback } from 'react';

export interface HtmlGeneratorState {
  textInput: string;
  htmlOutput: string;
  isGenerating: boolean;
  generatedDescription: string;
  showReplaceDialog: boolean;
}

export const useHtmlGenerator = () => {
  const [textInput, setTextInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);

  const validateAmazonHtml = useCallback((html: string) => {
    return html.replace(/<(?!\/?(strong|i|u|br|p|ul|ol|li|em)\b)[^>]*>/gi, '');
  }, []);

  const convertToHtml = useCallback((text: string) => {
    if (!text) return '';

    const lines = text.split('\n');
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === '') {
        html += '<p>&nbsp;</p>';
      } else {
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<i>$1</i>');
        
        html += `<p>${processedLine}</p>`;
      }
    }
    
    return validateAmazonHtml(html);
  }, [validateAmazonHtml]);

  const updateTextInput = useCallback((value: string) => {
    setTextInput(value);
    setHtmlOutput(convertToHtml(value));
  }, [convertToHtml]);

  const handleReplaceContent = useCallback((replace: boolean) => {
    if (replace) {
      updateTextInput(generatedDescription);
    }
    setShowReplaceDialog(false);
    setGeneratedDescription('');
  }, [generatedDescription, updateTextInput]);

  const reset = useCallback(() => {
    setTextInput('');
    setHtmlOutput('');
    setGeneratedDescription('');
    setShowReplaceDialog(false);
  }, []);

  return {
    textInput,
    htmlOutput,
    isGenerating,
    generatedDescription,
    showReplaceDialog,
    setIsGenerating,
    setGeneratedDescription,
    setShowReplaceDialog,
    updateTextInput,
    handleReplaceContent,
    reset,
    convertToHtml
  };
};
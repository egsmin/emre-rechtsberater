'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function RAGUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [regex, setRegex] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [chunkSize, setChunkSize] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Bitte wählen Sie eine Datei aus.');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (regex.trim()) {
        formData.append('regex', regex.trim());
      }
      if (chunkSize.trim()) {
        if (isNaN(Number(chunkSize.trim()))) {
          setMessage('Chunk-Größe muss eine Zahl sein.');
          return;
        }
        if (Number(chunkSize.trim()) <= 0) {
          setMessage('Chunk-Größe muss größer als 0 sein.');
          return;
        }
        formData.append('chunkSize', chunkSize.trim());
      }
      if (title.trim()) {
        formData.append('title', title.trim());
      } else {
        setMessage('Bitte geben Sie einen Titel ein.');
        return;
      }
      if (chunkSize.trim() && regex.trim()) {
        setMessage('Regex und Chunk-Größe können nicht zusammen verwendet werden.');
        return;
      }
      if (!chunkSize.trim() && !regex.trim()) {
        setMessage('Bitte geben Sie entweder einen Regex oder eine Chunk-Größe ein.');
        return;
      }
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload fehlgeschlagen');
      }

      const result = await response.json();
      setMessage('Upload erfolgreich!');
      setFile(null);
      setRegex('');
      setTitle('');
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Datei-Upload</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-input">Datei auswählen</Label>
            <Input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Ausgewählte Datei: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Mein Dokument"
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regex">Regex (optional)</Label>
            <Input
              id="regex"
              type="text"
              value={regex}
              onChange={(e) => setRegex(e.target.value)}
              placeholder="z.B. ^[A-Z]+$"
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chunkSize">Chunk-Größe</Label>
            <Input
              id="chunkSize"
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(e.target.value)}
              placeholder="z.B. 1000"
              disabled={isUploading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isUploading || !file}
            className="w-full"
          >
            {isUploading ? (
              'Wird hochgeladen...'
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                Datei hochladen
              </>
            )}
          </Button>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('erfolgreich') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}


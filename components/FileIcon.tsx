'use client';

import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  FileSpreadsheet,
  Archive,
  Paperclip
} from 'lucide-react';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className = "h-5 w-5 text-gray-600" }: FileIconProps) {
  const mimeTypeLower = mimeType.toLowerCase();
  
  if (mimeTypeLower.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeTypeLower.startsWith('video/')) return <Video className={className} />;
  if (mimeTypeLower.startsWith('audio/')) return <Music className={className} />;
  if (mimeTypeLower.includes('pdf')) return <FileText className={className} />;
  if (mimeTypeLower.includes('word') || mimeTypeLower.includes('document')) return <FileText className={className} />;
  if (mimeTypeLower.includes('excel') || mimeTypeLower.includes('spreadsheet')) return <FileSpreadsheet className={className} />;
  if (mimeTypeLower.includes('zip') || mimeTypeLower.includes('archive')) return <Archive className={className} />;
  return <Paperclip className={className} />;
}



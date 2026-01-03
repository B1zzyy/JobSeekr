'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'

interface CVUploadProps {
  onFileUpload: (file: File) => void
  file: File | null
  onFileRemove?: () => void
}

export default function CVUpload({ onFileUpload, file, onFileRemove }: CVUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [file])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const newFile = acceptedFiles[0]
        if (newFile.type === 'application/pdf') {
          onFileUpload(newFile)
        } else {
          alert('Please upload a PDF file')
        }
      }
    },
    [onFileUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    if (onFileRemove) {
      onFileRemove()
    }
  }

  if (file && previewUrl) {
    return (
      <div className="relative border-2 border-border rounded-lg overflow-hidden bg-muted/30">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleRemove}
            className="p-2 bg-card border border-border rounded-full shadow-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div
          {...getRootProps()}
          className="cursor-pointer"
          onClick={(e) => {
            // Allow clicking the remove button
            if ((e.target as HTMLElement).closest('button')) {
              return
            }
          }}
        >
          <input {...getInputProps()} />
          <div className="w-full" style={{ height: '600px' }}>
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="CV Preview"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-2 text-center">
            <p className="text-sm text-muted-foreground">
              Click to replace • {file.name}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer transition-colors flex items-center justify-center h-64 md:h-80
        ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-input hover:border-primary/50 bg-muted/30'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <>
            <Upload className="w-12 h-12 text-primary" />
            <p className="text-primary font-medium">Drop your CV here</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">
                Drag & drop your CV here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">PDF files only</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


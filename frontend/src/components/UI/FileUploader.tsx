import React, { useRef, useState } from 'react';
import { Button } from './Button';

interface FileUploaderProps {
    onUpload: (file: File) => Promise<void>;
    accept?: string;
    maxSize?: number; // in bytes
    className?: string;
    children?: React.ReactNode;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    onUpload,
    accept = 'image/*',
    maxSize = 5242880, // 5MB
    className = '',
    children
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>('');

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (accept && !file.type.match(accept.replace('*', '.*'))) {
            setError(`File type not accepted. Please upload ${accept}`);
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setError(`File size too large. Max size is ${maxSize / 1024 / 1024}MB`);
            return;
        }

        setError('');
        try {
            await onUpload(file);
        } catch (err: any) {
            setError(err.message || 'Error uploading file');
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />
            <div onClick={handleClick}>
                {children || <Button variant="outline" size="sm">Upload File</Button>}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

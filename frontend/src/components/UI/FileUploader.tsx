import React, { useRef, useState } from 'react';
import Button from './Button';

interface FileUploaderProps {
    onUpload: (files: File[] | File) => Promise<void> | void;
    accept?: string;
    maxSize?: number; // in bytes
    className?: string;
    children?: React.ReactNode;
    multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    onUpload,
    accept = 'image/*',
    maxSize = 5242880, // 5MB
    className = '',
    children,
    multiple = false
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>('');

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // Reset error
        setError('');

        const validFiles: File[] = [];

        for (const file of files) {
            // Validate file type
            if (accept && !file.type.match(accept.replace('*', '.*'))) {
                setError(`One or more files have invalid type. Accepted: ${accept}`);
                return;
            }

            // Validate file size
            if (file.size > maxSize) {
                setError(`One or more files allow max size of ${maxSize / 1024 / 1024}MB`);
                return;
            }
            validFiles.push(file);
        }

        try {
            if (multiple) {
                // If onUpload expects array (we need to update interface first or cast)
                await (onUpload as any)(validFiles);
            } else {
                await (onUpload as any)(validFiles[0]);
            }
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
                multiple={multiple}
                className="hidden"
            />
            <div onClick={handleClick}>
                {children || <Button variant="outline" size="sm">Upload File</Button>}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

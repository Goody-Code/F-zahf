// File Upload Zone Component
function FileUploadZone({ onFileSelect, selectedFile, error, placeholder }) {
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div
            className={`upload-zone p-6 rounded-lg border-2 border-dashed cursor-pointer ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
        >
            <div className="text-center">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600 font-medium">
                    {selectedFile ? selectedFile.name : placeholder}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                    اسحب الملف هنا أو انقر للاختيار
                </p>
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => onFileSelect(e.target.files[0])}
                className="hidden"
            />
        </div>
    );
}

// Export for use in other files
window.FileUploadZone = FileUploadZone;
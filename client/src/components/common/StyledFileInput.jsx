/* eslint-disable react/prop-types */
const StyledFileInput = ({
    label,
    subLabel,
    onChange,
    Icon,
    fileName,
    onClear,
    fileUrl,
    accept,
    // submitted,
    isImage,
}) => {
    const fileInput = (
        <label className="flex items-center gap-2 px-4 py-2 border border-[#7E7E7E] text-[#7E7E7E] rounded-md cursor-pointer hover:border-[#061140] hover:text-[#061140]">
            {Icon && <Icon size={16} className="text-[#484848]" />}
            <span className="text-sm font-bold text-[#484848]">Upload</span>
            <input
                type="file"
                accept={accept}
                onChange={onChange}
                className="hidden"
            />
        </label>
    );

    return (
        <div className="space-y-1">
            <p className="text-[#061140] font-normal text-sm">{label}</p>
            {subLabel && <p className="text-[#7E7E7E] text-xs">{subLabel}</p>}

            {isImage && fileUrl ? (
                <div className="relative w-[100px] h-[100px] mt-2">
                    <img src={fileUrl} alt={label} className="w-full h-full object-cover rounded-md border" />
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            ) : !isImage && fileName ? (
                <div className="mt-2 border border-[#7E7E7E] rounded-md px-4 py-2 text-xs text-[#484848] flex justify-between items-center w-full sm:w-[250px]">
                    <span className="truncate">{fileName}</span>
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-red-500 hover:underline ml-2"
                    >
                        Clear
                    </button>
                </div>
            ) : (
                <>
                    {fileInput}
                    {fileName && !isImage && (
                        <div className="flex justify-between items-center mt-1 text-xs text-[#484848]">
                            <span className="truncate">{fileName}</span>
                            <button
                                type="button"
                                onClick={onClear}
                                className="text-red-500 hover:underline ml-2"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StyledFileInput;
/* eslint-disable react/prop-types */
// client/src/components/common/InputWithFileUpload.jsx
import { useRef } from 'react';
import plusCircle from '/public/plusCircle.svg';


const InputWithFileUpload = ({
  label,
  name,
  placeholder,
  value,
  onTextChange,
  onFileSelect,
  fileName,
  showClear = true,
  onClearFile,
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative mt-4">
      <label htmlFor={name} className="block text-[16px] font-normal text-[#484848] mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onTextChange}
          className="block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
        />

        <button
          type="button"
          onClick={handleFileClick}
          title="Upload File"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484848] text-xl cursor-pointer"
        >
            <img src={plusCircle} alt="Upload" className="w-[18px] h-[18px]" />
        </button>
      </div>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelect(name, file.name);
        }}
      />

      {fileName && (
        <div className="flex items-center gap-2 mt-2 text-sm text-[#061140]">
          📄 {fileName}
          {showClear && (
            <button
              type="button"
              className="text-red-600 text-xs"
              onClick={() => onClearFile(name)}
            >
              ❌
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InputWithFileUpload;

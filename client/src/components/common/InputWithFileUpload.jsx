/* eslint-disable react/prop-types */
// client/src/components/common/InputWithFileUpload.jsx
import { useRef } from 'react';
import plusCircle from '/public/plusCircle.svg';
import { RxCross2 } from 'react-icons/rx';

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
  onAddField,
  onRemoveField,
  index = 0,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="relative mt-4">
      {label && (
        <label htmlFor={`${name}-${index}`} className="block text-[16px] font-normal text-[#484848] mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          id={`${name}-${index}`}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onTextChange}
          className="block w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]"
        />

        {/* Plus icon on first input, Cross icon on additional ones */}
        {index === 0 ? (
          <button
            type="button"
            onClick={onAddField}
            title="Add Another"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484848] cursor-pointer"
          >
            <img src={plusCircle} alt="Add" className="w-[18px] h-[18px]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRemoveField(index)}
            title="Remove"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484848] text-lg cursor-pointer"
          >
            <RxCross2 />
          </button>
        )}
      </div>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelect(name, file.name, index);
        }}
      />

      {fileName && (
        <div className="flex items-center gap-2 mt-2 text-sm text-[#061140]">
          📄 {fileName}
          {showClear && (
            <button
              type="button"
              className="text-red-600 text-xs"
              onClick={() => onClearFile(name, index)}
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

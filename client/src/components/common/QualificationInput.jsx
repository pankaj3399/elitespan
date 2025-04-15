/* eslint-disable react/prop-types */
import plusCircle from '/public/plusCircle.svg';
import { RxCross2 } from 'react-icons/rx';

const QualificationInput = ({
  label,
  name,
  placeholder,
  value,
  onTextChange,
  onAddField,
  onRemoveField,
  index = 0,
}) => {
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
    </div>
  );
};

export default QualificationInput;

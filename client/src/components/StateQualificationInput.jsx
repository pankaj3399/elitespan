import { FaPlus, FaXmark } from 'react-icons/fa6';

const StateQualificationInput = ({
  label,
  name,
  index,
  license,
  states,
  onLicenseChange,
  onAddField,
  onRemoveField,
}) => {
  const showAdditionalFields = license.state && license.state.trim() !== '';

  return (
    <div>
      {label && (
        <label className='block text-[16px] font-normal text-[#484848] mb-2'>
          {label}
        </label>
      )}
      
      <div className='flex items-center gap-2'>
        <div className='flex-1'>
          <select
            value={license.state}
            onChange={(e) => onLicenseChange(index, 'state', e.target.value)}
            className='w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]'
          >
            <option value=''>Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        
        {index === 0 ? (
          <button
            type='button'
            onClick={onAddField}
            className='p-2 text-[#0C1F6D] hover:text-[#162241] border border-[#7E7E7E] rounded-md hover:border-[#0C1F6D]'
          >
            <FaPlus size={14} />
          </button>
        ) : (
          <button
            type='button'
            onClick={() => onRemoveField(index)}
            className='p-2 text-red-500 hover:text-red-700 border border-[#7E7E7E] rounded-md hover:border-red-500'
          >
            <FaXmark size={14} />
          </button>
        )}
      </div>

      {/* DEA and License Number fields appear when state is selected */}
      {showAdditionalFields && (
        <div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-[#DFE3F2]'>
          <div>
            <input
              type='text'
              value={license.deaNumber}
              onChange={(e) => onLicenseChange(index, 'deaNumber', e.target.value)}
              placeholder='DEA Number'
              className='w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]'
            />
          </div>
          <div>
            <input
              type='text'
              value={license.licenseNumber}
              onChange={(e) => onLicenseChange(index, 'licenseNumber', e.target.value)}
              placeholder='License Number'
              className='w-full border border-[#7E7E7E] text-sm text-[#7E7E7E] rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#061140] focus:border-[#061140]'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StateQualificationInput;
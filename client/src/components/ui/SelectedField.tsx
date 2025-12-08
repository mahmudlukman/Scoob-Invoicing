import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: (SelectOption | string | number)[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
      </label>
      <select
        name={name}
        id={name}
        {...props}
        className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => {
          const isObject = typeof option === "object" && option !== null;
          const value = isObject ? (option as SelectOption).value : option;
          const label = isObject ? (option as SelectOption).label : option;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectField;

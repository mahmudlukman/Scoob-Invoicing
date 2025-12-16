import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  type: string;
  disabled?: boolean;
}

const Input = ({ value, onChange, label, placeholder, type }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      <label className="text-[13px] text-slate-800">{label}</label>

      <div className="flex items-center border border-gray-200 rounded px-3 py-2 mt-1 bg-white focus-within:border-black">
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-black placeholder:text-gray-500"
          value={value}
          onChange={(e) => onChange(e)}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="ml-2 text-gray-400 hover:text-primary"
          >
            {showPassword ? (
              <FaRegEye size={20} />
            ) : (
              <FaRegEyeSlash size={20} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;

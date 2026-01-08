// src/components/SearchBar.tsx
import { FiSearch } from "react-icons/fi";
import { FC } from "react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ 
  placeholder = "Search here", 
  className = "",
  onSearch 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <div className={`flex items-center bg-[#FFFAF0] rounded-full px-4 py-2 shadow-sm ${className}`}>
      <FiSearch className="text-yellow-500 mr-3 text-lg" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm text-red-600"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchBar;

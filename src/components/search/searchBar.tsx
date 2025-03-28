import React, { useCallback, useRef, useState } from "react";
import Input from "../common/input";
import ListItems from "./listItems";
import { getUniqueId } from "../../utils/helpers";

interface SearchBarProps {
  onSearch: (searchValue: string, isSearching: boolean) => void;
  suggestion: string[];
  searchValue: string;
}
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestion,
  searchValue,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const isSelectingRef = useRef<boolean>(false); // Track Enter key for selection

  const newSuggestion = React.useMemo(() => {
    return suggestion.map((item) => {
      // Finds all matches instead of stopping at the first one, regardless of uppercase/lowercase.
      const regex = new RegExp(`(${searchValue})`, "gi");
      const parts = item.split(regex);
      return parts.map((part) =>
        part.toLowerCase() === searchValue.toLowerCase() ? (
          <span key={getUniqueId()} className="font-bold">
            {part}
          </span>
        ) : (
          part
        )
      );
    });
  }, [suggestion, searchValue]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showSuggestions || newSuggestion.length === 0) return;
  
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => {
          const newIndex = prev === null || prev === newSuggestion.length - 1 ? 0 : prev + 1;
          setInputValue(suggestion[newIndex]); // Cập nhật giá trị input
          return newIndex;
        });
      } else if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => {
          const newIndex = prev === null || prev === 0 ? newSuggestion.length - 1 : prev - 1;
          setInputValue(suggestion[newIndex]); // Cập nhật giá trị input
          return newIndex;
        });
      } else if (event.key === "Enter" && selectedIndex !== null) {
        event.preventDefault(); // Ngăn chặn reload trang
        setInputValue(suggestion[selectedIndex]); // Gán giá trị vào ô input
        onSearch(suggestion[selectedIndex], true);
        setShowSuggestions(false);
        isSelectingRef.current = true;
      }
    },
    [newSuggestion, selectedIndex, showSuggestions, suggestion, onSearch]
  );
  

  const handleInputSearch = (value: string, isSearching: boolean) => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false; // Reset flag
      setInputValue(value);
      onSearch(value, false);
      setShowSuggestions(false);
      return; // Prevent input search if Enter was used for selection
    }
    setInputValue(value);
    setShowSuggestions(true);
    onSearch(value, isSearching);
  };

  return (
    <>
      <section className="w-full h-full px-[10%]">
        <section className="h-full w-full flex items-center">
          <Input
            onSearch={handleInputSearch}
            value={inputValue}
            onKeyDown={handleKeyDown}
          />
        </section>
        {showSuggestions && newSuggestion.length > 0 && (
          <section className="w-[90%] relative top-[-50px] left-0 shadow-lg shadow-gray-200 rounded-b-lg bg-white transition-all">
            <ListItems
              items={newSuggestion}
              selectedIndex={selectedIndex}
              onSelect={(_, index) => {
                setInputValue(suggestion[index]);
                onSearch(suggestion[index], true);
                setShowSuggestions(false);
              }}
            />
          </section>
        )}
      </section>
    </>
  );
};

export default SearchBar;

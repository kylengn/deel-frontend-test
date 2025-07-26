import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import './Autocomplete.css';

/**
 * Props accepted by the Autocomplete component.
 *
 * • fetchSuggestions: an async function that returns a list of suggestions
 *   based on the current query.  It must return a promise to mimic a real
 *   network request.
 * • onSelect: optional callback invoked when the user selects a suggestion.
 * • placeholder: optional placeholder text shown in the input element.
 * • id: optional id prefix to uniquely identify the component and its list.
 */
export interface AutocompleteProps {
  fetchSuggestions: (query: string) => Promise<string[]>;
  onSelect?: (value: string) => void;
  placeholder?: string;
  id?: string;
}

/**
 * The Autocomplete component provides an accessible, high‑performance
 * typeahead input.  It does not rely on any third‑party libraries and
 * handles asynchronous suggestion loading, keyboard navigation and
 * highlighting of matched text.
 */
const Autocomplete: React.FC<AutocompleteProps> = ({
  fetchSuggestions,
  onSelect,
  placeholder = 'Search…',
  id = 'autocomplete'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listId = `${id}-listbox`;

  // Fetch suggestions whenever the input changes.  We cancel stale
  // fetches by keeping track of whether the effect is still active.
  useEffect(() => {
    let active = true;
    if (!inputValue) {
      setSuggestions([]);
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    setLoading(true);
    fetchSuggestions(inputValue).then((results) => {
      if (!active) return;
      setSuggestions(results);
      setOpen(true);
      setHighlightedIndex(results.length > 0 ? 0 : -1);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [inputValue, fetchSuggestions]);

  // Close the suggestion list when clicking outside of the component.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Highlight the matching substring in a suggestion.  Returns an array of
   * React nodes so that the matching part can be wrapped in a <mark> tag.
   */
  const renderHighlighted = useCallback(
    (suggestion: string) => {
      const query = inputValue.trim();
      if (!query) return suggestion;
      const index = suggestion.toLowerCase().indexOf(query.toLowerCase());
      if (index === -1) return suggestion;
      const before = suggestion.slice(0, index);
      const match = suggestion.slice(index, index + query.length);
      const after = suggestion.slice(index + query.length);
      return (
        <>
          {before}
          <mark>{match}</mark>
          {after}
        </>
      );
    },
    [inputValue]
  );

  /**
   * Handles selection of an item via click or Enter key.  Updates the input
   * value, closes the list and notifies the parent component.
   */
  const handleSelect = useCallback(
    (value: string) => {
      setInputValue(value);
      setOpen(false);
      setSuggestions([]);
      setHighlightedIndex(-1);
      if (onSelect) onSelect(value);
    },
    [onSelect]
  );

  /**
   * Keyboard navigation for the input.  Supports arrow keys to move the
   * highlight, Enter to select and Escape to close the list.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open) return;
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev + 1;
            return next >= suggestions.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? suggestions.length - 1 : next;
          });
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSelect(suggestions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
        default:
          break;
      }
    },
    [open, suggestions, highlightedIndex, handleSelect]
  );

  /**
   * Updates the input value and resets the highlighted index.  The
   * suggestion list will update via the effect above.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div ref={containerRef} className="autocomplete-container">
      <input
        id={id}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
        }
        className="autocomplete-input"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="autocomplete-listbox"
        >
          {loading && (
            <li
              className="autocomplete-option"
              role="option"
              aria-disabled="true"
            >
              Loading…
            </li>
          )}
          {!loading && suggestions.length === 0 && (
            <li
              className="autocomplete-option"
              role="option"
              aria-disabled="true"
            >
              No results found
            </li>
          )}
          {!loading &&
            suggestions.map((sugg, index) => (
              <li
                key={sugg}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={(e) => {
                  // Prevent the input from losing focus which would trigger the
                  // click outside handler before onClick runs.
                  e.preventDefault();
                }}
                onClick={() => handleSelect(sugg)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className="autocomplete-option"
              >
                {renderHighlighted(sugg)}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
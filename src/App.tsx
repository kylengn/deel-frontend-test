import React, { useState } from 'react';
import Autocomplete from './components/Autocomplete';
import { fetchFruits } from './data';
import './App.css';

/**
 * Example application that demonstrates usage of the Autocomplete component.
 * The state of the selected value is shown below the input for reference.
 */
const App: React.FC = () => {
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="app-container">
      <h1 className="app-title">Fruits Autocomplete</h1>
      <p className="app-description">
        Start typing a fruit name and select it from the list.  Matching parts
        are highlighted.
      </p>
      <Autocomplete
        id="fruit-autocomplete"
        placeholder="Type to search fruits…"
        fetchSuggestions={fetchFruits}
        onSelect={(value) => setSelected(value)}
      />
      {selected && (
        <p aria-live="polite" className="app-selected">
          Selected: <strong>{selected}</strong>
        </p>
      )}
    </div>
  );
};

export default App;
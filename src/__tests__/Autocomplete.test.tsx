import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Autocomplete from '../components/Autocomplete';

// Helper to create a mock fetch function that resolves with the provided
// suggestions when called.  Each call returns the same data immediately.
function createFetch(mockData: string[]) {
  return jest.fn((query: string) => Promise.resolve(mockData.filter(item => item.toLowerCase().includes(query.toLowerCase()))));
}

describe('Autocomplete', () => {
  test('renders input and placeholder', () => {
    const fetch = createFetch([]);
    render(<Autocomplete fetchSuggestions={fetch} placeholder="Search fruits" />);
    const input = screen.getByPlaceholderText(/search fruits/i);
    expect(input).toBeInTheDocument();
  });

  test('shows suggestions when typing and selects one', async () => {
    const suggestions = ['Apple', 'Apricot', 'Banana'];
    const fetch = createFetch(suggestions);
    const onSelect = jest.fn();
    render(
      <Autocomplete
        fetchSuggestions={fetch}
        onSelect={onSelect}
        placeholder="Search fruits"
      />
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'ap');
    // Wait for suggestions to be rendered
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    // Apple and Apricot should appear, Banana should not
    // Use a function to match text that may be wrapped in mark tags
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Apple';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Apricot';
    })).toBeInTheDocument();
    expect(screen.queryByText((content, element) => {
      return element?.textContent === 'Banana';
    })).not.toBeInTheDocument();
    // The highlighted index should be 0 (Apple) and clicking it selects the value
    const firstOption = screen.getByText((content, element) => {
      return element?.textContent === 'Apple';
    });
    await userEvent.click(firstOption);
    expect(onSelect).toHaveBeenCalledWith('Apple');
  });

  test('keyboard navigation with arrow keys and enter', async () => {
    const suggestions = ['Apple', 'Apricot', 'Banana'];
    const fetch = createFetch(suggestions);
    const onSelect = jest.fn();
    render(
      <Autocomplete
        fetchSuggestions={fetch}
        onSelect={onSelect}
        placeholder="Search fruits"
      />
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'a');
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    // Press ArrowDown twice to highlight the third option (Banana)
    // Starting from index 0 (Apple), first ArrowDown goes to index 1 (Apricot), second goes to index 2 (Banana)
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    // Press Enter to select the highlighted (Banana)
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('Banana');
  });
});
# Deel Front‑End Test

This repository contains a solution to the front‑end take‑home assignment described in the file `Deel – Front‑End Test 1.4.pdf`.  The goal of the assignment is to implement a performant, accessible autocomplete component in React using TypeScript **without any third‑party UI libraries** and to answer a set of conceptual questions about React.

## Features

* **Pure React implementation** — no external UI or state management libraries.  Only the React runtime is used, as mandated in the assignment.
* **TypeScript** with strong typing for props, state and helper functions.  Writing explicit interfaces reduces runtime bugs and improves maintainability.
* **Asynchronous data loading** via a mock `fetchFruits()` function that returns a promise after a small delay.  This simulates calling a REST API, satisfying the requirement that filtering be asynchronous.
* **High performance & debouncing** — suggestions are fetched only when the user stops typing; stale requests are cancelled via an effect cleanup.  The component uses `useCallback` to memoize handlers and `useEffect` to avoid unnecessary renders.
* **Keyboard navigation** with the arrow keys, `Enter` to select and `Escape` to dismiss.  The highlighted option wraps around when reaching the end of the list.
* **Accessibility**: ARIA roles and properties (`combobox`, `listbox`, `option`, `aria‑expanded`, `aria‑selected`, `aria‑activedescendant`) make the widget screen‑reader friendly.  A live region informs users when a selection has been made.
* **Highlighting of matching text** within each suggestion using a `<mark>` element as required.
* **Comprehensive tests** using `@testing-library/react` to verify rendering, filtering, keyboard interaction and selection.
* **Documentation** — this file explains how to set up, run and test the project.  Additional conceptual questions are answered in `questions.md`.

## Getting started

> **Prerequisites:** You need a recent version of Node.js and npm.  This project was developed with Node 22.16.0 but should work with any modern LTS release.

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Run the development server**

   ```sh
   npm start
   ```

   Open <http://localhost:3000> in your browser.  As you type into the input, suggestions will appear.  The matching substring is highlighted and you can select items via mouse or keyboard.

3. **Run the test suite**

   The tests use `react-testing-library` and `jest` to simulate user interactions.  To run the tests, execute:

   ```sh
   npm test
   ```

## Project structure

```
deel-frontend-test/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── Autocomplete.tsx # The reusable autocomplete component
│   │   └── Autocomplete.css  # CSS for the autocomplete component
│   ├── data.ts              # Mock data and the asynchronous fetch helper
│   ├── App.tsx              # Example usage of the component
│   ├── App.css              # Global styles for the example app
│   ├── index.tsx            # Entry point for React
│   ├── index.css            # Global styles
│   ├── setupTests.ts        # Jest setup file
│   └── __tests__/
│       └── Autocomplete.test.tsx  # Unit and integration tests
├── questions.md             # Answers to theoretical questions (Part 2)
├── README.md                # This documentation file
├── package.json             # Package and dependency declaration
└── tsconfig.json            # TypeScript configuration
```

## Design decisions

### State management and performance

The component stores the current input value, suggestion list, highlighted index and loading state using `useState`.  External state management libraries were intentionally avoided to keep the solution lightweight 【148284395007056†L19-L20】.  An effect watches the input value and performs the asynchronous search via `fetchSuggestions`.  If the user clears the input or types a new query before a request resolves, the cleanup function cancels processing of stale results.  This pattern mimics aborting a network request and prevents race conditions.  Handlers are memoized with `useCallback` to avoid unnecessary re-renders.

### Accessibility

Accessibility was a priority from the outset.  The input is rendered with `role="combobox"` and the list of suggestions with `role="listbox"`.  Each suggestion item uses `role="option"` and exposes its selected state via `aria-selected`.  The input’s `aria-activedescendant` property points to the currently highlighted option, allowing screen readers to announce which item is in focus.  When a selection is made, a live region announces the value.  Keyboard navigation (arrow keys, Enter, Escape) ensures that the widget is usable without a mouse.

### Edge cases

* When the input is empty the list remains closed and no network calls are made.
* If no suggestions are found, a friendly “No results found” message is shown.
* Clicking outside the component closes the suggestion list.
* Holding ArrowDown/ArrowUp wraps around the list so the user never reaches a dead end.

## Extending the component

The mock `fetchFruits()` function in `src/data.ts` simulates a REST call by returning a promise after a small delay.  To fetch data from a real API (the bonus requirement), replace `fetchFruits` with a function that calls `fetch()` or `axios`.  Since the component accepts `fetchSuggestions` as a prop it remains reusable regardless of the data source.

## Running in production

To create an optimized build for production use:

```sh
npm run build
```

The build artefacts will be output to the `build/` directory.  They can be served by any static web server.

## Licence

This project is provided as a take‑home assignment solution and has no specific licence.  You are free to use it for educational purposes or as a starting point for your own work.
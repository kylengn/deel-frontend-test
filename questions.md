# Part 2 – Conceptual questions

This file contains answers to the theoretical questions posed in the second part of the assignment.  Answers are written from memory without consulting external resources, as required.

1. **What is the difference between `Component` and `PureComponent`?  Give an example where it might break my app.**

   A class that extends `React.Component` will re‑render whenever its parent re‑renders and passes new props, even if the new props are referentially equal to the previous ones.  `React.PureComponent`, on the other hand, implements a shallow comparison of both its props and state in `shouldComponentUpdate`.  If the shallow equality check deems them unchanged the component will skip rendering.  This optimisation can avoid unnecessary renders when a component receives the same values repeatedly.

   The important caveat is that the comparison is **shallow**.  If a parent mutates an object or array in place and passes it down, the reference does not change so `PureComponent` will incorrectly assume that nothing changed.  For example:

   ```tsx
   class List extends React.PureComponent<{ items: string[] }> {
     render() {
       return <ul>{this.props.items.map((i) => <li key={i}>{i}</li>)}</ul>;
     }
   }

   // Somewhere in a parent:
   const items = ['a', 'b'];
   items.push('c');          // Mutating the same array
   return <List items={items} />;
   ```

   Because the `items` array reference did not change, the `List` component sees the same props and does not update.  Using `Component` instead of `PureComponent`, or always creating new objects/arrays instead of mutating in place, avoids this pitfall.

2. **Context + `shouldComponentUpdate` might be dangerous.  Why is that?**

   When using the legacy context API, components that consume context are updated whenever the context changes, regardless of whether their props or state have changed.  However, if a component defines `shouldComponentUpdate` and returns `false` (e.g. because it extends `PureComponent`), it will **block** re‑rendering in response to context changes.  This means that updates to the context will not propagate to that component, leaving it with stale values.  In modern React the `useContext` hook or new context API avoids this hazard by always re‑rendering consumers when the context provider updates.

3. **Describe three ways to pass information from a component to its parent.**

   1. **Callback props:** The parent passes a function as a prop (e.g. `onChange` or `onSelect`) which the child calls to report its internal state.  This is the idiomatic React pattern used in the autocomplete component.
   2. **Refs with `forwardRef` and `useImperativeHandle`:** A child can expose imperative methods to a parent by calling `useImperativeHandle` in combination with `forwardRef`.  The parent can then call functions on the child instance.
   3. **Context or global stores:** While context is typically used to pass data down, a child could update values in a shared store (e.g. via a context provider) that the parent subscribes to.  Libraries like Redux follow a similar approach where any component can dispatch actions that update a global state observed by others.

4. **Give two ways to prevent components from re‑rendering.**

   * Use **`React.memo`** (or extend `PureComponent` in class components) to memoise the rendered output based on a shallow comparison of props.  When the props are referentially identical the component will not re‑render.
   * Extract expensive computations into a `useMemo` hook and event handlers into `useCallback` so that they retain the same identity across renders.  Passing stable references prevents child components from re‑rendering unnecessarily.  Another technique in class components is to implement `shouldComponentUpdate` and return `false` when the update can be skipped.

5. **What is a fragment and why do we need it?  Give an example where it might break my app.**

   A fragment is a wrapper for multiple elements that does not render an extra DOM node.  In JSX you can write `<React.Fragment>` or the shorthand `<>`/`</>` to group children.  Fragments are useful when a component needs to return multiple sibling elements but adding an extra `<div>` would interfere with layout or styling (for example, when rendering table rows).  Fragments can “break” your app when a parent expects a single child or relies on a particular DOM structure.  For instance, `<tr>` elements in an HTML table must be direct children of `<tbody>`.  If you return a fragment that contains `<tr>` children as siblings, React wraps them in a `<React.Fragment>` which is fine, but if you accidentally wrap them in a `<div>` it will break the table structure.

6. **Give three examples of the HOC (Higher Order Component) pattern.**

   A higher‑order component is a function that takes a component and returns a new component with extended behaviour.  Examples include:

   * `connect()` from `react-redux`, which injects state and dispatch props into a component.
   * `withRouter()` from `react-router`, which provides access to router parameters and navigation functions.
   * `withErrorBoundary()` or `withErrorHandler()` functions that catch errors in a wrapped component and render a fallback UI.

7. **What’s the difference in handling exceptions in promises, callbacks and `async…await`?**

   * **Callbacks:** Traditional Node‑style callbacks take an error as the first argument.  You must manually check for errors and handle them.  Errors thrown inside the callback cannot be caught outside of it without additional error handling logic.
   * **Promises:** A promise represents an asynchronous computation.  Errors inside a promise are propagated to the nearest `.catch()` in the chain.  You can also attach a rejection handler as the second argument to `.then()`.
   * **`async…await`:** An `async` function implicitly wraps its return value in a promise.  You can use `await` to pause execution until a promise settles.  Errors thrown inside an `async` function or in awaited promises can be caught synchronously with `try…catch`, producing code that reads like synchronous error handling.

8. **How many arguments does `setState` take and why is it async?**

   In class components `setState` can take up to two arguments: either an object containing state updates, or a function that receives the previous state and props and returns an update, **and** an optional callback executed after the state change has been applied.  `setState` is asynchronous because React batches state updates for performance reasons; multiple calls may be combined into a single render.  By not updating state synchronously, React can reduce unnecessary reflows and paint operations.  The callback argument exists for cases where you need to run code after the DOM has updated.

9. **List the steps needed to migrate a class to a function component.**

   1. **Convert the class to a function:** Replace `class MyComponent extends React.Component` with `function MyComponent(props: Props) {}` or an arrow function.  Remove the `render()` method — the return value of the function is the JSX.
   2. **Replace state with hooks:** For each state property, call `const [value, setValue] = useState(initialValue)`.  Replace calls to `this.setState()` with calls to the corresponding setter.
   3. **Replace lifecycle methods:** Combine `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` into one or more `useEffect` hooks.  The effect’s dependency array controls when it runs.
   4. **Remove `this` references:** In function components you access props directly (`props.foo` or destructure them) and you don’t need to bind methods.  Event handlers can be defined inline or with `useCallback`.
   5. **Handle refs and imperative methods:** Replace `React.createRef()` with `useRef()` and `forwardRef/useImperativeHandle` if the component exposes methods to parents.

10. **List a few ways styles can be used with components.**

   * **External CSS files:** Import a `.css` file and apply classes to your JSX elements.
   * **CSS modules:** Name‑scoped CSS that compiles to unique class names (`import styles from './styles.module.css';`).
   * **Inline styles:** Use the `style` prop with a JavaScript object for dynamic styling.
   * **CSS‑in‑JS libraries:** Libraries such as `styled-components`, `emotion` or `linaria` allow you to write CSS directly in your component files and generate scoped classes.
   * **Utility classes:** Frameworks like Tailwind CSS provide predefined utility classes that can be composed in your markup.

11. **How do you render an HTML string coming from the server?**

   In React you normally cannot render raw HTML directly because the JSX syntax escapes any strings to prevent cross‑site scripting (XSS).  If you must render trusted HTML, you can use the `dangerouslySetInnerHTML` prop:

   ```tsx
   function Article({ html }: { html: string }) {
     return <div dangerouslySetInnerHTML={{ __html: html }} />;
   }
   ```

   The name is deliberately intimidating to remind you that injecting unsanitised strings can be dangerous.  Always sanitise user‑generated or external HTML before rendering it, or avoid this pattern entirely when possible.
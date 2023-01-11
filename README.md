# Roulette

Javascript helper functions and collection class implementing the Roulette Method for weighted random sampling.

This is the first iteration and is not fully optimized.

## News

- Eleventh of January, 2023: Now updated to modern javascript!

## Usage

The file `main.js` exports three identifiers:

1. `Roulette`: the `Roulette` collection class from `modules/Roulette.js`.
2. `choose`: the `choose` function from `modules/helpers.js`.
3. `roulette`: the `roulette` function from `modules/helpers.js`.

Add `import { <identifier> } from '<path to main.js>'` to your script, where
`<identifier>` is the identifier you want to import, and `<path to main.js>` is
the path to the `main.js` file.

In the Node REPL, you can `await import('<path to main.js>')`.

## Documentation

See source. Docstrings use the JSDoc syntax.

## Testing

Use mocha and chai for tests.

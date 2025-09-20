# JavaScript Loose Equals Explorer

[![CodeFactor](https://www.codefactor.io/repository/github/attacktive/js-loose-equals/badge)](https://www.codefactor.io/repository/github/attacktive/js-loose-equals)
[![pages-build-deployment](https://github.com/Attacktive/javascript-loosely-equal-example-giver/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/Attacktive/javascript-loosely-equal-example-giver/actions/workflows/pages/pages-build-deployment)

An interactive web tool that demonstrates JavaScript's loose equality (`==`) behavior by showing what values are loosely equal to any given expression.

## 🚀 Features

- **Interactive Interface**: Enter any JavaScript expression and see what other values are loosely equal to it
- **Comprehensive Coverage**: Handles all JavaScript types including primitives, objects, arrays, functions, and symbols
- **Educational Examples**: Built-in example buttons for common tricky cases
- **Type Coercion Visualization**: Shows how JavaScript's `==` operator performs type coercion
- **Real-time Evaluation**: Live preview of expression evaluation
- **Error Handling**: Safe expression evaluation with input validation

## 🎯 How It Works

JavaScript's loose equality (`==`) operator performs automatic type conversion (coercion) when comparing values of different types. This can lead to surprising results that are often confusing for developers.

For example:
- `false == 0` → `true`
- `'' == 0` → `true` 
- `[] == false` → `true`
- `[0] == false` → `true`
- `[[]] == false` → `true`

This tool helps visualize these relationships by showing all values that are loosely equal to your input.

## 🛠️ Usage

1. Open `index.html` in your browser
2. Enter any JavaScript expression in the input field
3. Click "Give examples" or press Ctrl+Enter
4. View the results showing all loosely equal values

### Example Inputs to Try

- Basic values: `false`, `0`, `''`, `null`, `undefined`
- Arrays: `[]`, `[0]`, `[[]]`, `[1]`
- Objects: `new Date()`, `new String('0')`
- Functions: `function(){return 42}`

## 🧪 Testing

Run the test suite by opening `test.html` in your browser and clicking "Run Tests".

## 📁 Project Structure

```
├── index.html          # Main application interface
├── index.js            # Main application logic
├── index.css           # Styling
├── test.html           # Test runner interface
├── scripts/
│   ├── example-giver.js # Core logic for finding loose equality examples
│   └── formatter.js     # Value formatting utilities
└── tests/
    └── test-example-giver.js # Unit tests
```

## 🔧 Technical Details

The core algorithm follows the ECMAScript specification for the Abstract Equality Comparison algorithm, handling:

- Primitive type coercion
- Object-to-primitive conversion
- Array flattening behavior
- Symbol handling
- Function string conversion
- Special cases for `null`, `undefined`, and `NaN`

## 🤝 Contributing

Feel free to submit issues and pull requests to improve the tool's accuracy or add new features.

## 📚 References

- [ECMAScript Abstract Equality Comparison](https://262.ecma-international.org/5.1/#sec-11.9.3)
- [JavaScript Equality Table](https://dorey.github.io/JavaScript-Equality-Table/)

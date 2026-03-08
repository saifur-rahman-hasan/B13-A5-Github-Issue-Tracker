# JavaScript Quick Answers

---

**1️⃣ What is the difference between var, let, and const?**

- `var` → function-scoped, can re-declare, old way
- `let` → block-scoped, can re-assign, modern
- `const` → block-scoped, can't re-assign, for fixed values

---

**2️⃣ What is the spread operator (...)?**

It unpacks an array or object into individual pieces.
`const merged = [...arr1, ...arr2];`

---

**3️⃣ What is the difference between map(), filter(), and forEach()?**

- `map()` → transforms and returns a **new array**
- `filter()` → picks matching items, returns a **new array**
- `forEach()` → just loops, returns **nothing**

---

**4️⃣ What is an arrow function?**

A shorter way to write functions.
`const add = (a, b) => a + b;`
Also, it doesn't have its own `this`.

---

**5️⃣ What are template literals?**

Strings using backticks that allow variables inside.
`` `Hello, ${name}!` `` — cleaner than `"Hello, " + name`
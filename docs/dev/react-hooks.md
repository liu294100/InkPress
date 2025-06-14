---
title: "Mastering React Hooks"
date: "2024-01-10"
author: "React Expert"
tags: ["react", "hooks", "javascript", "frontend"]
description: "A deep dive into React Hooks and how to use them effectively"
---

# Mastering React Hooks

React Hooks revolutionized how we write React components by allowing us to use state and other React features in functional components. This guide will help you master the most important hooks.

## What are React Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 and have become the standard way to write React components.

### Rules of Hooks

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call them from React function components or custom hooks

## useState Hook

The `useState` hook lets you add state to functional components:

```jsx
import React, { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}
```

### Multiple State Variables

```jsx
function UserProfile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState(0)

  // Component logic here
}
```

### State with Objects

```jsx
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  })

  const updateUser = (field, value) => {
    setUser(prevUser => ({
      ...prevUser,
      [field]: value
    }))
  }

  return (
    <form>
      <input
        value={user.name}
        onChange={(e) => updateUser('name', e.target.value)}
        placeholder="Name"
      />
      {/* More inputs */}
    </form>
  )
}
```

## useEffect Hook

The `useEffect` hook lets you perform side effects in function components:

```jsx
import React, { useState, useEffect } from 'react'

function DataFetcher() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this runs once on mount

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No data found</div>

  return <div>{JSON.stringify(data)}</div>
}
```

### Cleanup with useEffect

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    // Cleanup function
    return () => clearInterval(interval)
  }, [])

  return <div>Timer: {seconds} seconds</div>
}
```

### Dependencies Array

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId]) // Re-run when userId changes

  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
```

## useContext Hook

The `useContext` hook lets you consume context values:

```jsx
import React, { createContext, useContext, useState } from 'react'

// Create context
const ThemeContext = createContext()

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Consumer component
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <button
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle Theme
    </button>
  )
}
```

## useReducer Hook

For complex state logic, `useReducer` is often preferable to `useState`:

```jsx
import React, { useReducer } from 'react'

const initialState = { count: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return initialState
    default:
      throw new Error()
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>
        +
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        -
      </button>
      <button onClick={() => dispatch({ type: 'reset' })}>
        Reset
      </button>
    </div>
  )
}
```

## useMemo Hook

The `useMemo` hook memoizes expensive calculations:

```jsx
import React, { useState, useMemo } from 'react'

function ExpensiveComponent({ items }) {
  const [filter, setFilter] = useState('')

  const filteredItems = useMemo(() => {
    console.log('Filtering items...') // This will only run when items or filter change
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [items, filter])

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## useCallback Hook

The `useCallback` hook memoizes functions:

```jsx
import React, { useState, useCallback } from 'react'

function TodoList() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  const addTodo = useCallback(() => {
    if (text.trim()) {
      setTodos(prev => [...prev, { id: Date.now(), text }])
      setText('')
    }
  }, [text])

  const removeTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }, [])

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onRemove={removeTodo}
          />
        ))}
      </ul>
    </div>
  )
}

const TodoItem = React.memo(({ todo, onRemove }) => {
  return (
    <li>
      {todo.text}
      <button onClick={() => onRemove(todo.id)}>Remove</button>
    </li>
  )
})
```

## useRef Hook

The `useRef` hook creates a mutable ref object:

```jsx
import React, { useRef, useEffect } from 'react'

function FocusInput() {
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus the input on mount
    inputRef.current.focus()
  }, [])

  return (
    <div>
      <input ref={inputRef} placeholder="This will be focused" />
      <button onClick={() => inputRef.current.focus()}>
        Focus Input
      </button>
    </div>
  )
}
```

### Storing Previous Values

```jsx
function PreviousValue({ value }) {
  const prevValue = useRef()

  useEffect(() => {
    prevValue.current = value
  })

  return (
    <div>
      <p>Current: {value}</p>
      <p>Previous: {prevValue.current}</p>
    </div>
  )
}
```

## Custom Hooks

Create your own hooks to reuse stateful logic:

```jsx
// Custom hook for local storage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  return [storedValue, setValue]
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  )
}
```

### Custom Hook for API Calls

```jsx
function useApi(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useApi(`/api/users/${userId}`)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>No user found</div>

  return <div>Welcome, {user.name}!</div>
}
```

## Best Practices

1. **Keep hooks at the top level** - Never call hooks inside loops, conditions, or nested functions
2. **Use multiple state variables** - Instead of one large state object, use multiple `useState` calls
3. **Optimize with useMemo and useCallback** - But don't overuse them; measure performance first
4. **Create custom hooks** - Extract reusable stateful logic into custom hooks
5. **Use useEffect cleanup** - Always clean up subscriptions and timers
6. **Be careful with dependencies** - Include all values from component scope that are used inside useEffect

## Common Pitfalls

1. **Missing dependencies in useEffect** - This can cause stale closures
2. **Infinite loops** - Usually caused by missing or incorrect dependencies
3. **Overusing useMemo/useCallback** - These have their own overhead
4. **Not cleaning up effects** - Can cause memory leaks

## Conclusion

React Hooks provide a powerful and flexible way to manage state and side effects in functional components. By mastering these hooks and following best practices, you can write cleaner, more maintainable React code.

Remember to always follow the rules of hooks and consider creating custom hooks when you find yourself repeating stateful logic across components.
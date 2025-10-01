# Contributing to Electricity Meter Tracker

## For AI Agents and Human Contributors

This document provides guidelines for contributing to the Electricity Meter Tracker project. Following these guidelines ensures consistent code quality, maintainability, and collaboration.

## Code Style and Standards

### General Principles

1. **Keep It Simple**: Favor readability and maintainability over cleverness
2. **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions
3. **Single Responsibility**: Each function/component should have one clear purpose
4. **Meaningful Names**: Use descriptive variable and function names
5. **Comments for Why, Not What**: Code should be self-documenting; comments explain reasoning

### Backend (Node.js/Express)

#### File Organization
```
backend/
├── src/
│   ├── models/       # Database models
│   ├── routes/       # API route handlers
│   ├── database.js   # Database initialization
│   └── server.js     # Main server file
```

#### Code Standards

- Use **CommonJS** (`require`/`module.exports`)
- Use **async/await** for asynchronous operations
- Always validate input with `express-validator`
- Use proper HTTP status codes (200, 201, 400, 404, 500)
- Return consistent JSON response formats:
  ```javascript
  // Success
  res.json({ ...data })
  
  // Error
  res.status(4xx).json({ error: 'Error message' })
  ```

#### Database Operations

- Use prepared statements for all queries (already done with better-sqlite3)
- Always handle FOREIGN KEY constraints
- Use transactions for multi-step operations
- Index frequently queried columns

#### Error Handling

```javascript
try {
  // Operation
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({ error: 'Specific error message' });
  }
  res.status(500).json({ error: error.message });
}
```

### Frontend (React/Vite)

#### File Organization
```
frontend/src/
├── components/       # Reusable components
├── pages/           # Page-level components
├── api.js           # API client
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

#### Code Standards

- Use **functional components** with hooks
- Use **ES6 modules** (`import`/`export`)
- Use **Material-UI components** for consistency
- Follow **React hooks rules** (eslint-plugin-react-hooks)
- Keep components under 300 lines; split if larger

#### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Component } from '@mui/material';

// 2. Component definition
function MyComponent({ prop1, prop2 }) {
  // 3. State hooks
  const [state, setState] = useState(initialValue);
  
  // 4. Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 5. Event handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // 6. Render
  return (
    <Component>
      {/* JSX */}
    </Component>
  );
}

// 7. Export
export default MyComponent;
```

#### State Management

- Use `useState` for local state
- Lift state up when sharing between components
- Consider Context API for deeply nested props (if needed in future)

#### API Calls

- Always handle loading states
- Always handle error states
- Use try-catch for error handling
- Show user feedback (Snackbar) for success/error

```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await api.getData();
    setData(response.data);
    showSnackbar('Success', 'success');
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    setLoading(false);
  }
};
```

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Messages

Follow conventional commits format:

```
type(scope): brief description

Detailed explanation (if needed)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(backend): add export readings endpoint
fix(frontend): correct delta calculation display
docs(readme): update installation instructions
```

## Testing Guidelines

### Backend Testing

When adding new endpoints:
1. Test with valid data
2. Test with invalid data (validation)
3. Test edge cases (empty DB, missing relations)
4. Test error handling

### Frontend Testing

When adding new features:
1. Test responsive design (mobile, tablet, desktop)
2. Test loading states
3. Test error states
4. Test user interactions (clicks, forms)

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make changes** following code standards
3. **Test thoroughly** in development
4. **Update documentation** if needed
5. **Create PR** with clear description:
   - What changed
   - Why it changed
   - How to test
6. **Address review feedback** promptly

## Code Review Checklist

### For Reviewers

- [ ] Code follows style guidelines
- [ ] No security vulnerabilities introduced
- [ ] Error handling is appropriate
- [ ] User-facing changes are intuitive
- [ ] Documentation is updated
- [ ] No unnecessary dependencies added

### For Contributors

Before requesting review:
- [ ] Code is self-tested
- [ ] No console.log or debug code left
- [ ] Comments explain complex logic
- [ ] Naming is clear and consistent
- [ ] No breaking changes (or properly documented)

## Adding New Features

### New API Endpoint

1. Create/update model in `backend/src/models/`
2. Add route handler in `backend/src/routes/`
3. Add validation with `express-validator`
4. Update API client in `frontend/src/api.js`
5. Update relevant frontend components
6. Document in README API section

### New UI Component

1. Create component in `frontend/src/components/`
2. Use Material-UI components
3. Make responsive (test on mobile)
4. Add prop validation (PropTypes or TypeScript)
5. Export and use in pages
6. Document props if complex

### New Database Table/Column

1. Update schema in `backend/src/database.js`
2. Consider migration strategy for existing data
3. Update relevant models
4. Update API endpoints
5. Test with both empty and populated DB

## Performance Guidelines

### Backend

- Use indexes for frequently queried columns
- Limit query results (pagination)
- Use SELECT only needed columns
- Cache expensive operations if needed

### Frontend

- Lazy load heavy components
- Debounce frequent operations (search, resize)
- Use React.memo for expensive renders
- Optimize images and assets

## Security Guidelines

- **Never** commit secrets or credentials
- **Always** validate user input
- **Always** use prepared statements (already enforced)
- **Always** sanitize error messages (no stack traces to client)
- Keep dependencies updated

## Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying configuration
- Changing deployment process

Required documentation:
- README.md - User-facing features and setup
- CONTRIBUTING.md (this file) - Development guidelines
- Code comments - Complex logic and reasoning

## Questions?

For questions about:
- Code style: Refer to this document
- Feature requests: Open an issue with [FEATURE] tag
- Bug reports: Open an issue with [BUG] tag
- Architecture decisions: Open a discussion

## AI Agent Specific Guidelines

When contributing as an AI agent:

1. **Read existing code first** to understand patterns
2. **Follow established conventions** in the codebase
3. **Test changes** if possible before committing
4. **Explain reasoning** in commit messages
5. **Ask for clarification** if requirements are ambiguous
6. **Provide complete solutions** including error handling
7. **Update documentation** when adding features
8. **Consider edge cases** in implementations

Remember: The goal is maintainable, production-quality code that future contributors (human or AI) can easily understand and extend.

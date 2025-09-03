# Contributing to MiraiLens MCP Server

Thank you for your interest in contributing to MiraiLens! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Documentation](#documentation)

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment for all contributors. We expect all participants to:

- Be respectful and considerate of others
- Use welcoming and inclusive language
- Be collaborative and open to feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- Chrome/Chromium browser for testing

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/mugenkyou/mcp-server-mirailens.git
   cd mcp-server-mirailens
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/mugenkyou/mcp-server-mirailens.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
# Development build with watch mode
npm run watch

# Production build
npm run build

# Type checking
npm run typecheck
```

### Install Extension

1. Build the project: `npm run build`
2. Open Chrome/Chromium and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the browser extension folder from your MiraiLens installation

## Making Changes

### Branch Strategy

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Commit with clear, descriptive messages
4. Push to your fork

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(tools): add new screenshot tool`
- `fix(extension): resolve connection timeout issue`
- `docs(readme): update installation instructions`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Testing

### Run Tests

```bash
# Type checking
npm run typecheck

# Build verification
npm run build

# MCP Inspector (manual testing)
npm run inspector
```

### Testing Checklist

Before submitting changes, ensure:

- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] Extension loads in Chrome without errors
- [ ] MCP server starts successfully
- [ ] Basic tools work in MCP Inspector
- [ ] No console errors in browser

## Submitting Changes

### Pull Request Process

1. **Update your branch**: Ensure your branch is up to date with upstream
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push changes**: Push your updated branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create PR**: Create a pull request on GitHub

4. **PR Description**: Include:
   - Clear description of changes
   - Related issue numbers
   - Testing steps
   - Screenshots (if UI changes)

### Review Process

- All PRs require at least one review
- Address feedback and requested changes
- Maintainers may request additional changes
- Once approved, maintainers will merge

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### General

- Follow existing code patterns
- Use consistent indentation (2 spaces)
- Keep functions focused and small
- Add error handling where appropriate

### Example

```typescript
/**
 * Navigates to a specified URL in the active tab
 * @param url - The URL to navigate to
 * @returns Promise that resolves when navigation is complete
 */
export async function navigate(url: string): Promise<void> {
  try {
    // Implementation
  } catch (error) {
    console.error('Navigation failed:', error);
    throw new Error(`Failed to navigate to ${url}`);
  }
}
```

## Documentation

### Code Documentation

- Document all public functions and classes
- Include examples for complex functionality
- Keep documentation up to date with code changes

### User Documentation

- Update README.md for user-facing changes
- Update README.md installation section for installation changes
- Update browser extension documentation for extension changes

### API Documentation

- Document MCP tools and their parameters
- Include usage examples
- Document error conditions and responses

## Getting Help

### Questions and Discussion

- Use GitHub Discussions for questions
- Join our Discord community
- Check existing issues and PRs

### Reporting Bugs

1. Check if the issue is already reported
2. Use the bug report template
3. Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Feature Requests

1. Check if the feature is already requested
2. Use the feature request template
3. Explain the use case and benefits
4. Consider implementation complexity

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Project README (for significant contributions)
- Release notes
- Community acknowledgments

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MiraiLens! Your contributions help make this project better for everyone.

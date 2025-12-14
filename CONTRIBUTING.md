# Contributing to Nimbus ☁️

First off, thank you for considering contributing to Nimbus! It's people like you that make Nimbus such a great tool for building AI agents.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Our Standards:**
- ✅ Be respectful and inclusive
- ✅ Welcome newcomers and help them learn
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members
- ❌ No harassment, trolling, or derogatory comments
- ❌ No spam or self-promotion

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm, yarn, or pnpm
- Docker (for Kestra)
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/nimbus.git
cd nimbus

# 3. Add upstream remote
git remote add upstream https://github.com/Tasfia-17/nimbus.git

# 4. Install dependencies
npm install

# 5. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 6. Start Kestra
docker-compose up -d

# 7. Run development server
npm run dev

# 8. Open http://localhost:3000
```

---

## 🤝 How to Contribute

### Reporting Bugs

Found a bug? Help us fix it:

1. **Check existing issues** - Someone might have already reported it
2. **Create a detailed issue** using the bug report template
3. **Include:**
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, browser)
   - Error messages or logs

### Suggesting Enhancements

Have an idea? We'd love to hear it:

1. **Check existing feature requests**
2. **Create an issue** using the feature request template
3. **Include:**
   - Clear use case
   - Why this would be valuable
   - Potential implementation approach
   - Any alternatives you've considered

### Your First Contribution

New to open source? Here's how to start:

1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to let others know you're working on it
3. Ask questions if anything is unclear
4. Follow the development workflow below

---

## 💻 Development Workflow

### Branch Naming Convention

Use descriptive branch names:
- `feature/add-agent-templates` - New features
- `fix/execution-logging-bug` - Bug fixes
- `docs/update-api-reference` - Documentation
- `refactor/simplify-tool-executor` - Code refactoring
- `test/add-agent-executor-tests` - Tests

### Making Changes

```bash
# 1. Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# - Write code
# - Add tests
# - Update documentation

# 4. Test your changes
npm run test
npm run lint
npm run build

# 5. Commit your changes
git add .
git commit -m "feat: add amazing feature"

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create a Pull Request on GitHub
```

---

## 🔄 Pull Request Process

### Before Submitting

- ✅ Code follows our style guidelines
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Documentation is updated
- ✅ Commit messages follow conventions
- ✅ Branch is up to date with main

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Added integration tests

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated checks** run (linting, tests, build)
2. **Maintainers review** your code
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

---

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good
interface AgentConfig {
  name: string;
  instructions: string;
  tools: Tool[];
}

async function createAgent(config: AgentConfig): Promise<Agent> {
  // Implementation
}

// ❌ Avoid
function createAgent(config: any): any {
  // No types
}
```

### File Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components
├── lib/           # Business logic and utilities
└── types/         # TypeScript type definitions
```

### Naming Conventions

- **Files:** `kebab-case.tsx`, `agent-executor.ts`
- **Components:** `PascalCase` - `AgentCard.tsx`
- **Functions:** `camelCase` - `executeAgent()`
- **Constants:** `UPPER_SNAKE_CASE` - `MAX_RETRIES`
- **Types/Interfaces:** `PascalCase` - `AgentConfig`

### Code Style

```typescript
// Use async/await instead of .then()
✅ const result = await fetchData();
❌ fetchData().then(result => ...);

// Use const for non-reassigned variables
✅ const config = getConfig();
❌ let config = getConfig();

// Use template literals
✅ const message = `Agent ${name} executed`;
❌ const message = 'Agent ' + name + ' executed';

// Use optional chaining
✅ const value = obj?.nested?.property;
❌ const value = obj && obj.nested && obj.nested.property;
```

---

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// tests/agent-executor.test.ts
import { describe, it, expect } from '@jest/globals';
import { executeAgent } from '@/lib/agent-executor';

describe('AgentExecutor', () => {
  it('should execute agent successfully', async () => {
    const agent = createMockAgent();
    const result = await executeAgent(agent, 'test input');
    
    expect(result.status).toBe('success');
    expect(result.output).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const agent = createMockAgent();
    const result = await executeAgent(agent, 'invalid input');
    
    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test agent-executor.test.ts
```

---

## 📚 Documentation

### Code Comments

```typescript
/**
 * Executes an AI agent with the given input.
 * 
 * @param agent - The agent configuration
 * @param input - User input to process
 * @returns Execution result with status and output
 * 
 * @example
 * ```typescript
 * const result = await executeAgent(agent, "Analyze competitors");
 * console.log(result.output);
 * ```
 */
async function executeAgent(agent: Agent, input: string): Promise<ExecutionResult> {
  // Implementation
}
```

### README Updates

When adding new features:
1. Update the main README.md
2. Add entry to relevant docs/
3. Update CHANGELOG.md
4. Add code examples if applicable

---

## 🎯 Project Structure

```
nimbus/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   └── agents/         # Agent pages
│   ├── components/         # React components
│   │   ├── agents/         # Agent-specific components
│   │   ├── tools/          # Tool components
│   │   └── ui/             # UI components
│   └── lib/                # Core business logic
│       ├── agent-executor.ts
│       ├── kestra.ts
│       ├── llm.ts
│       └── tools/
├── prisma/                 # Database schema
├── docs/                   # Documentation
├── public/                 # Static assets
└── tests/                  # Test files
```

---

## 🏆 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Featured in README (for significant contributions)
- Given credit in commits

---

## 💬 Getting Help

- **Discord:** Join our community server
- **GitHub Discussions:** Ask questions
- **Issues:** Tag with `question` label
- **Email:** Contact maintainers

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes Nimbus better. We appreciate your time and effort!

**Happy coding!** ☁️✨

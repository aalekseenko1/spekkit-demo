# Demo1 - AI-Driven SDLC Project

A Next.js application demonstrating AI-assisted software development using the SpecKit workflow.

## Project Scope

**MVP Focus:** This project implements MVP phases only to demonstrate core user story functionality. No modern UI components, additional features, or tests are included in the initial implementation.

## AI SDLC Process

This project follows a structured AI-driven Software Development Life Cycle using [SpecKit](https://github.com/github/spec-kit):

![Spec Kit Workflow](./.specify/speckit-workflow.png)

### Workflow Overview

**Constitution** - Define project principles and standards that guide all development decisions.

**Feature Life Cycle:**
1. **/specify** - Define what to build (product requirements, no technical details)
2. **/clarify** - Resolve ambiguities with targeted follow-up questions
3. **/plan** - Create detailed implementation plan with technical approach
4. **/tasks** - Break plan into actionable, dependency-ordered steps
5. **/analyze** - Validate consistency across all documentation artifacts
6. **/implement** - Execute tasks with automated testing and validation
7. **Create PR/Merge** - Review, approve, and integrate changes

## Tech Stack

- **Framework:** Next.js 15.5.5 (with Turbopack)
- **UI:** React 19.1.0
- **Styling:** Tailwind CSS 4
- **Data Visualization:** Recharts 3.2.1
- **CSV Processing:** PapaParse 5.5.3
- **Language:** TypeScript 5

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Test Data

The project includes `fake_bank_statement.csv` as default test data for demonstrating CSV processing and data visualization features.

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## SpecKit Commands

This project uses SpecKit slash commands for AI-assisted development:

- `/speckit.constitution` - Create/update project principles
- `/speckit.specify` - Define new feature requirements
- `/speckit.clarify` - Ask targeted clarification questions
- `/speckit.plan` - Generate implementation plan
- `/speckit.tasks` - Break plan into actionable tasks
- `/speckit.analyze` - Validate cross-artifact consistency
- `/speckit.implement` - Execute implementation plan
- `/speckit.checklist` - Generate custom feature checklist

## Project Structure

```
demo1/
├── .specify/          # SpecKit workflow artifacts
├── specs/            # Feature specifications
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
└── .claude/          # Claude Code configuration
```

## Learn More

- [SpecKit GitHub Repository](https://github.com/github/spec-kit)
- [Next.js Documentation](https://nextjs.org/docs)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

Private project.

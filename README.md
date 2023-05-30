# Funne API

## Documentations

### Environment Variabels

For using this API, you need to create `.env` file in root directory of this project. You can copy the `.env.example` file and rename it to `.env`. Then, you can fill the environment variables with your own values.

> Detail of environment variables can be found in [.env.example](./.env.example) file.

### Scripts

The following scripts are available:

| Script             | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `pnpm start`       | Run the server                                           |
| `pnpm start:prod`  | Run database migration for production and run the server |
| `pnpm db:migrate`  | Create database migration for development                |
| `pnpm db:studio`   | Run prisma studio (_GUI Database explorer_)              |
| `pnpm db:generate` | Generate artifacts for prisma client                     |
| `pnpm format`      | Run code formating with prettier                         |

### Development Guide

For better development experience, the following VSCode extensions are recommended:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (Code Linter)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (Code Formatter)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma) (Syntax support for Prisma Schema)

## Contributors

- `C243DSX0644` - Edwin Tantawi
- `C350DSY3018` - Puan Abidah Nitisara

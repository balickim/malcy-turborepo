# TurboRepo Malcy Game

This TurboRepo project consists of four main applications:

1. **game-api**: A NestJS API for specific game world bounds.
2. **game-web**: A React app for specific game world bounds.
3. **backoffice-api**: A Backoffice NestJS API for managing game worlds.
4. **backoffice-web**: A Backoffice React app for managing game worlds.

## Setup Instructions

### Prerequisites

1. Install pnpm (used for pnpm workspaces). Follow the instructions [here](https://pnpm.io/installation).
2. Setup `docker-compose.yml`.

### Setting Up the Project for Development

1. Install dependencies at the root directory:
   ```sh
   pnpm install
2. Start Docker containers:
   ```sh
   docker-compose up
3. Copy `.env.example` to `.env` and populate it with your own data.

### Configuring game-api

1. Navigate to `apps/game-api` directory.
2. Run migrations:
    ```sh
    pnpm migration:run
3. Copy `.env.example` to `.env` and populate it with your own data.

### Configuring backoffice-api

1. Navigate to `apps/backoffice-api` directory.
2. Copy `.env.example` to `.env` and populate it with your own data.
   a. Replace `{worldName}` with your created world name from the database.

### Configuring game-web and backoffice-web

1. Navigate to `apps/game-web` and `apps/backoffice-web` directories.
2. Copy `.env.example` to `.env` and populate it with your own data.

## Misc
### Shared Packages
The project contains shared directories in the `packages` directory. Always remember to build them after making changes. The `shared-nestjs` package is built automatically when the dev server restarts (refer to `turbo.json` for more details).

### Building React Apps
* To build and start the app on a connected device:
  ```sh
  pnpm start:android 
  pnpm start:ios

* To open Android Studio or Xcode to build the apps manually:
  ```sh
  pnpm open:android 
  pnpm open:ios
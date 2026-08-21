# MediLog

MediLog is a local, single-user clinic management app built with Electron, React, SQLite, and Drizzle. It is meant for personal or small-practice use where the data stays on one machine and the app opens directly into the main dashboard without a sign-in flow.

## What it does

- Manages patients, visits, medications, prescriptions, settings, audit logs, exports, and local backups.
- Stores all data in a local SQLite database on the user’s machine.
- Uses a preload bridge so the renderer never talks to Node.js directly.

## Main features

- Patient CRUD with searchable lists and profile history.
- Visit tracking with clinician name, notes, diagnoses, and linked prescriptions.
- Medication catalog and prescription management.
- Clinic settings, including clinician name and contact details.
- Audit log for important app actions.
- CSV export for patients and visits.
- Backup and restore for the local database.
- Direct-to-dashboard startup with no authentication screen.

## Tech stack

- Electron 43
- React 19
- Vite / electron-vite 5
- TypeScript
- SQLite via `better-sqlite3`
- Drizzle ORM
- Zod for runtime validation

## Project structure

```text
src/
  main/        Electron main process, IPC handlers, services, and database code
  preload/     Secure contextBridge API exposed to the renderer
  renderer/    React UI
  shared/      Shared Zod schemas and types
```

## Development setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app in development:
   ```bash
   npm run dev
   ```

3. Run linting:
   ```bash
   npm run lint
   ```

4. Build the app:
   ```bash
   npm run build
   ```

## Packaging

To produce a Windows installer:

```bash
npm run package
```

This builds the Electron app and then packages it with `electron-builder`.

## Database behavior

- The database is stored in the Electron user data directory as `medilog.sqlite`.
- On Windows, that is typically under the app’s user data folder inside `%APPDATA%` or the Electron user-data location for the installed app.
- The database is created automatically on first launch.
- Migrations run at startup before the main window opens.
- Existing installs are upgraded in place so patients, visits, medications, prescriptions, audit logs, and settings are preserved.

## Fresh install behavior

- MediLog starts directly in the dashboard.
- The database and default clinic settings are created automatically.
- The clinician name falls back to `Primary Clinician` until changed in Settings.

## Data migration notes

- The current repository preserves legacy installs by converting old visit `doctorId` references into a stored `doctorName`.
- Legacy `users` and auth-related structures are removed from the final schema.
- Existing patient, visit, medication, prescription, audit, and settings data are preserved during migration.

## Backup and restore

### Backup

- Use the Settings page to create a SQLite backup.
- The backup is written as a `.db` file.
- Backups are created with SQLite’s backup mechanism so the copy is consistent.

### Restore

- Choose a previously created SQLite backup from the Settings page.
- MediLog validates that the file is a readable SQLite database and that it looks like a compatible MediLog database.
- Before restoring, MediLog creates an automatic safety backup of the current database.
- If validation fails, the current database is left untouched.
- After a successful restore, the app restarts so the database is reopened cleanly.

## Security and privacy notes

- MediLog is designed for local use and keeps data on the machine where it runs.
- Renderer code does not use Node.js directly.
- The preload bridge exposes only the APIs needed by the app.
- Validation is performed in the main process before data reaches SQLite.
- This project is not a certified medical product and does not claim regulatory compliance.

## Known limitations

- It is a single-user local application, not a multi-user or cloud-synced system.
- There is no authentication or role-based access control.
- Backup validation checks for a compatible MediLog schema, but it is still a local-file workflow, so users should keep multiple backups if the data matters.

## Useful scripts

- `npm run dev` - development mode
- `npm run build` - build main, preload, and renderer bundles
- `npm run package` - build and package a Windows installer
- `npm run lint` - run Oxlint
- `npm run db:generate` - generate Drizzle migrations
- `npm run db:migrate` - run Drizzle migration commands

# Tasks Feature

This module handles all task-related functionality including CRUD operations and UI components.

## Structure

- `TasksPanel.tsx`: Main UI component for displaying and managing tasks
- `taskHooks.ts`: React Query hooks for task operations (list, create, update, delete)

## Usage

The Tasks feature is integrated into the Dashboard page. All operations are scoped to the authenticated user unless the user is an admin.

## Extending

To add new entity types, follow this pattern:
1. Create a new feature folder (e.g., `features/notes`)
2. Implement hooks using React Query with the actor
3. Create UI components for CRUD operations
4. Add to the dashboard or create a new route

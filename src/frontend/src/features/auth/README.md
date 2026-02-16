# Authentication Feature

This module handles authentication state and user profile management using Internet Identity.

## Components

- Profile setup modal for first-time users
- Auth state management via Internet Identity hooks
- Protected route guards

## Usage

Authentication is handled automatically through the `useInternetIdentity` hook. User profiles are created on first login and stored in the backend canister.

## Security

- No passwords are stored in the frontend
- Internet Identity provides secure authentication
- Session state is managed through the actor system

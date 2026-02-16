# TaskFlow API Reference

This document describes the backend API for the TaskFlow application, including authentication, authorization, and task management endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Authorization & RBAC](#authorization--rbac)
- [Task Management](#task-management)
- [Error Handling](#error-handling)

## Authentication

TaskFlow uses Internet Identity for authentication. Users authenticate through the Internet Identity service, which provides a decentralized identity solution on the Internet Computer.

### Login Flow

1. User clicks "Login" button
2. Application redirects to Internet Identity
3. User authenticates with their chosen method (biometrics, security key, etc.)
4. Internet Identity returns a delegated identity
5. Application uses this identity for all subsequent API calls

### User Profile

After authentication, users must set up their profile on first login.

#### Get Caller User Profile


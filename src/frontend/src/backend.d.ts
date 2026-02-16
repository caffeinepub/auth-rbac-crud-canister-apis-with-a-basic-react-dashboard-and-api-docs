import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: string;
    title: string;
    owner: Principal;
    tags: Array<string>;
    completed: boolean;
    dueDate?: Time;
    description: string;
    priority: Priority;
}
export type Time = bigint;
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(id: string, title: string, description: string, priority: Priority, dueDate: Time | null, tags: Array<string>): Promise<void>;
    deleteTask(id: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getTask(id: string): Promise<Task>;
    isCallerAdmin(): Promise<boolean>;
    listFilteredTasks(showCompleted: boolean, tagFilter: string | null): Promise<Array<Task>>;
    listTasks(): Promise<Array<Task>>;
    updateTask(id: string, title: string, description: string, completed: boolean, priority: Priority, dueDate: Time | null, tags: Array<string>): Promise<void>;
}

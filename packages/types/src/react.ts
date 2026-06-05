import { CancelledPayload, CompletedPayload, EventType, FailedPayload, PageCompletedPayload, PageFailedPayload, PageSkippedPayload, PageStartedPayload, ProgressPayload, QueuedPayload, StartedPayload } from "./events";

export enum StatusEnum {
    Queued = 'queued',
    Started = 'started',
    Cancelled = 'cancelled',
    Failed = 'failed',
    Completed = 'completed',
}

export type StatusEnumKeys = keyof typeof StatusEnum;

export interface WsEvent<D> {
    type: EventType;
    data: D;
    version: string;
    timestamp: string;
}

export interface StartedWsData extends StartedPayload {}
export interface QueuedWsData extends QueuedPayload {}
export interface FailedWsData extends FailedPayload {}
export interface CancelledWsData extends CancelledPayload {}
export interface CompletedWsData extends CompletedPayload {}
export interface PageStartedWsData extends PageStartedPayload {}
export interface PageSkippedWsData extends PageSkippedPayload {}
export interface PageFailedWsData extends PageFailedPayload {}
export interface PageCompletedWsData extends PageCompletedPayload {}
export interface ProgressWsData extends ProgressPayload {}

export type StartedWsEvent = WsEvent<StartedWsData>;
export type QueuedWsEvent = WsEvent<QueuedWsData>;
export type FailedWsEvent = WsEvent<FailedWsData>;
export type CancelledWsEvent = WsEvent<CancelledWsData>;
export type CompletedWsEvent = WsEvent<CompletedWsData>;
export type PageStartedWsEvent = WsEvent<PageStartedWsData>;
export type PageFailedWsEvent = WsEvent<PageFailedWsData>;
export type PageSkippedWsEvent = WsEvent<PageSkippedWsData>;
export type PageCompletedWsEvent = WsEvent<PageCompletedWsData>;
export type ProgressWsEvent = WsEvent<ProgressWsData>;

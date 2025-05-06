import type { NotificationCenter } from 'node-notifier';

export type NotificationOptions = {
  title: string;
  message: string;
  sound: boolean;
};

export type NotificationService = {
  notify(options: NotificationOptions): void;
  on(event: string, callback: (notifierObject: any, options: NotificationOptions) => void): void;
  once(event: string, callback: (notifierObject: any, options: NotificationOptions) => void): void;
  emit(event: string, notifierObject: any, options: NotificationOptions): void;
  removeAllListeners(): void;
}; 
import { api } from '../api/client';

export type LiveEventType = 'spin' | 'task' | 'wallet' | 'notification' | 'command' | 'all';

class RealtimeHub {
  private currentUserId: string | null = null;
  private isInitialized = false;

  public init(userId: string) {
    if (!userId) return;
    if (this.currentUserId === userId && this.isInitialized) {
      return;
    }

    this.cleanup();
    this.currentUserId = userId;
    this.isInitialized = true;
  }

  public broadcast(type: LiveEventType, payload?: any) {
    // Targeted cache invalidation based on event type
    if (type === 'wallet') {
      api.invalidateCache('/wallet');
      api.invalidateCache('/user/dashboard');
    } else if (type === 'task') {
      api.invalidateCache('/tasks');
      api.invalidateCache('/user/dashboard');
    } else if (type === 'spin') {
      api.invalidateCache('/spin');
    } else if (type === 'notification') {
      api.invalidateCache('/notifications');
    } else {
      api.invalidateCache();
    }

    // Fire custom event for any listening page / part to update without reloading
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('royal_live_update', {
          detail: { type, payload, timestamp: Date.now() },
        })
      );
    }
  }

  public cleanup() {
    this.currentUserId = null;
    this.isInitialized = false;
  }
}

export const realtimeHub = new RealtimeHub();

export type FriendType = 'local' | 'online';

export interface Friend {
  id: string;
  name: string;
  type: FriendType;
  email?: string;
  createdAt: string;
  balance: number;
}

export interface Debt {
  id: string;
  amount: number;
  creditorId: string;
  debtorId: string;
  name?: string;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string;
  isDivided: boolean;
  dividedAmong: string[];
}

export interface LocalData {
  friends: Friend[];
  debts: Debt[];
}

import { api } from '../api';
import { ApiResponse } from '../types';

export interface EarningActivity {
  id: string;
  source: 'hackathons' | 'grants' | 'crowdfunding' | 'bounties';
  title: string;
  amount: number;
  currency: string;
  occurredAt: string;
}

export interface EarningsData {
  summary: {
    totalEarned: number;
    pendingWithdrawal: number;
    completedWithdrawal: number;
  };
  breakdown: {
    hackathons: number;
    grants: number;
    crowdfunding: number;
    bounties: number;
  };
  activities: EarningActivity[];
}

export interface GetEarningsResponse extends ApiResponse<EarningsData> {
  success: true;
  data: EarningsData;
}

export interface ClaimEarningRequest {
  activityId: string;
}

export interface ClaimEarningResponse extends ApiResponse {
  success: boolean;
  message: string;
  data?: {
    transactionHash: string;
  };
}

/**
 * Get user earnings data
 */
export const getUserEarnings = async (): Promise<GetEarningsResponse> => {
  const res = await api.get<GetEarningsResponse>('/users/earnings');
  return res.data;
};

/**
 * Claim a specific earning
 */
export const claimEarning = async (
  data: ClaimEarningRequest
): Promise<ClaimEarningResponse> => {
  const res = await api.post<ClaimEarningResponse>(
    '/users/earnings/claim',
    data
  );
  return res.data;
};

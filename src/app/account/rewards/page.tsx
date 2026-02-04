'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface RewardTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  pointsMultiplier: number;
  benefits: string[];
  color: string;
  icon: string;
}

export default function AccountRewards() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPoints, setUserPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState<RewardTier | null>(null);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/account/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchRewardsData() {
      if (status !== 'authenticated') return;
      
      try {
        // Fetch user's reward points and tiers
        const [pointsRes, tiersRes] = await Promise.all([
          fetch('/api/users/me/points'),
          fetch('/api/rewards/tiers')
        ]);
        
        const pointsData = await pointsRes.json();
        const tiersData = await tiersRes.json();
        
        if (pointsData.success) {
          setUserPoints(pointsData.data.points);
        }
        
        if (tiersData.success) {
          setRewardTiers(tiersData.data);
          // Determine current tier based on points
          const tier = tiersData.data.find((t: RewardTier) => 
            userPoints >= t.minPoints && (!t.maxPoints || userPoints <= t.maxPoints)
          );
          setCurrentTier(tier || tiersData.data[0]);
        }
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRewardsData();
  }, [status, userPoints]);

  const formatPoints = (points: number) => points.toLocaleString();

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-2xl md:text-3xl font-bold">My Rewards</h1>
          <p className="text-gray-300 mt-2">Track your loyalty points and rewards</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Points Summary Card */}
        <div className="bg-gradient-to-r from-primary via-rose-gold to-burgundy rounded-xl shadow-soft p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">Your Reward Points</h2>
              <p className="text-white/80 mb-4">
                Earn {500 - (userPoints % 500)} more points to unlock your next reward!
              </p>
              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <div 
                  className="bg-white rounded-full h-3" 
                  style={{ width: `${(userPoints % 500) / 5}%` }}
                ></div>
              </div>
              <p className="text-sm">Next milestone: {(Math.floor(userPoints / 500) + 1) * 500} points</p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-5xl font-bold mb-2">{formatPoints(userPoints)}</div>
              <p className="text-white/80">Total Points</p>
            </div>
          </div>
        </div>

        {/* Current Tier */}
        {currentTier && (
          <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Current Tier: {currentTier.name}</h3>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: currentTier.color }}
              >
                {currentTier.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-gray-600 mb-2">
                  You're in the <span className="font-semibold text-gray-900">{currentTier.name}</span> tier
                </p>
                <p className="text-sm text-gray-500">
                  Points multiplier: {currentTier.pointsMultiplier}x
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next tier at</p>
                <p className="font-semibold text-gray-900">
                  {currentTier.maxPoints ? `${currentTier.maxPoints + 1}+ points` : 'Maximum tier'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        {currentTier && (
          <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Your Tier Benefits</h3>
            <ul className="space-y-3">
              {currentTier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All Tiers */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-6">All Reward Tiers</h3>
          <div className="space-y-4">
            {rewardTiers.map((tier) => (
              <div 
                key={tier.id} 
                className={`p-4 rounded-lg border-2 ${
                  currentTier?.id === tier.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: tier.color }}
                  >
                    {tier.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{tier.name} Tier</h4>
                    <p className="text-sm text-gray-600">
                      {tier.minPoints} {tier.maxPoints ? `- ${tier.maxPoints} points` : '+ points'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tier.pointsMultiplier}x points multiplier
                    </p>
                  </div>
                  {currentTier?.id === tier.id && (
                    <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      Current Tier
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Earn more points by shopping and engaging with us!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/shop" 
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-center"
            >
              Start Shopping
            </Link>
            <Link 
              href="/account/orders" 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
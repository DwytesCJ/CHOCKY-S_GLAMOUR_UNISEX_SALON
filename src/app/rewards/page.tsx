"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface RewardTier {
  id: string;
  name: string;
  slug: string;
  minPoints: number;
  maxPoints: number | null;
  pointsMultiplier: number;
  benefits: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
}

interface UserRewards {
  totalPoints: number;
  currentTier: {
    id: string;
    name: string;
    slug: string;
    pointsMultiplier: number;
    benefits: string | null;
    color: string | null;
    icon: string | null;
  } | null;
  nextTier: {
    id: string;
    name: string;
    minPoints: number;
  } | null;
  pointsToNextTier: number;
  history: {
    id: string;
    points: number;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
}

const fallbackTiers = [
  {
    name: 'Bronze',
    spend: 'Free to Join',
    points: '1 point per UGX 1,000',
    color: 'from-amber-600 to-amber-800',
    benefits: [
      'Earn points on every purchase',
      'Birthday reward (500 points)',
      'Member-only promotions',
      'Early access to sales',
    ],
  },
  {
    name: 'Silver',
    spend: 'UGX 500,000+ annually',
    points: '1.25 points per UGX 1,000',
    color: 'from-gray-400 to-gray-600',
    benefits: [
      'All Bronze benefits',
      'Free shipping on orders over UGX 100,000',
      'Exclusive Silver member events',
      'Priority customer support',
      'Birthday reward (1,000 points)',
    ],
  },
  {
    name: 'Gold',
    spend: 'UGX 1,500,000+ annually',
    points: '1.5 points per UGX 1,000',
    color: 'from-yellow-500 to-yellow-700',
    benefits: [
      'All Silver benefits',
      'Free shipping on all orders',
      'VIP access to new products',
      'Complimentary gift wrapping',
      'Birthday reward (2,000 points)',
      'Exclusive Gold member gifts',
      'Personal beauty consultant',
    ],
  },
];

const earnMethods = [
  { icon: 'fa-shopping-bag', title: 'Shop', description: 'Earn points on every purchase', points: '1-1.5 pts/UGX 1,000' },
  { icon: 'fa-user-plus', title: 'Sign Up', description: 'Join the rewards program', points: '500 points' },
  { icon: 'fa-birthday-cake', title: 'Birthday', description: 'Celebrate with bonus points', points: '500-2,000 points' },
  { icon: 'fa-share-alt', title: 'Refer Friends', description: 'Share the love', points: '1,000 points' },
  { icon: 'fa-star', title: 'Write Reviews', description: 'Share your experience', points: '50 points' },
  { icon: 'fa-calendar-check', title: 'Salon Visits', description: 'Book appointments', points: '2x points' },
];

const redeemOptions = [
  { points: 100, value: 'UGX 5,000 off', numericValue: 5000 },
  { points: 250, value: 'UGX 15,000 off', numericValue: 15000 },
  { points: 500, value: 'UGX 35,000 off', numericValue: 35000 },
  { points: 1000, value: 'UGX 80,000 off', numericValue: 80000 },
  { points: 2000, value: 'UGX 180,000 off', numericValue: 180000 },
  { points: 5000, value: 'UGX 500,000 off', numericValue: 500000 },
];

const tierColors: Record<string, string> = {
  'bronze': 'from-amber-600 to-amber-800',
  'silver': 'from-gray-400 to-gray-600',
  'gold': 'from-yellow-500 to-yellow-700',
  'platinum': 'from-purple-500 to-purple-700',
  'diamond': 'from-cyan-400 to-cyan-600',
};

function parseBenefits(benefits: string | null): string[] {
  if (!benefits) return [];
  try {
    const parsed = JSON.parse(benefits);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return benefits.split('\n').map(b => b.trim()).filter(Boolean);
  }
}

function formatSpend(minPoints: number): string {
  if (minPoints === 0) return 'Free to Join';
  const spend = minPoints * 1000;
  if (spend >= 1000000) return `UGX ${(spend / 1000000).toFixed(1)}M+ annually`;
  return `UGX ${(spend / 1000).toFixed(0)}K+ annually`;
}

function formatPointsRate(multiplier: number): string {
  return `${multiplier} point${multiplier !== 1 ? 's' : ''} per UGX 1,000`;
}

function formatPrice(price: number): string {
  return `UGX ${Number(price).toLocaleString()}`;
}

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const [tiers, setTiers] = useState<typeof fallbackTiers>(fallbackTiers);
  const [loading, setLoading] = useState(true);
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<{ code: string; discount: number; newBalance: number } | null>(null);
  const [redeemError, setRedeemError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'redeem'>('overview');

  // Fetch tiers
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await fetch('/api/rewards/tiers');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const mappedTiers = data.data.map((tier: RewardTier) => ({
            name: tier.name,
            spend: formatSpend(tier.minPoints),
            points: formatPointsRate(Number(tier.pointsMultiplier)),
            color: tierColors[tier.slug.toLowerCase()] || 'from-gray-500 to-gray-700',
            benefits: parseBenefits(tier.benefits),
          }));
          setTiers(mappedTiers);
        }
      } catch (error) {
        console.error('Error fetching reward tiers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  // Fetch user rewards when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    setUserLoading(true);
    const fetchUserRewards = async () => {
      try {
        const res = await fetch('/api/rewards/points');
        const data = await res.json();
        if (data.success) {
          setUserRewards(data.data);
        }
      } catch (error) {
        console.error('Error fetching user rewards:', error);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUserRewards();
  }, [isLoggedIn]);

  const handleRedeem = async (pointsToRedeem: number) => {
    setRedeemLoading(true);
    setRedeemError('');
    setRedeemSuccess(null);
    try {
      const res = await fetch('/api/rewards/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsToRedeem }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemSuccess({
          code: data.data.redemptionCode,
          discount: data.data.discountValue,
          newBalance: data.data.newBalance,
        });
        // Refresh user rewards
        setUserRewards(prev => prev ? { ...prev, totalPoints: data.data.newBalance } : prev);
      } else {
        setRedeemError(data.error || 'Failed to redeem points');
      }
    } catch {
      setRedeemError('Network error. Please try again.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const pointTypeLabel = (type: string) => {
    switch (type) {
      case 'EARNED_PURCHASE': return 'Purchase';
      case 'EARNED_REVIEW': return 'Review';
      case 'EARNED_REFERRAL': return 'Referral';
      case 'EARNED_SIGNUP': return 'Sign Up Bonus';
      case 'EARNED_BIRTHDAY': return 'Birthday Bonus';
      case 'REDEEMED': return 'Redeemed';
      case 'EXPIRED': return 'Expired';
      case 'ADJUSTED': return 'Adjustment';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-rose-gold to-burgundy"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm mb-4">
            <i className="fas fa-crown mr-2"></i>
            Loyalty Program
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            CHOCKY&apos;S Glamour Rewards
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join our exclusive rewards program and earn points on every purchase. 
            Unlock amazing benefits and save on your favorite beauty products.
          </p>
          
          {isLoggedIn ? (
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              {userLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-8 bg-white/20 rounded w-1/2 mx-auto"></div>
                  <div className="h-12 bg-white/20 rounded w-2/3 mx-auto"></div>
                </div>
              ) : userRewards ? (
                <>
                  <p className="text-white/70 text-sm mb-1">Welcome back, {session?.user?.name || 'Member'}!</p>
                  <div className="text-5xl font-bold text-white mb-2">{userRewards.totalPoints.toLocaleString()}</div>
                  <p className="text-white/70 text-sm mb-3">reward points</p>
                  {userRewards.currentTier && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${tierColors[userRewards.currentTier.slug] || 'from-amber-600 to-amber-800'} text-white`}>
                      <i className="fas fa-crown mr-1"></i>{userRewards.currentTier.name} Member
                    </span>
                  )}
                  {userRewards.nextTier && userRewards.pointsToNextTier > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>{userRewards.currentTier?.name}</span>
                        <span>{userRewards.nextTier.name}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${Math.min(100, ((userRewards.totalPoints - (userRewards.currentTier ? 0 : 0)) / userRewards.nextTier.minPoints) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-white/60 text-xs mt-1">{userRewards.pointsToNextTier.toLocaleString()} points to {userRewards.nextTier.name}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-white/70">Start shopping to earn your first points!</p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/account/register" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4">
                Join Now - It&apos;s Free
              </Link>
              <Link href="/account/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* User Dashboard (logged in only) */}
      {isLoggedIn && userRewards && (
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-4 justify-center mb-6">
              {(['overview', 'history', 'redeem'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'overview' && <><i className="fas fa-chart-pie mr-2"></i>Overview</>}
                  {tab === 'history' && <><i className="fas fa-history mr-2"></i>History</>}
                  {tab === 'redeem' && <><i className="fas fa-gift mr-2"></i>Redeem</>}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-cream rounded-xl p-6 text-center">
                  <i className="fas fa-coins text-3xl text-primary mb-3"></i>
                  <div className="text-3xl font-bold text-gray-900">{userRewards.totalPoints.toLocaleString()}</div>
                  <p className="text-gray-500 text-sm">Available Points</p>
                </div>
                <div className="bg-cream rounded-xl p-6 text-center">
                  <i className="fas fa-crown text-3xl text-primary mb-3"></i>
                  <div className="text-3xl font-bold text-gray-900">{userRewards.currentTier?.name || 'Bronze'}</div>
                  <p className="text-gray-500 text-sm">Current Tier</p>
                </div>
                <div className="bg-cream rounded-xl p-6 text-center">
                  <i className="fas fa-tag text-3xl text-primary mb-3"></i>
                  <div className="text-3xl font-bold text-gray-900">{formatPrice(Math.floor(userRewards.totalPoints / 100) * 5000)}</div>
                  <p className="text-gray-500 text-sm">Redeemable Value</p>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="max-w-3xl mx-auto">
                {userRewards.history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-history text-4xl mb-4 opacity-30"></i>
                    <p>No reward history yet. Start shopping to earn points!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userRewards.history.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-cream rounded-xl p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <i className={`fas ${item.points > 0 ? 'fa-plus' : 'fa-minus'}`}></i>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.description || pointTypeLabel(item.type)}</p>
                            <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.points > 0 ? '+' : ''}{item.points.toLocaleString()} pts
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Redeem Tab */}
            {activeTab === 'redeem' && (
              <div className="max-w-3xl mx-auto">
                {redeemSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                    <p className="font-semibold text-green-800">Points Redeemed Successfully!</p>
                    <p className="text-green-700 text-sm mt-1">Discount: {formatPrice(redeemSuccess.discount)}</p>
                    <p className="text-green-700 text-sm">Redemption Code: <span className="font-mono font-bold">{redeemSuccess.code}</span></p>
                    <p className="text-green-600 text-xs mt-2">Use this code at checkout. New balance: {redeemSuccess.newBalance.toLocaleString()} points</p>
                  </div>
                )}
                {redeemError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-red-700">{redeemError}</p>
                  </div>
                )}
                <p className="text-center text-gray-600 mb-6">
                  Your balance: <span className="font-bold text-primary">{userRewards.totalPoints.toLocaleString()} points</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {redeemOptions.map((option) => {
                    const canRedeem = userRewards.totalPoints >= option.points;
                    return (
                      <div key={option.points} className={`rounded-xl p-4 text-center border-2 transition-all ${canRedeem ? 'bg-white border-primary/20 hover:border-primary hover:shadow-lg' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                        <div className="text-2xl font-bold text-primary mb-1">{option.points.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mb-2">points</div>
                        <div className="text-sm font-medium mb-3">{option.value}</div>
                        <button
                          onClick={() => handleRedeem(option.points)}
                          disabled={!canRedeem || redeemLoading}
                          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                            canRedeem ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {redeemLoading ? 'Processing...' : canRedeem ? 'Redeem' : 'Not Enough'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">HOW IT WORKS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
              Start Earning in 3 Easy Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, icon: 'fa-user-plus', title: 'Join', desc: 'Sign up for free and become a member' },
              { step: 2, icon: 'fa-shopping-bag', title: 'Shop', desc: 'Earn points on every purchase you make' },
              { step: 3, icon: 'fa-gift', title: 'Redeem', desc: 'Use your points for discounts and rewards' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <i className={`fas ${item.icon} text-2xl text-primary`}></i>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">MEMBERSHIP TIERS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Unlock More Benefits as You Shop
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The more you shop, the more you earn. Climb the tiers and enjoy exclusive perks.
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-24 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier, index) => {
                const isCurrentTier = isLoggedIn && userRewards?.currentTier?.name === tier.name;
                return (
                  <div key={tier.name} className={`bg-white rounded-2xl overflow-hidden shadow-lg ${isCurrentTier ? 'ring-2 ring-primary ring-offset-2' : index === tiers.length - 1 ? 'ring-2 ring-primary' : ''}`}>
                    {isCurrentTier && (
                      <div className="bg-primary text-white text-center py-1 text-xs font-semibold">
                        <i className="fas fa-check-circle mr-1"></i>YOUR CURRENT TIER
                      </div>
                    )}
                    <div className={`bg-gradient-to-r ${tier.color} p-6 text-white text-center`}>
                      <h3 className="font-heading text-2xl font-bold mb-1">{tier.name}</h3>
                      <p className="text-white/80 text-sm">{tier.spend}</p>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-6 pb-6 border-b border-gray-100">
                        <span className="text-3xl font-bold text-primary">{tier.points}</span>
                      </div>
                      <ul className="space-y-3">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <i className="fas fa-check-circle text-green-500 mt-1"></i>
                            <span className="text-gray-600 text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Ways to Earn */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">EARN POINTS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Multiple Ways to Earn
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {earnMethods.map((method, index) => (
              <div key={index} className="bg-cream rounded-xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${method.icon} text-primary`}></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                  <span className="text-primary font-medium text-sm">{method.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redeem Points (public view) */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">REDEEM REWARDS</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">
              Turn Points into Savings
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Redeem your points for discounts on your purchases. The more points you have, the bigger the savings!
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {redeemOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-xl p-4 text-center shadow-soft hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-primary mb-1">{option.points.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mb-2">points</div>
                <div className="text-sm font-medium">{option.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-medium">FAQ</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">
              Common Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'How do I join the rewards program?', a: "Simply create an account on our website or in-store. Membership is free and you'll start earning points immediately." },
              { q: 'Do my points expire?', a: 'Points are valid for 12 months from the date they were earned. Make at least one purchase within 12 months to keep your points active.' },
              { q: 'Can I use points and a promo code together?', a: 'Yes! You can combine points redemption with most promotional codes for maximum savings.' },
              { q: 'How do I check my points balance?', a: 'Log into your account and visit the Rewards section to see your current balance, tier status, and transaction history.' },
            ].map((faq, index) => (
              <div key={index} className="bg-cream rounded-xl p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 bg-gradient-to-r from-primary via-rose-gold to-burgundy">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Start Earning Today
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join CHOCKY&apos;S Glamour Rewards and start earning points on every purchase.
              It&apos;s free to join and the benefits are endless!
            </p>
            <Link href="/account/register" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4">
              <i className="fas fa-crown mr-2"></i>
              Join Now - It&apos;s Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

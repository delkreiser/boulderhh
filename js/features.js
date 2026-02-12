export const getFeatureTier = (deal) => {
    if (!deal.feature_tier) return null;

    // Check if expired
    if (deal.feature_expiration) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expirationDate = new Date(deal.feature_expiration);
        expirationDate.setHours(23, 59, 59, 999);

        if (today > expirationDate) return null;
    }

    // Valid tiers: basic, hot, premium
    const tier = deal.feature_tier.toLowerCase();
    if (['basic', 'hot', 'premium'].includes(tier)) {
        return tier;
    }

    return null;
};

export const isFeaturedActive = (deal) => {
    return getFeatureTier(deal) !== null;
};

export const getTierStyles = (venueTier) => {
    if (!venueTier) return { border: '', badge: null, style: {} };

    switch (venueTier) {
        case 'premium':
            return {
                border: 'ring-4 ring-yellow-500 ring-opacity-100 shadow-2xl',
                badge: {
                    text: '⭐ PREMIUM',
                    className: 'bg-gradient-to-r from-yellow-300 to-yellow-600 text-yellow-950'
                },
                style: {}
            };
        case 'hot':
            return {
                border: 'animate-pulseGlowRed',
                badge: {
                    text: '🔥 HOT DEAL!',
                    className: 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                },
                style: {
                    border: '4px solid #ef4444'
                }
            };
        case 'basic':
        default:
            return {
                border: 'animate-pulseGlow',
                badge: {
                    text: '⭐ Featured',
                    className: 'bg-gradient-to-r from-[#FFD703] to-[#FFC700] text-yellow-950'
                },
                style: {
                    border: '4px solid #FFD703'
                }
            };
    }
};

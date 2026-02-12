import { getFeatureTier } from './features.js';

export function getStartTime(timeStr) {
    if (!timeStr) return 9999;

    const match = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm|AM|PM)?/);
    if (!match) return 9999;

    let hour = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3] ? match[3].toLowerCase() : 'pm';

    if (period === 'pm' && hour !== 12) {
        hour += 12;
    } else if (period === 'am' && hour === 12) {
        hour = 0;
    }

    return hour * 60 + minutes;
}

export function filterDeals(deals, selectedDay, dealType, drinkFilter, lateNightOnly) {
    return deals.filter(deal => {
        const dealDay = deal.day.toLowerCase();
        const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(selectedDay.toLowerCase());
        const isWeekend = ['saturday', 'sunday'].includes(selectedDay.toLowerCase());

        const matchesDay =
            deal.day === selectedDay ||
            dealDay === 'daily' ||
            (dealDay === 'weekdays' && isWeekday) ||
            (dealDay === 'weekends' && isWeekend);

        if (!matchesDay) return false;

        if (dealType !== 'all' && deal.deal_type !== dealType) return false;

        if (lateNightOnly) {
            const timeStr = deal.time || '';

            const hasPM = timeStr.toLowerCase().includes('pm');
            const hasAM = timeStr.toLowerCase().includes('am');

            if (hasAM && !hasPM) {
                return false;
            }

            if (!hasPM) {
                return false;
            }

            const timeMatch = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm|AM|PM)?[\s\-–to]+(\d+)?(?::(\d+))?\s*(am|pm|AM|PM)?/i);

            if (timeMatch) {
                let startHour = parseInt(timeMatch[1]);
                let startMin = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
                const startPeriod = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
                const endHour = timeMatch[4] ? parseInt(timeMatch[4]) : null;
                const endMin = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
                const endPeriod = timeMatch[6] ? timeMatch[6].toLowerCase() : null;

                if (startPeriod === 'pm' && startHour !== 12) {
                    startHour += 12;
                } else if (startPeriod === 'am' && startHour === 12) {
                    startHour = 0;
                }

                if (startPeriod === 'am') {
                    return false;
                }

                let endHour24 = endHour;
                if (endHour24) {
                    if (endPeriod === 'pm' && endHour24 !== 12) {
                        endHour24 += 12;
                    } else if (endPeriod === 'am' && endHour24 === 12) {
                        endHour24 = 0;
                    }
                }

                const startTime = startHour * 60 + startMin;
                const lateNightStart = 20 * 60;

                const startsLateNight = startTime >= lateNightStart;

                let endsLateNight = false;
                if (endHour24) {
                    const endTime = endHour24 * 60 + endMin;
                    endsLateNight = endTime > lateNightStart;
                }

                if (!startsLateNight && !endsLateNight) {
                    return false;
                }
            } else {
                return false;
            }
        }

        if (dealType === 'Drink' && drinkFilter !== 'all') {
            if (drinkFilter === 'beer' && !deal.beer) return false;
            if (drinkFilter === 'wine' && !deal.wine) return false;
            if (drinkFilter === 'cocktail' && !deal.cocktail) return false;
            if (drinkFilter === 'margarita' && !deal.margarita) return false;
        }

        return true;
    });
}

export function groupByVenue(filteredDeals) {
    const venueMap = new Map();
    filteredDeals.forEach(deal => {
        const key = `${deal.venue}|${deal.city}`;
        if (!venueMap.has(key)) {
            venueMap.set(key, {
                venue: deal.venue,
                city: deal.city,
                deals: []
            });
        }
        venueMap.get(key).deals.push(deal);
    });
    return Array.from(venueMap.values());
}

export function sortVenueDeals(displayDeals) {
    displayDeals.forEach(venueGroup => {
        venueGroup.deals.sort((a, b) => {
            return getStartTime(a.time) - getStartTime(b.time);
        });
    });
}

export function sortVenues(displayDeals) {
    return displayDeals.sort((a, b) => {
        const aTime = a.deals.length > 0 ? getStartTime(a.deals[0].time) : 9999;
        const bTime = b.deals.length > 0 ? getStartTime(b.deals[0].time) : 9999;

        const aTier = a.deals.map(deal => getFeatureTier(deal)).find(tier => tier !== null);
        const bTier = b.deals.map(deal => getFeatureTier(deal)).find(tier => tier !== null);

        const aFeaturePriority = a.deals.map(deal => deal.feature_priority || 999).reduce((min, val) => Math.min(min, val), 999);
        const bFeaturePriority = b.deals.map(deal => deal.feature_priority || 999).reduce((min, val) => Math.min(min, val), 999);

        const tierPriority = {
            'premium': 1,
            'hot': 2,
            'basic': 3,
            null: 4
        };

        const aTierPriority = tierPriority[aTier] || tierPriority[null];
        const bTierPriority = tierPriority[bTier] || tierPriority[null];

        if (aTierPriority !== bTierPriority) {
            return aTierPriority - bTierPriority;
        }

        if (aFeaturePriority !== bFeaturePriority) {
            return aFeaturePriority - bFeaturePriority;
        }

        return aTime - bTime;
    });
}

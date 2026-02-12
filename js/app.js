const React = await import('https://esm.sh/react@18.2.0');
const ReactDOM = await import('https://esm.sh/react-dom@18.2.0/client');
const { default: htm } = await import('https://esm.sh/htm@3.1.1');

const html = htm.bind(React.createElement);
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

import { SHEET_CSV_URL, DAYS, STARFIELD_ACTIVE_STYLE, STARFIELD_INACTIVE_STYLE } from './constants.js';
import { parseCSV } from './csvParser.js';
import { getFeatureTier, getTierStyles } from './features.js';
import { filterDeals, groupByVenue, sortVenueDeals, sortVenues } from './filters.js';

function scrollToDeals() {
    const dealsSection = document.getElementById('deals-section');
    if (dealsSection) {
        const yOffset = -140;
        const y = dealsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

function getCardHeaderClass(lateNightOnly, isAllView, dealType, drinkFilter, firstDealType) {
    if (lateNightOnly) return 'bg-gradient-to-r from-indigo-900 to-purple-900';
    if (isAllView) return 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800';
    if (firstDealType === 'Food') return 'bg-gradient-to-br from-green-500 via-green-600 to-green-800';
    if (dealType === 'Drink' && drinkFilter === 'beer') return 'bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400';
    if (dealType === 'Drink' && drinkFilter === 'wine') return 'bg-gradient-to-r from-blue-600 via-blue-500 to-red-400';
    if (dealType === 'Drink' && drinkFilter === 'cocktail') return 'bg-gradient-to-r from-blue-600 via-blue-500 to-pink-400';
    if (dealType === 'Drink' && drinkFilter === 'margarita') return 'bg-gradient-to-r from-blue-600 via-blue-500 to-lime-400';
    return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800';
}

function getNeighborhood(deal) {
    if (deal.nobo) return 'NoBo';
    if (deal.sobo) return 'SoBo';
    if (deal.downtown) return 'Downtown';
    if (deal.lesbo) return 'LesBo';
    if (deal.thehill) return 'The Hill';
    if (deal.central) return 'Central';
    return '';
}

function App() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedDay, setSelectedDay] = useState('');
    const [dealType, setDealType] = useState('all');
    const [drinkFilter, setDrinkFilter] = useState('all');
    const [lateNightOnly, setLateNightOnly] = useState(false);
    const [showStickyFilters, setShowStickyFilters] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        const today = new Date().getDay();
        setSelectedDay(DAYS[today]);
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleScroll = () => setShowStickyFilters(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showContactModal) setShowContactModal(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showContactModal]);

    useEffect(() => {
        if (showStickyFilters) scrollToDeals();
    }, [selectedDay, dealType, drinkFilter, lateNightOnly]);

    useEffect(() => {
        async function fetchDeals() {
            try {
                const response = await fetch(SHEET_CSV_URL);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const csvText = await response.text();
                setDeals(parseCSV(csvText));
                setLoading(false);
            } catch (err) {
                console.error('Error fetching deals:', err);
                setError('Failed to load deals. Please refresh the page.');
                setLoading(false);
            }
        }
        fetchDeals();
    }, []);

    const filteredDeals = filterDeals(deals, selectedDay, dealType, drinkFilter, lateNightOnly);
    const showAdCard = deals.some(deal => deal.show_ad_card);
    const showCoffeeCard = deals.some(deal => deal.coffee);
    const displayDeals = groupByVenue(filteredDeals);
    sortVenueDeals(displayDeals);
    const sortedDisplayDeals = sortVenues(displayDeals);

    // Shared class builders
    const dayBtnClass = (day, base) =>
        `${base} rounded-lg font-medium transition-all backdrop-blur-md border ${
            selectedDay === day
                ? 'bg-white/80 text-slate-900 shadow-lg border-white/60 scale-105'
                : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
        }`;

    const stickyDayBtnClass = (day) =>
        `px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all backdrop-blur-md border ${
            selectedDay === day
                ? 'bg-white/80 text-slate-900 shadow-lg border-white/60 scale-105'
                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
        }`;

    const lateNightBtnClass = (base) =>
        `${base} rounded-lg font-medium transition-all relative overflow-hidden ${
            lateNightOnly
                ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg scale-105'
                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 hover:from-indigo-800 hover:to-purple-800 hover:text-white'
        }`;

    const dealTypeBtnClass = (type, activeClass) =>
        `rounded-lg font-medium transition-all backdrop-blur-md border ${
            dealType === type ? activeClass : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
        }`;

    const drinkBtnClass = (filter, activeColor) =>
        `px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
            drinkFilter === filter
                ? `bg-${activeColor}-600 text-white shadow-lg border-${activeColor}-400`
                : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
        }`;

    if (loading) {
        return html`<div class="flex items-center justify-center min-h-screen">
            <div class="text-xl text-gray-600">Loading happy hours...</div>
        </div>`;
    }

    if (error) {
        return html`<div class="flex items-center justify-center min-h-screen">
            <div class="text-xl text-red-600">${error}</div>
        </div>`;
    }

    return html`<div class="min-h-screen bg-gradient-to-b from-indigo-300 to-indigo-500">
      <div class="container mx-auto px-4 py-8 max-w-6xl">

        ${!showContactModal && html`
            <button onClick=${() => setShowContactModal(true)}
                class="fixed bottom-6 right-6 z-40 bg-white/80 backdrop-blur-md border border-white/40 text-indigo-900 px-4 py-3 md:px-5 md:py-3 rounded-full shadow-2xl hover:bg-white/95 hover:scale-105 transition-all font-semibold flex items-center gap-2"
                style=${{ minWidth: '60px' }}>
                <span class="text-xl">💬</span>
                <span class="hidden md:inline">Feedback</span>
            </button>
        `}

        ${showContactModal && html`
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick=${(e) => { if (e.target === e.currentTarget) setShowContactModal(false); }}>
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
                    onClick=${(e) => e.stopPropagation()}>
                    <button onClick=${() => setShowContactModal(false)}
                        class="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors font-bold text-xl"
                        aria-label="Close">✕</button>
                    <iframe src="https://form.jotform.com/260067743464056"
                        width="100%" height="600" frameBorder="0" scrolling="yes"
                        class="w-full h-[600px]" />
                </div>
            </div>
        `}

        ${showStickyFilters && !showContactModal && html`
            <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 animate-fadeIn">
                <div class="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-4">
                    <div class="flex flex-wrap gap-1.5 justify-center mb-2">
                        ${DAYS.map(day => html`
                            <button key=${day} onClick=${() => setSelectedDay(day)}
                                class=${stickyDayBtnClass(day)}>
                                <span class="md:hidden">${day.substring(0, 3)}</span>
                                <span class="hidden md:inline">${day}</span>
                            </button>
                        `)}
                        <button onClick=${() => setLateNightOnly(!lateNightOnly)}
                            class=${`px-3 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all relative overflow-hidden ${
                                lateNightOnly
                                    ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:from-indigo-800 hover:to-purple-800 hover:text-white'
                            }`}
                            style=${lateNightOnly ? STARFIELD_ACTIVE_STYLE : STARFIELD_INACTIVE_STYLE}>
                            🌛 Late Night
                        </button>
                        <button onClick=${() => { setDealType('all'); setDrinkFilter('all'); }}
                            class=${`md:hidden px-3 py-1.5 ${dealTypeBtnClass('all', 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white shadow-lg border-purple-400')}`}>All</button>
                        <button onClick=${() => { setDealType('Food'); setDrinkFilter('all'); }}
                            class=${`md:hidden px-3 py-1.5 ${dealTypeBtnClass('Food', 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white shadow-lg border-green-400')}`}>🍕</button>
                        <button onClick=${() => setDealType('Drink')}
                            class=${`md:hidden px-3 py-1.5 ${dealTypeBtnClass('Drink', 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-lg border-blue-400')}`}>🍺</button>
                    </div>
                    <div class="hidden md:flex gap-2 justify-center">
                        <button onClick=${() => { setDealType('all'); setDrinkFilter('all'); }}
                            class=${`px-6 py-2 ${dealTypeBtnClass('all', 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white shadow-lg border-purple-400')}`}>All</button>
                        <button onClick=${() => { setDealType('Food'); setDrinkFilter('all'); }}
                            class=${`px-6 py-2 ${dealTypeBtnClass('Food', 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white shadow-lg border-green-400')}`}>🍕 Food</button>
                        <button onClick=${() => setDealType('Drink')}
                            class=${`px-6 py-2 ${dealTypeBtnClass('Drink', 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-lg border-blue-400')}`}>🍺 Drink</button>
                    </div>
                </div>
            </div>
        `}

        <div class="relative mb-8">
            <img src="/images/boulderhh.jpg" alt="Boulder Happy Hours" class="w-full h-64 object-cover rounded-lg shadow-xl md:hidden" />
            <img src="/images/boulderhappyhour-1200x320.jpg" alt="Boulder Happy Hours" class="hidden md:block w-full h-80 object-cover rounded-lg shadow-xl" />
            <div class="absolute bottom-6 left-0 right-0 flex justify-center">
                <button onClick=${scrollToDeals}
                    class="px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer hover:bg-white/40">
                    <span class="text-white text-lg drop-shadow-lg">🎉 </span>
                    <span class="font-bold text-amber-400 text-lg drop-shadow-lg">${sortedDisplayDeals.length}</span>
                    <span class="text-white text-lg drop-shadow-lg">${` deal${sortedDisplayDeals.length !== 1 ? 's' : ''} today!`}</span>
                </button>
            </div>
        </div>

        <div class="mb-6">
            <div class="flex gap-1.5 mb-1.5 md:hidden">
                ${['Sunday', 'Monday', 'Tuesday', 'Wednesday'].map(day => html`
                    <button key=${day} onClick=${() => setSelectedDay(day)}
                        class=${dayBtnClass(day, 'flex-1 px-2 py-1.5 text-sm')}>${day}</button>
                `)}
            </div>
            <div class="flex gap-1.5 md:hidden">
                ${['Thursday', 'Friday', 'Saturday'].map(day => html`
                    <button key=${day} onClick=${() => setSelectedDay(day)}
                        class=${dayBtnClass(day, 'flex-1 px-2 py-1.5 text-sm')}>${day}</button>
                `)}
                <button onClick=${() => setLateNightOnly(!lateNightOnly)}
                    class=${lateNightBtnClass('px-3 py-1.5 text-sm whitespace-nowrap')}
                    style=${lateNightOnly ? STARFIELD_ACTIVE_STYLE : STARFIELD_INACTIVE_STYLE}>
                    🌛 Late Night
                </button>
            </div>
            <div class="hidden md:flex flex-wrap gap-2 justify-center">
                ${DAYS.map(day => html`
                    <button key=${day} onClick=${() => setSelectedDay(day)}
                        class=${dayBtnClass(day, 'px-4 py-2 text-base')}>${day}</button>
                `)}
                <button onClick=${() => setLateNightOnly(!lateNightOnly)}
                    class=${lateNightBtnClass('px-6 py-2 text-base')}
                    style=${lateNightOnly ? STARFIELD_ACTIVE_STYLE : STARFIELD_INACTIVE_STYLE}>
                    🌛 Late Night
                </button>
            </div>
        </div>

        <div class="mb-6">
            <div class="flex gap-2 md:justify-center">
                <button onClick=${() => { setDealType('all'); setDrinkFilter('all'); }}
                    class=${`w-20 md:w-auto md:flex-none px-6 py-2 ${dealTypeBtnClass('all', 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white shadow-lg border-purple-400')}`}>All</button>
                <button onClick=${() => { setDealType('Food'); setDrinkFilter('all'); }}
                    class=${`flex-1 md:flex-none md:w-auto px-6 py-2 ${dealTypeBtnClass('Food', 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white shadow-lg border-green-400')}`}>🍕 Food</button>
                <button onClick=${() => setDealType('Drink')}
                    class=${`flex-1 md:flex-none md:w-auto px-6 py-2 ${dealTypeBtnClass('Drink', 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-lg border-blue-400')}`}>🍺 Drink</button>
            </div>
        </div>

        ${dealType === 'Drink' && html`
            <div class="mb-6">
                <div class="flex flex-wrap gap-2 justify-center">
                    <button onClick=${() => setDrinkFilter('all')} class=${drinkBtnClass('all', 'blue')}>All Drinks</button>
                    <button onClick=${() => setDrinkFilter('beer')} class=${drinkBtnClass('beer', 'yellow')}>🍺 Beer</button>
                    <button onClick=${() => setDrinkFilter('wine')} class=${drinkBtnClass('wine', 'red')}>🍷 Wine</button>
                    <button onClick=${() => setDrinkFilter('cocktail')} class=${drinkBtnClass('cocktail', 'pink')}>🍸 Cocktails</button>
                    <button onClick=${() => setDrinkFilter('margarita')} class=${drinkBtnClass('margarita', 'lime')}>🍹 Margaritas</button>
                </div>
            </div>
        `}

        <div id="deals-section">
            ${sortedDisplayDeals.length === 0
                ? html`<div class="text-center py-12 bg-white rounded-lg shadow">
                    <p class="text-xl text-gray-500">No deals found for this selection</p>
                    <p class="text-gray-400 mt-2">Try selecting a different day or filter</p>
                </div>`
                : html`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${sortedDisplayDeals.flatMap((venueGroup, index) => {
                        const isAllView = dealType === 'all';
                        const venueTier = venueGroup.deals
                            .map(deal => getFeatureTier(deal))
                            .filter(tier => tier !== null)
                            .sort((a, b) => ({ 'premium': 1, 'hot': 2, 'basic': 3 })[a] - ({ 'premium': 1, 'hot': 2, 'basic': 3 })[b])[0] || null;
                        const hasFeaturedDeal = venueTier !== null;
                        const tierStyles = getTierStyles(venueTier);
                        const neighborhood = getNeighborhood(venueGroup.deals[0]);
                        const headerClass = getCardHeaderClass(lateNightOnly, isAllView, dealType, drinkFilter, venueGroup.deals[0].deal_type);

                        const venueCard = html`
                            <div key=${index}
                                class=${`bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative ${tierStyles.border}`}
                                style=${tierStyles.style || {}}>

                                ${hasFeaturedDeal && tierStyles.badge && html`
                                    <div class=${`absolute top-3 right-3 z-10 ${tierStyles.badge.className} px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`}>
                                        ${tierStyles.badge.text}
                                    </div>
                                `}

                                <div class=${`p-4 ${headerClass}`}
                                    style=${lateNightOnly ? STARFIELD_ACTIVE_STYLE : {}}>
                                    <h3 class="text-xl font-bold text-white mb-1">${venueGroup.venue}</h3>
                                    <p class="text-purple-50 text-sm">
                                        📍 ${venueGroup.city}${neighborhood ? ` • 🏡 ${neighborhood}` : ''}
                                    </p>
                                </div>

                                <div class="p-4">
                                    ${venueGroup.deals.map((deal, dealIndex) => html`
                                        <div key=${dealIndex} class=${dealIndex > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
                                            <div class="mb-2">
                                                <span class=${`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                    deal.deal_type === 'Food' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>${deal.deal_type === 'Food' ? '🍕 Food' : '🍺 Drink'}</span>
                                            </div>
                                            <p class="text-gray-600 text-sm font-medium mb-2">⏰ ${deal.time}</p>
                                            <p class="text-gray-700 text-base leading-relaxed mb-3 font-medium">${deal.deal_description}</p>
                                            ${deal.url && html`
                                                <a href=${deal.url} target="_blank" rel="noopener noreferrer"
                                                    class="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-3 hover:underline">
                                                    View Full Menu<span>→</span>
                                                </a>
                                            `}
                                            <div class="flex gap-2 flex-wrap">
                                                ${(deal.taco_tuesday && (deal.day === 'Tuesday' || selectedDay === 'Tuesday')) && html`
                                                    <span class="px-3 py-1 bg-gradient-to-r from-orange-400 to-yellow-400 text-orange-900 rounded-full text-sm font-bold shadow-md">🌮 Taco Tuesday!</span>
                                                `}
                                                ${deal.latenight && html`
                                                    <span class="px-2 py-1 bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 rounded text-xs font-medium">🌛 Late Night</span>
                                                `}
                                                ${deal.deal_type === 'Drink' && deal.beer && html`<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">🍺 Beer</span>`}
                                                ${deal.deal_type === 'Drink' && deal.wine && html`<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">🍷 Wine</span>`}
                                                ${deal.deal_type === 'Drink' && deal.cocktail && html`<span class="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs font-medium">🍸 Cocktail</span>`}
                                                ${deal.deal_type === 'Drink' && deal.margarita && html`<span class="px-2 py-1 bg-lime-100 text-lime-800 rounded text-xs font-medium">🍹 Margarita</span>`}
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            </div>
                        `;

                        const promoCard = html`
                            <a key=${`promo-${index}`} href="https://boulderevents.app" target="_blank" rel="noopener noreferrer"
                                class="block bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden"
                                style=${{ minHeight: '400px', textDecoration: 'none' }}>
                                <div class="p-10 text-center text-white flex flex-col items-center justify-center h-full gap-4">
                                    <div class="text-6xl">🎉</div>
                                    <h3 class="text-2xl font-bold">Looking for things to do in Boulder?</h3>
                                    <p class="text-xl font-semibold">Boulder Events Calendar</p>
                                    <p class="text-base opacity-90">Discover live music, entertainment, and events in Boulder County</p>
                                    <span class="inline-block bg-white text-purple-700 px-6 py-3 rounded-full font-semibold mt-4 hover:bg-purple-50 transition-colors">Check It Out →</span>
                                </div>
                            </a>
                        `;

                        const adCard = showAdCard && index === 2 && html`
                            <a key="ad-card" href="/advertise.html"
                                class="block bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden"
                                style=${{ minHeight: '180px', textDecoration: 'none' }}>
                                <div class="p-8 text-center text-white flex flex-col items-center justify-center h-full gap-4">
                                    <h3 class="text-2xl font-bold">Advertise Your Happy Hour</h3>
                                    <span class="inline-block bg-white text-amber-700 px-6 py-2.5 rounded-full font-semibold hover:bg-amber-50 transition-colors">Learn More →</span>
                                </div>
                            </a>
                        `;

                        const coffeeCard = showCoffeeCard && index === 3 && html`
                            <a key="coffee-card" href="https://buymeacoffee.com/boulderevents" target="_blank" rel="noopener noreferrer"
                                class="block bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-500 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden"
                                style=${{ minHeight: '180px', textDecoration: 'none' }}>
                                <div class="p-8 text-center text-white flex flex-col items-center justify-center h-full gap-3">
                                    <h3 class="text-2xl font-bold">Love the project?</h3>
                                    <span class="inline-flex items-center gap-2 bg-white text-orange-700 px-6 py-2.5 rounded-full font-semibold hover:bg-orange-50 transition-colors">
                                        <span>☕</span><span>Buy me a coffee</span>
                                    </span>
                                    <p class="text-sm text-white/90 mt-1">Free! No ads.<br />Help keep it alive! 💛</p>
                                </div>
                            </a>
                        `;

                        const cards = [venueCard];
                        if (adCard) cards.push(adCard);
                        if (coffeeCard) cards.push(coffeeCard);
                        if ((index + 1) % 6 === 0) cards.push(promoCard);
                        return cards;
                    })}
                </div>`
            }
        </div>

        <div class="text-center py-12 mt-8">
            <p class="text-white text-lg mb-4">Know a happy hour we're missing?</p>
            <button onClick=${() => setShowContactModal(true)}
                class="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md hover:bg-white text-indigo-900 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <span>📝</span><span>Submit a Happy Hour</span>
            </button>
        </div>

      </div>
    </div>`;
}

const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);

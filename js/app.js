const React = await import('https://esm.sh/react@18.2.0');
const ReactDOM = await import('https://esm.sh/react-dom@18.2.0/client');

const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

import { SHEET_CSV_URL, DAYS, STARFIELD_ACTIVE_STYLE, STARFIELD_INACTIVE_STYLE } from './constants.js';
import { parseCSV } from './csvParser.js';
import { getFeatureTier, getTierStyles } from './features.js';
import { filterDeals, groupByVenue, sortVenueDeals, sortVenues } from './filters.js';

function App() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedDay, setSelectedDay] = useState('');
    const [dealType, setDealType] = useState('all');
    const [drinkFilter, setDrinkFilter] = useState('all');
    const [lateNightOnly, setLateNightOnly] = useState(false);
    const [showStickyFilters, setShowStickyFilters] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Get current day
    useEffect(() => {
        const today = new Date().getDay();
        setSelectedDay(DAYS[today]);
        window.scrollTo(0, 0);
    }, []);

    // Detect scroll to show/hide sticky filters
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyFilters(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showContactModal) {
                setShowContactModal(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showContactModal]);

    // Scroll to deals section when filters change (if sticky menu is visible)
    useEffect(() => {
        if (showStickyFilters) {
            const dealsSection = document.getElementById('deals-section');
            if (dealsSection) {
                const yOffset = -140;
                const y = dealsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    }, [selectedDay, dealType, drinkFilter, lateNightOnly]);

    // Fetch data
    useEffect(() => {
        async function fetchDeals() {
            try {
                const response = await fetch(SHEET_CSV_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvText = await response.text();
                const parsedDeals = parseCSV(csvText);
                setDeals(parsedDeals);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching deals:', err);
                setError('Failed to load deals. Please refresh the page.');
                setLoading(false);
            }
        }
        fetchDeals();
    }, []);

    // Filter deals
    const filteredDeals = filterDeals(deals, selectedDay, dealType, drinkFilter, lateNightOnly);

    // Check if special cards should be shown
    const showAdCard = deals.some(deal => deal.show_ad_card);
    const showCoffeeCard = deals.some(deal => deal.coffee);

    // Group, sort within venues, sort venues
    const displayDeals = groupByVenue(filteredDeals);
    sortVenueDeals(displayDeals);
    const sortedDisplayDeals = sortVenues(displayDeals);

    if (loading) {
        return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
            React.createElement('div', { className: 'text-xl text-gray-600' }, 'Loading happy hours...')
        );
    }

    if (error) {
        return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
            React.createElement('div', { className: 'text-xl text-red-600' }, error)
        );
    }

    return React.createElement('div', { className: 'min-h-screen bg-gradient-to-b from-indigo-300 to-indigo-500' },
        React.createElement('div', { className: 'container mx-auto px-4 py-8 max-w-6xl' },

        // Floating Feedback Button (hide when modal is open)
        !showContactModal && React.createElement('button', {
            onClick: () => setShowContactModal(true),
            className: 'fixed bottom-6 right-6 z-40 bg-white/80 backdrop-blur-md border border-white/40 text-indigo-900 px-4 py-3 md:px-5 md:py-3 rounded-full shadow-2xl hover:bg-white/95 hover:scale-105 transition-all font-semibold flex items-center gap-2',
            style: { minWidth: '60px' }
        },
            React.createElement('span', { className: 'text-xl' }, '💬'),
            React.createElement('span', { className: 'hidden md:inline' }, 'Feedback')
        ),

        // Contact Modal
        showContactModal && React.createElement('div', {
            className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
            onClick: (e) => {
                if (e.target === e.currentTarget) setShowContactModal(false);
            }
        },
            React.createElement('div', {
                className: 'bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative',
                onClick: (e) => e.stopPropagation()
            },
                React.createElement('button', {
                    onClick: () => setShowContactModal(false),
                    className: 'absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors font-bold text-xl',
                    'aria-label': 'Close'
                }, '✕'),
                React.createElement('iframe', {
                    src: 'https://form.jotform.com/260067743464056',
                    width: '100%',
                    height: '600',
                    frameBorder: '0',
                    scrolling: 'yes',
                    className: 'w-full h-[600px]'
                })
            )
        ),

        // Sticky Floating Glass Filter Menu
        showStickyFilters && !showContactModal && React.createElement('div', {
            className: 'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 animate-fadeIn'
        },
            React.createElement('div', {
                className: 'bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-4'
            },
                // Day buttons
                React.createElement('div', { className: 'flex flex-wrap gap-1.5 justify-center mb-2' },
                    ...DAYS.map(day =>
                        React.createElement('button', {
                            key: day,
                            onClick: () => setSelectedDay(day),
                            className: `px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all backdrop-blur-md border ${
                                selectedDay === day
                                    ? 'bg-white/80 text-slate-900 shadow-lg border-white/60 scale-105'
                                    : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                            }`
                        },
                            React.createElement('span', { className: 'md:hidden' }, day.substring(0, 3)),
                            React.createElement('span', { className: 'hidden md:inline' }, day)
                        )
                    ),
                    // Late Night
                    React.createElement('button', {
                        onClick: () => setLateNightOnly(!lateNightOnly),
                        className: `px-3 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all relative overflow-hidden ${
                            lateNightOnly
                                ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-300 hover:from-indigo-800 hover:to-purple-800 hover:text-white'
                        }`,
                        style: lateNightOnly ? STARFIELD_ACTIVE_STYLE : STARFIELD_INACTIVE_STYLE
                    }, '🌛 Late Night'),
                    // Deal type buttons - mobile only
                    React.createElement('button', {
                        onClick: () => { setDealType('all'); setDrinkFilter('all'); },
                        className: `md:hidden px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
                            dealType === 'all'
                                ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white shadow-lg border-purple-400'
                                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                        }`
                    }, 'All'),
                    React.createElement('button', {
                        onClick: () => { setDealType('Food'); setDrinkFilter('all'); },
                        className: `md:hidden px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
                            dealType === 'Food'
                                ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white shadow-lg border-green-400'
                                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                        }`
                    }, '🍕'),
                    React.createElement('button', {
                        onClick: () => setDealType('Drink'),
                        className: `md:hidden px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
                            dealType === 'Drink'
                                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-lg border-blue-400'
                                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                        }`
                    }, '🍺')
                ),
                // Deal type buttons - desktop/tablet only
                React.createElement('div', { className: 'hidden md:flex gap-2 justify-center' },
                    React.createElement('button', {
                        onClick: () => { setDealType('all'); setDrinkFilter('all'); },
                        className: `px-6 py-2 rounded-lg text-base font-medium transition-all backdrop-blur-md border ${
                            dealType === 'all'
                                ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white shadow-lg border-purple-400'
                                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                        }`
                    }, 'All'),
                    React.createElement('button', {
                        onClick: () => { setDealType('Food'); setDrinkFilter('all'); },
                        className: `px-6 py-2 rounded-lg text-base font-medium transition-all backdrop-blur-md border ${
                            dealType === 'Food'
                                ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white shadow-lg border-green-400'
                                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                        }`
                    }, '🍕 Food'),
                    React.createElement('button', {
                        onClick: () => setDealType('Drink'),
                        className: `px-6 py-2 rounded-lg text-base font-medium transition-all backdrop-blur-md border ${
                            dealType === 'Drink'
                                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-lg border-blue-400'
                                : 'bg-indigo-600/60 text-white border-indigo-400/40 hover:bg-indigo-500/60'
                        }`
                    }, '🍺 Drink')
                )
            )
        ),

        // Header - Image with overlay button
        React.createElement('div', { className: 'relative mb-8' },
            React.createElement('img', {
                src: '/images/boulderhh.jpg',
                alt: 'Boulder Happy Hours',
                className: 'w-full h-64 object-cover rounded-lg shadow-xl md:hidden'
            }),
            React.createElement('img', {
                src: '/images/boulderhappyhour-1200x320.jpg',
                alt: 'Boulder Happy Hours',
                className: 'hidden md:block w-full h-80 object-cover rounded-lg shadow-xl'
            }),
            React.createElement('div', { className: 'absolute bottom-6 left-0 right-0 flex justify-center' },
                React.createElement('button', {
                    onClick: () => {
                        const dealsSection = document.getElementById('deals-section');
                        if (dealsSection) {
                            const yOffset = -140;
                            const y = dealsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                    },
                    className: 'px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer hover:bg-white/40'
                },
                    React.createElement('span', { className: 'text-white text-lg drop-shadow-lg' }, '🎉 '),
                    React.createElement('span', { className: 'font-bold text-amber-400 text-lg drop-shadow-lg' }, sortedDisplayDeals.length),
                    React.createElement('span', { className: 'text-white text-lg drop-shadow-lg' }, ` deal${sortedDisplayDeals.length !== 1 ? 's' : ''} today!`)
                )
            )
        ),

        // Day Filter
        React.createElement('div', { className: 'mb-6' },
            // Row 1: Sunday - Wednesday (mobile only)
            React.createElement('div', { className: 'flex gap-1.5 mb-1.5 md:hidden' },
                ...['Sunday', 'Monday', 'Tuesday', 'Wednesday'].map(day =>
                    React.createElement('button', {
                        key: day,
                        onClick: () => setSelectedDay(day),
                        className: `flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
                            selectedDay === day
                                ? 'bg-white/80 text-slate-900 shadow-lg border-white/60 scale-105'
                                : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                        }`
                    }, day)
                )
            ),
            // Row 2: Thursday - Saturday + Late Night (mobile only)
            React.createElement('div', { className: 'flex gap-1.5 md:hidden' },
                ...['Thursday', 'Friday', 'Saturday'].map(day =>
                    React.createElement('button', {
                        key: day,
                        onClick: () => setSelectedDay(day),
                        className: `flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${
                            selectedDay === day
                                ? 'bg-white/80 text-slate-900 shadow-lg border-white/60 scale-105'
                                : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                        }`
                    }, day)
                ),
                React.createElement('button', {
                    onClick: () => setLateNightOnly(!lateNightOnly),
                    className: `px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden whitespace-nowrap ${
                        lateNightOnly
                            ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg scale-105'
                            : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 hover:from-indigo-800 hover:to-purple-800 hover:text-white'
                    }`,
                    style: lateNightOnly ? STARFIELD_ACTIVE_STYLE : STARFIELD_INACTIVE_STYLE
                }, '🌛 Late Night')
            ),
            // Desktop: All days + Late Night in one centered row
            React.createElement('div', { className: 'hidden md:flex flex-wrap gap-2 justify-center' },
                ...DAYS.map(day =>
                    React.createElement('button', {
                        key: day,
                        onClick: () => setSelectedDay(day),
                        className: `px-4 py-2 rounded-lg text-base font-medium transition-all backdrop-blur-md border ${
                            selectedDay === day
                                ? 'bg-white/80 text-slate-900 shadow-lg border-white/60 scale-105'
                                : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                        }`
                    }, day)
                ),
                React.createElement('button', {
                    onClick: () => setLateNightOnly(!lateNightOnly),
                    className: `px-6 py-2 rounded-lg text-base font-medium transition-all relative overflow-hidden ${
                        lateNightOnly
                            ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg scale-105'
                            : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 hover:from-indigo-800 hover:to-purple-800 hover:text-white'
                    }`,
                    style: lateNightOnly ? STARFIELD_ACTIVE_STYLE : STARFIELD_INACTIVE_STYLE
                }, '🌛 Late Night')
            )
        ),

        // Deal Type Toggle
        React.createElement('div', { className: 'mb-6' },
            React.createElement('div', { className: 'flex gap-2 md:justify-center' },
                React.createElement('button', {
                    onClick: () => { setDealType('all'); setDrinkFilter('all'); },
                    className: `w-20 md:w-auto md:flex-none px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        dealType === 'all'
                            ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 text-white shadow-lg border-purple-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, 'All'),
                React.createElement('button', {
                    onClick: () => { setDealType('Food'); setDrinkFilter('all'); },
                    className: `flex-1 md:flex-none md:w-auto px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        dealType === 'Food'
                            ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 text-white shadow-lg border-green-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, '🍕 Food'),
                React.createElement('button', {
                    onClick: () => setDealType('Drink'),
                    className: `flex-1 md:flex-none md:w-auto px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        dealType === 'Drink'
                            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 text-white shadow-lg border-blue-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, '🍺 Drink')
            )
        ),
        dealType === 'Drink' && React.createElement('div', { className: 'mb-6' },
            React.createElement('div', { className: 'flex flex-wrap gap-2 justify-center' },
                React.createElement('button', {
                    onClick: () => setDrinkFilter('all'),
                    className: `px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        drinkFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-lg border-blue-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, 'All Drinks'),
                React.createElement('button', {
                    onClick: () => setDrinkFilter('beer'),
                    className: `px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        drinkFilter === 'beer'
                            ? 'bg-yellow-600 text-white shadow-lg border-yellow-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, '🍺 Beer'),
                React.createElement('button', {
                    onClick: () => setDrinkFilter('wine'),
                    className: `px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        drinkFilter === 'wine'
                            ? 'bg-red-600 text-white shadow-lg border-red-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, '🍷 Wine'),
                React.createElement('button', {
                    onClick: () => setDrinkFilter('cocktail'),
                    className: `px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        drinkFilter === 'cocktail'
                            ? 'bg-pink-600 text-white shadow-lg border-pink-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, '🍸 Cocktails'),
                React.createElement('button', {
                    onClick: () => setDrinkFilter('margarita'),
                    className: `px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-md border ${
                        drinkFilter === 'margarita'
                            ? 'bg-lime-600 text-white shadow-lg border-lime-400'
                            : 'bg-white/30 text-white border-white/20 hover:bg-white/40'
                    }`
                }, '🍹 Margaritas')
            )
        ),

        // Deals Grid
        React.createElement('div', { id: 'deals-section' },
        sortedDisplayDeals.length === 0
            ? React.createElement('div', { className: 'text-center py-12 bg-white rounded-lg shadow' },
                React.createElement('p', { className: 'text-xl text-gray-500' }, 'No deals found for this selection'),
                React.createElement('p', { className: 'text-gray-400 mt-2' }, 'Try selecting a different day or filter')
            )
            : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                ...sortedDisplayDeals.flatMap((venueGroup, index) => {
                    const isAllView = dealType === 'all';
                    const hasMultipleDeals = venueGroup.deals.length > 1;

                    // Get highest tier from venue's deals
                    const venueTier = venueGroup.deals
                        .map(deal => getFeatureTier(deal))
                        .filter(tier => tier !== null)
                        .sort((a, b) => {
                            const priority = { 'premium': 1, 'hot': 2, 'basic': 3 };
                            return priority[a] - priority[b];
                        })[0] || null;

                    const hasFeaturedDeal = venueTier !== null;
                    const tierStyles = getTierStyles(venueTier);

                    const venueCard = React.createElement('div', {
                        key: index,
                        className: `bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative ${tierStyles.border}`,
                        style: tierStyles.style || {}
                    },
                        // Featured Badge
                        hasFeaturedDeal && tierStyles.badge && React.createElement('div', {
                            className: `absolute top-3 right-3 z-10 ${tierStyles.badge.className} px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1`
                        }, tierStyles.badge.text),

                        // Card Header
                        React.createElement('div', {
                            className: `p-4 ${
                                lateNightOnly
                                    ? 'bg-gradient-to-r from-indigo-900 to-purple-900'
                                    : isAllView
                                        ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800'
                                        : venueGroup.deals[0].deal_type === 'Food'
                                            ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-800'
                                            : dealType === 'Drink' && drinkFilter === 'beer'
                                                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400'
                                                : dealType === 'Drink' && drinkFilter === 'wine'
                                                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-red-400'
                                                    : dealType === 'Drink' && drinkFilter === 'cocktail'
                                                        ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-pink-400'
                                                        : dealType === 'Drink' && drinkFilter === 'margarita'
                                                            ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-lime-400'
                                                            : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800'
                            }`,
                            style: lateNightOnly ? STARFIELD_ACTIVE_STYLE : {}
                        },
                            React.createElement('h3', { className: 'text-xl font-bold text-white mb-1' },
                                venueGroup.venue
                            ),
                            React.createElement('p', { className: 'text-purple-50 text-sm' },
                                (() => {
                                    const deal = venueGroup.deals[0];
                                    let neighborhood = '';
                                    if (deal.nobo) neighborhood = 'NoBo';
                                    else if (deal.sobo) neighborhood = 'SoBo';
                                    else if (deal.downtown) neighborhood = 'Downtown';
                                    else if (deal.lesbo) neighborhood = 'LesBo';
                                    else if (deal.thehill) neighborhood = 'The Hill';
                                    else if (deal.central) neighborhood = 'Central';

                                    return `📍 ${venueGroup.city}${neighborhood ? ` • 🏡 ${neighborhood}` : ''}`;
                                })()
                            )
                        ),

                        // Card Body - Loop through all deals for this venue
                        React.createElement('div', { className: 'p-4' },
                            ...venueGroup.deals.map((deal, dealIndex) =>
                                React.createElement('div', {
                                    key: dealIndex,
                                    className: dealIndex > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''
                                },
                                    React.createElement('div', { className: 'mb-2' },
                                        React.createElement('span', {
                                            className: `inline-block px-2 py-1 rounded text-xs font-medium ${
                                                deal.deal_type === 'Food'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`
                                        }, deal.deal_type === 'Food' ? '🍕 Food' : '🍺 Drink')
                                    ),
                                    React.createElement('p', { className: 'text-gray-600 text-sm font-medium mb-2' },
                                        `⏰ ${deal.time}`
                                    ),
                                    React.createElement('p', { className: 'text-gray-700 text-base leading-relaxed mb-3 font-medium' }, deal.deal_description),
                                    deal.url && React.createElement('a', {
                                        href: deal.url,
                                        target: '_blank',
                                        rel: 'noopener noreferrer',
                                        className: 'inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-3 hover:underline'
                                    },
                                        'View Full Menu',
                                        React.createElement('span', null, '→')
                                    ),
                                    React.createElement('div', { className: 'flex gap-2 flex-wrap' },
                                        (deal.taco_tuesday && (deal.day === 'Tuesday' || selectedDay === 'Tuesday')) && React.createElement('span', {
                                            className: 'px-3 py-1 bg-gradient-to-r from-orange-400 to-yellow-400 text-orange-900 rounded-full text-sm font-bold shadow-md'
                                        }, '🌮 Taco Tuesday!'),
                                        deal.latenight && React.createElement('span', {
                                            className: 'px-2 py-1 bg-gradient-to-r from-purple-100 to-indigo-200 text-purple-800 rounded text-xs font-medium'
                                        }, '🌛 Late Night'),
                                        deal.deal_type === 'Drink' && deal.beer && React.createElement('span', { className: 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium' }, '🍺 Beer'),
                                        deal.deal_type === 'Drink' && deal.wine && React.createElement('span', { className: 'px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium' }, '🍷 Wine'),
                                        deal.deal_type === 'Drink' && deal.cocktail && React.createElement('span', { className: 'px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs font-medium' }, '🍸 Cocktail'),
                                        deal.deal_type === 'Drink' && deal.margarita && React.createElement('span', { className: 'px-2 py-1 bg-lime-100 text-lime-800 rounded text-xs font-medium' }, '🍹 Margarita')
                                    )
                                )
                            )
                        )
                    );

                    // Create promo card for Boulder Events
                    const promoCard = React.createElement('a', {
                        key: `promo-${index}`,
                        href: 'https://boulderevents.app',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'block bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden',
                        style: { minHeight: '400px', textDecoration: 'none' }
                    },
                        React.createElement('div', {
                            className: 'p-10 text-center text-white flex flex-col items-center justify-center h-full gap-4'
                        },
                            React.createElement('div', { className: 'text-6xl' }, '🎉'),
                            React.createElement('h3', { className: 'text-2xl font-bold' }, 'Looking for things to do in Boulder?'),
                            React.createElement('p', { className: 'text-xl font-semibold' }, 'Boulder Events Calendar'),
                            React.createElement('p', { className: 'text-base opacity-90' }, 'Discover live music, entertainment, and events in Boulder County'),
                            React.createElement('span', {
                                className: 'inline-block bg-white text-purple-700 px-6 py-3 rounded-full font-semibold mt-4 hover:bg-purple-50 transition-colors'
                            }, 'Check It Out →')
                        )
                    );

                    // Create ad card for advertising
                    const adCard = showAdCard && index === 2 && React.createElement('a', {
                        key: 'ad-card',
                        href: '/advertise.html',
                        className: 'block bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden',
                        style: { minHeight: '180px', textDecoration: 'none' }
                    },
                        React.createElement('div', {
                            className: 'p-8 text-center text-white flex flex-col items-center justify-center h-full gap-4'
                        },
                            React.createElement('h3', { className: 'text-2xl font-bold' }, 'Advertise Your Happy Hour'),
                            React.createElement('span', {
                                className: 'inline-block bg-white text-amber-700 px-6 py-2.5 rounded-full font-semibold hover:bg-amber-50 transition-colors'
                            }, 'Learn More →')
                        )
                    );

                    // Create coffee card
                    const coffeeCard = showCoffeeCard && index === 3 && React.createElement('a', {
                        key: 'coffee-card',
                        href: 'https://buymeacoffee.com/boulderevents',
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'block bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-500 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden',
                        style: { minHeight: '180px', textDecoration: 'none' }
                    },
                        React.createElement('div', {
                            className: 'p-8 text-center text-white flex flex-col items-center justify-center h-full gap-3'
                        },
                            React.createElement('h3', { className: 'text-2xl font-bold' }, 'Love the project?'),
                            React.createElement('span', {
                                className: 'inline-flex items-center gap-2 bg-white text-orange-700 px-6 py-2.5 rounded-full font-semibold hover:bg-orange-50 transition-colors'
                            },
                                React.createElement('span', null, '☕'),
                                React.createElement('span', null, 'Buy me a coffee')
                            ),
                            React.createElement('p', { className: 'text-sm text-white/90 mt-1' },
                                'Free! No ads.',
                                React.createElement('br'),
                                'Help keep it alive! 💛'
                            )
                        )
                    );

                    // Return venue card + special cards at specific positions
                    const cards = [venueCard];

                    if (adCard) {
                        cards.push(adCard);
                    }

                    if (coffeeCard) {
                        cards.push(coffeeCard);
                    }

                    if ((index + 1) % 6 === 0) {
                        cards.push(promoCard);
                    }

                    return cards;
                })
            )
        ),

        // Footer - Submit Happy Hour CTA
        React.createElement('div', { className: 'text-center py-12 mt-8' },
            React.createElement('p', { className: 'text-white text-lg mb-4' }, 'Know a happy hour we\'re missing?'),
            React.createElement('button', {
                onClick: () => setShowContactModal(true),
                className: 'inline-flex items-center gap-2 bg-white/80 backdrop-blur-md hover:bg-white text-indigo-900 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105'
            },
                React.createElement('span', null, '📝'),
                React.createElement('span', null, 'Submit a Happy Hour')
            )
        )
        ) // Close inner container div
    ); // Close outer wrapper div
}

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));

import React, { useState } from 'react';
import { Search, Tag, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { createFileRoute, Link } from '@tanstack/react-router';


export const Route = createFileRoute('/earn')({
    component: Earn,
});

function Earn() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { name: 'All', icon: '🌐' },
        { name: 'Food', icon: '🍔' },
        { name: 'Shopping', icon: '🛍️' },
        { name: 'Travel', icon: '✈️' },
        { name: 'Entertainment', icon: '🎬' },
    ];

    const merchants = [
        {
            id: 'starbucks',
            name: 'Starbucks',
            logo: '☕',
            cashback: '3.5%',
            category: 'Food',
            featured: true
        },
        {
            id: 'amazon',
            name: 'Amazon',
            logo: '📦',
            cashback: '2.5%',
            category: 'Shopping',
            featured: true
        },
        {
            id: 'spotify',
            name: 'Spotify',
            logo: '🎵',
            cashback: '4%',
            category: 'Entertainment',
            featured: false
        },
        {
            id: 'uber',
            name: 'Uber',
            logo: '🚗',
            cashback: '3%',
            category: 'Travel',
            featured: true
        },
        {
            id: 'netflix',
            name: 'Netflix',
            logo: '🎬',
            cashback: '4.5%',
            category: 'Entertainment',
            featured: false
        },
        {
            id: 'apple',
            name: 'Apple',
            logo: '🍎',
            cashback: '2%',
            category: 'Shopping',
            featured: false
        },
        {
            id: 'airbnb',
            name: 'Airbnb',
            logo: '🏠',
            cashback: '5%',
            category: 'Travel',
            featured: true
        },
        {
            id: 'mcdonalds',
            name: 'McDonald\'s',
            logo: '🍟',
            cashback: '3%',
            category: 'Food',
            featured: false
        }
    ];

    const filteredMerchants = searchQuery
        ? merchants.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : merchants;

    const featuredMerchants = merchants.filter(m => m.featured).slice(0, 3);

    return (
        <AppLayout title="Earn Cashback" showBackButton={true}>
            <div className="p-4 space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search stores"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="flex overflow-x-auto gap-3 py-2 no-scrollbar">
                    {categories.map((category) => (
                        <div key={category.name} className="flex flex-col items-center gap-1 min-w-16">
                            <div className="w-12 h-12 rounded-full bg-secondary/70 flex items-center justify-center text-xl">
                                {category.icon}
                            </div>
                            <span className="text-xs text-foreground">{category.name}</span>
                        </div>
                    ))}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-foreground">Featured Offers</h2>
                        <Link to="/" className="text-primary text-sm">See all</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {featuredMerchants.map((merchant) => (
                            <Link
                                key={merchant.id}
                                to="/merchant/$id" // Define the dynamic route path
                                params={{ id: merchant.id }} // Pass the dynamic parameter
                                className="acorn-card p-4 flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-secondary/70 flex items-center justify-center text-2xl">
                                        {merchant.logo}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{merchant.name}</p>
                                        <Badge variant="outline" className="mt-1 bg-secondary/50">
                                            {merchant.cashback} Cashback
                                        </Badge>
                                    </div>
                                </div>
                                <ChevronRight className="text-muted-foreground" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-foreground">All Merchants</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {filteredMerchants.map((merchant) => (
                            <Link key={merchant.id} to="/merchant/$id" params={{ id: merchant.id }} className="acorn-card text-center p-3">
                                <div className="w-12 h-12 rounded-full bg-secondary/70 flex items-center justify-center text-2xl mx-auto mb-2">
                                    {merchant.logo}
                                </div>
                                <p className="font-medium text-foreground text-sm">{merchant.name}</p>
                                <div className="flex items-center justify-center mt-1">
                                    <Tag className="w-3 h-3 text-primary mr-1" />
                                    <span className="text-xs text-primary">{merchant.cashback}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

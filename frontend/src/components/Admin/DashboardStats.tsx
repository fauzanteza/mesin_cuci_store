import React from 'react';
import { Card, LoadingSpinner } from '../UI';

interface StatCard {
    title: string;
    value: string | number;
    change: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo';
    prefix?: string;
    suffix?: string;
}

interface DashboardStatsProps {
    stats: StatCard[];
    loading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading = false }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-6">
                        <div className="flex justify-center items-center h-32">
                            <LoadingSpinner size="md" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            red: 'bg-red-100 text-red-600',
            orange: 'bg-orange-100 text-orange-600',
            indigo: 'bg-indigo-100 text-indigo-600'
        };
        return colors[color] || colors.blue;
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return 'fa-arrow-up';
        if (change < 0) return 'fa-arrow-down';
        return 'fa-minus';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                            <div className="flex items-baseline">
                                {stat.prefix && <span className="text-lg text-gray-700">{stat.prefix}</span>}
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {typeof stat.value === 'number'
                                        ? stat.value.toLocaleString('id-ID')
                                        : stat.value}
                                </h3>
                                {stat.suffix && <span className="text-lg text-gray-700 ml-1">{stat.suffix}</span>}
                            </div>

                            <div className={`flex items-center mt-3 ${getChangeColor(stat.change)}`}>
                                <i className={`fas ${getChangeIcon(stat.change)} text-xs mr-2`}></i>
                                <span className="text-sm font-medium">
                                    {Math.abs(stat.change)}%
                                    <span className="text-gray-600 ml-1">
                                        {stat.change > 0 ? 'increase' : stat.change < 0 ? 'decrease' : 'no change'} from last month
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses(stat.color)}`}>
                            <i className={`fas ${stat.icon} text-lg`}></i>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DashboardStats;

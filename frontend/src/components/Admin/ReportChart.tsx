import React from 'react';
import { Card, LoadingSpinner } from '../UI';

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
        fill?: boolean;
    }[];
}

interface ReportChartProps {
    title: string;
    type: 'line' | 'bar' | 'pie';
    data: ChartData;
    loading?: boolean;
    height?: number;
}

const ReportChart: React.FC<ReportChartProps> = ({
    title,
    type,
    data,
    loading = false,
    height = 300
}) => {
    // In real app, use Chart.js or Recharts
    // This is a mock chart for now

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg">
                            Monthly
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            Weekly
                        </button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                            Daily
                        </button>
                    </div>
                </div>
                <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
                    <LoadingSpinner size="lg" />
                </div>
            </Card>
        );
    }

    // Mock chart visualization
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    const chartHeight = height - 80; // Account for padding and labels

    return (
        <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 sm:mb-0">{title}</h3>
                <div className="flex gap-2">
                    {['Monthly', 'Weekly', 'Daily'].map((period) => (
                        <button
                            key={period}
                            className={`px-3 py-1 text-sm rounded-lg ${period === 'Monthly'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative" style={{ height: `${height}px` }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                        <div key={ratio} className="text-right pr-2">
                            {Math.round(maxValue * ratio).toLocaleString()}
                        </div>
                    ))}
                </div>

                {/* Chart area */}
                <div className="ml-12 h-full relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-t border-gray-200"></div>
                        ))}
                    </div>

                    {/* Chart bars/lines */}
                    <div className="absolute inset-0 flex items-end">
                        {data.labels.map((label, index) => {
                            const value = data.datasets[0]?.data[index] || 0;
                            const heightPercent = (value / maxValue) * 100;

                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center mx-1"
                                    style={{ height: '100%' }}
                                >
                                    {/* Bar/Lines */}
                                    <div
                                        className={`w-3/4 rounded-t-lg ${type === 'bar'
                                                ? 'bg-gradient-to-t from-blue-500 to-blue-300'
                                                : 'bg-gradient-to-t from-purple-500 to-purple-300'
                                            }`}
                                        style={{ height: `${heightPercent}%` }}
                                    >
                                        {/* Value label */}
                                        <div className="text-xs text-white text-center -mt-5">
                                            {value.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* X-axis label */}
                                    <div className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                                        {label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6">
                {data.datasets.map((dataset, index) => (
                    <div key={index} className="flex items-center">
                        <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                                backgroundColor: dataset.backgroundColor ||
                                    (index === 0 ? '#3B82F6' : '#8B5CF6')
                            }}
                        ></div>
                        <span className="text-sm text-gray-700">{dataset.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ReportChart;

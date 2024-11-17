import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MetricsData {
    searchSuccessRate: number;
    averageResponseTime: number;
    errorRate: number;
    totalSearches: number;
    activeUsers: number;
    searchTypeDistribution: {
        text: number;
        image: number;
        voice: number;
    };
    apiUsage: {
        grok: number;
        gemini: number;
        whisper: number;
    };
}

export const AnalyticsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [realtimeAlerts, setRealtimeAlerts] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');

    useEffect(() => {
        // Subscribe to real-time metrics updates
        const unsubscribe = analyticsService.subscribeToMetrics((newMetrics) => {
            setMetrics(newMetrics);
        });

        // Subscribe to real-time alerts
        const alertUnsubscribe = analyticsService.subscribeToAlerts((alert) => {
            setRealtimeAlerts(prev => [...prev, alert].slice(-5)); // Keep last 5 alerts
        });

        return () => {
            unsubscribe();
            alertUnsubscribe();
        };
    }, []);

    const responseTimeData: ChartData<'line'> = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
            {
                label: 'Average Response Time (ms)',
                data: metrics ? [metrics.averageResponseTime] : [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    const searchTypeData: ChartData<'bar'> = {
        labels: ['Text', 'Image', 'Voice'],
        datasets: [
            {
                label: 'Search Type Distribution',
                data: metrics ? [
                    metrics.searchTypeDistribution.text,
                    metrics.searchTypeDistribution.image,
                    metrics.searchTypeDistribution.voice
                ] : [],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ]
            }
        ]
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('hour')}
                        className={`px-3 py-1 rounded ${
                            timeRange === 'hour' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        Hour
                    </button>
                    <button
                        onClick={() => setTimeRange('day')}
                        className={`px-3 py-1 rounded ${
                            timeRange === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1 rounded ${
                            timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}
                    >
                        Week
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800">Success Rate</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {metrics?.searchSuccessRate.toFixed(1)}%
                    </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800">Active Users</h3>
                    <p className="text-3xl font-bold text-green-600">{metrics?.activeUsers}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800">Total Searches</h3>
                    <p className="text-3xl font-bold text-purple-600">{metrics?.totalSearches}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800">Error Rate</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {metrics?.errorRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Response Time Trend</h3>
                    <Line data={responseTimeData} />
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Search Type Distribution</h3>
                    <Bar data={searchTypeData} />
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Real-time Alerts</h3>
                <div className="space-y-2">
                    {realtimeAlerts.map((alert, index) => (
                        <div
                            key={index}
                            className="p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700"
                        >
                            {alert}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

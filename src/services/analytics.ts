import mixpanel from 'mixpanel-browser';
import { analytics } from '../config/firebase';

// Initialize Mixpanel with cookie settings
mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN || 'your-mixpanel-token', {
    cookie_domain: '.discoverdiani.com',
    cross_site_cookie: true,
    secure_cookie: true
});

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
    responseTime: 2000, // 2 seconds
    errorRate: 10, // 10%
    apiTimeout: 5000, // 5 seconds
};

export interface SearchAnalyticsData {
    query: string;
    searchType: 'text' | 'image' | 'voice';
    source: 'grok' | 'gemini' | 'whisper' | null;
    successful: boolean;
    responseTime: number;
    errorMessage?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    deviceInfo?: {
        type: string;
        browser: string;
        os: string;
    };
}

export interface UserEngagementData {
    eventName: string;
    properties?: Record<string, any>;
}

type MetricsSubscriber = (metrics: any) => void;
type AlertSubscriber = (alert: string) => void;

class AnalyticsService {
    private sessionStartTime: number;
    private searchCount: number = 0;
    private errorCount: number = 0;
    private responseTimeSamples: number[] = [];
    private metricsSubscribers: Set<MetricsSubscriber> = new Set();
    private alertSubscribers: Set<AlertSubscriber> = new Set();
    private searchHistory: SearchAnalyticsData[] = [];
    private performanceMetrics: {
        [key: string]: number[];
    } = {};

    constructor() {
        this.sessionStartTime = Date.now();
        this.trackPageView();
        this.setupSessionTracking();
        this.initializePerformanceMonitoring();
    }

    private initializePerformanceMonitoring() {
        // Monitor performance metrics every minute
        setInterval(() => {
            this.checkPerformanceThresholds();
        }, 60000);

        // Clear old metrics every hour
        setInterval(() => {
            this.clearOldMetrics();
        }, 3600000);
    }

    private checkPerformanceThresholds() {
        const avgResponseTime = this.calculateAverageResponseTime();
        const currentErrorRate = this.calculateErrorRate();

        if (avgResponseTime > PERFORMANCE_THRESHOLDS.responseTime) {
            this.notifySubscribers(`High response time detected: ${avgResponseTime.toFixed(0)}ms`);
        }

        if (currentErrorRate > PERFORMANCE_THRESHOLDS.errorRate) {
            this.notifySubscribers(`High error rate detected: ${currentErrorRate.toFixed(1)}%`);
        }
    }

    private calculateAverageResponseTime(): number {
        if (this.responseTimeSamples.length === 0) return 0;
        return this.responseTimeSamples.reduce((a, b) => a + b, 0) / this.responseTimeSamples.length;
    }

    private calculateErrorRate(): number {
        if (this.searchCount === 0) return 0;
        return (this.errorCount / this.searchCount) * 100;
    }

    private clearOldMetrics() {
        const oneHourAgo = Date.now() - 3600000;
        this.searchHistory = this.searchHistory.filter(
            search => search.timestamp > oneHourAgo
        );
        this.responseTimeSamples = this.responseTimeSamples.slice(-100); // Keep last 100 samples
    }

    public subscribeToMetrics(callback: MetricsSubscriber) {
        this.metricsSubscribers.add(callback);
        return () => this.metricsSubscribers.delete(callback);
    }

    public subscribeToAlerts(callback: AlertSubscriber) {
        this.alertSubscribers.add(callback);
        return () => this.alertSubscribers.delete(callback);
    }

    private notifySubscribers(alert: string) {
        this.alertSubscribers.forEach(subscriber => subscriber(alert));
    }

    private updateMetrics() {
        const metrics = {
            searchSuccessRate: ((this.searchCount - this.errorCount) / this.searchCount) * 100,
            averageResponseTime: this.calculateAverageResponseTime(),
            errorRate: this.calculateErrorRate(),
            totalSearches: this.searchCount,
            activeUsers: this.calculateActiveUsers(),
            searchTypeDistribution: this.calculateSearchTypeDistribution(),
            apiUsage: this.calculateAPIUsage(),
            performanceMetrics: this.performanceMetrics
        };

        this.metricsSubscribers.forEach(subscriber => subscriber(metrics));
    }

    private calculateActiveUsers(): number {
        const fiveMinutesAgo = Date.now() - 300000;
        return new Set(
            this.searchHistory
                .filter(search => search.timestamp > fiveMinutesAgo)
                .map(search => search.userId)
        ).size;
    }

    private calculateSearchTypeDistribution() {
        const distribution = {
            text: 0,
            image: 0,
            voice: 0
        };

        this.searchHistory.forEach(search => {
            distribution[search.searchType]++;
        });

        return distribution;
    }

    private calculateAPIUsage() {
        const usage = {
            grok: 0,
            gemini: 0,
            whisper: 0
        };

        this.searchHistory.forEach(search => {
            if (search.source) {
                usage[search.source]++;
            }
        });

        return usage;
    }

    public trackSearch(data: SearchAnalyticsData) {
        const enrichedData = {
            ...data,
            timestamp: Date.now(),
            userId: this.getUserId(),
            deviceInfo: this.getDeviceInfo()
        };

        this.searchHistory.push(enrichedData);
        this.responseTimeSamples.push(data.responseTime);
        this.searchCount++;
        if (!data.successful) this.errorCount++;

        const eventName = data.successful ? 'Search Success' : 'Search Failed';
        mixpanel.track(eventName, {
            ...enrichedData,
            sessionDuration: Date.now() - this.sessionStartTime
        });

        analytics.logEvent('search', {
            search_term: data.query,
            search_type: data.searchType,
            source: data.source,
            success: data.successful,
            response_time: data.responseTime
        });

        this.trackAPIUsage(enrichedData);
        this.updateMetrics();

        // Check for anomalies
        if (data.responseTime > PERFORMANCE_THRESHOLDS.responseTime) {
            this.notifySubscribers(`Slow response detected: ${data.responseTime}ms for ${data.searchType} search`);
        }
    }

    public trackUserEngagement(data: UserEngagementData) {
        mixpanel.track(data.eventName, {
            ...data.properties,
            timestamp: new Date().toISOString()
        });

        analytics.logEvent(data.eventName.toLowerCase().replace(/\s+/g, '_'), {
            ...data.properties,
            timestamp: new Date().toISOString()
        });
    }

    public trackAuth(eventName: 'sign_up' | 'login' | 'logout', method: 'email' | 'google') {
        mixpanel.track(eventName, {
            method,
            timestamp: new Date().toISOString()
        });

        analytics.logEvent(eventName, {
            method,
            timestamp: new Date().toISOString()
        });
    }

    public trackBusinessInteraction(eventName: string, businessId: string, businessName: string, action: string) {
        mixpanel.track(eventName, {
            business_id: businessId,
            business_name: businessName,
            action,
            timestamp: new Date().toISOString()
        });

        analytics.logEvent(eventName.toLowerCase().replace(/\s+/g, '_'), {
            business_id: businessId,
            business_name: businessName,
            action,
            timestamp: new Date().toISOString()
        });
    }

    private getUserId(): string {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    private getDeviceInfo() {
        const ua = navigator.userAgent;
        return {
            type: /mobile/i.test(ua) ? 'mobile' : 'desktop',
            browser: this.getBrowserInfo(ua),
            os: this.getOSInfo(ua)
        };
    }

    private getBrowserInfo(ua: string): string {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Other';
    }

    private getOSInfo(ua: string): string {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'MacOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Other';
    }

    private trackPageView() {
        mixpanel.track('Page View', {
            path: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    private setupSessionTracking() {
        // Track session duration
        window.addEventListener('beforeunload', () => {
            this.trackEvent('Session End', {
                duration: Date.now() - this.sessionStartTime,
                totalSearches: this.searchCount,
                errorRate: this.searchCount ? (this.errorCount / this.searchCount) : 0
            });
        });
    }

    public trackResultInteraction(action: 'view' | 'copy' | 'share', query: string) {
        mixpanel.track('Result Interaction', {
            action,
            query,
            timestamp: new Date().toISOString()
        });
    }

    public trackSuggestionUsage(suggestion: string, wasClicked: boolean) {
        mixpanel.track('Suggestion Usage', {
            suggestion,
            wasClicked,
            timestamp: new Date().toISOString()
        });
    }

    public trackPerformance() {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
            const tcpTime = perfData.connectEnd - perfData.connectStart;
            const serverTime = perfData.responseEnd - perfData.requestStart;

            mixpanel.track('Performance Metrics', {
                pageLoadTime,
                dnsTime,
                tcpTime,
                serverTime,
                timestamp: new Date().toISOString()
            });
        }
    }

    private trackAPIUsage(data: SearchAnalyticsData) {
        mixpanel.track('API Usage', {
            api: data.source,
            successful: data.successful,
            responseTime: data.responseTime,
            timestamp: new Date().toISOString()
        });
    }

    public generateCustomReport(timeRange: 'hour' | 'day' | 'week') {
        const now = Date.now();
        const ranges = {
            hour: now - 3600000,
            day: now - 86400000,
            week: now - 604800000
        };

        const startTime = ranges[timeRange];
        const relevantSearches = this.searchHistory.filter(
            search => search.timestamp >= startTime
        );

        return {
            summary: {
                totalSearches: relevantSearches.length,
                successRate: this.calculateSuccessRate(relevantSearches),
                averageResponseTime: this.calculateAverageResponseTimeForSearches(relevantSearches),
                uniqueUsers: this.calculateUniqueUsers(relevantSearches)
            },
            searchTypes: this.calculateSearchTypeDistributionForSearches(relevantSearches),
            apiUsage: this.calculateAPIUsageForSearches(relevantSearches),
            hourlyDistribution: this.calculateHourlyDistribution(relevantSearches),
            topQueries: this.calculateTopQueries(relevantSearches),
            errorAnalysis: this.analyzeErrors(relevantSearches)
        };
    }

    private calculateSuccessRate(searches: SearchAnalyticsData[]): number {
        if (searches.length === 0) return 0;
        const successful = searches.filter(s => s.successful).length;
        return (successful / searches.length) * 100;
    }

    private calculateAverageResponseTimeForSearches(searches: SearchAnalyticsData[]): number {
        if (searches.length === 0) return 0;
        return searches.reduce((acc, s) => acc + s.responseTime, 0) / searches.length;
    }

    private calculateUniqueUsers(searches: SearchAnalyticsData[]): number {
        return new Set(searches.map(s => s.userId)).size;
    }

    private calculateHourlyDistribution(searches: SearchAnalyticsData[]) {
        const distribution: number[] = new Array(24).fill(0);
        searches.forEach(search => {
            const hour = new Date(search.timestamp).getHours();
            distribution[hour]++;
        });
        return distribution;
    }

    private calculateTopQueries(searches: SearchAnalyticsData[]) {
        const queryCounts = new Map<string, number>();
        searches.forEach(search => {
            const count = queryCounts.get(search.query) || 0;
            queryCounts.set(search.query, count + 1);
        });

        return Array.from(queryCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));
    }

    private analyzeErrors(searches: SearchAnalyticsData[]) {
        const errorSearches = searches.filter(s => !s.successful);
        const errorTypes = new Map<string, number>();

        errorSearches.forEach(search => {
            const errorType = search.errorMessage || 'Unknown Error';
            const count = errorTypes.get(errorType) || 0;
            errorTypes.set(errorType, count + 1);
        });

        return Array.from(errorTypes.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({ type, count }));
    }
}

export const analyticsService = new AnalyticsService();

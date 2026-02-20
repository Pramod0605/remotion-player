export type IssueLevel = 'error' | 'warning' | 'info';

export interface Issue {
    id: string;
    timestamp: string;
    level: IssueLevel;
    component: string;
    message: string;
    stack?: string;
    metadata?: Record<string, any>;
}

class IssueLogger {
    private issues: Issue[] = [];

    log(level: IssueLevel, component: string, message: string, metadata?: Record<string, any>) {
        const issue: Issue = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            metadata,
        };

        this.issues.push(issue);
        console.log(`[${level.toUpperCase()}] ${component}: ${message}`, metadata || '');

        // In a real app, we might send this to a telemetry endpoint
        // For this project, we'll store it in localStorage for retrieval by tests
        this.persist();
    }

    error(component: string, message: string, stack?: string, metadata?: Record<string, any>) {
        const issue: Issue = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            level: 'error',
            component,
            message,
            stack,
            metadata,
        };
        this.issues.push(issue);
        console.error(`[ERROR] ${component}: ${message}`, stack || '', metadata || '');
        this.persist();
    }

    private persist() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('remotion_player_issues', JSON.stringify(this.issues));
        }
    }

    getIssues() {
        return this.issues;
    }

    clear() {
        this.issues = [];
        this.persist();
    }
}

export const logger = new IssueLogger();

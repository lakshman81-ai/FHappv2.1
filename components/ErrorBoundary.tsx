
import React from 'react';

interface ErrorBoundaryProps {
    children?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(error: any): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Component crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center bg-red-50 rounded-xl border border-red-100 m-4">
                    <span className="material-icons text-red-400 text-4xl mb-2">error_outline</span>
                    <p className="text-red-700 font-medium">Something went wrong while displaying this section.</p>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-3 text-sm text-red-600 underline hover:text-red-800"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return (this as any).props.children;
    }
}

export default ErrorBoundary;

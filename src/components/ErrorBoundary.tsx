import React from 'react';

// Catches any crash inside the app and shows the error ON SCREEN instead of
// a blank black page. Essential on phones, where there is no console.

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
    declare readonly props: Readonly<Props>;
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('App crashed:', error, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: '#000000',
                    color: '#F7F5F1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    zIndex: 999999,
                }}
            >
                <h1 style={{ fontSize: '1.1rem', letterSpacing: '0.12em', fontWeight: 600 }}>
                    SOMETHING WENT WRONG
                </h1>
                <p style={{ marginTop: 12, fontSize: '0.75rem', color: '#A3A3A3', maxWidth: 320 }}>
                    Take a screenshot of this screen so the problem can be fixed.
                </p>
                <pre
                    style={{
                        marginTop: 16,
                        maxWidth: '100%',
                        maxHeight: '40vh',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.7rem',
                        backgroundColor: '#111111',
                        color: '#C49A6C',
                        padding: 12,
                        borderRadius: 8,
                        textAlign: 'left',
                    }}
                >
                    {String(this.state.error?.message || this.state.error)}
                </pre>
                <button
                    onClick={() => {
                        window.location.href = '/';
                    }}
                    style={{
                        marginTop: 24,
                        padding: '12px 28px',
                        borderRadius: 999,
                        backgroundColor: '#C49A6C',
                        color: '#000000',
                        fontSize: '0.65rem',
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                        border: 'none',
                    }}
                >
                    RELOAD
                </button>
            </div>
        );
    }
}

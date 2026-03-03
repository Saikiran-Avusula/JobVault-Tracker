import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null })
        window.location.href = '/'
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#020617]">
                    <div className="max-w-md w-full bg-white dark:bg-[#0c1020] rounded-[2.5rem] p-10 shadow-2xl border border-gray-200 dark:border-white/5 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-rose-500/10">
                            <AlertTriangle size={36} />
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Sync interrupted</h2>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                            A system error occurred while processing your data. Don't worry, your vault is safe.
                        </p>

                        <button
                            onClick={this.handleReset}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
                        >
                            <RefreshCw size={18} />
                            Reload Vault
                        </button>

                        {import.meta.env.DEV && (
                            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-left border border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Debug Info</p>
                                <p className="text-xs font-mono text-rose-500 break-words line-clamp-3">
                                    {this.state.error?.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

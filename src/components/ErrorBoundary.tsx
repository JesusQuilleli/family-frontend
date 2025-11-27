import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
   children: ReactNode;
}

interface State {
   hasError: boolean;
   error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
   public state: State = {
      hasError: false,
      error: null
   };

   public static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
   }

   public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error('Uncaught error:', error, errorInfo);
   }

   public render() {
      if (this.state.hasError) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
               <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h1>
                  <p className="text-gray-600 mb-6">
                     Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                  </p>
                  {this.state.error && (
                     <pre className="text-xs text-left bg-gray-100 p-2 rounded mb-4 overflow-auto max-h-32">
                        {this.state.error.toString()}
                     </pre>
                  )}
                  <button
                     onClick={() => window.location.reload()}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                     Recargar Página
                  </button>
               </div>
            </div>
         );
      }

      return this.props.children;
   }
}

export default ErrorBoundary;

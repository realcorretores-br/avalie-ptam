import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccessPopup() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status') || 'success';

    useEffect(() => {
        const notifyParent = (msg) => {
            // Support for Window Popup
            if (window.opener) {
                window.opener.postMessage(msg, window.location.origin);
            }
            // Support for Iframe Modal
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(msg, window.location.origin);
            }
        };

        if (status === 'success' || status === 'approved') {
            notifyParent({ type: 'PAYMENT_SUCCESS' });
        } else {
            notifyParent({ type: 'PAYMENT_FAILURE', status });
        }

        // Auto close logic
        setTimeout(() => {
            // If window popup
            if (window.opener) window.close();
            // If iframe, we can't close via script easily, but the parent might act on the message
        }, 1500);
    }, [status]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
                {status === 'success' || status === 'approved' ? (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h2>
                        <p className="text-gray-600 text-sm">Seus créditos já foram adicionados.</p>
                        <p className="text-xs text-gray-400 mt-4">Fechando janela...</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Algo deu errado</h2>
                        <p className="text-gray-600 text-sm">O pagamento não foi concluído.</p>
                        <p className="text-xs text-gray-400 mt-4">Fechando janela...</p>
                    </>
                )}
            </div>
        </div>
    );
}

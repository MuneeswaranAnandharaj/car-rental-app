import React, { useState, useEffect } from 'react';
import './PaymentModal.css';

const PAYMENT_STEPS = {
  VALIDATING: 'validating',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
};

const METHOD_CONFIG = {
  CREDIT_CARD: { icon: '\uD83D\uDCB3', name: 'Credit Card', color: '#2563eb' },
  DEBIT_CARD: { icon: '\uD83D\uDCB3', name: 'Debit Card', color: '#2563eb' },
  STRIPE: { icon: '\uD83D\uDCB3', name: 'Stripe', color: '#635bff' },
  CASH: { icon: '\uD83D\uDCB5', name: 'Cash on Pickup', color: '#16a34a' },
  BANK_TRANSFER: { icon: '\uD83C\uDFE6', name: 'Bank Transfer', color: '#ca8a04' },
};

const generateTxnId = () => {
  const prefix = 'TXN';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const PaymentModal = ({ amount, method, paymentDetails, onComplete, onClose }) => {
  const [step, setStep] = useState(PAYMENT_STEPS.VALIDATING);
  const [progress, setProgress] = useState(0);
  const [txnId, setTxnId] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const config = METHOD_CONFIG[method] || METHOD_CONFIG.CREDIT_CARD;

  const messages = {
    CREDIT_CARD: [
      'Validating card details...',
      'Connecting to payment gateway...',
      'Authorizing transaction...',
      'Processing payment...',
    ],
    DEBIT_CARD: [
      'Validating card details...',
      'Connecting to bank...',
      'Authorizing transaction...',
      'Processing payment...',
    ],
    STRIPE: [
      'Connecting to Stripe...',
      'Securing payment...',
      'Processing...',
    ],
    CASH: [
      'Reserving vehicle...',
      'Preparing pickup details...',
      'Confirming booking...',
    ],
    BANK_TRANSFER: [
      'Generating payment instructions...',
      'Reserving vehicle...',
      'Confirming booking...',
    ],
  };

  const stepMessages = messages[method] || messages.CREDIT_CARD;

  useEffect(() => {
    setStep(PAYMENT_STEPS.PROCESSING);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15 + 2;
      });
    }, 400);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, stepMessages.length - 1));
    }, 1200);

    const txn = generateTxnId();
    setTxnId(txn);

    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgress(100);
      setStep(PAYMENT_STEPS.SUCCESS);
    }, 3000 + Math.random() * 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const handleDone = () => {
    onComplete(txnId);
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        {step === PAYMENT_STEPS.PROCESSING || step === PAYMENT_STEPS.VALIDATING ? (
          <div className="payment-processing">
            <div className="payment-spinner" style={{ borderTopColor: config.color }}>
              <span className="payment-icon-large">{config.icon}</span>
            </div>
            <h3 className="payment-status-text">Processing Payment</h3>
            <p className="payment-method-label">via {config.name}</p>
            <div className="payment-amount-large">${amount.toFixed(2)}</div>
            <div className="payment-progress-bar">
              <div className="payment-progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: config.color }}></div>
            </div>
            <p className="payment-message">{stepMessages[messageIndex]}</p>
          </div>
        ) : step === PAYMENT_STEPS.SUCCESS ? (
          <div className="payment-success">
            <div className="success-checkmark">
              <div className="check-icon" style={{ borderColor: config.color }}>
                <span className="checkmark" style={{ borderColor: config.color }}></span>
              </div>
            </div>
            <h3 className="payment-status-text">Payment Successful!</h3>
            <p className="payment-method-label">via {config.name}</p>
            <div className="payment-amount-large">${amount.toFixed(2)}</div>
            <div className="txn-id">
              <span className="txn-label">Transaction ID:</span>
              <span className="txn-value">{txnId}</span>
            </div>
            <button className="payment-done-btn" onClick={handleDone}>
              View My Bookings
            </button>
          </div>
        ) : (
          <div className="payment-failed">
            <div className="failed-icon">&#10060;</div>
            <h3>Payment Failed</h3>
            <p>Something went wrong. Please try again.</p>
            <button className="payment-done-btn" onClick={onClose}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

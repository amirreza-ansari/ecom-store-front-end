import { useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { paymentApi } from "./paymentApi";
import { HiCreditCard, HiLockClosed, HiCheck } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function PaymentModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  orderNumber,
  onSuccess,
}) {
  const [step, setStep] = useState(1); // 1: Card form, 2: Processing, 3: Success
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ") : digits;
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length !== 16) {
      setError("Card number must be 16 digits");
      return;
    }
    if (!cardName.trim()) {
      setError("Cardholder name is required");
      return;
    }
    if (expiry.length !== 5) {
      setError("Invalid expiry date (MM/YY)");
      return;
    }
    if (cvv.length < 3) {
      setError("CVV must be at least 3 digits");
      return;
    }

    // Step 1: Create payment
    setIsProcessing(true);
    setStep(2);

    try {
      const { data: createData } = await paymentApi.createPayment({
        orderId,
        paymentMethod: "mock_card",
      });

      setTransactionId(createData.data.transactionId);

      // Step 2: Process payment
      const { data: processData } = await paymentApi.processPayment({
        transactionId: createData.data.transactionId,
        cardLast4: rawCard.slice(-4),
      });

      if (processData.status === "success") {
        setStep(3);
        toast.success("Payment successful!");
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
      setStep(1);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setError("");
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Secure Checkout'
      size='md'
    >
      {/* Processing State */}
      {step === 2 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='relative w-16 h-16 mb-6'>
            <div className='absolute inset-0 border-4 border-slate-100 rounded-full'></div>
            <div className='absolute inset-0 border-4 border-slate-900 rounded-full border-t-transparent animate-spin'></div>
          </div>
          <h3 className='text-lg font-bold text-slate-900 mb-2 tracking-tight'>
            Processing Payment
          </h3>
          <p className='text-sm text-slate-500 animate-pulse'>
            Contacting your bank securely...
          </p>
        </div>
      )}

      {/* Success State */}
      {step === 3 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner'>
            <HiCheck className='w-8 h-8 text-emerald-500' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 mb-2 tracking-tight'>
            Payment Successful!
          </h3>
          <p className='text-sm font-medium text-slate-500'>
            Transaction ID:{" "}
            <span className='text-slate-900'>{transactionId}</span>
          </p>
        </div>
      )}

      {/* Card Form */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className='space-y-6 pt-2'>
          {/* Order Summary Header */}
          <div className='flex justify-between items-end pb-4 border-b border-slate-100'>
            <div>
              <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1'>
                Order #{orderNumber}
              </p>
              <p className='text-sm font-medium text-slate-900'>Total Amount</p>
            </div>
            <p className='text-3xl font-extrabold text-slate-900 tracking-tight'>
              ${orderTotal?.toFixed(2)}
            </p>
          </div>

          {/* Dynamic Virtual Card Preview */}
          <div className='relative w-full h-48 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl overflow-hidden p-6 flex flex-col justify-between'>
            {/* Glassmorphism decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none'></div>
            <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none'></div>

            <div className='flex justify-between items-start relative z-10'>
              {/* Microchip representation */}
              <div className='w-12 h-9 rounded bg-slate-300/80 flex flex-col justify-between p-1.5 opacity-80'>
                <div className='w-full h-[1px] bg-slate-500/50'></div>
                <div className='w-full h-[1px] bg-slate-500/50'></div>
                <div className='w-full h-[1px] bg-slate-500/50'></div>
              </div>
              <HiCreditCard className='w-6 h-6 text-white/50' />
            </div>

            <div className='relative z-10'>
              <p className='font-mono text-xl tracking-[0.15em] mb-2 opacity-90 h-7'>
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
              <div className='flex justify-between items-end'>
                <div className='max-w-[70%]'>
                  <p className='text-[9px] uppercase tracking-widest text-slate-400 mb-0.5'>
                    Cardholder
                  </p>
                  <p className='text-sm font-medium tracking-wide truncate h-5'>
                    {cardName ? cardName.toUpperCase() : "YOUR NAME"}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-[9px] uppercase tracking-widest text-slate-400 mb-0.5'>
                    Expires
                  </p>
                  <p className='text-sm font-medium tracking-wider h-5'>
                    {expiry || "MM/YY"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className='p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm font-medium text-rose-600 flex items-center gap-2'>
              <div className='w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0'></div>
              {error}
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5'>
                Card Number
              </label>
              <div className='relative'>
                <HiCreditCard className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400' />
                <input
                  type='text'
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  placeholder='4242 4242 4242 4242'
                  maxLength={19}
                  className='w-full pl-11 pr-4 py-3 text-sm font-medium bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-300'
                />
              </div>
              <p className='text-[10px] font-medium text-slate-400 mt-1.5 pl-1'>
                Use test card:{" "}
                <span className='font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600'>
                  4242 4242 4242 4242
                </span>
              </p>
            </div>

            <div>
              <label className='block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5'>
                Name on Card
              </label>
              <input
                type='text'
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder='Nastaran Heidari'
                className='w-full px-4 py-3 text-sm font-medium bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-300'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5'>
                  Expiration
                </label>
                <input
                  type='text'
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder='MM/YY'
                  maxLength={5}
                  className='w-full px-4 py-3 text-sm font-medium bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-300'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5'>
                  CVV
                </label>
                <input
                  type='password'
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder='123'
                  maxLength={4}
                  className='w-full px-4 py-3 text-sm font-medium tracking-widest bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-300'
                />
              </div>
            </div>
          </div>

          <div className='pt-2'>
            <Button
              type='submit'
              variant='primary'
              className='w-full py-3.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed'
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : `Pay $${orderTotal?.toFixed(2)}`}
            </Button>

            <div className='flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 mt-4'>
              <HiLockClosed className='w-3.5 h-3.5 text-slate-400' />
              <span>Payments are secure and encrypted via AES-256</span>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

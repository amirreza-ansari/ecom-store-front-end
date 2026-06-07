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
  const [step, setStep] = useState(1);
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
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

    setIsProcessing(true);
    setStep(2);
    try {
      const { data: createData } = await paymentApi.createPayment({
        orderId,
        paymentMethod: "mock_card",
      });
      setTransactionId(createData.data.transactionId);
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
      setError(error.response?.data?.message || "Payment failed.");
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
      {step === 2 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='relative w-16 h-16 mb-6'>
            <div className='absolute inset-0 border-4 border-slate-100 dark:border-gray-700 rounded-full'></div>
            <div className='absolute inset-0 border-4 border-slate-900 dark:border-white rounded-full border-t-transparent animate-spin'></div>
          </div>
          <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>
            Processing Payment
          </h3>
          <p className='text-sm text-slate-500 dark:text-gray-400 animate-pulse'>
            Contacting your bank securely...
          </p>
        </div>
      )}

      {step === 3 && (
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6'>
            <HiCheck className='w-8 h-8 text-emerald-500 dark:text-emerald-400' />
          </div>
          <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>
            Payment Successful!
          </h3>
          <p className='text-sm font-medium text-slate-500 dark:text-gray-400'>
            Transaction ID:{" "}
            <span className='text-slate-900 dark:text-white'>
              {transactionId}
            </span>
          </p>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit} className='space-y-6 pt-2'>
          <div className='flex justify-between items-end pb-4 border-b border-slate-100 dark:border-gray-700'>
            <div>
              <p className='text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase mb-1'>
                Order #{orderNumber}
              </p>
              <p className='text-sm font-medium text-slate-900 dark:text-white'>
                Total Amount
              </p>
            </div>
            <p className='text-3xl font-extrabold text-slate-900 dark:text-white'>
              ${orderTotal?.toFixed(2)}
            </p>
          </div>

          <div className='relative w-full h-48 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl overflow-hidden p-6 flex flex-col justify-between'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10'></div>
            <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-5 -mb-5'></div>
            <div className='flex justify-between items-start relative z-10'>
              <div className='w-12 h-9 rounded bg-slate-300/80 flex flex-col justify-between p-1.5 opacity-80'>
                <div className='w-full h-[1px] bg-slate-500/50'></div>
                <div className='w-full h-[1px] bg-slate-500/50'></div>
                <div className='w-full h-[1px] bg-slate-500/50'></div>
              </div>
              <HiCreditCard className='w-6 h-6 text-white/50' />
            </div>
            <div className='relative z-10'>
              <p className='font-mono text-xl tracking-[0.15em] mb-2 opacity-90'>
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
              <div className='flex justify-between items-end'>
                <div className='max-w-[70%]'>
                  <p className='text-[9px] uppercase text-slate-400 mb-0.5'>
                    Cardholder
                  </p>
                  <p className='text-sm font-medium truncate'>
                    {cardName ? cardName.toUpperCase() : "YOUR NAME"}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-[9px] uppercase text-slate-400 mb-0.5'>
                    Expires
                  </p>
                  <p className='text-sm font-medium'>{expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className='p-3.5 bg-rose-50/50 dark:bg-red-900/20 border border-rose-200 dark:border-red-800 rounded-xl text-sm font-medium text-rose-600 dark:text-red-400 flex items-center gap-2'>
              <div className='w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0'></div>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1.5'>
                Card Number
              </label>
              <div className='relative'>
                <HiCreditCard className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500' />
                <input
                  type='text'
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  placeholder='4242 4242 4242 4242'
                  maxLength={19}
                  className='w-full pl-11 pr-4 py-3 text-sm font-medium bg-slate-50/50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-gray-600 transition-all placeholder:text-slate-300 dark:text-white'
                />
              </div>
              <p className='text-[10px] font-medium text-slate-400 dark:text-gray-500 mt-1.5 pl-1'>
                Test card:{" "}
                <span className='font-mono bg-slate-100 dark:bg-gray-700 px-1 py-0.5 rounded text-slate-600 dark:text-gray-300'>
                  4242 4242 4242 4242
                </span>
              </p>
            </div>
            <div>
              <label className='block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1.5'>
                Name on Card
              </label>
              <input
                type='text'
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder='Your Name'
                className='w-full px-4 py-3 text-sm font-medium bg-slate-50/50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-gray-600 transition-all placeholder:text-slate-300 dark:text-white'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1.5'>
                  Expiration
                </label>
                <input
                  type='text'
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder='MM/YY'
                  maxLength={5}
                  className='w-full px-4 py-3 text-sm font-medium bg-slate-50/50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-gray-600 transition-all placeholder:text-slate-300 dark:text-white'
                />
              </div>
              <div>
                <label className='block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1.5'>
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
                  className='w-full px-4 py-3 text-sm font-medium tracking-widest bg-slate-50/50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-gray-600 transition-all placeholder:text-slate-300 dark:text-white'
                />
              </div>
            </div>
          </div>

          <div className='pt-2'>
            <Button
              type='submit'
              variant='primary'
              className='w-full py-3.5 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-gray-200 shadow-lg transition-all disabled:opacity-70'
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : `Pay $${orderTotal?.toFixed(2)}`}
            </Button>
            <div className='flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-4'>
              <HiLockClosed className='w-3.5 h-3.5' /> Payments are secure and
              encrypted
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

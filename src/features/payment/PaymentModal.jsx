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
      title='Complete Payment'
      size='md'
    >
      {/* Processing */}
      {step === 2 && (
        <div className='text-center py-8'>
          <div className='w-16 h-16 border-4 border-[#D5D9D9] border-t-[#FF9900] rounded-full animate-spin mx-auto mb-6' />
          <h3 className='text-lg font-semibold text-[#0F1111] mb-2'>
            Processing Payment
          </h3>
          <p className='text-sm text-[#565959]'>
            Please wait while we process your payment...
          </p>
        </div>
      )}

      {/* Success */}
      {step === 3 && (
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <HiCheck className='w-8 h-8 text-[#067D62]' />
          </div>
          <h3 className='text-lg font-semibold text-[#0F1111] mb-2'>
            Payment Successful!
          </h3>
          <p className='text-sm text-[#565959]'>
            Transaction ID: {transactionId}
          </p>
        </div>
      )}

      {/* Card Form */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Order Info */}
          <div className='bg-[#F7FAFA] rounded-lg p-4 flex justify-between items-center'>
            <div>
              <p className='text-xs text-[#565959]'>Order #{orderNumber}</p>
              <p className='text-sm font-medium text-[#0F1111]'>Total to Pay</p>
            </div>
            <p className='text-xl font-bold text-[#0F1111]'>
              ${orderTotal?.toFixed(2)}
            </p>
          </div>

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#B12704]'>
              {error}
            </div>
          )}

          {/* Card Number */}
          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              Card Number
            </label>
            <div className='relative'>
              <HiCreditCard className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#565959]' />
              <input
                type='text'
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                placeholder='4242 4242 4242 4242'
                maxLength={19}
                className='w-full pl-10 pr-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
              />
            </div>
            <p className='text-xs text-[#565959] mt-1'>
              Use test card: 4242 4242 4242 4242
            </p>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              Cardholder Name
            </label>
            <input
              type='text'
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder='John Doe'
              className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
            />
          </div>

          {/* Expiry & CVV */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-[#0F1111] mb-1'>
                Expiry Date
              </label>
              <input
                type='text'
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder='MM/YY'
                maxLength={5}
                className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-[#0F1111] mb-1'>
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
                className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent'
              />
            </div>
          </div>

          {/* Secure badge */}
          <div className='flex items-center gap-2 text-xs text-[#565959]'>
            <HiLockClosed className='w-4 h-4 text-[#067D62]' />
            <span>Your payment is secure and encrypted</span>
          </div>

          <Button
            type='submit'
            variant='primary'
            size='lg'
            className='w-full'
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay $${orderTotal?.toFixed(2)}`}
          </Button>
        </form>
      )}
    </Modal>
  );
}

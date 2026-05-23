import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function PaymentResult({ type }) {
  const config = {
    success: {
      icon: <CheckCircle size={64} className="text-green-400" />,
      title: 'Payment Successful!',
      message: 'Your course has been unlocked. Head to your dashboard to start learning.',
      color: 'text-green-400',
      bg: 'bg-green-900/20 border-green-900/40',
      link: '/my-learning',
      linkText: 'Go to My Learning',
    },
    failed: {
      icon: <XCircle size={64} className="text-red-400" />,
      title: 'Payment Failed',
      message: 'Something went wrong with your payment. Please try again.',
      color: 'text-red-400',
      bg: 'bg-red-900/20 border-red-900/40',
      link: '/courses',
      linkText: 'Back to Courses',
    },
    cancelled: {
      icon: <AlertTriangle size={64} className="text-yellow-400" />,
      title: 'Payment Cancelled',
      message: 'You cancelled the payment. You can try again whenever you\'re ready.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20 border-yellow-900/40',
      link: '/courses',
      linkText: 'Back to Courses',
    },
  };

  const { icon, title, message, color, bg, link, linkText } = config[type] || config.failed;

  return (
    <div className="pt-16 min-h-screen bg-[#0f0a0b] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className={`max-w-md w-full text-center p-10 rounded-3xl border ${bg}`}>
        <div className="flex justify-center mb-6">{icon}</div>
        <h1 className={`text-3xl font-bold mb-3 ${color}`}>{title}</h1>
        <p className="text-[#c5b4b8] mb-8">{message}</p>
        <div className="flex flex-col gap-3">
          <Link to={link}
            className="px-6 py-3 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl text-center">
            {linkText}
          </Link>
          <Link to="/" className="text-sm text-[#c5b4b8] hover:text-white transition-colors">
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentResult;

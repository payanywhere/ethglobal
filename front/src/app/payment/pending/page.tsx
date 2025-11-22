export default function PaymentPendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold text-yellow-600">Payment Pending ⏳</h1>
      <p className="mt-3 text-gray-600">Your payment is being processed.</p>
      <a href="/payment" className="mt-5 text-blue-600 underline">
        Back to Payment Page
      </a>
    </div>
  )
}

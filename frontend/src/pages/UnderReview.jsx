export default function UnderReview() {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Application Under Review
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Thank you for submitting your loan application.  
        Our team is currently reviewing your details.  
        You will be notified once a decision has been made.
      </p>
      <p className="text-gray-500">
        Please check back later or wait for our email notification.
      </p>
    </div>
  );
}

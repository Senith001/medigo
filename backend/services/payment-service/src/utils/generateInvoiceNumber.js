const generateInvoiceNumber = () => {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  // Create a simple invoice number for payment records.
  return `INV-${yyyy}${mm}${dd}-${random}`;
};

module.exports = generateInvoiceNumber;

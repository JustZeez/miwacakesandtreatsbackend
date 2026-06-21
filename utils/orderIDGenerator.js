const generateOrderId = (customerFullName) => {
  const now = new Date();
  
  // Extract first name
  const firstName = customerFullName.split(' ')[0] || customerFullName;
  
  // Time part (HHMM)
  const timePart = String(now.getHours()).padStart(2, '0') + 
    String(now.getMinutes()).padStart(2, '0');
  
  // Date part (DDMMYY)
  const datePart = String(now.getDate()).padStart(2, '0') + 
    String(now.getMonth() + 1).padStart(2, '0') + 
    String(now.getFullYear()).slice(-2);
  
  // Clean first name
  const namePart = firstName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 12);
  
  // generate a random number
  const randomSuffix = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  
  return `${timePart}-${datePart}-${namePart}-${randomSuffix}`;
};

module.exports = generateOrderId;

// for a better understanding this code is use to generate order id the order id will be in this format customer first name, time,  date and 2 digits random numbers
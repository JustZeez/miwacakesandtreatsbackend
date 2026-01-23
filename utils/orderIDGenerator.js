const generateOrderId = (customerFullName) => {
  const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Lagos"}));

  const firstName = customerFullName.split(" ")[0] || customerFullName;

  const timePart =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  const datePart =
    String(now.getDate()).padStart(2, "0") +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getFullYear()).slice(-2);

  const namePart = firstName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 12);

  const randomSuffix = String(Math.floor(Math.random() * 99) + 1).padStart(
    2,
    "0"
  );

  return `${timePart}-${datePart}-${namePart}-${randomSuffix}`;
};

module.exports = generateOrderId;

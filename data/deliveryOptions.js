import dayjs from "https://cdn.jsdelivr.net/npm/dayjs@1.11/+esm";

export function getDeliveryOption(deliveryOptionId) {
  let deliveryOption;

  deliveryOptions.forEach((option) => {
    if (option.id === deliveryOptionId) {
      deliveryOption = option;
    }
  });

  return deliveryOption || deliveryOptions[0];
}

export function calculateDeliveryDate(deliveryOption) {
  let remainingDays = deliveryOption.deliveryDays;
  let deliveryDate = dayjs();
  const isWeekend = (date) => {
    const dayOfWeek = date.format("dddd");
    return dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
  };

  while (remainingDays > 0) {
    deliveryDate = deliveryDate.add(1, "day");
    if (!isWeekend(deliveryDate)) {
      remainingDays--;
    }
  }

  return deliveryDate.format("dddd, MMMM D");
}

export function isValidDeliveryOption(deliveryOptionId) {
  let isValidDeliveryOption = false;

  deliveryOptions.forEach((option) => {
    if (option.id === deliveryOptionId) {
      isValidDeliveryOption = true;
    }
  });

  return isValidDeliveryOption;
}

export const deliveryOptions = [
  {
    id: "1",
    deliveryDays: 7,
    priceCents: 0,
  },
  {
    id: "2",
    deliveryDays: 3,
    priceCents: 499,
  },
  {
    id: "3",
    deliveryDays: 1,
    priceCents: 999,
  },
];

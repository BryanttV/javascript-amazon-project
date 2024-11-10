import {
  cart,
  removeFromCart,
  updateDeliveryOption,
  updateQuantity,
} from "../../data/cart.js";
import {
  calculateDeliveryDate,
  deliveryOptions,
  getDeliveryOption,
} from "../../data/deliveryOptions.js";
import { getProduct } from "../../data/products.js";
import formatCurrency from "../utils/money.js";
import { renderCheckoutHeader } from "./checkoutHeader.js";
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderOrderSummary() {
  let cartSummaryHTML = "";

  cart.forEach((cartItem) => {
    const { productId } = cartItem;
    const product = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;
    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const dateString = calculateDeliveryDate(deliveryOption);

    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container js-cart-item-container-${productId}">
        <div class="delivery-date">Delivery date: ${dateString}</div>

        <div class="cart-item-details-grid">
            <img
            class="product-image"
            src="${product.image}"
            />

            <div class="cart-item-details">
            <div class="product-name js-product-name-${productId}">
                ${product.name}
            </div>
            <div class="product-price js-product-price-${productId}">$${formatCurrency(
      product.priceCents
    )}</div>
            <div class="product-quantity js-product-quantity-${productId}">
                <span> Quantity: <span class="quantity-label js-quantity-label-${productId}">${
      cartItem.quantity
    }</span> </span>
                <span class="update-quantity-link link-primary js-update-link" data-product-id="${productId}">
                Update
                </span>
                <input class="quantity-input js-quantity-input js-quantity-input-${productId}" data-product-id="${productId}">
                <span class="save-quantity-link link-primary js-save-link" data-product-id="${productId}">Save</span>
                <span class="delete-quantity-link link-primary js-delete-link js-delete-link-${productId}" data-product-id="${productId}">
                Delete
                </span>
            </div>
            </div>

            <div class="delivery-options">
            <div class="delivery-options-title">
                Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(productId, cartItem)}
            </div>
        </div>
    </div>
    `;
  });

  function deliveryOptionsHTML(productId, cartItem) {
    let html = "";
    deliveryOptions.forEach((deliveryOption) => {
      const dateString = calculateDeliveryDate(deliveryOption);
      const priceString =
        deliveryOption.priceCents === 0
          ? "FREE"
          : `$${formatCurrency(deliveryOption.priceCents)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
      html += `
      <div class="delivery-option js-delivery-option" data-product-id="${productId}" data-delivery-option-id="${
        deliveryOption.id
      }">
        <input
        type="radio"
        ${isChecked ? "checked" : ""}
        class="delivery-option-input"
        name="delivery-option-${productId}"
        />
        <div>
          <div class="delivery-option-date">${dateString}</div>
          <div class="delivery-option-price">${priceString} Shipping</div>
        </div>
      </div>
    `;
    });

    return html;
  }

  document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;

  document.querySelectorAll(".js-delete-link").forEach((link) => {
    link.addEventListener("click", () => {
      const { productId } = link.dataset;
      removeFromCart(productId);
      renderCheckoutHeader();
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll(".js-update-link").forEach((link) => {
    link.addEventListener("click", () => {
      const { productId } = link.dataset;

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      container.classList.add("is-editing-quantity");
    });
  });

  document.querySelectorAll(".js-delivery-option").forEach((element) => {
    element.addEventListener("click", () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll(".js-save-link").forEach((link) => {
    link.addEventListener("click", () => {
      const { productId } = link.dataset;

      const inputElement = document.querySelector(
        `.js-quantity-input-${productId}`
      );
      const newQuantity = Number(inputElement.value);

      saveCartQuantity(productId, newQuantity);
    });
  });

  document.querySelectorAll(".js-quantity-input").forEach((input) => {
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        const { productId } = input.dataset;
        const newQuantity = Number(input.value);
        saveCartQuantity(productId, newQuantity);
      }
    });
  });

  function saveCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0 || newQuantity > 1000) {
      alert("Quantity must be at least 0 and less than 1000");
      return;
    }

    updateQuantity(productId, newQuantity);

    const container = document.querySelector(
      `.js-cart-item-container-${productId}`
    );
    container.classList.remove("is-editing-quantity");

    renderOrderSummary();
    renderCheckoutHeader();
    renderPaymentSummary();
  }
}

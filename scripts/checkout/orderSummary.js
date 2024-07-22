import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import {
  calculateCartQuantity,
  cart,
  removeFromCart,
  updateDeliveryOption,
  updateQuantity,
} from "../../data/cart.js";
import {
  deliveryOptions,
  getDeliveryOption,
} from "../../data/deliveryOptions.js";
import { getProduct } from "../../data/products.js";
import formatCurrency from "../utils/money.js";
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderOrderSummary() {
  let cartSummaryHTML = "";

  cart.forEach((cartItem) => {
    const { productId } = cartItem;
    const product = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;
    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
    const dateString = deliveryDate.format("dddd, MMMM D");

    cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${productId}">
        <div class="delivery-date">Delivery date: ${dateString}</div>

        <div class="cart-item-details-grid">
            <img
            class="product-image"
            src="${product.image}"
            />

            <div class="cart-item-details">
            <div class="product-name">
                ${product.name}
            </div>
            <div class="product-price">$${formatCurrency(
              product.priceCents
            )}</div>
            <div class="product-quantity">
                <span> Quantity: <span class="quantity-label js-quantity-label-${productId}">${
      cartItem.quantity
    }</span> </span>
                <span class="update-quantity-link link-primary js-update-link" data-product-id="${productId}">
                Update
                </span>
                <input class="quantity-input js-quantity-input js-quantity-input-${productId}" data-product-id="${productId}">
                <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${productId}">Save</span>
                <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${productId}">
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
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
      const dateString = deliveryDate.format("dddd, MMMM D");
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

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      container.remove();

      updateCartQuantity();
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

  document.querySelectorAll(".js-save-quantity-link").forEach((link) => {
    link.addEventListener("click", () => {
      const { productId } = link.dataset;

      const inputElement = document.querySelector(
        `.js-quantity-input-${productId}`
      );
      const newQuantity = Number(inputElement.value);

      saveCartQuantity(productId, newQuantity);
      renderPaymentSummary();
    });
  });

  document.querySelectorAll(".js-quantity-input").forEach((input) => {
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        const { productId } = input.dataset;
        const newQuantity = Number(input.value);
        saveCartQuantity(productId, newQuantity);
        renderPaymentSummary();
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

    document.querySelector(`.js-quantity-label-${productId}`).innerHTML =
      newQuantity;

    updateCartQuantity();
  }

  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();

    document.querySelector(
      ".js-return-to-home-link"
    ).innerHTML = `${cartQuantity} items`;
  }

  updateCartQuantity();
}

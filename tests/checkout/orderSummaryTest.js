import { cart, loadFromStorage } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { renderOrderSummary } from "../../scripts/checkout/orderSummary.js";
import formatCurrency from "../../scripts/utils/money.js";

describe("test suite: renderOrderSummary", () => {
  const productId1 = "e43638ce-6aa0-4b85-b27f-e1d07eb678c6";
  const productId2 = "15b6fc6f-327a-4ec4-896f-486349e85a3d";
  const product1 = getProduct(productId1);
  const product2 = getProduct(productId2);

  beforeEach(() => {
    spyOn(localStorage, "setItem");

    document.querySelector(".js-test-container").innerHTML = `
        <div class="js-order-summary"></div>
        <div class="js-payment-summary"></div>
        <div class="js-checkout-header"></div>
    `;

    spyOn(localStorage, "getItem").and.callFake(() => {
      return JSON.stringify([
        {
          productId: productId1,
          quantity: 2,
          deliveryOptionId: "1",
        },
        {
          productId: productId2,
          quantity: 1,
          deliveryOptionId: "2",
        },
      ]);
    });
    loadFromStorage();
    renderOrderSummary();
  });

  afterEach(() => {
    document.querySelector(".js-test-container").innerHTML = "";
  });

  it("displays the cart", () => {
    expect(document.querySelectorAll(".js-cart-item-container").length).toEqual(
      2
    );
    expect(
      document.querySelector(`.js-product-quantity-${productId1}`).innerText
    ).toContain("Quantity: 2");
    expect(
      document.querySelector(`.js-product-quantity-${productId2}`).innerText
    ).toContain("Quantity: 1");
    expect(
      document.querySelector(`.js-product-name-${productId1}`).innerText
    ).toContain(product1.name);
    expect(
      document.querySelector(`.js-product-name-${productId2}`).innerText
    ).toContain(product2.name);
    expect(
      document.querySelector(`.js-product-price-${productId1}`).innerText
    ).toContain(formatCurrency(product1.priceCents));
    expect(
      document.querySelector(`.js-product-price-${productId2}`).innerText
    ).toContain(formatCurrency(product2.priceCents));
  });

  it("removes a product", () => {
    document.querySelector(`.js-delete-link-${productId1}`).click();

    expect(document.querySelectorAll(".js-cart-item-container").length).toEqual(
      1
    );
    expect(
      document.querySelector(`.js-cart-item-container-${productId1}`)
    ).toEqual(null);
    expect(
      document.querySelector(`.js-cart-item-container-${productId2}`)
    ).not.toEqual(null);
    expect(
      document.querySelector(`.js-product-name-${productId2}`).innerText
    ).toContain(product2.name);
    expect(
      document.querySelector(`.js-product-price-${productId2}`).innerText
    ).toContain(formatCurrency(product2.priceCents));
    expect(cart.length).toEqual(1);
    expect(cart[0].productId).toEqual(productId2);
  });
});

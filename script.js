/* =========================================================
   THE MACCHI MART
   Firebase Live Products + Cart + WhatsApp Checkout
========================================================= */


/* =========================================================
   BUSINESS SETTINGS
========================================================= */

const WHATSAPP_NUMBER = "918652065885";

const DELIVERY_AREAS = [
  "Vile Parle",
  "Andheri",
  "Jogeshwari",
  "Bhandup"
];


/* =========================================================
   FIREBASE SETTINGS
========================================================= */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD8kfHBr-Kwc-Jf2HHtyBCllsr4A8ev6f0",
  authDomain: "the-macchi-mart-7be07.firebaseapp.com",
  projectId: "the-macchi-mart-7be07",
  storageBucket: "the-macchi-mart-7be07.firebasestorage.app",
  messagingSenderId: "981386840283",
  appId: "1:981386840283:web:967a71c447387f612564fe",
  measurementId: "G-ZLWDLY3QZ7"
};


/* =========================================================
   STATE
========================================================= */

let cart = [];

let selectedCategory = "all";

let searchText = "";


/*
  products.js already creates:
  const products = [...]

  We keep that catalogue as the fallback.
  Firebase will update matching products.
*/


/* =========================================================
   ELEMENTS
========================================================= */

const productGrid =
  document.getElementById("productGrid");

const searchInput =
  document.getElementById("searchInput");

const categoryButtons =
  document.querySelectorAll(".category-btn");

const cartButton =
  document.getElementById("cartButton");

const cartPanel =
  document.getElementById("cartPanel");

const closeCartButton =
  document.getElementById("closeCart");

const overlay =
  document.getElementById("overlay");

const cartItems =
  document.getElementById("cartItems");

const cartCount =
  document.getElementById("cartCount");

const cartTotal =
  document.getElementById("cartTotal");

const whatsappOrderButton =
  document.getElementById("whatsappOrder");

const productResultText =
  document.getElementById("productResultText");

const currentYear =
  document.getElementById("currentYear");


/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price) {

  return Number(price).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2
    }
  );

}


/*
  IMPORTANT:

  price = 0
  means rate is not available.

  price > 0
  means admin has entered today's actual rate.

  Therefore priceType === "today" does NOT automatically
  mean that the price is unknown.
*/

function isRateUnavailable(product) {

  const price =
    Number(product.price);

  return (
    !Number.isFinite(price) ||
    price <= 0
  );

}


function getWeightMultiplier(weight) {

  if (!weight) {
    return 1;
  }

  const value =
    weight.toLowerCase().trim();

  if (value.includes("250g")) {
    return 0.25;
  }

  if (value.includes("500g")) {
    return 0.5;
  }

  if (value.includes("750g")) {
    return 0.75;
  }

  if (value.includes("1.5kg")) {
    return 1.5;
  }

  if (value.includes("2kg")) {
    return 2;
  }

  if (value.includes("1kg")) {
    return 1;
  }

  return 1;

}


/* =========================================================
   CALCULATE PRODUCT PRICE
========================================================= */

function calculateSelectedPrice(
  product,
  selectedOption
) {

  if (isRateUnavailable(product)) {

    return null;

  }


  /*
    Special fixed-unit product:
    Dry Bombil ₹480 / 100 pcs
  */

  if (
    product.unit &&
    product.unit !== "kg"
  ) {

    return Number(product.price);

  }


  const multiplier =
    getWeightMultiplier(
      selectedOption
    );


  return (
    Number(product.price) *
    multiplier
  );

}


/* =========================================================
   FIREBASE LIVE PRODUCT DATA
========================================================= */

async function loadFirebaseProducts() {

  try {

    const {
      initializeApp
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"
      );


    const {
      getFirestore,
      collection,
      getDocs
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
      );


    const app =
      initializeApp(
        FIREBASE_CONFIG
      );


    const db =
      getFirestore(app);


    const snapshot =
      await getDocs(
        collection(
          db,
          "products"
        )
      );


    snapshot.forEach(
      (documentSnapshot) => {

        const firebaseProduct =
          documentSnapshot.data();


        /*
          Match Firebase product with static product.

          First try numeric id.
          Then try product name.
          Then try Firebase document id.
        */

        let index = -1;


        if (
          firebaseProduct.id !==
          undefined
        ) {

          index =
            products.findIndex(
              (product) =>
                String(product.id) ===
                String(firebaseProduct.id)
            );

        }


        if (
          index === -1 &&
          firebaseProduct.name
        ) {

          index =
            products.findIndex(
              (product) =>
                String(product.name)
                  .trim()
                  .toLowerCase() ===
                String(firebaseProduct.name)
                  .trim()
                  .toLowerCase()
            );

        }


        if (index === -1) {

          index =
            products.findIndex(
              (product) =>
                String(product.name)
                  .trim()
                  .toLowerCase() ===
                String(documentSnapshot.id)
                  .trim()
                  .toLowerCase()
            );

        }


        if (index !== -1) {

          /*
            Merge Firebase values over
            the existing static product.
          */

          Object.assign(
            products[index],
            firebaseProduct
          );


          /*
            Keep the static numeric ID.

            This prevents cart onclick
            problems if Firestore has no ID.
          */

          if (
            !Number.isFinite(
              Number(products[index].id)
            )
          ) {

            products[index].id =
              index + 1;

          }

        } else {

          /*
            Future support:
            If admin creates a completely
            new product in Firestore,
            it can also appear on website.
          */

          const newProduct = {

            ...firebaseProduct,

            id:
              Number(
                firebaseProduct.id
              ) ||
              (
                Math.max(
                  0,
                  ...products.map(
                    (product) =>
                      Number(product.id) || 0
                  )
                ) + 1
              ),

            image:
              firebaseProduct.image ||
              "logo.png",

            options:
              Array.isArray(
                firebaseProduct.options
              )
                ? firebaseProduct.options
                : [],

            cleaning:
              Boolean(
                firebaseProduct.cleaning
              ),

            inStock:
              firebaseProduct.inStock !==
              false

          };


          products.push(
            newProduct
          );

        }

      }
    );


    /*
      Sort using sortOrder when available.
    */

    products.sort(
      (a, b) => {

        const aOrder =
          Number(
            a.sortOrder ??
            a.id ??
            999
          );

        const bOrder =
          Number(
            b.sortOrder ??
            b.id ??
            999
          );

        return (
          aOrder -
          bOrder
        );

      }
    );


    console.log(
      "Firebase products loaded successfully."
    );


    displayProducts();

  } catch (error) {

    /*
      IMPORTANT:
      Website continues working with
      products.js if Firebase fails.
    */

    console.error(
      "Firebase product loading failed:",
      error
    );


    displayProducts();

  }

}


/* =========================================================
   DISPLAY PRODUCTS
========================================================= */

function displayProducts() {

  if (!productGrid) {
    return;
  }


  const filteredProducts =
    products.filter(
      (product) => {

        const categoryMatch =
          selectedCategory === "all" ||
          product.category ===
          selectedCategory;


        const combinedText = `

          ${product.name || ""}

          ${product.marathiName || ""}

          ${product.category || ""}

          ${product.description || ""}

        `.toLowerCase();


        const searchMatch =
          combinedText.includes(
            searchText.toLowerCase()
          );


        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  productGrid.innerHTML = "";


  if (productResultText) {

    productResultText.textContent =
      `${filteredProducts.length} products found`;

  }


  if (
    filteredProducts.length === 0
  ) {

    productGrid.innerHTML = `

      <div class="empty-cart">

        <h3>
          No seafood found
        </h3>

        <p>
          Try another search
          or category.
        </p>

      </div>

    `;

    return;

  }


  filteredProducts.forEach(
    (product) => {

      const card =
        createProductCard(
          product
        );


      productGrid.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "product-card";


  const rateUnavailable =
    isRateUnavailable(product);


  let priceHTML = "";


  if (rateUnavailable) {

    priceHTML = `

      <div>

        <span
          class="product-price"
          style="
            font-size:16px;
            color:#167a9f;
          "
        >

          Today's Rate

        </span>

        <div
          style="
            font-size:10px;
            color:#7b8b95;
          "
        >

          Confirm on WhatsApp

        </div>

      </div>

    `;

  } else {

    priceHTML = `

      <div>

        <span class="product-price">

          ₹${formatPrice(product.price)}

        </span>

        <div
          style="
            font-size:10px;
            color:#7b8b95;
          "
        >

          ${
            product.priceType === "today"
              ? "Today's Rate"
              : "per " +
                (product.unit || "unit")
          }

          ${
            product.priceType === "today" &&
            product.unit
              ? " / " + product.unit
              : ""
          }

        </div>

      </div>

    `;

  }


  let optionHTML = "";


  if (
    Array.isArray(product.options) &&
    product.options.length > 0
  ) {

    optionHTML = `

      <div
        style="
          margin-top:14px;
          margin-bottom:10px;
        "
      >

        <label
          for="option-${product.id}"
          style="
            display:block;
            font-size:11px;
            font-weight:800;
            margin-bottom:5px;
            color:#425d6b;
          "
        >

          SELECT WEIGHT / PACK

        </label>


        <select
          id="option-${product.id}"
          style="
            width:100%;
            padding:10px;
            border:1px solid #dbe5e9;
            border-radius:9px;
            background:white;
          "
        >

          ${product.options
            .map(
              (option) => `

                <option
                  value="${option}"
                >
                  ${option}
                </option>

              `
            )
            .join("")}

        </select>

      </div>

    `;

  }


  let cleaningHTML = "";


  if (product.cleaning) {

    cleaningHTML = `

      <div
        style="
          margin-bottom:12px;
        "
      >

        <label
          for="cleaning-${product.id}"
          style="
            display:block;
            font-size:11px;
            font-weight:800;
            margin-bottom:5px;
            color:#425d6b;
          "
        >

          CLEANING / CUTTING

        </label>


        <select
          id="cleaning-${product.id}"
          style="
            width:100%;
            padding:10px;
            border:1px solid #dbe5e9;
            border-radius:9px;
            background:white;
          "
        >

          <option value="Whole / No Cleaning">
            Whole / No Cleaning
          </option>

          <option value="Cleaned">
            Cleaned
          </option>

          <option value="Cleaned & Cut">
            Cleaned & Cut
          </option>

        </select>

      </div>

    `;

  }


  card.innerHTML = `

    <img
      class="product-image"
      src="${product.image || "logo.png"}"
      alt="${product.name || "Seafood"}"
      loading="lazy"

      onerror="
        this.onerror=null;
        this.src='logo.png';
        this.style.objectFit='contain';
        this.style.padding='25px';
      "
    >


    <div class="product-info">


      <span class="product-category">

        ${product.category || ""}

      </span>


      <h3 class="product-name">

        ${product.name || "Seafood"}

      </h3>


      ${
        product.marathiName

          ? `

            <div
              style="
                color:#167a9f;
                font-weight:700;
                font-size:13px;
                margin-bottom:6px;
              "
            >

              ${product.marathiName}

            </div>

          `

          : ""
      }


      <p class="product-description">

        ${product.description || ""}

      </p>


      ${optionHTML}


      ${cleaningHTML}


      <div class="product-bottom">

        ${priceHTML}


        ${
          product.inStock !== false

            ? `

              <button
                class="add-cart"
                type="button"
                onclick="addConfiguredProductToCart(${product.id})"
              >

                ${
                  rateUnavailable
                    ? "Add Enquiry"
                    : "Add to Cart"
                }

              </button>

            `

            : `

              <button
                class="add-cart"
                type="button"
                disabled
                style="opacity:0.5;"
              >

                Out of Stock

              </button>

            `
        }

      </div>

    </div>

  `;


  return card;

}


/* =========================================================
   ADD CONFIGURED PRODUCT
========================================================= */

function addConfiguredProductToCart(
  productId
) {

  const product =
    products.find(
      (item) =>
        Number(item.id) ===
        Number(productId)
    );


  if (
    !product ||
    product.inStock === false
  ) {

    return;

  }


  const optionElement =
    document.getElementById(
      `option-${productId}`
    );


  const cleaningElement =
    document.getElementById(
      `cleaning-${productId}`
    );


  const selectedOption =
    optionElement
      ? optionElement.value
      : product.unit || "1 unit";


  const cleaningOption =
    cleaningElement
      ? cleaningElement.value
      : "Not Applicable";


  const calculatedPrice =
    calculateSelectedPrice(
      product,
      selectedOption
    );


  const cartKey = `

    ${product.id}-
    ${selectedOption}-
    ${cleaningOption}

  `.replace(/\s+/g, "");


  const existingItem =
    cart.find(
      (item) =>
        item.cartKey ===
        cartKey
    );


  if (existingItem) {

    existingItem.quantity += 1;

  } else {

    cart.push({

      cartKey: cartKey,

      id: product.id,

      name: product.name,

      marathiName:
        product.marathiName || "",

      category:
        product.category,

      selectedOption:
        selectedOption,

      cleaning:
        cleaningOption,

      price:
        calculatedPrice,

      todayRate:
        calculatedPrice === null,

      quantity: 1

    });

  }


  updateCart();

  openCart();

}


/* =========================================================
   CART QUANTITY
========================================================= */

function increaseQuantity(
  cartKey
) {

  const item =
    cart.find(
      (cartItem) =>
        cartItem.cartKey ===
        cartKey
    );


  if (!item) {
    return;
  }


  item.quantity += 1;

  updateCart();

}


function decreaseQuantity(
  cartKey
) {

  const item =
    cart.find(
      (cartItem) =>
        cartItem.cartKey ===
        cartKey
    );


  if (!item) {
    return;
  }


  item.quantity -= 1;


  if (
    item.quantity <= 0
  ) {

    removeFromCart(
      cartKey
    );

    return;

  }


  updateCart();

}


/* =========================================================
   REMOVE CART ITEM
========================================================= */

function removeFromCart(
  cartKey
) {

  cart =
    cart.filter(
      (item) =>
        item.cartKey !==
        cartKey
    );


  updateCart();

}


/* =========================================================
   UPDATE CART
========================================================= */

function updateCart() {

  restoreCartFooter();


  if (!cartItems) {
    return;
  }


  cartItems.innerHTML = "";


  if (
    cart.length === 0
  ) {

    cartItems.innerHTML = `

      <div class="empty-cart">

        <div
          style="
            font-size:45px;
          "
        >
          🛒
        </div>

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add fresh or dry seafood
          to start your order.
        </p>

      </div>

    `;

  } else {


    cart.forEach(
      (item) => {

        const cartItem =
          document.createElement(
            "div"
          );


        cartItem.className =
          "cart-item";


        let priceText = "";


        if (item.todayRate) {

          priceText =
            "Today's Rate";

        } else {

          const lineTotal =
            item.price *
            item.quantity;


          priceText =
            `₹${formatPrice(lineTotal)}`;

        }


        cartItem.innerHTML = `

          <div>

            <h4>
              ${item.name}
            </h4>


            ${
              item.marathiName

                ? `
                  <p>
                    ${item.marathiName}
                  </p>
                `

                : ""
            }


            <p>

              Pack:
              <strong>
                ${item.selectedOption}
              </strong>

            </p>


            ${
              item.cleaning !==
              "Not Applicable"

                ? `

                  <p>

                    Cleaning:
                    <strong>
                      ${item.cleaning}
                    </strong>

                  </p>

                `

                : ""
            }


            <div class="cart-controls">

              <button
                class="quantity-btn"
                type="button"
                onclick="decreaseQuantity('${item.cartKey}')"
              >
                −
              </button>


              <strong>
                ${item.quantity}
              </strong>


              <button
                class="quantity-btn"
                type="button"
                onclick="increaseQuantity('${item.cartKey}')"
              >
                +
              </button>


              <button
                class="remove-item"
                type="button"
                onclick="removeFromCart('${item.cartKey}')"
              >
                Remove
              </button>

            </div>

          </div>


          <strong>
            ${priceText}
          </strong>

        `;


        cartItems.appendChild(
          cartItem
        );

      }
    );

  }


  updateCartSummary();

}


/* =========================================================
   CART SUMMARY
========================================================= */

function updateCartSummary() {

  const totalQuantity =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  const knownPriceTotal =
    cart.reduce(
      (total, item) => {

        if (
          item.todayRate ||
          item.price === null
        ) {

          return total;

        }


        return (
          total +
          item.price *
          item.quantity
        );

      },
      0
    );


  const containsTodayRate =
    cart.some(
      (item) =>
        item.todayRate
    );


  if (cartCount) {

    cartCount.textContent =
      totalQuantity;

  }


  if (cartTotal) {

    if (containsTodayRate) {

      if (
        knownPriceTotal > 0
      ) {

        cartTotal.textContent =
          `${formatPrice(
            knownPriceTotal
          )} + Today's Rate`;

      } else {

        cartTotal.textContent =
          "Today's Rate";

      }

    } else {

      cartTotal.textContent =
        formatPrice(
          knownPriceTotal
        );

    }

  }

}


/* =========================================================
   OPEN / CLOSE CART
========================================================= */

function openCart() {

  if (cartPanel) {

    cartPanel.classList.add(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.add(
      "show"
    );

  }


  document.body.style.overflow =
    "hidden";

}


function closeCart() {

  if (cartPanel) {

    cartPanel.classList.remove(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.remove(
      "show"
    );

  }


  document.body.style.overflow =
    "";

}


/* =========================================================
   CHECKOUT FORM
========================================================= */

function showCheckoutForm() {

  if (
    cart.length === 0
  ) {

    alert(
      "Please add products to your cart first."
    );

    return;

  }


  cartItems.innerHTML = `

    <div
      style="
        padding-bottom:25px;
      "
    >

      <button
        type="button"
        onclick="updateCart()"
        style="
          border:none;
          background:transparent;
          color:#167a9f;
          font-weight:800;
          margin-bottom:20px;
        "
      >
        ← Back to Cart
      </button>


      <p class="section-small">
        DELIVERY DETAILS
      </p>


      <h3
        style="
          color:#071d35;
          margin-bottom:20px;
          font-size:22px;
        "
      >
        Complete Your Order
      </h3>


      <label
        style="
          display:block;
          font-size:12px;
          font-weight:800;
          margin-bottom:5px;
        "
      >
        CUSTOMER NAME *
      </label>


      <input
        id="customerName"
        type="text"
        placeholder="Your full name"
        style="
          width:100%;
          padding:13px;
          margin-bottom:15px;
          border:1px solid #dbe5e9;
          border-radius:10px;
        "
      >


      <label
        style="
          display:block;
          font-size:12px;
          font-weight:800;
          margin-bottom:5px;
        "
      >
        MOBILE NUMBER *
      </label>


      <input
        id="customerMobile"
        type="tel"
        inputmode="numeric"
        maxlength="10"
        placeholder="10-digit mobile number"
        style="
          width:100%;
          padding:13px;
          margin-bottom:15px;
          border:1px solid #dbe5e9;
          border-radius:10px;
        "
      >


      <label
        style="
          display:block;
          font-size:12px;
          font-weight:800;
          margin-bottom:5px;
        "
      >
        DELIVERY AREA *
      </label>


      <select
        id="customerArea"
        style="
          width:100%;
          padding:13px;
          margin-bottom:15px;
          border:1px solid #dbe5e9;
          border-radius:10px;
          background:white;
        "
      >

        <option value="">
          Select delivery area
        </option>

        ${DELIVERY_AREAS
          .map(
            (area) => `
              <option value="${area}">
                ${area}
              </option>
            `
          )
          .join("")}

      </select>


      <label
        style="
          display:block;
          font-size:12px;
          font-weight:800;
          margin-bottom:5px;
        "
      >
        FULL DELIVERY ADDRESS *
      </label>


      <textarea
        id="customerAddress"
        placeholder="Building, road, landmark, area..."
        rows="4"
        style="
          width:100%;
          padding:13px;
          margin-bottom:15px;
          border:1px solid #dbe5e9;
          border-radius:10px;
          resize:vertical;
          font-family:inherit;
        "
      ></textarea>


      <label
        style="
          display:block;
          font-size:12px;
          font-weight:800;
          margin-bottom:5px;
        "
      >
        ORDER NOTE
      </label>


      <textarea
        id="customerNote"
        placeholder="Any special cutting or delivery instruction..."
        rows="3"
        style="
          width:100%;
          padding:13px;
          margin-bottom:20px;
          border:1px solid #dbe5e9;
          border-radius:10px;
          resize:vertical;
          font-family:inherit;
        "
      ></textarea>


      <button
        type="button"
        onclick="sendWhatsAppOrder()"
        style="
          width:100%;
          padding:15px;
          border:none;
          border-radius:12px;
          background:#1f9d68;
          color:white;
          font-weight:900;
          font-size:15px;
        "
      >
        💬 Send Order on WhatsApp
      </button>


      <p
        style="
          margin-top:12px;
          font-size:10px;
          color:#82949e;
          text-align:center;
        "
      >
        Fresh fish prices and final
        availability will be confirmed
        by The Macchi Mart.
      </p>

    </div>

  `;


  const cartFooter =
    document.querySelector(
      ".cart-footer"
    );


  if (cartFooter) {

    cartFooter.style.display =
      "none";

  }

}


/* =========================================================
   RESTORE CART FOOTER
========================================================= */

function restoreCartFooter() {

  const cartFooter =
    document.querySelector(
      ".cart-footer"
    );


  if (cartFooter) {

    cartFooter.style.display =
      "";

  }

}


/* =========================================================
   SEND WHATSAPP ORDER
========================================================= */

function sendWhatsAppOrder() {

  const nameElement =
    document.getElementById(
      "customerName"
    );

  const mobileElement =
    document.getElementById(
      "customerMobile"
    );

  const areaElement =
    document.getElementById(
      "customerArea"
    );

  const addressElement =
    document.getElementById(
      "customerAddress"
    );

  const noteElement =
    document.getElementById(
      "customerNote"
    );


  if (
    !nameElement ||
    !mobileElement ||
    !areaElement ||
    !addressElement
  ) {

    return;

  }


  const customerName =
    nameElement.value.trim();

  const customerMobile =
    mobileElement.value
      .replace(/\D/g, "")
      .trim();

  const customerArea =
    areaElement.value.trim();

  const customerAddress =
    addressElement.value.trim();

  const customerNote =
    noteElement
      ? noteElement.value.trim()
      : "";


  if (!customerName) {

    alert(
      "Please enter your name."
    );

    nameElement.focus();

    return;

  }


  if (
    customerMobile.length !== 10
  ) {

    alert(
      "Please enter a valid 10-digit mobile number."
    );

    mobileElement.focus();

    return;

  }


  if (!customerArea) {

    alert(
      "Please select your delivery area."
    );

    areaElement.focus();

    return;

  }


  if (!customerAddress) {

    alert(
      "Please enter your delivery address."
    );

    addressElement.focus();

    return;

  }


  let message = "";


  message +=
    "🐟 *THE MACCHI MART*\n";

  message +=
    "*From Ocean to Plate*\n";

  message +=
    "━━━━━━━━━━━━━━━━━━\n";

  message +=
    "🛒 *NEW SEAFOOD ORDER*\n";

  message +=
    "━━━━━━━━━━━━━━━━━━\n\n";


  message +=
    "👤 *CUSTOMER DETAILS*\n\n";

  message +=
    `Name: ${customerName}\n`;

  message +=
    `Mobile: ${customerMobile}\n`;

  message +=
    `Area: ${customerArea}\n`;

  message +=
    `Address: ${customerAddress}\n\n`;


  message +=
    "🐟 *ORDER DETAILS*\n\n";


  let knownTotal = 0;

  let hasTodayRate = false;


  cart.forEach(
    (item, index) => {

      message +=
        `*${index + 1}. ${item.name}*`;


      if (item.marathiName) {

        message +=
          ` (${item.marathiName})`;

      }


      message += "\n";


      message +=
        `Pack/Weight: ${item.selectedOption}\n`;

      message +=
        `Quantity: ${item.quantity}\n`;


      if (
        item.cleaning !==
        "Not Applicable"
      ) {

        message +=
          `Cleaning: ${item.cleaning}\n`;

      }


      if (item.todayRate) {

        message +=
          "Rate: Today's Rate - Please Confirm\n";

        hasTodayRate = true;

      } else {

        const itemTotal =
          item.price *
          item.quantity;


        knownTotal +=
          itemTotal;


        message +=
          `Price: ₹${formatPrice(item.price)}\n`;

        message +=
          `Subtotal: ₹${formatPrice(itemTotal)}\n`;

      }


      message += "\n";

    }
  );


  message +=
    "━━━━━━━━━━━━━━━━━━\n";


  if (
    knownTotal > 0
  ) {

    message +=
      `💰 *Known Total: ₹${formatPrice(knownTotal)}*\n`;

  }


  if (hasTodayRate) {

    message +=
      "🐟 Fresh Fish: *Today's Rate to be confirmed*\n";

  }


  message +=
    "━━━━━━━━━━━━━━━━━━\n";


  if (customerNote) {

    message +=
      `\n📝 *Order Note:*\n${customerNote}\n`;

  }


  message +=
    "\nPlease confirm availability, final price and delivery charges.";


  const whatsappURL =

    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


  window.open(
    whatsappURL,
    "_blank"
  );

}


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

  searchInput.addEventListener(
    "input",
    (event) => {

      searchText =
        event.target.value.trim();

      displayProducts();

    }
  );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

categoryButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        categoryButtons.forEach(
          (btn) => {

            btn.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        selectedCategory =
          button.dataset.category;


        displayProducts();

      }
    );

  }
);


/* =========================================================
   CART EVENTS
========================================================= */

if (cartButton) {

  cartButton.addEventListener(
    "click",
    () => {

      updateCart();

      openCart();

    }
  );

}


if (closeCartButton) {

  closeCartButton.addEventListener(
    "click",
    closeCart
  );

}


if (overlay) {

  overlay.addEventListener(
    "click",
    closeCart
  );

}


/* =========================================================
   CHECKOUT BUTTON
========================================================= */

if (whatsappOrderButton) {

  whatsappOrderButton.addEventListener(
    "click",
    showCheckoutForm
  );

}


/* =========================================================
   YEAR
========================================================= */

if (currentYear) {

  currentYear.textContent =
    new Date().getFullYear();

}


/* =========================================================
   INITIAL LOAD
========================================================= */

/*
  First show static products immediately.
  Then Firebase updates matching products.
*/

displayProducts();

updateCart();

loadFirebaseProducts();

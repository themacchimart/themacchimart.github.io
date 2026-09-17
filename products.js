/* =========================================================
   THE MACCHI MART
   PRODUCTS.JS
   Product Catalogue
========================================================= */


/* =========================================================
   PRODUCTS
========================================================= */

const products = [

  /* =======================================================
     1. SURMAI
  ======================================================= */

  {
    id: 1,

    name: "Surmai",

    marathiName: "सुरमई",

    category: "Fresh Fish",

    price: 0,

    priceType: "today",

    unit: "kg",

    image: "images/surmai.jpg",

    description:
      "Fresh Surmai selected for quality and freshness. Cleaning and cutting available.",

    options: [
      "500g",
      "1kg"
    ],

    cleaning: true,

    inStock: true
  },



  /* =======================================================
     2. POMFRET
  ======================================================= */

  {
    id: 2,

    name: "Pomfret",

    marathiName: "पापलेट",

    category: "Fresh Fish",

    price: 0,

    priceType: "today",

    unit: "kg",

    image: "images/pomfret.jpg",

    description:
      "Fresh Pomfret carefully selected and hygienically packed.",

    options: [
      "500g",
      "1kg"
    ],

    cleaning: true,

    inStock: true
  },



  /* =======================================================
     3. BANGDA
  ======================================================= */

  {
    id: 3,

    name: "Bangda",

    marathiName: "बांगडा",

    category: "Fresh Fish",

    price: 0,

    priceType: "today",

    unit: "kg",

    image: "images/bangda.jpg",

    description:
      "Fresh Bangda with cleaning and cutting option available.",

    options: [
      "500g",
      "1kg"
    ],

    cleaning: true,

    inStock: true
  },



  /* =======================================================
     4. RAWAS
  ======================================================= */

  {
    id: 4,

    name: "Rawas",

    marathiName: "रावस",

    category: "Fresh Fish",

    price: 0,

    priceType: "today",

    unit: "kg",

    image: "images/rawas.jpg",

    description:
      "Fresh Rawas selected for quality and prepared for home delivery.",

    options: [
      "500g",
      "1kg"
    ],

    cleaning: true,

    inStock: true
  },



  /* =======================================================
     5. BOMBIL
  ======================================================= */

  {
    id: 5,

    name: "Bombil",

    marathiName: "बॉम्बील",

    category: "Fresh Fish",

    price: 0,

    priceType: "today",

    unit: "kg",

    image: "images/bombil.jpg",

    description:
      "Fresh Bombil cleaned and hygienically packed for your order.",

    options: [
      "500g",
      "1kg"
    ],

    cleaning: true,

    inStock: true
  },



  /* =======================================================
     6. PRAWNS
  ======================================================= */

  {
    id: 6,

    name: "Prawns",

    marathiName: "कोळंबी",

    category: "Fresh Fish",

    price: 0,

    priceType: "today",

    unit: "kg",

    image: "images/prawns.jpg",

    description:
      "Fresh prawns with cleaning option available.",

    options: [
      "250g",
      "500g",
      "1kg"
    ],

    cleaning: true,

    inStock: true
  },



  /* =======================================================
     7. JAVLA
  ======================================================= */

  {
    id: 7,

    name: "Javla",

    marathiName: "जावळा",

    category: "Dry Fish",

    price: 320,

    priceType: "fixed",

    unit: "kg",

    image: "images/javla.jpg",

    description:
      "Premium quality Javla, carefully selected and hygienically packed.",

    options: [
      "250g",
      "500g",
      "1kg"
    ],

    cleaning: false,

    inStock: true
  },



  /* =======================================================
     8. KARDI
     PHOTO WILL BE ADDED LATER
  ======================================================= */

  {
    id: 8,

    name: "Kardi",

    marathiName: "करडी",

    category: "Dry Fish",

    price: 650,

    priceType: "fixed",

    unit: "kg",

    /*
      Temporary placeholder.
      When correct Kardi photo is available,
      replace this with:

      image: "images/kardi.jpg"
    */

    image: "logo.png",

    description:
      "Premium quality dry Kardi with hygienic packaging.",

    options: [
      "250g",
      "500g",
      "1kg"
    ],

    cleaning: false,

    inStock: true
  },



  /* =======================================================
     9. DRY BOMBIL
  ======================================================= */

  {
    id: 9,

    name: "Dry Bombil",

    marathiName: "सुका बॉम्बील",

    category: "Dry Fish",

    price: 480,

    priceType: "fixed",

    unit: "100 pcs",

    image: "images/dry-bombil.jpg",

    description:
      "Premium quality dried Bombil, selected and hygienically packed.",

    options: [
      "100 pcs"
    ],

    cleaning: false,

    inStock: true
  },



  /* =======================================================
     10. SODE / DRY PRAWNS
  ======================================================= */

  {
    id: 10,

    name: "Sode / Dry Prawns",

    marathiName: "सोडे / सुकी कोळंबी",

    category: "Dry Fish",

    price: 1750,

    priceType: "fixed",

    unit: "kg",

    image: "images/sode.jpg",

    description:
      "Premium dried prawns selected for quality and hygienically packed.",

    options: [
      "250g",
      "500g",
      "1kg"
    ],

    cleaning: false,

    inStock: true
  }

];



/* =========================================================
   BUSINESS INFORMATION
========================================================= */

const businessInfo = {

  name:
    "The Macchi Mart",

  tagline:
    "From Ocean to Plate",

  whatsapp:
    "918652065885",

  instagram:
    "@the_macchi_mart",

  deliveryAreas: [

    "Vile Parle",

    "Andheri",

    "Jogeshwari",

    "Bhandup"

  ]

};

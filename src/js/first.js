const itemNumber = document.getElementById('item_number');
const cartButton = document.getElementById('add_to_cart');
const card_img = document.getElementById('card_img');
let counter = 1;

// cartButton.addEventListener('click', () => {
//     itemNumber.innerText = counter++;
// })

const shoe_name = document.getElementById('shoe_name');
const phone_price = document.getElementById('phone_price');
console.log(shoe_name);

const shoe_price = document.getElementById('shoe_price');
const total = parseInt(shoe_price.innerHTML) + parseInt(phone_price.innerHTML);
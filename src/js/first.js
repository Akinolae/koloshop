const itemNumber = document.getElementById('item_number');
const cartButton = document.getElementById('add_to_cart');
const card_img = document.getElementById('card_img');
const timbs = document.getElementById('timbs');
const reg_err = document.getElementById('reg_err');
let counter = 1;


setInterval(() => {
    timbs.style.transform = 'scale(1.2)';
}, 1000);

setInterval(()=>{
    reg_err.style.display = "none";
}, 4000)

setInterval(() => {
    timbs.style.transform = 'scale(1)';
}, 2000);
const shoe_name = document.getElementById('shoe_name');
const phone_price = document.getElementById('phone_price');

const shoe_price = document.getElementById('shoe_price');
const total = parseInt(shoe_price.innerHTML) + parseInt(phone_price.innerHTML);

function getData () {
    fetch(`http://localhost:8000/users/${user_id}`).then((res)=> res.json()).then((data) => console.log(data))
}
// getData();

let arr = ['first', 'second', 'third', 'fourth', 'fifth'];
let obj = {
    first: "Ak",
    second: 'ak2',
    third: 'ak3',
    four: 'ak4'
}

function objData() {
}
function arrData() {
    arr.map((array, i) => {
        console.log(array);
    })
}
arrData();
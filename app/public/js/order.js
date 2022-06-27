document.querySelector('#lite-shop-order').onsubmit = function (event) {
    event.preventDefault();
    let username = document.querySelector('#username').value.trim();
    let phone = document.querySelector('#phone').value.trim();
    let email = document.querySelector('#email').value.trim();
    let address = document.querySelector('#address').value.trim();

    if (!document.querySelector('#rule').checked) {
        //с правилами не согласен
        Swal.fire({
            title: 'Внимание',
            text: 'Подтвердите ознакомление с информацией',
            type: 'info',
            confirmButtonText: 'Ok'
        });
        return false;
    }

    if (username == '' || phone == '' || email == '' || address == '') {
        //не заполнены поля
        Swal.fire({
            title: 'Внимание',
            text: 'Заполните все поля',
            icon: "error",
            confirmButtonText: 'Ok'
        });
        return false;
    }

    fetch('/finish-order', {
        method: 'POST',
        body: JSON.stringify({
            'username': username,
            'phone': phone,
            'address': address,
            'email': email,
            'key': JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (body) {
            if (body == 1) {
                Swal.fire({
                    title: 'Спасибо',
                    text: 'Заказ принят',
                    icone: "success",
                    confirmButtonText: 'Ok'
                });
            }
            else {
                Swal.fire({
                    title: 'Ошибка в Email-адресе',
                    text: 'Ошибка',
                    type: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        })
}
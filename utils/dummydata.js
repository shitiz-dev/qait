const users = {
    'adivmtest5512a@yopmail.com': '7D9YBI6ZIVYrGc45qgyteLUEgKI3',
    'adivmtest9912a@yopmail.com': 'qa4x0yGa8jS04XKImzBfZA3NSl03',
    'adivmtest1112ffg@yopmail.com': 'AiCdfZX2cBOUUPw8vKw9fls3hfi1',
    'adivmtest6612a@yopmail.com': '9P4zHt1rrsPF2Wh7Y5zWpunqhMJ2',
    'adivmtest8812a@yopmail.com': 'TYtazE9Yy8PHcOdRZT1cH9UyezG2',
    'adivmtest11112a@yopmail.com': 'PO45hQb8ZmPXHAGDXLALhYtImuk1',
    'adivmtest22213a@yopmail.com': 'PphAsFZb47Zzob5OefF9JngSUkV2',
    'adivmtest2212h@yopmail.com': '9Mr8QlVLbGOptbrOd0VqT6mVgHm1',
    'adivmtest3312a@yopmail.com': 'gpuAipEU69Vv1PnbMVCyaDxurhU2',
    'adivmtest@yopmail.com':'hNL4iN4aVrfNaZO4HI8rbQDrPlo2'
}


const getUSer = async (email) => {
    console.log('email', email)
    return (Promise.resolve({ value: users[email] }))
}

module.exports = { getUSer }

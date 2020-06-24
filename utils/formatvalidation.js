function validateEmailFormat(email) {
    const mailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (mailformat.test(String(email).toLowerCase())) {
        // console.log(email, "valid")
        return true
    }
    // console.log(email, "invalid")
    return false
}

module.exports = { validateEmailFormat }
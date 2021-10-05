function menuReveal() {
    if (document.getElementById('menuMobile').style.display == 'none') {
        document.getElementById('menuMobile').style.display = 'block'
        document.getElementById('menuToggle').innerHTML = 'เมนู >'
    } else {
        document.getElementById('menuMobile').style.display = 'none'
        document.getElementById('menuToggle').innerHTML = '< เมนู'
    }
    
}
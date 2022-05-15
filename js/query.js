$( document ).ready(async () => {
    $('.loading').fadeOut(1000)
})


//Funciones jquery
let open_menu = false
$('.open').on('click', async () => {
    if(open_menu == false) {
        $('.menu-open').show('slide')
        open_menu = true
    } else {
        $('.menu-open').hide("slide")
        console.log('asda')
        open_menu = false
    }
})







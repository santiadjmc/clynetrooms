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
        open_menu = false
    }
})

let lastScrollTop = 0

window.onscroll = function(e) {
    var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
   if (st > lastScrollTop){
       $('.movil-nav').css('position', 'fixed')
   } else {
    $('.movil-nav').css('position', 'sticky')
   }
   lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
}

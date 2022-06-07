
let guiaStatus = 0;
let canNavigate = true;

$('.guia').on('click', async(e) => {
    if(canNavigate) {
        if(guiaStatus == 0) {
            $('#texto').animate({'opacity': 0}, 400, function() {
                $('#texto').html('Donando algún incentivo a nuestra institución,<br> ayudaras a muchas personas que no pueden costearse un curso <br> para aprender lo que posiblemente les guste, la tecnologia').animate({'opacity': 1}, 400)
            })
        } else if(guiaStatus == 1) {
            $('#texto').animate({'opacity': 0}, 400, function() {
                $('#texto').html('Así también ayudando a estas personas, a trabajar con nosotros en <br><br> <img src="../img/footer.png" alt="Clynet">').animate({'opacity': 1}, 400)
            })
        } else if (guiaStatus == 2) {
            $('#texto').animate({'opacity': 0}, 400, function() {
                $('#texto').html('¿Qué dices?...<br> ¿Ayudaras a estas personas?').animate({'opacity': 1}, 400)
            })
            canNavigate = false
            $('#donate').fadeIn(1000)
            $('')
        }
        guiaStatus++
    } else {
        $('.guia').css('cursor', 'default')
        $('.navigate').css('display', 'none')
    }
})
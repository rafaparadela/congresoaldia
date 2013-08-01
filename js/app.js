$(document).ready(function() {
    routes();
});

$(window).on('hashchange', function() {
    routes();
});

var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
var dias = new Array ("LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO");

var api_url='http://proyectocolibri.es';
var partidos=[];
var diputados=[];

var ultimas_sesiones=[];

function routes () {
    var hash = window.location.hash.substring(1);
    switch(hash){
        case 'diputados':   chageView(function(){ cargaVistaDiputados(); }); break;
        case 'sesiones':    chageView(function(){ cargaVistaSesiones();  }); break;
        default:            chageView(function(){ cargaVistaPortada(); });
    }
}

function chageView (callback) {
    $('#loading').text('Cargando vista').fadeIn(400);
    var menuoptions=$('.menuoptions');
    $('.menuoption.active').removeClass('active');
    anima($('#contenido'),'fadeOutRight');
    if($('#presentacion').length>0){
        $('#presentacion').slideUp(2000, 'easeOutQuad',function(){ $('#presentacion').remove(); });
    }
    if (typeof callback == "function") setTimeout(function(){ callback(); },100); 
}


//PORTADA

function cargaVistaPortada () {
    $('#loading').hide();
    
    $('#contenido').empty().css('padding-top','40px');
    
    
    if($('#presentacion').length==0){
        var presentacion = $('<div></div>').attr({'id':'presentacion', 'class':'animated fadeInDown'}); 
        var head = $('<div></div>').attr({'class':'head'}); presentacion.append(head);
        var container = $('<div></div>').attr({'class':'container'}); head.append(container);
        var text = $('<div></div>').attr({'class':'span6 text animated fadeInLeft'}); container.append(text);
            var h4 = $('<h4></h4>').text('Entérate de todo'); text.append(h4);
            var p = $('<p></p>').html('La manera más sencilla de estar al día de todo lo que<br>pasa en el Congreso de los Diputados.'); text.append(p);
            var socialmedia = $('<div></div>').attr({'class':'socialmedia'}); text.append(socialmedia);
                var twitter = $('<div></div>').attr({'class':'item twitter'}).html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="http://www.congresoaldia.es/" data-via="rafaparadela" data-lang="es" data-related="congresoaldia">Twittear</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'); socialmedia.append(twitter);
                var facebook = $('<div></div>').attr({'class':'item facebook'}).html('<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.congresoaldia.es&amp;send=false&amp;layout=button_count&amp;width=120&amp;show_faces=true&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:120px; height:21px;" allowTransparency="true"></iframe>'); socialmedia.append(facebook);
                var plus = $('<div></div>').attr({'class':'item plus'}).html('<g:plusone size="medium" href="http://www.congresoaldia.es/"></g:plusone><script type="text/javascript" src="https://apis.google.com/js/plusone.js">{lang: "es"}</script>'); socialmedia.append(plus);
        
        var premac = $('<div></div>').attr({'class':'span6 premac animated fadeInRight'}); container.append(premac);
            var mac = $('<div></div>').attr({'id':'mac'}); premac.append(mac);
        
        $('#contenido').before(presentacion);
    }
    
    


    var row = $('<div></div>').attr({'id':'features', 'class':'row-fluid'}); $('#contenido').append(row);
        var span1 = $('<div></div>').attr({'class':'span4'}); row.append(span1);
            var h3 = $('<h3></h3>').html('<i class="icon-hand-right "></i> &nbsp; Cuál es el propósito'); span1.append(h3);
            var p = $('<p></p>').html('Aportar información sobre los diputados de nuestro congreso y sobre las decisiones que toman que tan directamente nos afecta a todos. Simplemente conocer más a quienes nos representan.'); span1.append(p);
            
        var span1 = $('<div></div>').attr({'class':'span4'}); row.append(span1);
            var h3 = $('<h3></h3>').html('<i class="icon-lightbulb"></i> &nbsp; Cómo surge'); span1.append(h3);
            var p = $('<p></p>').html('Desde que conocí el <a href="http://proyectocolibri.es/" target="_blank">Proyecto Colibrí</a> me pareció muy interesante poner toda esa información que recaban diariamente a disposición de todo el mundo.'); span1.append(p);
            
        var span1 = $('<div></div>').attr({'class':'span4'}); row.append(span1);
            var h3 = $('<h3></h3>').html('<i class="icon-random"></i> &nbsp; Cómo está'); span1.append(h3);
            var p = $('<p></p>').html('La manera más sencilla de estar al día de todo lo que pasa en el Congreso de los Diputados.'); span1.append(p);
            
            
    $('#contenido').removeClass('fadeOutRight');
    anima($('#contenido'),'fadeInLeft',true);

    // 
    // if(partidos.length==0){
    //     partidosRequest(api_url+'/api/v1/party/?limit=1000', function(){
    //         
    //         partidos = _(partidos).sortBy("name");
    //         
    //         if(diputados.length==0){
    //             
    //             diputadosRequest(api_url+'/api/v1/group/', function(){
    //                 if(ultimas_sesiones.length==0){
    //                     sesionesRequest(api_url+'/api/v1/session/?limit=1000&order_by=-date');
    //                 }
    //             });
    //         }
    //         
    //     });
    // }
    // 
    
    
}


//DIPUTADOS

function cargaVistaDiputados () {
    
    $('.menuoption.diputados').addClass('active');
    if(partidos.length==0){
        partidosRequest(api_url+'/api/v1/party/?limit=1000', function(){
            partidos = _(partidos).sortBy("name");
            muestraPartidos();
        });
    }
    else muestraPartidos();
}

function partidosRequest (url, callback) {
    $('#loading').text('Cargando partidos');
    
    $.getJSON(url, function(data) {
      
        $.each(data.objects, function(index, val) {
            partidos.push({'id':val.id, 'name':val.name});
        });
      
        if (typeof callback == "function") setTimeout(function(){ callback(); },10); 
      
    });
}

function muestraPartidos () {
    $('#contenido').empty();
    
    var row = $('<div></div>').attr({'class':'row'}); $('#contenido').append(row);
    var wrapper_partidos = $('<div></div>').attr({'id':'wrapper_partidos','class':'span2'}); row.append(wrapper_partidos);
    var wrapper_diputados = $('<div></div>').attr({'id':'wrapper_diputados','class':'span10'}); row.append(wrapper_diputados);
    
    $.each(partidos, function(index, val) {
        var elemento = $('<div></div>').attr({'class':'item','data-partido':val.id, 'data-acronimo':val.name, 'data-filter':'.partido'+val.id}).text(val.name); wrapper_partidos.append(elemento);
    });
   
    if(diputados.length==0){
        diputadosRequest(api_url+'/api/v1/group/', function(){
            muestraDiputados();
        });
    }
    else muestraDiputados();
    
}

function diputadosRequest (url, callback) {
    $('#loading').text('Cargando diputados');
    
    $.getJSON(url, function(data) {
      
        $.each(data.objects, function(index, partido) {
            
            $.each(partido.members, function(index, diputado) {
                diputados.push({    'acronimo':partido.acronym, 
                                    'partido':getParty(diputado.party), 
                                    'id':diputado.id, 
                                    'nombre':diputado.member.name+' '+diputado.member.second_name,
                                    'email':diputado.member.email,
                                    'twitter':diputado.member.twitter,
                                    'web':diputado.member.web,
                                    'avatar':diputado.member.avatar
                                });
            });
            
        });
      
        if (typeof callback == "function") setTimeout(function(){ callback(); },10); 
        
    });
}

function muestraDiputados () {
    var wrapper_diputados=$('#wrapper_diputados');
    
    
    $.each(diputados, function(index, val) {
        
        var diputado = $('<div></div>').attr({'data-partido':val.partido, 'class':'item partido'+val.partido}); wrapper_diputados.append(diputado);
        
        var foto = $('<div></div>').css({'background-image':'url('+val.avatar+')'}).attr({'class':'foto'}); diputado.append(foto);
        
        var titulo = $('<div></div>').attr({'class':'titulo'}).text(val.nombre); diputado.append(titulo);
        var subtitulo = $('<div></div>').attr({'class':'subtitulo'}).text(val.acronimo); diputado.append(subtitulo);
        
        if(val.email.length>''){
            var email = $('<div></div>').attr({'class':'social'}).html('<i class="icon-envelope"></i>&nbsp;&nbsp;'+val.email); diputado.append(email);
        }
        if(val.twitter.length>''){
            var twitter = $('<div></div>').attr({'class':'social'}).html('<i class="icon-twitter"></i>&nbsp;&nbsp;<a target="_blank" href="'+val.twitter+'">Twitter</a>'); diputado.append(twitter);
        }
        if(val.web.length>''){
            var web = $('<div></div>').attr({'class':'social'}).html('<i class="icon-globe"></i>&nbsp;&nbsp;<a target="_blank" href="'+val.web+'">Web personal</a>'); diputado.append(web);
        }
        
        
    });
    
    activaIsotope();
    
    
}

function activaIsotope () {
    var filtros = $('#wrapper_partidos .item');
    // var primer_filtro = filtros.first().attr('data-filter');
    
    $('#wrapper_diputados').isotope({
        itemSelector : '.item'
    });
    
    // $('#wrapper_diputados').isotope({ filter: primer_filtro });
    
    filtros.click(function() {
        filtros.removeClass("selected");
        $(this).addClass("selected");
        var selector = $(this).attr('data-filter');
        $('#wrapper_diputados').isotope({ filter: selector });
        return false;
    });
    
    filtros.first().click();
    
    $('#contenido').removeClass('fadeOutRight').css('padding-top','100px');;
    anima($('#contenido'),'fadeInLeft',true);
    
    $('#loading').fadeOut(400);
}


//SESIONES

function cargaVistaSesiones () {
    $('.menuoption.sesiones').addClass('active');
    if(ultimas_sesiones.length==0){
        sesionesRequest(api_url+'/api/v1/session/?limit=1000&order_by=-date', function(){
            muestraUltimasSesiones();
        });
    }
    else muestraUltimasSesiones();
}

function sesionesRequest (url, callback) {

    $('#loading').text('Cargando últimas sesiones');
    
    $.getJSON(url, function(data) {
      
        $.each(data.objects, function(index, val) {
            ultimas_sesiones.push({'date':val.date,'id':val.id,'votaciones':val.votings.length});
        });
      
        if (typeof callback == "function") setTimeout(function(){ callback(); },10); 
      
    });
      
}

function muestraUltimasSesiones () {
    $('#contenido').empty();
    
    
    $.each(ultimas_sesiones, function(index, val) {
        var fecha = new Date(val.date);
        var anio = fecha.getFullYear();
        var mes = fecha.getMonth();
        var dia = fecha.getDate();
        var dia_semana = fecha.getDay();
        
        var anio_wrapper=$('#anio'+anio);
        
        if(anio_wrapper.length>0)   var destino_mes=anio_wrapper.find('.anio_content');
        else var destino_mes = creaAnioWrapper(anio);

        var mes_wrapper=$('#mes'+anio+mes);
        if(mes_wrapper.length>0)   var destino_dia=mes_wrapper.find('.dias');
        else var destino_dia = creaMesWrapper(destino_mes,anio,mes);
        
        creaSesion(destino_dia,val,dia,dia_semana);

    });
    
    
    $('#contenido').removeClass('fadeOutRight').css('padding-top','100px');;
    anima($('#contenido'),'fadeInLeft',true);
    $('#loading').fadeOut(400);
}

function creaAnioWrapper (anio) {
    var item_anio=$('<div></div>').attr({'id':'anio'+anio, 'class':'row anio'}); $('#contenido').append(item_anio);
    var anio_number=$('<div></div>').attr({'class':'span2 anio_number'}); item_anio.append(anio_number);
    var titulo=$('<div></div>').attr({'class':'titulo'}).text(anio); anio_number.append(titulo);
    var anio_content=$('<div></div>').attr({'class':'span10 anio_content'}); item_anio.append(anio_content);
    
    return anio_content;
}

function creaMesWrapper (destino,anio,mes) {
    var item_mes=$('<div></div>').attr({'id':'mes'+anio+mes, 'class':'mes'}); destino.append(item_mes);
    var titulo=$('<div></div>').attr({'class':'titulo'}).text(meses[mes]); item_mes.append(titulo);
    var mes_content=$('<div></div>').attr({'class':'dias clearfix'}); item_mes.append(mes_content);
    
    return mes_content;
}

function creaSesion (destino,item,dia,dia_semana) {
    var item_dia=$('<div></div>').attr({'class':'dia'}); destino.append(item_dia);
    var semana=$('<div></div>').attr({'class':'semana'}).text(dias[dia_semana]); item_dia.append(semana);
    var titulo=$('<div></div>').attr({'class':'titulo'}).text(dia); item_dia.append(titulo);
    var subtitulo=$('<div></div>').attr({'class':'subtitulo'}).html(item.votaciones); item_dia.append(subtitulo);
    
    item_dia.click(function(e) {
        window.location.hash = 'sesion/'+dia;
        e.preventDefault();
    });
}






// MISCELANEA

function anima(elemento,animacion,transitorio) {
    elemento.addClass('animated').addClass(animacion);
    if(transitorio){
        var wait = window.setTimeout( function(){
            elemento.removeClass('animated').removeClass(animacion);
        },1300);
    }
    
}

function getParty (cadena) {
    return cadena.replace('/api/v1/party/','').replace('/','');
}




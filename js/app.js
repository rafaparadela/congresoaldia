$(document).ready(function() {
    routes();
    $('#anioactual').html((new Date).getFullYear());
});

$(window).on('hashchange', function() {
    routes();
});

var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
var dias = new Array ("LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO");

var api_url='http://proyectocolibri.es';
var partidos=[];
var diputados=[];
var nombre_diputado_seleccionado='';

var ultimas_sesiones=[];
var votaciones_sesion_seleccionada=[];

function routes () {
    var hash = window.location.hash.substring(1);

    var diputado_expreg = /^diputado\/.+/;
    var sesion_expreg = /^sesion\/.+/;
    
    switch (true) {
        case hash=='diputados':             chageView(function(){ cargaVistaDiputados(); }); break;
        case hash=='sesiones':              chageView(function(){ cargaVistaSesiones();  }); break;
        case diputado_expreg.test(hash):    chageView(function(){ cargaVistaDiputadoId();  }); break;
        case sesion_expreg.test(hash):      chageView(function(){ cargaVistaSesionId();  }); break;
        default:                            chageView(function(){ cargaVistaPortada(); });
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
            var p = $('<p></p>').html('Aportar información sobre los diputados de nuestro congreso y sobre las decisiones que toman y que tan directamente nos afecta a todos. Dar a conocer a quienes nos representan.'); span1.append(p);
            
        var span1 = $('<div></div>').attr({'class':'span4'}); row.append(span1);
            var h3 = $('<h3></h3>').html('<i class="icon-lightbulb"></i> &nbsp; Cómo surge'); span1.append(h3);
            var p = $('<p></p>').html('Desde que conocí el <a href="http://proyectocolibri.es/" target="_blank">Proyecto Colibrí</a> me pareció muy interesante poner toda esa información que recaban diariamente a disposición de todo el mundo.'); span1.append(p);
            
        var span1 = $('<div></div>').attr({'class':'span4'}); row.append(span1);
            var h3 = $('<h3></h3>').html('<i class="icon-gears"></i> &nbsp; El proyecto'); span1.append(h3);
            var p = $('<p></p>').html('Como la idea que lo inspiró, este proyecto es 100% libre. El <a href="https://github.com/rafaparadela/congresoaldia" target="_blank">código fuente</a> está disponible en GitHub para todo el que quiera hacer uso de él o añadirle funcionalidades.'); span1.append(p);
            
            
    $('#contenido').removeClass('fadeOutRight');
    anima($('#contenido'),'fadeInLeft',true);

    
    if(partidos.length==0){
        partidosRequest(api_url+'/api/v1/party/?limit=1000', function(){
            
            partidos = _(partidos).sortBy("name");
            
            if(diputados.length==0){
                
                diputadosRequest(api_url+'/api/v1/group/', function(){
                    if(ultimas_sesiones.length==0){
                        sesionesRequest(api_url+'/api/v1/session/?limit=1000&order_by=-date');
                    }
                });
            }
            
        });
    }
    
    
    
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
                diputados.push({    'acronimo':partido.acronym.trim(), 
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
        foto.click(function(e){
            window.location.hash = 'diputado/'+val.id;
            e.preventDefault();
        });
        
        var titulo = $('<div></div>').attr({'class':'titulo'}).text(val.nombre); diputado.append(titulo);
        titulo.click(function(e){
            window.location.hash = 'diputado/'+val.id;
            e.preventDefault();
        });
        
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


//DIPUTADO

function cargaVistaDiputadoId () {
    
    $('.menuoption.diputados').addClass('active');
    if(diputados.length==0){
        diputadosRequest(api_url+'/api/v1/group/', function(){
            muestraDatosDiputado();
        });
    }
    else muestraDatosDiputado();
}

function muestraDatosDiputado () {
    $('#contenido').empty();
    
    var hash = window.location.hash.substring(1);
    var id = getDiputadoHash(hash);
    
    var diputado = _.where(diputados, {"id":parseInt(id) });
    
    if(diputado.length>0){
        diputado=diputado[0];
        
        nombre_diputado_seleccionado=diputado.nombre;
        
        var pre = $('<div></div>').attr({'class':'pull-right volver'}).html('Volver'); $('#contenido').append(pre);
            pre.click(function(e){
                window.history.back();
                e.preventDefault();
            });
        
        var row = $('<div></div>').attr({'class':'row centrado'}); $('#contenido').append(row);
            var span = $('<div></div>').attr({'id':'diputado','class':'span12'}); row.append(span);
            var titulo = $('<div></div>').attr({'class':'titulo'}).text(diputado.nombre); span.append(titulo);
            var subtitulo = $('<div></div>').attr({'class':'subtitulo'}).text(diputado.acronimo); span.append(subtitulo);
            var foto = $('<div></div>').css({'background-image':'url('+diputado.avatar+')'}).attr({'class':'foto'}); span.append(foto);
            var social = $('<div></div>').attr({'class':'social'}); span.append(social);
            
            
            if(diputado.email.length>'') social.append('<i class="icon-envelope"></i>&nbsp;&nbsp;'+diputado.email);
            if(diputado.twitter.length>'') social.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="icon-twitter"></i>&nbsp;&nbsp;<a target="_blank" href="'+diputado.twitter+'">Twitter</a>');
            if(diputado.web.length>'') social.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="icon-globe"></i>&nbsp;&nbsp;<a target="_blank" href="'+diputado.web+'">Web personal</a>');
            
        
        var row = $('<div></div>').attr({'class':'row'}); $('#contenido').append(row);
            var span = $('<div></div>').attr({'class':'span12 seccion_header'}).text('Sus últimas votaciones'); row.append(span);
            
        var cargando = $('<div></div>').attr({'id':'cargando'}); $('#contenido').append(cargando);
            
            
        if(ultimas_sesiones.length==0){
            sesionesRequest(api_url+'/api/v1/session/?limit=1000&order_by=-date', function(){
                detallesUltimaSesion(diputado.id);
            });
        }
        else detallesUltimaSesion(diputado.id);
            

        $('#contenido').removeClass('fadeOutRight').css('padding-top','100px');;
        anima($('#contenido'),'fadeInLeft',true);

        $('#loading').fadeOut(400);
        
    }
    else window.location.hash = '';
    
    
}

function detallesUltimaSesion (id) {
    
    var ultima_sesion=ultimas_sesiones[0];
    
    sesionDetailRequest(api_url+'/api/v1/session/'+ultima_sesion.id+'/', function(){
        muestraUltimasVotacionesDiputado(id);
    });
}


function muestraUltimasVotacionesDiputado (diputado_id) {

    $('#cargando').remove();
    
    $.each(votaciones_sesion_seleccionada.votings, function(index, votacion) {
        
        var id=getVotacion(votacion);
        var item = $('<div></div>').attr({'id':'votacion'+id,'class':'row votacion','data-id':id}); $('#contenido').append(item);
            var span10 = $('<div></div>').attr({'class':'span10'}); item.append(span10);
                var titulo=$('<div></div>').attr({'class':'titulo'}).text('Cargando titulo...'); span10.append(titulo);
                var descripcion=$('<div></div>').attr({'class':'descripcion'}).text('Cargando descripción...'); span10.append(descripcion);
                
            var span2 = $('<div></div>').attr({'class':'span2'}); item.append(span2);
                var grafica=$('<div></div>').attr({'id':'grafica'+id,'class':'grafica'}); span2.append(grafica);
                
                rellenaDatosVotacion(id,diputado_id);
                
                
    });
    
    
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
            ultimas_sesiones.push({'date':val.date,'id':val.id,'sesion':val.session,'votaciones':val.votings.length});
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
        
        creaSesion(destino_dia,val,dia,dia_semana,val.id);

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

function creaSesion (destino,item,dia,dia_semana,id) {
    var item_dia=$('<div></div>').attr({'class':'dia'}); destino.append(item_dia);
    var semana=$('<div></div>').attr({'class':'semana'}).text(dias[dia_semana]); item_dia.append(semana);
    var titulo=$('<div></div>').attr({'class':'titulo'}).text(dia); item_dia.append(titulo);
    var subtitulo=$('<div></div>').attr({'class':'subtitulo'}).html(item.votaciones); item_dia.append(subtitulo);
    
    item_dia.click(function(e) {
        window.location.hash = 'sesion/'+id;
        e.preventDefault();
    });
}



//SESION

function cargaVistaSesionId () {
    
    $('.menuoption.sesiones').addClass('active');
    if(ultimas_sesiones.length==0){
        sesionesRequest(api_url+'/api/v1/session/?limit=1000&order_by=-date', function(){
            muestraDatosSesion();
        });
    }
    else muestraDatosSesion();
    
}

function muestraDatosSesion () {
    
    $('#contenido').empty();
    
    var hash = window.location.hash.substring(1);
    var id = getSesionHash(hash);
    
    var sesion = _.where(ultimas_sesiones, {"id":parseInt(id) });
    
    if(sesion.length>0){
        
        sesionDetailRequest(api_url+'/api/v1/session/'+id+'/', function(){
            
            //SI no tenemos diputados los buscamos
            if(diputados.length==0){
                diputadosRequest(api_url+'/api/v1/group/', function(){
                    muestraDatosGeneralesSesion();
                });
            }
            else muestraDatosGeneralesSesion();
            
        });
        
    }
    else window.location.hash = '';
    
    
}

function sesionDetailRequest (url, callback) {

    $('#loading').text('Cargando detalles de la sesión');
    
    $.getJSON(url, function(data) {
      
        votaciones_sesion_seleccionada.length=0;
        votaciones_sesion_seleccionada=data;
        
        if (typeof callback == "function") setTimeout(function(){ callback(); },10); 
      
    });
      
}

function muestraDatosGeneralesSesion () {
    
    $('#contenido').empty();
    
        
    var fecha = new Date(votaciones_sesion_seleccionada.date);
    var anio = fecha.getFullYear();
    var mes = fecha.getMonth();
    var dia = fecha.getDate();
    var dia_semana = fecha.getDay();
    var mes_letras=meses[mes];
    var dia_letras=dias[dia_semana];
    
    var pre = $('<div></div>').attr({'class':'pull-right volver'}).html('Volver'); $('#contenido').append(pre);
        pre.click(function(e){
            window.history.back();
            e.preventDefault();
        });
        
    var row = $('<div></div>').attr({'class':'row centrado'}); $('#contenido').append(row);
        var span = $('<div></div>').attr({'id':'sesion','class':'span12'}); row.append(span);
        var circulo=$('<div></div>').attr({'class':'circulo'}); span.append(circulo);
        var semana=$('<div></div>').attr({'class':'semana'}).text(dia_letras); circulo.append(semana);
        var dia=$('<div></div>').attr({'class':'eldia'}).text(dia); circulo.append(dia);
        var mesanio=$('<div></div>').attr({'class':'mesanio'}).text(mes_letras+' '+anio); circulo.append(mesanio);
        
    var row = $('<div></div>').attr({'class':'row'}); $('#contenido').append(row);
        var span = $('<div></div>').attr({'class':'span12 seccion_header'}).text('Votaciones'); row.append(span);
        
    $.each(votaciones_sesion_seleccionada.votings, function(index, votacion) {
        
        var id=getVotacion(votacion);
        var item = $('<div></div>').attr({'id':'votacion'+id,'class':'row votacion','data-id':id}); $('#contenido').append(item);
            var span10 = $('<div></div>').attr({'class':'span10'}); item.append(span10);
                var titulo=$('<div></div>').attr({'class':'titulo'}).text('Cargando titulo...'); span10.append(titulo);
                var descripcion=$('<div></div>').attr({'class':'descripcion'}).text('Cargando descripción...'); span10.append(descripcion);
                
            var span2 = $('<div></div>').attr({'class':'span2'}); item.append(span2);
                var grafica=$('<div></div>').attr({'id':'grafica'+id,'class':'grafica'}); span2.append(grafica);
                
                rellenaDatosVotacion(id, false);
                
                
    });
        
        
        
    
    
    
    $('#contenido').removeClass('fadeOutRight').css('padding-top','100px');
    
    // $('#contenido').html(JSON.stringify(votaciones_sesion_seleccionada, undefined, 20));
    
    anima($('#contenido'),'fadeInLeft',true);

    $('#loading').fadeOut(400);
}

function rellenaDatosVotacion (id, diputado_id) {
    var item=$('#votacion'+id);
    var titulo=item.find('.titulo');
    var descripcion=item.find('.descripcion');
    var grafica=item.find('.grafica');
    
    var url=api_url+'/api/v1/voting_full/'+id+'/';
    
    
    $.getJSON(url, function(data) {
      
        titulo.text(data.title);
        descripcion.text(data.record_text);
        
        var favor=parseInt(data.attendee);
        var contra=parseInt(data.against_votes);
        var abstenciones=parseInt(data.abstains);
        var total=favor+contra+abstenciones;
        
        if(total>0){
            Morris.Donut({
              element: 'grafica'+id,
              data: [
                {label: "A favor", value: favor},
                {label: "En contra", value: contra},
                {label: "Abstenciones", value: abstenciones}
              ],
              colors:["#375A99","#851A1F","#999"]
            });
            
            if(diputado_id){
                
                var havotado=dimeEleccionDeDiputado (nombre_diputado_seleccionado, diputado_id, data.votes);
                descripcion.append(havotado);
                
            }
            
            var vermas=$('<div></div>').attr({'data-id':id,'class':'vermas'}).text('Ver detalles'); descripcion.append(vermas);
            
            vermas.click(function(){
                muestraDesgloseVotacion(this);
            });
            
            
            var detalles=$('<div></div>').attr({'id':'detalles'+id,'class':'detalles'}).hide(); descripcion.append(detalles);
            
            var ordenacion=$('<div></div>').attr({'id':'ordenacion'+id, 'class':'ordenacion'}).html('Ordenar por: '); detalles.append(ordenacion);
                var por_votacion=$('<span></span>').attr({'class':'orden votacion'}).text('   Votación   '); ordenacion.append(por_votacion);
                var por_grupo=$('<span></span>').attr({'class':'orden grupo'}).text('   Grupos parlamentarios   '); ordenacion.append(por_grupo);
                
                
            
            var desglose_wrapper=$('<div></div>').attr({'id':'desglose'+id, 'data-id':id,'class':'desglose_wrapper clearfix'}); detalles.append(desglose_wrapper);
            
                $.each(data.votes, function(index, voto) {
                    var miembro=getMember(voto.member);
                    var eleccion=getEleccion(voto.vote);
                    
                    var diputado = _.where(diputados, {"id":parseInt(miembro) });
                    if(diputado.length>0){
                        diputado=diputado[0];
                        var grupo=getGrupo(diputado.acronimo);
                        var item=$('<div></div>').attr({'class':'item '+eleccion, 'data-votacion':eleccion, 'data-grupo':grupo }).text(diputado.nombre.substring(0,35)+' ['+diputado.acronimo+']'); desglose_wrapper.append(item);
                        item.click(function(){
                            window.location.hash = 'diputado/'+diputado.id;
                            e.preventDefault();
                        });
                    }
                    
                    
                });
                
            
        }
        
        else{
            grafica.css('background','none').html('<i class="icon-warning-sign"></i><br>Datos no obtenidos');
        }
        
        
      
    });
    
}

function muestraDesgloseVotacion (elemento) {
    var prota = $(elemento);
    var id= prota.attr('data-id');
    var detalles=prota.siblings('.detalles');
    var ordenacion=detalles.find('.ordenacion');
    var por_votacion=ordenacion.find('.orden.votacion');
    var por_grupo=ordenacion.find('.orden.grupo');
    
    
    $('.detalles.activo').hide();
    $('.vermas').text('Ver detalles');
    
    if(!detalles.hasClass('activo')){
        
        detalles.addClass('activo');
        prota.text('Ocultar detalles');
        
        detalles.slideDown(2000, 'easeOutQuad',function(){
    
            $('#desglose'+id).isotope({
                itemSelector : '.item',
                masonry: { columnWidth: 250 },
                getSortData : {
                    votacion : function ( $elem ) {
                      return $elem.attr('data-votacion');
                    },
                    grupo : function ( $elem ) {
                      return $elem.attr('data-grupo');
                    }
                  }
            });
        
            por_votacion.click(function(){
                por_grupo.removeClass('seleccionado');
                por_votacion.addClass('seleccionado');
                $('#desglose'+id).isotope({ sortBy : 'votacion' });
                  return false;
            });
        
            por_grupo.click(function(){
                por_votacion.removeClass('seleccionado');
                por_grupo.addClass('seleccionado');
                $('#desglose'+id).isotope({ sortBy : 'grupo' });
                  return false;
            });
        
            
        });
        
    }
    else{
        detalles.removeClass('activo');
    }

}


function dimeEleccionDeDiputado (nombre, diputado_id, votos) {
    var cadena_member="/api/v1/member/"+diputado_id+"/";
    var item_votacion = _.where(votos, {"member":cadena_member });
    if(item_votacion.length>0){
        item_votacion=item_votacion[0];
        
        switch(item_votacion.vote){
            case 'Sí':          var havotado=$('<div></div>').attr({'class':'havotado favor'}).text(nombre+' votó a favor'); break;
            case 'No':          var havotado=$('<div></div>').attr({'class':'havotado contra'}).text(nombre+' votó en contra'); break;
            case 'Abstención':  var havotado=$('<div></div>').attr({'class':'havotado abstencion'}).text(nombre+' se abstuvo'); break;
            case 'No vota':     var havotado=$('<div></div>').attr({'class':'havotado novota'}).text(nombre+' no votó'); break;
            default:            
        }
        
        
    }
    else var havotado=$('<div></div>').attr({'class':'havotado novota'}).text('No está disponible la votación de '+nombre);
    
    return havotado;
    
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

function getMember (cadena) {
    return cadena.replace('/api/v1/member/','').replace('/','');
}

function getVotacion (cadena) {
    return cadena.replace('/api/v1/voting_full/','').replace('/','');
}

function getDiputadoHash (hash) {
    return hash.replace('diputado/','');
}

function getSesionHash (hash) {
    return hash.replace('sesion/','');
}

function getEleccion (cadena) {
    switch(cadena.replace(' ','').replace('í','i').substring(0,4).toLowerCase()){
        case 'si':      var dev='a_si'; break;
        case 'no':      var dev='b_no'; break;
        case 'abst':    var dev='c_abst'; break;
        case 'novo':    var dev='d_novo'; break;
    }
    
    return dev;
}

function getGrupo (cadena) {
    return cadena.replace(' ','').replace('-','').toLowerCase();
}




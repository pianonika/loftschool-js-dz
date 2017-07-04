ymaps.ready(function () {

    var myMap = new ymaps.Map('map', {
        center: [55.76, 37.64], // Москва
        zoom: 5
    }, {
        searchControlProvider: 'yandex#search'
    });
    // Создаем собственный макет с информацией о выбранном геообъекте.
    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
            '<div class=ballon_body>' +
                '<a href="#" data-id="{{ properties.id }}" class="link-placemark">{{ properties.balloonContentBody|raw }}</a><br>' +
                '{{ properties.balloonContentFooter|raw }}' +
            '</div>' +
            '<div class=ballon_footer>{{ properties.data|raw }}</div>'
    );   

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 250,
        clusterBalloonContentLayoutHeight: 150,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
        // Настройка внешего вида нижней панели.
        // Режим marker рекомендуется использовать с небольшим количеством элементов.
        // clusterBalloonPagerType: 'marker',
        // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
        // clusterBalloonCycling: false,
        // Можно отключить отображение меню навигации.
        // clusterBalloonPagerVisible: false
    });

    myMap.geoObjects.add(clusterer);

    var dataPoints = [];

    var socket = new WebSocket("ws://localhost:8090");

    socket.addEventListener('message', function(event) {
        addPoint(event.data);
    });

    socket.addEventListener('error', function() {
        alert('Соединение закрыто или не может быть открыто');
    });

    function addPoint(point) {
        var dataPlacemark = JSON.parse(point);
        dataPoints.push(dataPlacemark)

        var myPlacemark = new ymaps.Placemark(dataPlacemark.geometry.coordinates, dataPlacemark.properties);

        myPlacemark.events.add('click', funEventPlacemarkClick);
        clusterer.add(myPlacemark);

        console.log(point);
        console.log(dataPlacemark.geometry.coordinates);
        console.log(balloon.getPosition());

        if(balloon.isOpen() && dataPlacemark.geometry.coordinates.join(',') == balloon.getPosition().join(','))
        {
            var dataForBallon = getDataByPlacemarkId(dataPlacemark.properties.id);
            balloon.open(dataForBallon.coords, dataForBallon.data);
        }
    }

    function sendMessage(point) {
        socket.send(JSON.stringify(point));
    }

    // функция для клика по метке
    var funEventPlacemarkClick = function (e) {                    
        var placemark = e.get('target');
        balloon.open(placemark.geometry.getCoordinates(),
            {
                formHeader:placemark.properties.get('balloonContentBody'),
                otzyvy: getOtzyvyByCoord(placemark.geometry.getCoordinates())
            });
        e.preventDefault();
    };

    // Создаем собственный макет с формой для отзывов
    var customForm = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<div class=form><div class=form_header><h2>{{ formHeader|raw }}</h2><span class="close"></span></div>' +
            '<div class=form_otzyvy>' + 
                     '{% for otzyv in otzyvy %}' +
                         // Переменная name "видна" только в блоке for ... endfor
                         '<b>{{ otzyv.person }}:</b> {{ otzyv.place }} {{ otzyv.data }}<br>{{ otzyv.text }}<br>' +
                     '{% endfor %}' +
            '</div>' +
            '<div class=form-body>'+
                '<h2 class=form-body-header>ВАШ ОТЗЫВ</h2>'+
                '<input type=text id=person name=person placeholder="Ваше имя"><br>'+
                '<input type=text id=place name=place placeholder="Укажите место"><br>'+
                '<textarea rows=5 id=otzyv name=otzyv placeholder="Поделитесь впечатлениями"></textarea><br>'+
                '<input type=submit id=post name=post>'+
            '</div></div>'
    );
    
    // Создание независимого экземпляра балуна и отображение его в центре карты.
    var balloon = new ymaps.Balloon(myMap,{layout:customForm});
    // Здесь родительскими устанавливаются опции карты,
    // где содержатся значения по умолчанию для обязательных опций.
    balloon.options.setParent(myMap.options);
    
    balloon.events.add('click', function (e) {
        // клик на кнопке добавить отзыв
       if(e.get('domEvent').originalEvent.target.id == 'post')
       {
            var today = new Date();
            var dataPlacemark = {
                type:'Feature',
                geometry:{
                    type: "Point",
                    coordinates: e.get('target').getPosition()
                },
                properties:{
                    balloonContentHeader: place.value,
                    balloonContentBody: e.get('target').getData().formHeader,
                    balloonContentFooter: otzyv.value,
                    person: person.value,
                    data: today.toLocaleString(),
                }
            }

            sendMessage(dataPlacemark);
            

       }
       // клик на крестике
       if(e.get('domEvent').originalEvent.target.classList && e.get('domEvent').originalEvent.target.classList.contains('close')) 
       {
             balloon.close(); 
       }
    });

    // Слушаем клик на карте
    myMap.events.add('click', function (e) {
        var lastCoords = e.get('coords');

        ymaps.geocode(lastCoords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            var lastAdress = firstGeoObject.getAddressLine();
            // Открываем балун
            balloon.open(lastCoords, {formHeader:lastAdress});

        });
    });

    // все отзывы для этих координат
    function getOtzyvyByCoord(coords) {
        var otzyvy = [];
        for (var i = 0; i < dataPoints.length ; i++) {
            if(coords.join(',') == dataPoints[i].geometry.coordinates.join(',')){
                otzyvy.push({
                    person: dataPoints[i].properties.person,
                    place: dataPoints[i].properties.balloonContentHeader,
                    data: dataPoints[i].properties.data,
                    text:  dataPoints[i].properties.balloonContentFooter,
                })
            }
        }
        return otzyvy;
    }

    // данные для формы по id метки
    function getDataByPlacemarkId(placemarkid) {
        var otzyvy = [];
        for (var i = 0; i < dataPoints.length ; i++) {
            if(placemarkid == dataPoints[i].properties.id){
                var dataForBallon = { 
                    coords: dataPoints[i].geometry.coordinates,
                    data: {
                        formHeader: dataPoints[i].properties.balloonContentBody,
                        otzyvy: getOtzyvyByCoord(dataPoints[i].geometry.coordinates)
                    }    
                };

                return dataForBallon;
            }
        }

        return '{}';
    }

    // слушаем клики по ссылке в каруселе. Может можно не на документе а ниже где-то слушать???
    document.addEventListener('click', function (e) {
       if(e.target.classList && e.target.classList.contains('link-placemark'))
       {
        var dataForBallon = getDataByPlacemarkId(e.target.dataset.id);
        balloon.open(dataForBallon.coords, dataForBallon.data);
        clusterer.balloon.close();
       };
    })
})
   


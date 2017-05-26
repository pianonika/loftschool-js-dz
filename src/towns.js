/**
 * ДЗ 6.2 - Создать страницу с текстовым полем для фильтрации городов
 *
 * Страница должна предварительно загрузить список городов из
 * https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * и отсортировать в алфавитном порядке.
 *
 * При вводе в текстовое поле, под ним должен появляться список тех городов,
 * в названии которых, хотя бы частично, есть введенное значение.
 * Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.
 *
 * Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 * После окончания загрузки городов, надпись исчезает и появляется текстовое поле.
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 *
 * *** Часть со звездочкой ***
 * Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 * то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 * При клике на кнопку, процесс загруки повторяется заново
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');

/**
 * Функция должна загружать список городов из https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 * И возвращать Promise, которой должен разрешиться массивом загруженных городов
 *
 * @return {Promise<Array<{name: string}>>}
 */
function loadTowns() {
    function sortCities(a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }

        return 0;
    }

    var p = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json', true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) {
                return;
            }
            if (xhr.status != 200) {
                reject();
            } else {
                var cities = JSON.parse(xhr.response);

                cities.sort(sortCities);
                resolve(cities);
            }

        };
        xhr.send();
    });

    return p;
}
/**
 * Функция должна проверять встречается ли подстрока chunk в строке full
 * Проверка должна происходить без учета регистра символов
 *
 * @example
 * isMatching('Moscow', 'moscow') // true
 * isMatching('Moscow', 'mosc') // true
 * isMatching('Moscow', 'cow') // true
 * isMatching('Moscow', 'SCO') // true
 * isMatching('Moscow', 'Moscov') // false
 *
 * @return {boolean}
 */
function isMatching(full, chunk) {
    if (chunk == '') {
        return false;
    }
    if (~full.toLowerCase().indexOf(chunk.toLowerCase())) {
        return true;
    }

    return false;
}

let loadingBlock = homeworkContainer.querySelector('#loading-block');
let filterBlock = homeworkContainer.querySelector('#filter-block');
let filterInput = homeworkContainer.querySelector('#filter-input');
let filterResult = homeworkContainer.querySelector('#filter-result');
let townsPromise = loadTowns();
let cities;

loadingBlock.textContent = 'Загрузка...';
filterBlock.style.display = 'none';

function startWork(rez) {
    loadingBlock.textContent = '';
    filterBlock.style.display = 'block';
    cities = rez;
    if (document.getElementById('load')) {
        homeworkContainer.removeChild(document.getElementById('load'));
    }
}
townsPromise.then(function (rez) {
    startWork(rez);
}, function () {
    filterBlock.style.display = 'none';
    loadingBlock.textContent = 'Не удалось загрузить города';

    var but = document.createElement('BUTTON');

    but.textContent = 'Повторить';
    but.id = 'load';
    homeworkContainer.appendChild(but);
    but.addEventListener('click', function () {
        loadTowns().then(function (rez) {
            startWork(rez);
        });
    })
});

filterInput.addEventListener('keyup', function () {
    for (var curNode = filterResult.firstChild; curNode != null;) {
        var nextNode = curNode.nextSibling;

        filterResult.removeChild(curNode);
        curNode = nextNode;
    }
    for (var i = 0; i < cities.length; i++) {
        if (isMatching(cities[i].name, this.value)) {
            var p = document.createElement('P');

            p.textContent = cities[i].name;
            filterResult.appendChild(p);
        }
    }
});

export {
    loadTowns,
    isMatching
};

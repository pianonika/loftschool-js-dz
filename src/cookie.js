/**
 * ДЗ 7.2 - Создать редактор cookie с возможностью фильтрации
 *
 * На странице должна быть таблица со списком имеющихся cookie:
 * - имя
 * - значение
 * - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)
 *
 * На странице должна быть форма для добавления новой cookie:
 * - имя
 * - значение
 * - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)
 *
 * Если добавляется cookie с именем уже существующией cookie, то ее значение в браузере и таблице должно быть обновлено
 *
 * На странице должно быть текстовое поле для фильтрации cookie
 * В таблице должны быть только те cookie, в имени или значении которых есть введенное значение
 * Если в поле фильтра пусто, то должны выводиться все доступные cookie
 * Если дабавляемая cookie не соответсвуте фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 * Если добавляется cookie, с именем уже существующией cookie и ее новое значение не соответствует фильтру,
 * то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена
 *
 * Для более подробной информации можно изучить код тестов
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');

function isMatching(full, chunk) {
    if (chunk == '') {
        return true;
    }
    if (~full.toLowerCase().indexOf(chunk.toLowerCase())) {
        return true;
    }

    return false;
}
function getCookiesMassiv() {
    var c = document.cookie;
    var cookies = c.split('; ');
    var massivCookies = [],
        indexMassiv = 0;

    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i]) {
            var [name, value] = cookies[i].split('=');

            massivCookies[indexMassiv] = { name: name, value: value };
            ++indexMassiv;
        }

    }

    return massivCookies;
}
function clearTable() {
    // удаляем все из таблицы
    for (var curNode = listTable.firstChild; curNode != null;) {
        var nextNode = curNode.nextSibling;

        listTable.removeChild(curNode);
        curNode = nextNode;
    }
}
function deleteCookie(name) {
    var d = new Date();

    d.setTime(d.getTime() - 1000);
    document.cookie = name + '=;expires=' + d.toUTCString();
}
function fillTable(filter) {
    // записывает в таблицу подходящие cookie
    var massivCookies = getCookiesMassiv();

    for (var i = 0; i < massivCookies.length; i++) {
        if (isMatching(massivCookies[i].name, filter) || isMatching(massivCookies[i].value, filter)) {
            var row = document.createElement('TR');
            var td1 = document.createElement('TD');

            td1.appendChild(document.createTextNode(massivCookies[i].name));

            var td2 = document.createElement('TD');

            td2.appendChild(document.createTextNode(massivCookies[i].value));

            var td3 = document.createElement('TD');
            var but = document.createElement('BUTTON');

            but.appendChild(document.createTextNode('DELETE'));
            but.setAttribute('coname', massivCookies[i].name);
            but.addEventListener('click', function (e) {
                deleteCookie(e.target.getAttribute('coname'));
                clearTable();
                fillTable('');
            });
            td3.appendChild(but);
            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
            listTable.appendChild(row);
        }
    }
}
filterNameInput.addEventListener('keyup', function () {
    clearTable();
    fillTable(this.value);
});

addButton.addEventListener('click', () => {
    document.cookie = addNameInput.value + '=' + addValueInput.value;
    clearTable();
    fillTable(filterNameInput.value);
});
window.onload = () => {
    clearTable();
    fillTable('');
}

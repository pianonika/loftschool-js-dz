/* ДЗ 4 - работа с DOM */

/**
 * Функция должна создать элемент с тегом DIV, поместить в него текстовый узел и вернуть получившийся элемент
 *
 * @param {string} text - текст, который необходимо поместить в div
 * @return {Element}
 */
function createDivWithText(text) {
    var div = document.createElement('div');

    div.innerHTML = text;

    return div;
}

/**
 * Функция должна создать элемент с тегом A, установить значение для атрибута href и вернуть получившийся элемент
 *
 * @param {string} hrefValue - значение для атрибута href
 * @return {Element}
 */
function createAWithHref(hrefValue) {
    var a = document.createElement('a');

    a.setAttribute('href', hrefValue);

    return a;
}

/**
 * Функция должна вставлять элемент what в начало элемента where
 *
 * @param {Element} what - что вставлять
 * @param {Element} where - куда вставлять
 */
function prepend(what, where) {
    where.prepend(what);
}

/**
 * Функция должна перебрать все дочерние элементы элемента where
 * и вернуть массив, состоящий из тех дочерних элементов
 * следующим соседом которых является элемент с тегом P
 * Рекурсия - по желанию
 *
 * @param {Element} where - где искать
 * @return {Array<Element>}
 *
 * @example
 * для html '<div></div><p></p><a></a><span></span><p></p>'
 * функция должна вернуть: [div, span]
 * т.к. следующим соседом этих элементов является элемент с тегом P
 */
function findAllPSiblings(where) {
    var children = where.children;
    var result = [];

    for (var i = 0; i < children.length; i++) {
        if (children[i].nextElementSibling && children[i].nextElementSibling.nodeName == 'P') {
            result.push(children[i]);
        }
    }

    return result;
}

/**
 * Функция должна перебрать все дочерние узлы типа "элемент" внутри where
 * и вернуть массив, состоящий из текстового содержимого перебираемых элементов
 * Но похоже, что в код закралась ошибка, которую нужно найти и исправить
 *
 * @param {Element} where - где искать
 * @return {Array<string>}
 */
function findError(where) {
    var result = [];

    for (var i = 0; i < where.children.length; i++) {
        result.push(where.children[i].innerText);
    }

    return result;
}

/**
 * Функция должна перебрать все дочерние узлы элемента where
 * и удалить из него все текстовые узлы
 * Без рекурсии!
 * Будьте внимательны при удалении узлов,
 * можно получить неожиданное поведение при переборе узлов
 *
 * @param {Element} where - где искать
 *
 * @example
 * после выполнения функции, дерево <div></div>привет<p></p>loftchool!!!
 * должно быть преобразовано в <div></div><p></p>
 */
function deleteTextNodes(where) {
    for (var curNode = where.firstChild; curNode != null;) {
        var nextNode = curNode.nextSibling;

        if (curNode.nodeType == 3) {
            where.removeChild(curNode);
        }
        curNode = nextNode;
    }
}

/**
 * Выполнить предудыщее задание с использование рекурсии
 * то есть необходимо заходить внутрь каждого дочернего элемента
 *
 * @param {Element} where - где искать
 *
 * @example
 * после выполнения функции, дерево <span> <div> <b>привет</b> </div> <p>loftchool</p> !!!</span>
 * должно быть преобразовано в <span><div><b></b></div><p></p></span>
 */
function deleteTextNodesRecursive(where) {
    for (var curNode = where.firstChild; curNode != null;) {
        var nextNode = curNode.nextSibling;

        if (curNode.nodeType == 3) {
            where.removeChild(curNode);
        }
        if (curNode.nodeType == 1 && curNode.childNodes.length != 0) {
            deleteTextNodesRecursive(curNode);
        }
        curNode = nextNode;
    }
}

/**
 * *** Со звездочкой ***
 * Необходимо собрать статистику по всем узлам внутри элемента root и вернуть ее в виде объекта
 * Статистика должна содержать:
 * - количество текстовых узлов
 * - количество элементов каждого класса
 * - количество элементов каждого тега
 * Для работы с классами рекомендуется использовать свойство classList
 * Постарайтесь не создавать глобальных переменных
 *
 * @param {Element} root - где собирать статистику
 * @return {{tags: Object<string, number>, classes: Object<string, number>, texts: number}}
 *
 * @example
 * для html <div class="some-class-1"><b>привет!</b> <b class="some-class-1 some-class-2">loftschool</b></div>
 * должен быть возвращен такой объект:
 * {
 *   tags: { DIV: 1, B: 2},
 *   classes: { "some-class-1": 2, "some-class-2": 1 },
 *   texts: 3
 * }
 */
function collectDOMStat(root, result) {
    if (result == undefined) {
        result = {
            tags: {},
            classes: {},
            texts: 0
        };
    }
    for (var curNode = root.firstChild; curNode != null; curNode = curNode.nextSibling) {
        if (curNode.nodeType == 1) {
            if (result.tags.hasOwnProperty(curNode.nodeName)) {
                result.tags[curNode.nodeName]++;
            } else {
                result.tags[curNode.nodeName] = 1;
            }
        }
        if (curNode.nodeType == 3) {
            result.texts++;
        }
        var classes = curNode.classList;

        if (classes) {
            for (var i = 0; i < classes.length; i++) {
                if (result.classes.hasOwnProperty(classes[i])) {
                    result.classes[classes[i]]++;
                } else {
                    result.classes[classes[i]] = 1;
                }
            }
        }
        if (curNode.childNodes && curNode.childNodes.length != 0) {
            collectDOMStat(curNode, result);
        }
    }

    return result;
}

/**
 * *** Со звездочкой ***
 * Функция должна отслеживать добавление и удаление элементов внутри элемента where
 * Как только в where добавляются или удаляются элемента,
 * необходимо сообщать об этом при помощи вызова функции fn со специальным аргументом
 * В качестве аргумента должен быть передан объек с двумя свойствами:
 * - type: типа события (insert или remove)
 * - nodes: массив из удаленных или добавленных элементов (а зависимости от события)
 * Отслеживание должно работать вне зависимости от глубины создаваемых/удаляемых элементов
 * Рекомендуется использовать MutationObserver
 *
 * @param {Element} where - где отслеживать
 * @param {function(info: {type: string, nodes: Array<Element>})} fn - функция, которую необходимо вызвать
 *
 * @example
 * если в where или в одного из его детей добавляется элемент div
 * то fn должна быть вызвана с аргументов:
 * {
 *   type: 'insert',
 *   nodes: [div]
 * }
 *
 * ------
 *
 * если из where или из одного из его детей удаляется элемент div
 * то fn должна быть вызвана с аргументов:
 * {
 *   type: 'remove',
 *   nodes: [div]
 * }
 */
function observeChildNodes(where, fn) {
    // создаём экземпляр MutationObserver
    var observer = new MutationObserver(function (mutations) {
        var info = {};

        mutations.forEach(function (mutation) {
            if (mutation.type == 'childList') {
                if (mutation.addedNodes.length) {
                    info.type = 'insert';
                    info.nodes = Array.prototype.slice.call(mutation.addedNodes);
                }
                if (mutation.removedNodes.length) {
                    info.type = 'remove';
                    info.nodes = Array.prototype.slice.call(mutation.removedNodes);
                }
                fn(info);
            }
        });
    });

// конфигурация нашего observer:
    var config = { childList: true };

// передаём в качестве аргументов целевой элемент и его конфигурацию
    observer.observe(where, config);
}

export {
    createDivWithText,
    createAWithHref,
    prepend,
    findAllPSiblings,
    findError,
    deleteTextNodes,
    deleteTextNodesRecursive,
    collectDOMStat,
    observeChildNodes
};

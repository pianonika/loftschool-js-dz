/* ДЗ 3 - работа с массивами и объеектами */

/*
 Задача 1:
 Напишите аналог встроенного метода forEach для работы с массивами
 */
function forEach(array, fn) {
    for (var i = 0; i < array.length; i++) {
        fn(array[i], i, array);
    }
}

/*
 Задача 2:
 Напишите аналог встроенного метода map для работы с массивами
 */
function map(array, fn) {
    var rezArray = [];

    for (var i = 0; i < array.length; i++) {
        rezArray[i] = fn(array[i], i, array);
    }

    return rezArray;
}

/*
 Задача 3:
 Напишите аналог встроенного метода reduce для работы с массивами
 */
function reduce(array, fn, initial) {
    var previousValue = initial,
        index = 0;

    if (initial === undefined) {
        previousValue = array[0];
        index = 1;
    }

    for (var i = index; i < array.length; i++) {
        previousValue = fn(previousValue, array[i], i, array);
    }

    return previousValue;
}

/*
 Задача 4:
 Функция принимает объект и имя свойства, которое необходиом удалить из объекта
 Функция должна удалить указанное свойство из указанного объекта
 */
function deleteProperty(obj, prop) {
    if (obj.hasOwnProperty(prop)) {
        delete obj[prop];
    }
}

/*
 Задача 5:
 Функция принимает объект и имя свойства и возвращает true или false
 Функция должна проверить существует ли укзаанное свойство в указанном объекте
 */
function hasProperty(obj, prop) {

    return obj.hasOwnProperty(prop);
}

/*
 Задача 6:
 Функция должна получить все перечисляемые свойства объекта и вернуть их в виде массива
 */
function getEnumProps(obj) {

    return Object.keys(obj);
}

/*
 Задача 7:
 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистра и вернуть в виде массива
 */
function upperProps(obj) {
    var propeties = Object.getOwnPropertyNames(obj);

    for (var i = 0; i < propeties.length; i++) {
        propeties[i] = propeties[i].toUpperCase();
    }

    return propeties;
}

/*
 Задача 8 *:
 Напишите аналог встроенного метода slice для работы с массивами
 */
function slice(array, from, to) {
    var rezArray = [],
        indexStart = from,
        indexEnd = to;

    if (from === undefined) {
        indexStart = 0;
    } else {
        if (from < 0) {
            indexStart = array.length + from;
        }
        if (from < 0) {
            indexStart = 0;
        }
    }
    if (to === undefined) {
        indexEnd = array.length;
    } else {
        if (to < 0) {
            indexEnd = array.length + to;
        }
        if (to > array.length) {
            indexEnd = array.length;
        }
    }
    for (var i = indexStart, indexRez = 0; i < indexEnd; i++) {
        rezArray[indexRez] = array[i];
        indexRez++;
    }

    return rezArray;
}

/*
 Задача 9 *:
 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
    var proxy = new Proxy(obj, {
        set(target, prop, value) {
            target[prop] = value ** 2;

            return true;
        }
    });

    return proxy;
}

export {
    forEach,
    map,
    reduce,
    deleteProperty,
    hasProperty,
    getEnumProps,
    upperProps,
    slice,
    createProxy
};

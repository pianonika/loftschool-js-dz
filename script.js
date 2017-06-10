function vkApi(method, options) {
    if (!options.v) {
        options.v = '5.64';
    }

    return new Promise((resolve, reject) => {
        VK.api(method, options, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

function vkInit() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 6067502
        });

        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

var templateAll = `
{{#each items}}
 {{#if all}}
    <li class="friend" id="f{{id}}" draggable="true">
        <img src="{{photo_200}}"  draggable="false">
        <div class="name">{{first_name}} {{last_name}}</div>
        <i class="btn" data-id="{{id}}">+</i>
    </li>
  {{/if}}
{{/each}}
`;
var templateList = `
{{#each items}}
 {{#if list}}
    <li class="friend" id="f{{id}}" draggable="true">
        <img src="{{photo_200}}"  draggable="false">
        <div class="name">{{first_name}} {{last_name}}</div>
        <i class="btn" data-id="{{id}}">x</i>
    </li>
  {{/if}}
{{/each}}
`;
var templateFnAll = Handlebars.compile(templateAll);
var templateFnList = Handlebars.compile(templateList);
// функция для поиска совпадений
function isMatching(full, chunk) {
    if (chunk == '') {
        return true;
    }
    if (~full.toLowerCase().indexOf(chunk.toLowerCase())) {
        return true;
    }

    return false;
}
// фильтр списков друзей
function filterFriends(idFriendsUl, filterWord) {
    var childFriendsList = document.getElementById(idFriendsUl).children;
    for (var i = 0; i < childFriendsList.length; i++) {
        if (isMatching(childFriendsList[i].children[1].innerHTML, filterWord)) {
            childFriendsList[i].style.display = 'block';
        } else {
            childFriendsList[i].style.display = 'none';
        }
    }
}
// сбросить фильтр
function resetFilter(filterId, friedsUlId) {
    document.getElementById(filterId).value = '';
    filterFriends(friedsUlId,'');
}
// перемещение друзей при нажатии на + x
function moveFriend(id) {
    var friend = document.getElementById('f' + id);
    var parent = friend.parentElement;
    if (parent.id == 'friends') {
        // переместить из общего списка
        parent.removeChild(friend);
        document.getElementById('friendslist').appendChild(friend);
        document.querySelector('#f' + id + ' i.btn').innerHTML = 'x';
        document.getElementById('friendslist').scrollTop = document.getElementById('friendslist').scrollHeight;
        resetFilter('filterlist','friendslist');
    } else {
        // переместить в общий список
        parent.removeChild(friend);
        document.getElementById('friends').appendChild(friend);
        document.querySelector('#f' + id + ' i.btn').innerHTML = '+';
        document.getElementById('friends').scrollTop = document.getElementById('friends').scrollHeight;
        resetFilter('filter','friends');
    }
}
// обработчики drag&drop
function dragStart(ev) {
    ev.target.style.opacity = '0.4';
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
    return true;
}
function dragEnter(ev) {
    event.preventDefault();
    return true;
}
function dragOver(ev) {
    event.preventDefault();
}
function dragDrop(ev) {
    var data = ev.dataTransfer.getData("Text");
    if ((ev.currentTarget.id == 'friends' || ev.currentTarget.id == 'friendslist')
        && document.getElementById(data).parentElement.id != ev.currentTarget.id) {
        ev.currentTarget.appendChild(document.getElementById(data));
        document.getElementById(data).children[2].innerHTML = (ev.currentTarget.id == 'friends') ? '+' : 'x';
        if (ev.currentTarget.id == 'friends') {
            resetFilter('filter','friends');
        } else {
            resetFilter('filterlist','friendslist');
        }
        ev.currentTarget.scrollTop = ev.currentTarget.scrollHeight;
    }
    ev.stopPropagation();
    return false;
}
function dragEnd(ev) {
    this.style.opacity = '1';
}
// загрузка данных
new Promise(resolve => window.onload = resolve)
    .then(() => vkInit())
    .then(() => vkApi('users.get', {name_case: 'gen'}))
    .then(response => {
        headerInfo.textContent = `Друзья ${response[0].first_name} ${response[0].last_name}`;
    })
    .then(() => vkApi('friends.get', {fields: 'photo_200'}))
    .then(response => {
        var friendsListIds = JSON.parse(localStorage.data || '[]');
        // пройтись по response и выбрать тех, кто есть в сохранненом списке
        // кто есть list = true, кого нет, тот в основной список идет list = true
        // если друг удалился, его не будет в списке сохранненых
        // если друг добавился, он добавится в общий список
        for (var i = 0; i < response.items.length; i++) {
            if (friendsListIds.indexOf('f' + response.items[i].id) == -1) {
                response.items[i].all = true;
            } else {
                response.items[i].list = true;
            }
        }
        // вызвать шаблон для одного списка и потом для второго
        friends.innerHTML = templateFnAll(response);
        friendslist.innerHTML = templateFnList(response);
    })
    .then(() => {
        // обработчики для кнопок + x
        var iPlus = document.getElementsByClassName('btn');
        for (var i = 0; i < iPlus.length; i++) {
            iPlus[i].addEventListener('click', (e) => {
                moveFriend(e.target.dataset.id);
            })
        }
        // обработчики для drag&drop
        var friends = document.querySelectorAll('.friend');
        [].forEach.call(friends, function (friend) {
            friend.addEventListener('dragstart', dragStart, false);
            friend.addEventListener('dragend', dragEnd, false);
        });
        document.getElementById('friends').addEventListener('dragenter', dragEnter, false);
        document.getElementById('friends').addEventListener('dragover', dragOver, false);
        document.getElementById('friends').addEventListener('drop', dragDrop, false);

        document.getElementById('friendslist').addEventListener('dragenter', dragEnter, false);
        document.getElementById('friendslist').addEventListener('dragover', dragOver, false);
        document.getElementById('friendslist').addEventListener('drop', dragDrop, false);
    })
    .catch(e => alert('Ошибка: ' + e.message));
// сохранение списка друзей выбранных
save.onclick = function () {
    var friendsListIds = [];
    var childFriendsList = document.getElementById('friendslist').children;
    for (var i = 0; i < childFriendsList.length; i++) {
        friendsListIds.push(childFriendsList[i].id);
    }
    localStorage.data = JSON.stringify(friendsListIds);
};
filter.addEventListener('keyup', function () {
    filterFriends('friends', this.value);
});
filterlist.addEventListener('keyup', function () {
    filterFriends('friendslist', this.value);
});
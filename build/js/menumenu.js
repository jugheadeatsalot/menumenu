var menumenu = (function () {
    'use strict';

    function addClasses(element, classes) {
        var elClasses = element.className.trim();
        var elClassesArray = elClasses ? elClasses.split(' ') : [];

        element.className = dedupe(classes.trim().split(' ').concat(elClassesArray)).join(' ');
    }

    function animationEndEvent() {
        var tempElement = document.createElement('spoink');

        var animationEnds = {
            'animation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd',
            'MozAnimation': 'mozAnimationEnd',
            'OAnimation': 'oAnimationEnd',
            'msAnimation': 'MSAnimationEnd'
        };

        for (var a in animationEnds) {
            if (typeof tempElement.style[a] !== 'undefined') return animationEnds[a];
        }
    }

    function dedupe(array) {
        return array.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    }

    function differ(haystack, needles) {
        return haystack.filter(function (value) {
            return !needles.includes(value);
        });
    }

    function forEach(array, callback, _this) {
        for (var i = 0; i < array.length; i++) {
            callback.call(_this, array[i], i);
        }
    }

    function getClosest(element, filter) {
        if (typeof filter === 'undefined') filter = '*';

        var closest = element.parentNode;

        while (!matches(closest, filter)) {
            closest = closest.parentNode;
        }

        return closest;
    }

    function getParents(element, filter) {
        if (typeof filter === 'undefined') filter = '*';

        var parents = [];

        var parent = element.parentNode;

        while (parent !== document) {
            if (matches(parent, filter)) parents.push(parent);

            parent = parent.parentNode;
        }

        return parents;
    }

    function matches(element, selector) {
        if (Element.prototype.matches) return element.matches(selector);

        var matches = document.querySelectorAll(selector);

        var i = matches.length;

        while (--i >= 0 && matches.item(i) !== element) {}

        return i > -1;
    }

    function merge(object1, object2) {
        for (var prop in object2) {
            if (object2.hasOwnProperty(prop)) object1[prop] = object2[prop];
        }

        return object1;
    }

    function removeClasses(element, classes) {
        var elClasses = element.className.trim();
        var elClassesArray = elClasses ? elClasses.split(' ') : [];

        element.className = differ(elClassesArray, classes.trim().split(' ')).join(' ');
    }

    function menumenu(selector, opts) {
        var menu = document.querySelector(selector);
        var menuItems = menu.querySelectorAll('li');
        var subMenus = menu.querySelectorAll('li > ul');
        var animationEnd = animationEndEvent();

        if (!menu || !menuItems.length || !subMenus.length) return;

        var defaults = {
            addBackLink: true,
            addDropdownToggle: true,
            classBackLink: 'back-link',
            classDropdownToggle: 'dropdown-toggle',
            classHasChildren: 'has-children',
            classMenuHidden: 'menu-hidden',
            classSubMenu: 'sub-menu',
            idMenu: 'menumenu',
            msgBack: 'Back'
        };

        opts = merge(defaults, opts);

        opts.classMenuIn = 'menu-in';
        opts.classMenuOut = 'menu-out';
        opts.classSubMenuIn = 'sub-menu-in';
        opts.classSubMenuOut = 'sub-menu-out';
        opts.classSubMenuHidden = 'sub-menu-hidden';
        opts.classSubMenuShown = 'sub-menu-shown';

        if (!menu.id) menu.id = opts.idMenu;

        addClasses(menu, 'menumenu');

        forEach(menuItems, function (menuItem, index) {
            if (!menuItem.id) menuItem.id = menu.id + '-item-' + (index + 1);
        });

        forEach(subMenus, function (subMenu) {
            addClasses(subMenu, opts.classSubMenu + ' ' + opts.classSubMenuHidden);

            if (opts.addDropdownToggle) {
                var dropdownToggleHTML = '<span class="' + opts.classDropdownToggle + ' generated"></span>';

                subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
            }

            if (opts.addBackLink) {
                var backLinkHTML = '<li class="' + opts.classBackLink + '"><a href="#">' + opts.msgBack + '</a></li>';

                subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
            }

            var parent = getClosest(subMenu, 'li');

            subMenu.dataset.id = parent.id;

            addClasses(parent, opts.classHasChildren);
        });

        var backLinkClicked = false;

        var dropdownToggles = menu.querySelectorAll('.' + opts.classDropdownToggle);

        forEach(dropdownToggles, function (dropdownToggle) {
            dropdownToggle.dataset.id = getClosest(dropdownToggle, 'li').id;
            dropdownToggle.dataset.depth = getParents(dropdownToggle, 'li > ul').length;

            var targetSubMenuSelector = 'ul[data-id="' + dropdownToggle.dataset.id + '"]';
            var targetSubMenu = menu.querySelector(targetSubMenuSelector);

            dropdownToggle.addEventListener('click', function (event) {
                event.preventDefault();

                var currentSubMenu = menu.querySelector('.' + opts.classSubMenuShown);

                if (currentSubMenu) {
                    if (this.dataset.depth === '0' && backLinkClicked === false) {
                        hideSubMenu(currentSubMenu, showMenu);
                    } else {
                        hideSubMenu(currentSubMenu, function () {
                            showSubMenu(targetSubMenu);
                        });
                    }
                } else {
                    hideMenu(function () {
                        showSubMenu(targetSubMenu);
                    });
                }

                backLinkClicked = false; // Reset. Seems obvious, but I'm stupid.
            });
        });

        var backLinks = menu.querySelectorAll('.' + opts.classBackLink);

        forEach(backLinks, function (backLink) {
            var grandparent = getParents(backLink, '#' + menu.id + ' li')[1];

            backLink.dataset.id = grandparent ? grandparent.id : 'none';

            backLink.addEventListener('click', function (event) {
                event.preventDefault();

                var currentSubMenu = menu.querySelector('.' + opts.classSubMenuShown);

                if (this.dataset.id === 'none') {
                    hideSubMenu(currentSubMenu, showMenu);
                } else {
                    var targetDropdownToggleSelector = '.' + opts.classDropdownToggle + '[data-id="' + backLink.dataset.id + '"]';

                    backLinkClicked = true;

                    menu.querySelector(targetDropdownToggleSelector).click();
                }
            });
        });

        var showMenu = function showMenu() {
            addClasses(menu, opts.classMenuIn);
            removeClasses(menu, opts.classMenuHidden);
            removeClasses(menu, opts.classMenuOut);
        };

        var hideMenu = function hideMenu(callback, _this) {
            addClasses(menu, opts.classMenuOut);
            addClasses(menu, opts.classMenuHidden);
            removeClasses(menu, opts.classMenuIn);

            if (typeof callback === 'function') callback.call(_this);
        };

        var showSubMenu = function showSubMenu(targetSubMenu) {
            addClasses(targetSubMenu, opts.classSubMenuIn);

            targetSubMenu.addEventListener(animationEnd, function () {
                removeClasses(this, opts.classSubMenuHidden);
                addClasses(this, opts.classSubMenuShown);
            }, { once: true });
        };

        var hideSubMenu = function hideSubMenu(currentSubMenu, callback, _this) {
            addClasses(currentSubMenu, opts.classSubMenuOut);
            removeClasses(currentSubMenu, opts.classSubMenuIn);

            currentSubMenu.addEventListener(animationEnd, function () {
                addClasses(this, opts.classSubMenuHidden);
                removeClasses(this, opts.classSubMenuShown);
                removeClasses(this, opts.classSubMenuOut);

                if (typeof callback === 'function') callback.call(_this);
            }, { once: true });
        };
    }

    return menumenu;

}());

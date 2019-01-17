var menumenu = (function (_d) {
    'use strict';

    function menumenu(selector, opts) {
        var menu = document.querySelector(selector);
        var menuItems = menu.querySelectorAll('li');
        var subMenus = menu.querySelectorAll('li > ul');
        var animationEnd = _d.animationEndEvent();

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

        opts = _d.merge(defaults, opts);

        opts.classMenuIn = 'menu-in';
        opts.classMenuOut = 'menu-out';
        opts.classSubMenuIn = 'sub-menu-in';
        opts.classSubMenuOut = 'sub-menu-out';
        opts.classSubMenuHidden = 'sub-menu-hidden';
        opts.classSubMenuShown = 'sub-menu-shown';

        if (!menu.id) menu.id = opts.idMenu;

        _d.addClasses(menu, 'menumenu');

        _d.forEach(menuItems, function (menuItem, index) {
            if (!menuItem.id) menuItem.id = menu.id + '-item-' + (index + 1);
        });

        _d.forEach(subMenus, function (subMenu) {
            _d.addClasses(subMenu, opts.classSubMenu + ' ' + opts.classSubMenuHidden);

            if (opts.addDropdownToggle) {
                var dropdownToggleHTML = '<span class="' + opts.classDropdownToggle + ' generated"></span>';

                subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
            }

            if (opts.addBackLink) {
                var backLinkHTML = '<li class="' + opts.classBackLink + '"><a href="#">' + opts.msgBack + '</a></li>';

                subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
            }

            var parent = _d.getClosest(subMenu, 'li');

            subMenu.dataset.id = parent.id;

            _d.addClasses(parent, opts.classHasChildren);
        });

        var backLinkClicked = false;

        var dropdownToggles = menu.querySelectorAll('.' + opts.classDropdownToggle);

        _d.forEach(dropdownToggles, function (dropdownToggle) {
            dropdownToggle.dataset.id = _d.getClosest(dropdownToggle, 'li').id;
            dropdownToggle.dataset.depth = _d.getParents(dropdownToggle, 'li > ul').length;

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

        _d.forEach(backLinks, function (backLink) {
            var grandparent = _d.getParents(backLink, '#' + menu.id + ' li')[1];

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
            _d.addClasses(menu, opts.classMenuIn);
            _d.removeClasses(menu, opts.classMenuHidden);
            _d.removeClasses(menu, opts.classMenuOut);
        };

        var hideMenu = function hideMenu(callback, _this) {
            _d.addClasses(menu, opts.classMenuOut);
            _d.addClasses(menu, opts.classMenuHidden);
            _d.removeClasses(menu, opts.classMenuIn);

            if (typeof callback === 'function') callback.call(_this);
        };

        var showSubMenu = function showSubMenu(targetSubMenu) {
            _d.addClasses(targetSubMenu, opts.classSubMenuIn);

            targetSubMenu.addEventListener(animationEnd, function () {
                _d.removeClasses(this, opts.classSubMenuHidden);
                _d.addClasses(this, opts.classSubMenuShown);
            }, { once: true });
        };

        var hideSubMenu = function hideSubMenu(currentSubMenu, callback, _this) {
            _d.addClasses(currentSubMenu, opts.classSubMenuOut);
            _d.removeClasses(currentSubMenu, opts.classSubMenuIn);

            currentSubMenu.addEventListener(animationEnd, function () {
                _d.addClasses(this, opts.classSubMenuHidden);
                _d.removeClasses(this, opts.classSubMenuShown);
                _d.removeClasses(this, opts.classSubMenuOut);

                if (typeof callback === 'function') callback.call(_this);
            }, { once: true });
        };
    }

    return menumenu;

}(dominoob));

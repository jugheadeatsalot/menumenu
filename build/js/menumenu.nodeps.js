var menumenu = (function (_d) {
    'use strict';

    function menumenu(menu, opts) {
        var menuItems = menu.querySelectorAll('li');
        var subMenus = menu.querySelectorAll('li > ul');
        var animationEnd = _d.animationEndEvent();

        if (!menu || !menuItems.length || !subMenus.length) return;

        var defaults = {
            addBackLink: true,
            addDropdownToggle: true,
            classDropdownToggle: 'dropdown-toggle',
            closeOnOutsideClick: true,
            idMenu: 'menumenu',
            msgBack: 'Back'
        };

        opts = _d.merge(defaults, opts);

        var classBackLink = 'back-link';
        var classHasChildren = 'has-children';
        var classMenuHidden = 'menu-hidden';
        var classMenuIn = 'menu-in';
        var classMenuOut = 'menu-out';
        var classSubMenu = 'sub-menu';
        var classSubMenuIn = 'sub-menu-in';
        var classSubMenuOut = 'sub-menu-out';
        var classSubMenuHidden = 'sub-menu-hidden';
        var classSubMenuShown = 'sub-menu-shown';

        if (!menu.id) menu.id = opts.idMenu;

        _d.addClasses(menu, 'menumenu');

        _d.forEach(menuItems, function (menuItem, index) {
            if (!menuItem.id) menuItem.id = menu.id + '-item-' + (index + 1);
        });

        _d.forEach(subMenus, function (subMenu) {
            _d.addClasses(subMenu, classSubMenu + ' ' + classSubMenuHidden);

            if (opts.addDropdownToggle) {
                var dropdownToggleHTML = '<span class="' + opts.classDropdownToggle + ' generated-toggle"></span>';

                subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
            }

            if (opts.addBackLink) {
                var backLinkHTML = '<li class="' + classBackLink + '"><a href="#">' + opts.msgBack + '</a></li>';

                subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
            }

            var parent = subMenu.closest('li');

            subMenu.dataset.id = parent.id;

            _d.addClasses(parent, classHasChildren);
        });

        var backLinkClicked = false;

        var dropdownToggles = menu.querySelectorAll('.' + opts.classDropdownToggle);

        _d.forEach(dropdownToggles, function (dropdownToggle) {
            dropdownToggle.dataset.id = dropdownToggle.closest('li').id;
            dropdownToggle.dataset.depth = _d.getParents(dropdownToggle, 'li > ul').length;

            var targetSubMenuSelector = 'ul[data-id="' + dropdownToggle.dataset.id + '"]';
            var targetSubMenu = menu.querySelector(targetSubMenuSelector);

            _d.on(dropdownToggle, 'click', function (event) {
                event.preventDefault();

                var currentSubMenu = menu.querySelector('.' + classSubMenuShown);

                if (currentSubMenu) {
                    if (dropdownToggle.dataset.depth === '0' && backLinkClicked === false) {
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

        var backLinks = menu.querySelectorAll('.' + classBackLink);

        _d.forEach(backLinks, function (backLink) {
            var grandparent = _d.getParents(backLink, '#' + menu.id + ' li')[1];

            backLink.dataset.id = grandparent ? grandparent.id : 'none';

            _d.on(backLink, 'click', function (event) {
                event.preventDefault();

                var currentSubMenu = menu.querySelector('.' + classSubMenuShown);

                if (backLink.dataset.id === 'none') {
                    hideSubMenu(currentSubMenu, showMenu);
                } else {
                    var targetDropdownToggleSelector = '.' + opts.classDropdownToggle + '[data-id="' + backLink.dataset.id + '"]';

                    backLinkClicked = true;

                    menu.querySelector(targetDropdownToggleSelector).click();
                }
            });
        });

        var showMenu = function showMenu() {
            _d.addClasses(menu, classMenuIn);
            _d.removeClasses(menu, classMenuHidden);
            _d.removeClasses(menu, classMenuOut);
        };

        var hideMenu = function hideMenu(callback, _this) {
            _d.addClasses(menu, classMenuOut);
            _d.addClasses(menu, classMenuHidden);
            _d.removeClasses(menu, classMenuIn);

            if (opts.closeOnOutsideClick) handleDocumentClicks(menu);

            if (typeof callback === 'function') callback.call(_this);
        };

        var showSubMenu = function showSubMenu(targetSubMenu) {
            _d.addClasses(targetSubMenu, classSubMenuIn);

            var listener = function listener(targetSubMenu, event) {
                _d.off(targetSubMenu, event.type, showSubMenuAnimationEnd);

                _d.removeClasses(targetSubMenu, classSubMenuHidden);
                _d.addClasses(targetSubMenu, classSubMenuShown);
            };

            var showSubMenuAnimationEnd = listener.bind(targetSubMenu, targetSubMenu);

            _d.on(targetSubMenu, animationEnd, showSubMenuAnimationEnd);
        };

        var hideSubMenu = function hideSubMenu(currentSubMenu, callback, _this) {
            _d.addClasses(currentSubMenu, classSubMenuOut);
            _d.removeClasses(currentSubMenu, classSubMenuIn);

            var listener = function listener(currentSubMenu, callback, _this, event) {
                _d.off(currentSubMenu, event.type, hideSubMenuAnimationEnd);

                _d.addClasses(currentSubMenu, classSubMenuHidden);
                _d.removeClasses(currentSubMenu, classSubMenuShown);
                _d.removeClasses(currentSubMenu, classSubMenuOut);

                if (typeof callback === 'function') callback.call(_this);
            };

            var hideSubMenuAnimationEnd = listener.bind(currentSubMenu, currentSubMenu, callback, _this);

            _d.on(currentSubMenu, animationEnd, hideSubMenuAnimationEnd);
        };

        var handleDocumentClicks = function handleDocumentClicks(container) {
            var listener = function listener(event) {
                if (!event.target.closest('.' + classHasChildren)) {
                    var currentSubMenu = container.querySelector('.' + classSubMenuShown);

                    if (_d.isVisible(currentSubMenu)) {
                        _d.off(document, 'click', listener);

                        hideSubMenu(currentSubMenu, showMenu);
                    }
                }
            };

            _d.on(document, 'click', listener);
        };
    }

    return menumenu;

}(dominoob));

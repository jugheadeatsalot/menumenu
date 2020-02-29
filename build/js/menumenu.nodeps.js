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

        var classActive = 'current-menumenu';
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
                var dropdownToggleHTML = '<span aria-hidden="true" class="' + opts.classDropdownToggle + ' generated"></span>';

                subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
            }

            if (opts.addBackLink) {
                var backLinkHTML = '<li aria-hidden="true" class="' + classBackLink + '"><a href="#">' + opts.msgBack + '</a></li>';

                subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
            }

            var parent = subMenu.closest('li');

            subMenu.setAttribute('data-id', parent.id);

            _d.addClasses(parent, classHasChildren);
        });

        var backLinkClicked = false;

        var dropdownToggles = menu.querySelectorAll('.' + opts.classDropdownToggle);

        _d.forEach(dropdownToggles, function (dropdownToggle) {
            dropdownToggle.setAttribute('data-id', dropdownToggle.closest('li').id);
            dropdownToggle.setAttribute('data-depth', _d.getParents(dropdownToggle, 'li > ul').length);

            var targetSubMenuSelector = 'ul[data-id="' + dropdownToggle.getAttribute('data-id') + '"]';
            var targetSubMenu = menu.querySelector(targetSubMenuSelector);

            _d.on(dropdownToggle, 'click', function (event) {
                event.preventDefault();

                var currentSubMenu = menu.querySelector('.' + classSubMenuShown);

                if (currentSubMenu) {
                    if (dropdownToggle.getAttribute('data-depth') === '0' && backLinkClicked === false) {
                        hideSubMenu(currentSubMenu, showMenu);
                    } else {
                        hideSubMenu(currentSubMenu, function () {
                            showSubMenu(targetSubMenu);
                        });
                    }
                } else {
                    hideMenu(function () {
                        showSubMenu(targetSubMenu);
                    }, dropdownToggle.closest('.has-children'));
                }

                backLinkClicked = false; // Reset. Seems obvious, but I'm stupid.
            });
        });

        var backLinks = menu.querySelectorAll('.' + classBackLink);

        _d.forEach(backLinks, function (backLink) {
            var grandparent = _d.getParents(backLink, '#' + menu.id + ' li')[1];

            backLink.setAttribute('data-id', grandparent ? grandparent.id : 'none');

            _d.on(backLink, 'click', function (event) {
                event.preventDefault();

                var currentSubMenu = menu.querySelector('.' + classSubMenuShown);

                if (backLink.getAttribute('data-id') === 'none') {
                    hideSubMenu(currentSubMenu, showMenu);
                } else {
                    var targetDropdownToggleSelector = '.' + opts.classDropdownToggle + '[data-id="' + backLink.getAttribute('data-id') + '"]';

                    backLinkClicked = true;

                    menu.querySelector(targetDropdownToggleSelector).click();
                }
            });
        });

        var showMenu = function showMenu() {
            if (opts.closeOnOutsideClick) _d.off(document, 'click', handleDocumentClicksListener);

            var active = menu.querySelector('.' + classActive);

            if (active) _d.removeClasses(menu.querySelector('.' + classActive), classActive);

            _d.addClasses(menu, classMenuIn);
            _d.removeClasses(menu, classMenuHidden);
            _d.removeClasses(menu, classMenuOut);
        };

        var hideMenu = function hideMenu(callback, toggleParent) {
            _d.addClasses(toggleParent, classActive);
            _d.addClasses(menu, classMenuOut);
            _d.removeClasses(menu, classMenuIn);

            var listener = function listener(menu, callback, event) {
                _d.off(menu, event.type, hideMenuAnimationEnd);

                _d.addClasses(menu, classMenuHidden);

                if (opts.closeOnOutsideClick) handleDocumentClicks();

                if (typeof callback === 'function') callback();
            };

            var hideMenuAnimationEnd = listener.bind(menu, menu, callback);

            _d.on(menu, animationEnd, hideMenuAnimationEnd);
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

        var hideSubMenu = function hideSubMenu(currentSubMenu, callback) {
            _d.addClasses(currentSubMenu, classSubMenuOut);
            _d.removeClasses(currentSubMenu, classSubMenuIn);

            var listener = function listener(currentSubMenu, callback, event) {
                _d.off(currentSubMenu, event.type, hideSubMenuAnimationEnd);

                _d.addClasses(currentSubMenu, classSubMenuHidden);
                _d.removeClasses(currentSubMenu, classSubMenuShown);
                _d.removeClasses(currentSubMenu, classSubMenuOut);

                if (typeof callback === 'function') callback();
            };

            var hideSubMenuAnimationEnd = listener.bind(currentSubMenu, currentSubMenu, callback);

            _d.on(currentSubMenu, animationEnd, hideSubMenuAnimationEnd);
        };

        var handleDocumentClicksListener = function handleDocumentClicksListener(event) {
            if (!event.target.closest('.' + classHasChildren)) {
                var currentSubMenu = menu.querySelector('.' + classSubMenuShown);

                if (_d.isVisible(currentSubMenu)) {
                    hideSubMenu(currentSubMenu, showMenu);
                }
            }
        };

        var handleDocumentClicks = function handleDocumentClicks() {
            _d.on(document, 'click', handleDocumentClicksListener);
        };
    }

    return menumenu;

}(dominoob));

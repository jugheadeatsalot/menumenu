import * as _d from 'dominoob/src/_main';

function menumenu(menu, opts) {
    const menuItems = menu.querySelectorAll('li');
    const subMenus = menu.querySelectorAll('li > ul');
    const animationEnd = _d.animationEndEvent();

    if(!menu || !menuItems.length || !subMenus.length) return;

    const defaults = {
        addBackLink: true,
        addDropdownToggle: true,
        classDropdownToggle: 'dropdown-toggle',
        closeOnOutsideClick: true,
        idMenu: 'menumenu',
        msgBack: 'Back',
    };

    opts = _d.merge(defaults, opts);

    const classActive = 'current-menumenu';
    const classBackLink = 'back-link';
    const classHasChildren = 'has-children';
    const classMenuHidden = 'menu-hidden';
    const classMenuIn = 'menu-in';
    const classMenuOut = 'menu-out';
    const classSubMenu = 'sub-menu';
    const classSubMenuIn = 'sub-menu-in';
    const classSubMenuOut = 'sub-menu-out';
    const classSubMenuHidden = 'sub-menu-hidden';
    const classSubMenuShown = 'sub-menu-shown';

    if(!menu.id) menu.id = opts.idMenu;

    _d.addClasses(menu, 'menumenu');

    _d.forEach(menuItems, (menuItem, index) => {
        if(!menuItem.id) menuItem.id = `${menu.id}-item-${index + 1}`;
    });

    _d.forEach(subMenus, (subMenu) => {
        _d.addClasses(subMenu, `${classSubMenu} ${classSubMenuHidden}`);

        if(opts.addDropdownToggle) {
            const dropdownToggleHTML =
                `<span aria-hidden="true" class="${opts.classDropdownToggle} generated"></span>`;

            subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
        }

        if(opts.addBackLink) {
            const backLinkHTML =
                `<li aria-hidden="true" class="${classBackLink}"><a href="#">${opts.msgBack}</a></li>`;

            subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
        }

        const parent = subMenu.closest('li');

        subMenu.setAttribute('data-id', parent.id);

        _d.addClasses(parent, classHasChildren);
    });

    let backLinkClicked = false;

    const dropdownToggles = menu.querySelectorAll(`.${opts.classDropdownToggle}`);

    _d.forEach(dropdownToggles, (dropdownToggle) => {
        dropdownToggle.setAttribute('data-id', dropdownToggle.closest('li').id);
        dropdownToggle.setAttribute('data-depth', _d.getParents(dropdownToggle, 'li > ul').length);

        const targetSubMenuSelector = `ul[data-id="${dropdownToggle.getAttribute('data-id')}"]`;
        const targetSubMenu = menu.querySelector(targetSubMenuSelector);

        _d.on(dropdownToggle, 'click', (event) => {
            event.preventDefault();

            const currentSubMenu = menu.querySelector(`.${classSubMenuShown}`);

            if(currentSubMenu) {
                if(dropdownToggle.getAttribute('data-depth') === '0' && backLinkClicked === false) {
                    hideSubMenu(currentSubMenu, showMenu);
                } else {
                    hideSubMenu(currentSubMenu, () => {
                        showSubMenu(targetSubMenu);
                    });
                }
            } else {
                hideMenu(() => {
                    showSubMenu(targetSubMenu);
                }, dropdownToggle.closest('.has-children'));
            }

            backLinkClicked = false; // Reset. Seems obvious, but I'm stupid.
        });
    });

    const backLinks = menu.querySelectorAll(`.${classBackLink}`);

    _d.forEach(backLinks, (backLink) => {
        const grandparent = _d.getParents(backLink, `#${menu.id} li`)[1];

        backLink.setAttribute('data-id', (grandparent) ? grandparent.id : 'none');

        _d.on(backLink, 'click', (event) => {
            event.preventDefault();

            const currentSubMenu = menu.querySelector(`.${classSubMenuShown}`);

            if(backLink.getAttribute('data-id') === 'none') {
                hideSubMenu(currentSubMenu, showMenu);
            } else {
                const targetDropdownToggleSelector =
                    `.${opts.classDropdownToggle}[data-id="${backLink.getAttribute('data-id')}"]`;

                backLinkClicked = true;

                menu.querySelector(targetDropdownToggleSelector).click();
            }
        });
    });

    const showMenu = () => {
        if(opts.closeOnOutsideClick) _d.off(document, 'click', handleDocumentClicksListener);

        var active = menu.querySelector(`.${classActive}`);

        if(active) _d.removeClasses(menu.querySelector(`.${classActive}`), classActive);

        _d.addClasses(menu, classMenuIn);
        _d.removeClasses(menu, classMenuHidden);
        _d.removeClasses(menu, classMenuOut);
    };

    const hideMenu = (callback, toggleParent) => {
        _d.addClasses(toggleParent, classActive);
        _d.addClasses(menu, classMenuOut);
        _d.removeClasses(menu, classMenuIn);

        const listener = (menu, callback, event) => {
            _d.off(menu, event.type, hideMenuAnimationEnd);

            _d.addClasses(menu, classMenuHidden);

            if(opts.closeOnOutsideClick) handleDocumentClicks();

            if(typeof callback === 'function') callback();
        };

        const hideMenuAnimationEnd = listener.bind(
            menu,
            menu,
            callback,
        );

        _d.on(menu, animationEnd, hideMenuAnimationEnd);
    };

    const showSubMenu = (targetSubMenu) => {
        _d.addClasses(targetSubMenu, classSubMenuIn);

        const listener = (targetSubMenu, event) => {
            _d.off(targetSubMenu, event.type, showSubMenuAnimationEnd);

            _d.removeClasses(targetSubMenu, classSubMenuHidden);
            _d.addClasses(targetSubMenu, classSubMenuShown);
        };

        const showSubMenuAnimationEnd = listener.bind(targetSubMenu, targetSubMenu);

        _d.on(targetSubMenu, animationEnd, showSubMenuAnimationEnd);
    };

    const hideSubMenu = (currentSubMenu, callback) => {
        _d.addClasses(currentSubMenu, classSubMenuOut);
        _d.removeClasses(currentSubMenu, classSubMenuIn);

        const listener = (currentSubMenu, callback, event) => {
            _d.off(currentSubMenu, event.type, hideSubMenuAnimationEnd);

            _d.addClasses(currentSubMenu, classSubMenuHidden);
            _d.removeClasses(currentSubMenu, classSubMenuShown);
            _d.removeClasses(currentSubMenu, classSubMenuOut);

            if(typeof callback === 'function') callback();
        };

        const hideSubMenuAnimationEnd = listener.bind(
            currentSubMenu,
            currentSubMenu,
            callback,
        );

        _d.on(currentSubMenu, animationEnd, hideSubMenuAnimationEnd);
    };

    const handleDocumentClicksListener = (event) => {
        if(!event.target.closest(`.${classHasChildren}`)) {
            const currentSubMenu = menu.querySelector(`.${classSubMenuShown}`);

            if(_d.isVisible(currentSubMenu)) {
                hideSubMenu(currentSubMenu, showMenu);
            }
        }
    };

    const handleDocumentClicks = () => {
        _d.on(document, 'click', handleDocumentClicksListener);
    };
}

export default menumenu;

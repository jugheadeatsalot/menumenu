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
                `<span class="${opts.classDropdownToggle} generated-toggle"></span>`;

            subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
        }

        if(opts.addBackLink) {
            const backLinkHTML =
                `<li class="${classBackLink}"><a href="#">${opts.msgBack}</a></li>`;

            subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
        }

        const parent = subMenu.closest('li');

        subMenu.dataset.id = parent.id;

        _d.addClasses(parent, classHasChildren);
    });

    let backLinkClicked = false;

    const dropdownToggles = menu.querySelectorAll(`.${opts.classDropdownToggle}`);

    _d.forEach(dropdownToggles, (dropdownToggle) => {
        dropdownToggle.dataset.id = dropdownToggle.closest('li').id;
        dropdownToggle.dataset.depth = _d.getParents(dropdownToggle, 'li > ul').length;

        const targetSubMenuSelector = `ul[data-id="${dropdownToggle.dataset.id}"]`;
        const targetSubMenu = menu.querySelector(targetSubMenuSelector);

        _d.on(dropdownToggle, 'click', (event) => {
            event.preventDefault();

            const currentSubMenu = menu.querySelector(`.${classSubMenuShown}`);

            if(currentSubMenu) {
                if(dropdownToggle.dataset.depth === '0' && backLinkClicked === false) {
                    hideSubMenu(currentSubMenu, showMenu);
                } else {
                    hideSubMenu(currentSubMenu, () => {
                        showSubMenu(targetSubMenu);
                    });
                }
            } else {
                hideMenu(() => {
                    showSubMenu(targetSubMenu);
                });
            }

            backLinkClicked = false; // Reset. Seems obvious, but I'm stupid.
        });
    });

    const backLinks = menu.querySelectorAll(`.${classBackLink}`);

    _d.forEach(backLinks, (backLink) => {
        const grandparent = _d.getParents(backLink, `#${menu.id} li`)[1];

        backLink.dataset.id = (grandparent) ? grandparent.id : 'none';

        _d.on(backLink, 'click', (event) => {
            event.preventDefault();

            const currentSubMenu = menu.querySelector(`.${classSubMenuShown}`);

            if(backLink.dataset.id === 'none') {
                hideSubMenu(currentSubMenu, showMenu);
            } else {
                const targetDropdownToggleSelector =
                    `.${opts.classDropdownToggle}[data-id="${backLink.dataset.id}"]`;

                backLinkClicked = true;

                menu.querySelector(targetDropdownToggleSelector).click();
            }
        });
    });

    const showMenu = () => {
        _d.addClasses(menu, classMenuIn);
        _d.removeClasses(menu, classMenuHidden);
        _d.removeClasses(menu, classMenuOut);
    };

    const hideMenu = (callback, _this) => {
        _d.addClasses(menu, classMenuOut);
        _d.addClasses(menu, classMenuHidden);
        _d.removeClasses(menu, classMenuIn);

        if(opts.closeOnOutsideClick) handleDocumentClicks(menu);

        if(typeof callback === 'function') callback.call(_this);
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

    const hideSubMenu = (currentSubMenu, callback, _this) => {
        _d.addClasses(currentSubMenu, classSubMenuOut);
        _d.removeClasses(currentSubMenu, classSubMenuIn);

        const listener = (currentSubMenu, callback, _this, event) => {
            _d.off(currentSubMenu, event.type, hideSubMenuAnimationEnd);

            _d.addClasses(currentSubMenu, classSubMenuHidden);
            _d.removeClasses(currentSubMenu, classSubMenuShown);
            _d.removeClasses(currentSubMenu, classSubMenuOut);

            if(typeof callback === 'function') callback.call(_this);
        };

        const hideSubMenuAnimationEnd = listener.bind(
            currentSubMenu,
            currentSubMenu,
            callback,
            _this,
        );

        _d.on(currentSubMenu, animationEnd, hideSubMenuAnimationEnd);
    };

    const handleDocumentClicks = (container) => {
        const listener = (event) => {
            if(!event.target.closest(`.${classHasChildren}`)) {
                const currentSubMenu = container.querySelector(`.${classSubMenuShown}`);

                if(_d.isVisible(currentSubMenu)) {
                    _d.off(document, 'click', listener);

                    hideSubMenu(currentSubMenu, showMenu);
                }
            }
        };

        _d.on(document, 'click', listener);
    };
}

export default menumenu;

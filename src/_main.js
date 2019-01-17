import * as _d from 'dominoob/src/_main';

function menumenu(selector, opts) {
    const menu = document.querySelector(selector);
    const menuItems = menu.querySelectorAll('li');
    const subMenus = menu.querySelectorAll('li > ul');
    const animationEnd = _d.animationEndEvent();

    if(!menu || !menuItems.length || !subMenus.length) return;

    const defaults = {
        addBackLink: true,
        addDropdownToggle: true,
        classBackLink: 'back-link',
        classDropdownToggle: 'dropdown-toggle',
        classHasChildren: 'has-children',
        classMenuHidden: 'menu-hidden',
        classSubMenu: 'sub-menu',
        idMenu: 'menumenu',
        msgBack: 'Back',
    };

    opts = _d.merge(defaults, opts);

    opts.classMenuIn = 'menu-in';
    opts.classMenuOut = 'menu-out';
    opts.classSubMenuIn = 'sub-menu-in';
    opts.classSubMenuOut = 'sub-menu-out';
    opts.classSubMenuHidden = 'sub-menu-hidden';
    opts.classSubMenuShown = 'sub-menu-shown';

    if(!menu.id) menu.id = opts.idMenu;

    _d.addClasses(menu, 'menumenu');

    _d.forEach(menuItems, (menuItem, index) => {
        if(!menuItem.id) menuItem.id = `${menu.id}-item-${index + 1}`;
    });

    _d.forEach(subMenus, subMenu => {
        _d.addClasses(subMenu, `${opts.classSubMenu} ${opts.classSubMenuHidden}`);

        if(opts.addDropdownToggle) {
            const dropdownToggleHTML =
                `<span class="${opts.classDropdownToggle} generated"></span>`;

            subMenu.insertAdjacentHTML('beforebegin', dropdownToggleHTML);
        }

        if(opts.addBackLink) {
            const backLinkHTML =
                `<li class="${opts.classBackLink}"><a href="#">${opts.msgBack}</a></li>`;

            subMenu.insertAdjacentHTML('afterbegin', backLinkHTML);
        }

        const parent = _d.getClosest(subMenu, 'li');

        subMenu.dataset.id = parent.id;

        _d.addClasses(parent, opts.classHasChildren);
    });

    let backLinkClicked = false;

    const dropdownToggles = menu.querySelectorAll(`.${opts.classDropdownToggle}`);

    _d.forEach(dropdownToggles, dropdownToggle => {
        dropdownToggle.dataset.id = _d.getClosest(dropdownToggle, 'li').id;
        dropdownToggle.dataset.depth = _d.getParents(dropdownToggle, 'li > ul').length;

        const targetSubMenuSelector = `ul[data-id="${dropdownToggle.dataset.id}"]`;
        const targetSubMenu = menu.querySelector(targetSubMenuSelector);

        dropdownToggle.addEventListener('click', function(event) {
            event.preventDefault();

            const currentSubMenu = menu.querySelector(`.${opts.classSubMenuShown}`);

            if(currentSubMenu) {
                if(this.dataset.depth === '0' && backLinkClicked === false) {
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

    const backLinks = menu.querySelectorAll(`.${opts.classBackLink}`);

    _d.forEach(backLinks, backLink => {
        const grandparent = _d.getParents(backLink, `#${menu.id} li`)[1];

        backLink.dataset.id = (grandparent) ? grandparent.id : 'none';

        backLink.addEventListener('click', function(event) {
            event.preventDefault();

            const currentSubMenu = menu.querySelector(`.${opts.classSubMenuShown}`);

            if(this.dataset.id === 'none') {
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
        _d.addClasses(menu, opts.classMenuIn);
        _d.removeClasses(menu, opts.classMenuHidden);
        _d.removeClasses(menu, opts.classMenuOut);
    };

    const hideMenu = (callback, _this) => {
        _d.addClasses(menu, opts.classMenuOut);
        _d.addClasses(menu, opts.classMenuHidden);
        _d.removeClasses(menu, opts.classMenuIn);

        if(typeof callback === 'function') callback.call(_this);
    };

    const showSubMenu = (targetSubMenu) => {
        _d.addClasses(targetSubMenu, opts.classSubMenuIn);

        targetSubMenu.addEventListener(animationEnd, function() {
            _d.removeClasses(this, opts.classSubMenuHidden);
            _d.addClasses(this, opts.classSubMenuShown);
        }, {once: true});
    };

    const hideSubMenu = (currentSubMenu, callback, _this) => {
        _d.addClasses(currentSubMenu, opts.classSubMenuOut);
        _d.removeClasses(currentSubMenu, opts.classSubMenuIn);

        currentSubMenu.addEventListener(animationEnd, function() {
            _d.addClasses(this, opts.classSubMenuHidden);
            _d.removeClasses(this, opts.classSubMenuShown);
            _d.removeClasses(this, opts.classSubMenuOut);

            if(typeof callback === 'function') callback.call(_this);
        }, {once: true});
    };
}

export default menumenu;

export class ContextMenu {
    constructor() {
        this.element = this.createElement();
        this.visible = false;
    }

    createElement() {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        document.body.appendChild(menu);
        return menu;
    }

    show(e, items) {
        this.element.innerHTML = items.map(item => `
            <div class="context-menu-item ${item.class || ''}" data-action="${item.action}">
                <i class="fas fa-${item.icon}"></i> ${item.label}
            </div>
        `).join('');

        this.element.style.display = 'block';
        this.position(e);
        this.visible = true;
    }

    position(e) {
        this.element.style.left = `${e.pageX}px`;
        this.element.style.top = `${e.pageY}px`;

        const rect = this.element.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.element.style.left = `${e.pageX - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.element.style.top = `${e.pageY - rect.height}px`;
        }
    }

    hide() {
        this.element.style.display = 'none';
        this.visible = false;
    }

    addListener(callback) {
        this.element.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const action = item.dataset.action;
                callback(action);
                this.hide();
            }
        });
    }
}
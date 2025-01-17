import { Component, ModuleDeclaration, L10n, EmitType, Browser } from '@syncfusion/ej2-base';
import { createElement, compile as templateCompiler } from '@syncfusion/ej2-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Property, Event, NotifyPropertyChanges, INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { PagerModel } from './pager-model';
import { PagerDropDown } from './pager-dropdown';
import { NumericContainer } from './numeric-container';
import { PagerMessage } from './pager-message';
import { ExternalMessage } from './external-message';
import { appendChildren } from '../grid/base/util';

/** @hidden */
export interface IRender {
    render(): void;
    refresh(): void;
}

/**
 * Represents the `Pager` component.
 * ```html
 * <div id="pager"/>
 * ```
 * ```typescript
 * <script>
 *   var pagerObj = new Pager({ totalRecordsCount: 50, pageSize:10 });
 *   pagerObj.appendTo("#pager");
 * </script>
 * ```
 */
@NotifyPropertyChanges
export class Pager extends Component<HTMLElement> implements INotifyPropertyChanged {
    //Internal variables
    /*** @hidden */
    public totalPages: number;
    /** @hidden */
    public templateFn: Function;
    /** @hidden */
    public hasParent: boolean = false;
    /*** @hidden */
    public previousPageNo: number;
    private defaultConstants: Object;
    private pageRefresh: string = 'pager-refresh';

    //Module declarations
    /*** @hidden */
    public localeObj: L10n;
    /**
     * `containerModule` is used to manipulate numeric container behavior of Pager.
     */
    public containerModule: NumericContainer;
    /**
     * `pagerMessageModule` is used to manipulate pager message of Pager.
     */
    public pagerMessageModule: PagerMessage;
    /**
     * `externalMessageModule` is used to manipulate external message of Pager.
     */
    public externalMessageModule: ExternalMessage;
    /**
     * @hidden
     * `pagerdropdownModule` is used to manipulate pageSizes of Pager.
     */
    public pagerdropdownModule: PagerDropDown;

    //Pager Options
    /**
     * If `enableQueryString` set to true,
     * then it pass current page information as a query string along with the URL while navigating to other page.
     *
     * @default false
     */
    @Property(false)
    public enableQueryString: boolean;

    /**
     * If `enableExternalMessage` set to true, then it adds the message to Pager.
     *
     * @default false
     */
    @Property(false)
    public enableExternalMessage: boolean;

    /**
     * If `enablePagerMessage` set to true, then it adds the pager information.
     *
     * @default true
     */
    @Property(true)
    public enablePagerMessage: boolean;

    /**
     * Defines the records count of visible page.
     *
     * @default 12
     */
    @Property(12)
    public pageSize: number;

    /**
     * Defines the number of pages to display in pager container.
     *
     * @default 10
     */
    @Property(10)
    public pageCount: number;

    /**
     * Defines the current page number of pager.
     *
     * @default 1
     */
    @Property(1)
    public currentPage: number;

    /**
     * Gets or Sets the total records count which is used to render numeric container.
     *
     * @default null
     */
    @Property()
    public totalRecordsCount: number;

    /**
     * Defines the external message of Pager.
     *
     * @default null
     */
    @Property()
    public externalMessage: string;

    /**
     * If `pageSizes` set to true or Array of values,
     * It renders DropDownList in the pager which allow us to select pageSize from DropDownList.
     *
     * @default false
     */
    @Property(false)
    public pageSizes: boolean | (number | string)[];

    /**
     *  Defines the template as string or HTML element ID which renders customized elements in pager instead of default elements.
     *
     * @default null
     */
    @Property()
    public template: string;

    /**
     * Defines the customized text to append with numeric items.
     *
     * @default null
     */
    @Property('')
    public customText: string;

    /**
     * Triggers when click on the numeric items.
     *
     * @default null
     */
    @Event()
    public click: EmitType<Object>;

    /**
     * Triggers after pageSize is selected in DropDownList.
     *
     * @default null
     */
    @Event()
    public dropDownChanged: EmitType<Object>;

    /**
     * Triggers when Pager is created.
     *
     * @default null
     */
    @Event()
    public created: EmitType<Object>;

    /**
     * @hidden
     */
    public isReact: boolean;

    /**
     * @hidden
     */
    public isVue: boolean;

    /**
     * Constructor for creating the component.
     *
     * @param {PagerModel} options - specifies the options
     * @param {string} element - specifies the element
     * @hidden
     */
    constructor(options?: PagerModel, element?: string | HTMLElement) {
        super(options, <HTMLElement | string>element);
    }

    /**
     * To provide the array of modules needed for component rendering
     *
     * @returns {ModuleDeclaration[]} returns the modules declaration
     * @hidden
     */
    protected requiredModules(): ModuleDeclaration[] {
        const modules: ModuleDeclaration[] = [];
        if (this.enableExternalMessage) {
            modules.push({
                member: 'externalMessage',
                args: [this]
            });
        }
        if (this.checkpagesizes()) {
            modules.push({
                member: 'pagerdropdown',
                args: [this]
            });
        }
        return modules;
    }


    /**
     * Initialize the event handler
     *
     * @returns {void}
     * @hidden
     */
    protected preRender(): void {
        //preRender
        this.defaultConstants = {
            currentPageInfo: '{0} of {1} pages',
            totalItemsInfo: '({0} items)',
            totalItemInfo: '({0} item)',
            firstPageTooltip: 'Go to first page',
            lastPageTooltip: 'Go to last page',
            nextPageTooltip: 'Go to next page',
            previousPageTooltip: 'Go to previous page',
            nextPagerTooltip: 'Go to next pager',
            previousPagerTooltip: 'Go to previous pager',
            pagerDropDown: 'Items per page',
            pagerAllDropDown: 'Items',
            CurrentPageInfo: '{0} of {1} pages',
            TotalItemsInfo: '({0} items)',
            FirstPageTooltip: 'Go to first page',
            LastPageTooltip: 'Go to last page',
            NextPageTooltip: 'Go to next page',
            PreviousPageTooltip: 'Go to previous page',
            NextPagerTooltip: 'Go to next pager',
            PreviousPagerTooltip: 'Go to previous pager',
            PagerDropDown: 'Items per page',
            PagerAllDropDown: 'Items',
            All: 'All'
        };
        this.containerModule = new NumericContainer(this);
        this.pagerMessageModule = new PagerMessage(this);
    }

    /**
     * To Initialize the component rendering
     *
     * @returns {void}
     */
    protected render(): void {
        if (this.template) {
            if (this.isReactTemplate()) {
                this.on(this.pageRefresh, this.pagerTemplate, this);
                this.notify(this.pageRefresh, {});
            } else {
                this.pagerTemplate();
            }
        } else {
            this.initLocalization();
            this.updateRTL();
            this.totalRecordsCount = this.totalRecordsCount || 0;
            this.renderFirstPrevDivForDevice();
            this.containerModule.render();
            if (this.enablePagerMessage) {
                this.pagerMessageModule.render();
            }
            this.renderNextLastDivForDevice();
            if (this.checkpagesizes() && this.pagerdropdownModule) {
                this.pagerdropdownModule.render();
            }
            this.addAriaLabel();
            if (this.enableExternalMessage && this.externalMessageModule) {
                this.externalMessageModule.render();
            }
            this.refresh();
            this.trigger('created', { 'currentPage': this.currentPage, 'totalRecordsCount': this.totalRecordsCount });
        }
    }

    /**
     * Get the properties to be maintained in the persisted state.
     *
     * @returns {string} returns the persist data
     * @hidden
     */
    public getPersistData(): string {
        const keyEntity: string[] = ['currentPage', 'pageSize'];
        return this.addOnPersist(keyEntity);
    }

    /**
     * To destroy the Pager component.
     *
     * @method destroy
     * @returns {void}
     */
    public destroy(): void {
        if (this.isReactTemplate()) {
            this.off(this.pageRefresh, this.pagerTemplate);
            if (!this.hasParent) {
                this.destroyTemplate(['template']);
            }
        }
        super.destroy();
        this.containerModule.destroy();
        this.pagerMessageModule.destroy();
        if (!this.isReactTemplate()) {
            this.element.innerHTML = '';
        }
    }

    /**
     * Destroys the given template reference.
     *
     * @param {string[]} propertyNames - Defines the collection of template name.
     * @param {any} index - Defines the index
     */
    // eslint-disable-next-line
    public destroyTemplate(propertyNames?: string[], index?: any): void {
        this.clearTemplate(propertyNames, index);
    }

    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string {
        return 'pager';
    }

    /**
     * Called internally if any of the property value changed.
     *
     * @param {PagerModel} newProp - specifies the new property
     * @param {PagerModel} oldProp - specifies the old propety
     * @returns {void}
     * @hidden
     */
    public onPropertyChanged(newProp: PagerModel, oldProp: PagerModel): void {
        if (this.isDestroyed) { return; }
        if (newProp.pageCount !== oldProp.pageCount) {
            this.containerModule.refreshNumericLinks();
            this.containerModule.refresh();
        }
        for (const prop of Object.keys(newProp)) {
            switch (prop) {
            case 'currentPage':
                if (this.checkGoToPage(newProp.currentPage, oldProp.currentPage)) {
                    this.currentPageChanged(newProp, oldProp);
                }
                break;
            case 'pageSize':
            case 'totalRecordsCount':
            case 'customText':
                if (this.checkpagesizes() && this.pagerdropdownModule) {
                    if (oldProp.pageSize !== newProp.pageSize) {
                        this.currentPage = 1;
                    }
                    this.pagerdropdownModule.setDropDownValue('value', this.pageSize);
                }
                if (newProp.pageSize !== oldProp.pageSize) {
                    this.pageSize = newProp.pageSize;
                    this.currentPageChanged(newProp, oldProp);
                } else {
                    this.refresh();
                }
                break;
            case 'pageSizes':
                if (this.checkpagesizes() && this.pagerdropdownModule) {
                    this.pagerdropdownModule.destroy();
                    this.pagerdropdownModule.render();
                }
                this.refresh();
                break;
            case 'template':
                this.templateFn = this.compile(this.template);
                this.refresh();
                break;
            case 'locale':
                this.initLocalization();
                this.refresh();
                break;
            case 'enableExternalMessage':
                if (this.enableExternalMessage && this.externalMessageModule) {
                    this.externalMessageModule.render();
                }
                break;
            case 'externalMessage':
                if (this.externalMessageModule) {
                    this.externalMessageModule.refresh();
                }
                break;
            case 'enableRtl':
                this.updateRTL();
                break;
            case 'enablePagerMessage':
                if (this.enablePagerMessage) {
                    this.pagerMessageModule.showMessage();
                } else {
                    this.pagerMessageModule.hideMessage();
                }
                break;
            }
        }
    }

    /**
     * Gets the localized label by locale keyword.
     *
     * @param  {string} key - specifies the key
     * @returns {string} returns the localized label
     */
    public getLocalizedLabel(key: string): string {
        return this.localeObj.getConstant(key);
    }

    /**
     * Navigate to target page by given number.
     *
     * @param  {number} pageNo - Defines page number.
     * @returns {void}
     */
    public goToPage(pageNo: number): void {
        if (this.checkGoToPage(pageNo)) {
            this.currentPage = pageNo;
            this.dataBind();
        }
    }

    /**
     * @param {number} pageSize - specifies the pagesize
     * @returns {void}
     * @hidden
     */
    public setPageSize(pageSize: number): void {
        this.pageSize = pageSize;
        this.dataBind();
    }

    private checkpagesizes(): boolean {
        if (this.pageSizes === true || (<number[]>this.pageSizes).length) {
            return true;
        }
        return false;
    }

    private checkGoToPage(newPageNo: number, oldPageNo?: number): boolean {
        if (newPageNo !== this.currentPage) {
            this.previousPageNo = this.currentPage;
        }
        if (!isNullOrUndefined(oldPageNo)) {
            this.previousPageNo = oldPageNo;
        }
        if (this.previousPageNo !== newPageNo && (newPageNo >= 1 && newPageNo <= this.totalPages)) {
            return true;
        }
        return false;
    }

    private currentPageChanged(newProp: PagerModel, oldProp: PagerModel): void {
        if (this.enableQueryString) {
            this.updateQueryString(this.currentPage);
        }
        if (newProp.currentPage !== oldProp.currentPage || newProp.pageSize !== oldProp.pageSize) {
            const args: { currentPage: number, newProp: PagerModel, oldProp: PagerModel, cancel: boolean } = {
                currentPage: this.currentPage,
                newProp: newProp, oldProp: oldProp, cancel: false
            };
            this.trigger('click', args);
            if (!args.cancel) {
                this.refresh();
            }
        }
    }

    private pagerTemplate(): void {
        if (this.isReactTemplate() && this.hasParent) { return; }
        let result: Element[];
        this.element.classList.add('e-pagertemplate');
        this.compile(this.template);
        const data: object = {
            currentPage: this.currentPage, pageSize: this.pageSize, pageCount: this.pageCount,
            totalRecordsCount: this.totalRecordsCount, totalPages: this.totalPages
        };
        const tempId: string = this.element.parentElement.id + '_template';
        if (this.isReactTemplate() && !this.isVue) {
            this.getPagerTemplate()(data, this, 'template', tempId, null, null, this.element);
            this.renderReactTemplates();
        } else {
            result = this.isVue ? this.getPagerTemplate()(data, this, 'template') as Element[] : this.getPagerTemplate()(data);
            appendChildren(this.element, result);
        }
    }

    /**
     * @returns {void}
     * @hidden
     */
    public updateTotalPages(): void {
        this.totalPages = (this.totalRecordsCount % this.pageSize === 0) ? (this.totalRecordsCount / this.pageSize) :
            (parseInt((this.totalRecordsCount / this.pageSize).toString(), 10) + 1);
    }

    /**
     * @returns {Function} returns the function
     * @hidden
     */
    public getPagerTemplate(): Function {
        return this.templateFn;
    }

    /**
     * @param {string} template - specifies the template
     * @returns {Function} returns the function
     * @hidden
     */
    public compile(template: string): Function {
        if (template) {
            try {
                if (document.querySelectorAll(template).length) {
                    this.templateFn = templateCompiler(document.querySelector(template).innerHTML.trim());
                }
            } catch (e) {
                this.templateFn = templateCompiler(template);
            }
        }
        return undefined;
    }

    /**
     * Refreshes page count, pager information and external message.
     *
     * @returns {void}
     */
    public refresh(): void {
        if (this.template) {
            if (this.isReactTemplate()) {
                this.updateTotalPages();
                this.notify(this.pageRefresh, {});
            } else {
                this.element.innerHTML = '';
                this.updateTotalPages();
                this.pagerTemplate();
            }
        } else {
            this.updateRTL();
            this.containerModule.refresh();
            if (this.enablePagerMessage) {
                this.pagerMessageModule.refresh();
            }
            if (this.pagerdropdownModule) {
                this.pagerdropdownModule.refresh();
            }
            if (this.enableExternalMessage && this.externalMessageModule) {
                this.externalMessageModule.refresh();
            }
        }
    }

    private updateRTL(): void {
        if (this.enableRtl) {
            this.element.classList.add('e-rtl');
        } else {
            this.element.classList.remove('e-rtl');
        }
    }

    private initLocalization(): void {
        this.localeObj = new L10n(this.getModuleName(), this.defaultConstants, this.locale);
    }

    private updateQueryString(value: number): void {
        const updatedUrl: string = this.getUpdatedURL(window.location.href, 'page', value.toString());
        window.history.pushState({ path: updatedUrl }, '', updatedUrl);
    }

    private getUpdatedURL(uri: string, key: string, value: string): string {
        const regx: RegExp = new RegExp('([?|&])' + key + '=.*?(&|#|$)', 'i');
        if (uri.match(regx)) {
            return uri.replace(regx, '$1' + key + '=' + value + '$2');
        } else {
            let hash: string = '';
            if (uri.indexOf('#') !== -1) {
                hash = uri.replace(/.*#/, '#');
                uri = uri.replace(/#.*/, '');
            }
            return uri + (uri.indexOf('?') !== -1 ? '&' : '?') + key + '=' + value + hash;
        }
    }

    private renderFirstPrevDivForDevice(): void {
        this.element.appendChild(createElement(
            'div', {
                className: 'e-mfirst e-icons e-icon-first',
                attrs: { title: this.getLocalizedLabel('firstPageTooltip'), tabindex: '-1' }
            }));
        this.element.appendChild(createElement(
            'div', {
                className: 'e-mprev e-icons e-icon-prev',
                attrs: { title: this.getLocalizedLabel('previousPageTooltip'), tabindex: '-1' }
            }));
    }

    private renderNextLastDivForDevice(): void {
        this.element.appendChild(createElement(
            'div', {
                className: 'e-mnext e-icons e-icon-next',
                attrs: { title: this.getLocalizedLabel('nextPageTooltip'), tabindex: '-1' }
            }));
        this.element.appendChild(createElement(
            'div', {
                className: 'e-mlast e-icons e-icon-last',
                attrs: { title: this.getLocalizedLabel('lastPageTooltip'), tabindex: '-1' }
            }));
    }

    private addAriaLabel(): void {
        const classList: string[] = ['.e-mfirst', '.e-mprev', '.e-mnext', '.e-mlast'];
        if (!Browser.isDevice) {
            for (let i: number = 0; i < classList.length; i++) {
                const element: Element = this.element.querySelector(classList[i]);
                element.setAttribute('aria-label', element.getAttribute('title'));
            }
        }
    }

    private isReactTemplate(): boolean {
        return (this.isReact || this.isVue) && this.template && typeof (this.template) !== 'string';
    }
}

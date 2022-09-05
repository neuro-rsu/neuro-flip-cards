import { FlipElement, html, css } from './lit-flip.js';

import '../components/button/button.js';

import { ulid } from './utils.js';

class FlipCards extends FlipElement {

    static get properties() {
        return {
            row: { type: Number, default: 3, save: true, category: 'settings' },
            column: { type: Number, default: 3, save: true, category: 'settings' },
            mode: { type: String, default: 'images', save: true, category: 'settings' },
            autoClose: { type: Boolean, default: true, category: 'settings' },
            timeToClose: { type: Number, default: 750, category: 'settings' },
            babyMode: { type: Boolean, default: false, save: true, category: 'settings' },
            fontSize: { type: Number, default: 32 },
            isOk: { type: Number, default: 0 },
            isError: { type: Number, default: 0 },
            step: { type: Number, default: 0 },
            cards: { type: Array },
            card1: { type: Object },
            card2: { type: Object },
            solved: { type: Array, default: [] },
            end: { type: Boolean },
        }
    }
    // static properties = {
    //     version: {},
    // };

    static styles = css`
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            box-sizing: border-box;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        header {
            position: absolute;
            top: 0;
            max-width: 100%;
            min-width: 100%;
            display: flex;
            flex: 1;
            align-items: center;
            border-bottom: 1px solid lightgray;
            padding: 2px;
            z-index: 9;
            max-height: 44px;
            overflow: hidden;
            overflow-x: auto;
            box-sizing: border-box;
        }
        .txt {
            border: none;
            outline: none;
            text-align: center;
            font-size: 22px;
            color: gray;
            white-space:nowrap;
        }
        .board {
            display: flex;
            flex-direction: column;
            align-self: center;
            justify-content: center;
            background-color: lightgray;
            border: 1px solid darkgray;
            width: 95vmin;
            max-height: 95vmin;
            position: relative;
            flex: 1;
            margin: 64px 8px 16px 8px;
            padding: 5px;
            overflow: hidden;
        }
        .row {
            display: flex;
            flex: 1;
        }
        .cell {
            display: flex;
            flex: 1;
            margin: calc(1px + 1vmin/2);
            background-color: transparent;
            perspective: 1000px;
            cursor: pointer;
        }
        .cell-inner {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            position: relative;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
            box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
            border: 1px solid darkgray;
        }
        .selected .cell-inner {
            transform: rotateY(180deg);
        }
        .cell-front, .cell-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            font-weight: 500;
        }
        .cell-back {
            background-color: #bbb;
            color: black;
        }
        .cell-front {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            background-color: white;
            transform: rotateY(180deg);
        }
        .odd {
            color: transparent;
            font-size: 0;
            opacity: 1;
            background-size: cover;
            background-repeat: no-repeat;
            cursor: default;
        }
    `;

    constructor() {
        super();
        this.version = "1.0.0";
    }

    render() {
        return html`
        <style>
                .solved { opacity: ${this.end ? 1 : .3}; }
                .cell:hover .cell-inner { transform: ${this.babyMode ? 'rotateY(180deg)' : ''}; }
                .cell-front, .cell-back { font-size: ${14 + this.fontSize - 100 <= 14 ? 14 : 14 + this.fontSize - 100}px; }
            </style>
            <header>
                <flip-button name='remove' border='none' size=28 @click=${() => --this.row}></flip-button>
                <div class='txt'>${this.row}</div>
                <flip-button name='add' border='none' size=28  @click=${() => ++this.row}></flip-button>
                <flip-button name='remove' border='none' size=28 @click=${() => --this.column} style='margin-left: 4px'></flip-button>
                <div class='txt'>${this.column}</div><flip-button name='add' border='none' size=28  @click=${() => ++this.column}></flip-button>
                <div style="display: flex; flex-direction: column; flex: 1; width: 100%">
                    <div class='txt' style="width: 100%; ">flips - ${this.mode}</div>
                    <div style="display: flex; width: 100%; justify-content: center; align-items: center">
                        <div style="color: green; flex: 1; text-align: right; font-weight: 600; opacity: .5">${this.isOk}</div>
                        <div style="padding: 0 4px"> : </div>
                        <div style="color: red; flex: 1; font-weight: 600; opacity: .5">${this.isError}</div>
                    </div>
                </div>
                <flip-button name='extension' border='none' size=28 @click=${this.setMode} title='mode' style='margin-right: 8px'></flip-button>
                <flip-button name='refresh' border='none' size=28 @click=${() => document.location.reload()} title='refresh' style='margin-right: 8px'></flip-button>
            </header>
            <div id="board" class='board'>
                ${[...Array(+this.row).keys()].map(row => html`
                    <div class='row'>
                        ${[...Array(+this.column).keys()].map(column => {
                            let idx = this.column * row + column;
                            return html`
                                <div class='cell ${(this.solved.includes(idx) || idx === this.card1?.id || idx === this.card2?.id) ? 'selected' : ''} ${this.solved.includes(idx) ? 'solved' : ''}'
                                        @click=${e => this.onclick(e, idx, this.cards?.[idx])}>
                                    <div class='cell-inner'>
                                        <div class='cell-front ${idx === this.odd ? 'odd' : ''}' style="color: hsla(${this.cards?.[idx]?.c || 0}, 60%, 50%, 1);">
                                            ${this.mode === 'images' || this.mode === 'colors' || idx === this.odd ? html`
                                                <img src=${this.cards?.[idx]?.v || this._url + 'li.png'} style="width: 100%;max-height: 100%;">
                                            ` : html`
                                                ${this.cards?.[idx]?.v}
                                            `}
                                        </div>
                                        <div class='cell-back ${idx === this.odd ? 'odd' : ''}'>
                                            ${idx === this.odd ? html`
                                                <img src=${this._url + 'li.png'} style="width: 100%;max-height: 100%;">
                                            ` : html``}
                                        </div>
                                    </div>
                                </div>
                            `})}
                    </div>
                `)}
            </div>
        `;
    }
}

customElements.define("flip-cards", FlipCards);




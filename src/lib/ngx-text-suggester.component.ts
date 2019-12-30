import {
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
  Input
} from "@angular/core";
import getCaretCoordinates from "textarea-caret";
import { scrollToPosition } from "../utils/scrollTo";

@Component({
  selector: "ngx-text-suggester",
  template: `
    <style>
      .main {
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        overflow-y: scroll;
        padding: 10px;
      }
      .main .code-builder-container {
        position: relative;
        width: auto;
        height: auto;
        display: inline-block;
        min-height: 100%;
        min-width: 100%;
      }
      .main .code-builder-container textarea {
        position: absolute;
        right: 0;
        left: 0;
        width: 100%;
        padding: 0;
        background: transparent;
        line-height: 1.45;
        bottom: 0;
        top: 0;
        font-weight: normal;
        word-break: normal;
        overflow: hidden;
        outline: none;
        letter-spacing: 1px;
        font-size: 14px;
        font-family: "Exo 2", sans-serif !important;
        -webkit-text-fill-color: transparent;
        resize: none;
        border: none;
      }
      .main .code-builder-container i {
        font-size: 20px;
        height: 20px;
      }
      .main .code-builder-container .tool-guide {
        position: absolute;
        top: 0;
        display: flex;
        right: 0;
        left: 0;
        height: 40px;
        align-items: center;
      }
      .main .code-builder-container ::ng-deep pre {
        border-radius: 0;
        overflow: hidden;
        letter-spacing: 1px;
        line-height: 1.45;
        font-size: 14px;
        font-family: "Exo 2", sans-serif !important;
        margin: 0;
        padding: 0;
        display: inline-block;
        height: auto;
        margin-bottom: 40px;
        background: transparent;
        margin-right: 80px;
      }
      .main .code-builder-container ::ng-deep pre span {
        letter-spacing: 1px;
        font-size: 14px;
        font-family: "Exo 2", sans-serif !important;
        line-height: 1.45;
        font-weight: initial !important;
      }
      .main .code-builder-container .suggest-options {
        position: fixed;
        max-height: 190px;
        overflow: hidden;
        border-radius: 2px;
        display: flex;
        min-width: 175px;
        border: 1px solid #6aff6a;
        opacity: 0;
        z-index: 10;
      }
      .main .code-builder-container .suggest-options ul {
        list-style: none;
        padding: 10px;
        overflow: auto;
        flex: 1;
        margin: 0;
        display: none;
      }
      .main .code-builder-container .suggest-options ul li {
        display: flex;
        padding: 5px 5px;
      }
      .main .code-builder-container .suggest-options ul li .icon-container {
        margin-right: 5px;
      }
      .main .code-builder-container .suggest-options ul li p {
        border-radius: 3px;
        margin: 0;
        flex: 1;
        padding-left: 5px;
        line-height: 1;
        display: flex;
        align-items: center;
      }
      .main .code-builder-container .suggest-options.show {
        opacity: 1;
      }
      .main .code-builder-container .suggest-options.show ul {
        display: inline-block;
      }
    </style>
    <div
      class="main"
      [ngStyle]="{ background: (mainColors && mainColors.main) || 'black' }"
    >
      <div class="code-builder-container">
        <textarea
          #queryTextArea
          spellcheck="false"
          class="en"
          [ngModel]="codeData"
          (ngModelChange)="onChangeInput($event, queryTextArea)"
          (keyup)="checkWord($event, queryTextArea)"
          (click)="onClickCursor(queryTextArea)"
          (keydown.enter)="onKeydown($event, queryTextArea)"
          (keydown.ArrowDown)="onKeydown($event, queryTextArea)"
          (keydown.ArrowUp)="onKeydown($event, queryTextArea)"
          [ngStyle]="{ color: (mainColors && mainColors.cursor) || '#03A9F4' }"
          (paste)="onPaste($event)"
        >
        </textarea>
        <textarea highlight-js [options]="{}" [lang]="lang">
      {{ codeData }}     
    </textarea>
        <div
          [ngClass]="{ show: suggestList.length > 0 }"
          class="suggest-options"
          [ngStyle]="{
            top: cursorPosition.top + 'px',
            left: cursorPosition.left + 'px',
            background: (menuColors && menuColors.backgroundMenu) || '#FFF'
          }"
        >
          <ul #suggestListRef>
            <li
              *ngFor="let item of suggestList; let i = index"
              [ngClass]="{ active: i === suggestOptionIndex }"
            >
              <div
                class="icon-container"
                *ngIf="item.icon"
                [innerHTML]="item.icon"
                [ngStyle]="{
                  color: (menuColors && menuColors.icons) || '#FFF'
                }"
              ></div>
              <p
                [ngStyle]="{
                  background:
                    i === suggestOptionIndex
                      ? (menuColors && menuColors.activeItem) || 'transparent'
                      : 'transparent',
                  color:
                    i === suggestOptionIndex
                      ? (menuColors && menuColors.activeItemColor) || '#FFF'
                      : null
                }"
              >
                {{ item.name }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NgxTextSuggesterComponent implements OnInit {
  @ViewChild("suggestListRef", { static: false }) suggestListRef: ElementRef<
    HTMLUListElement
  >;
  @ViewChild("textareaRef", { static: false }) textareaRef: ElementRef<
    HTMLAreaElement
  >;
  @Output() textChange = new EventEmitter();
  @Input() lang: string;
  @Input() sortList: boolean;
  @Input() suggests: {
    icon: string | null;
    name: string;
  }[];
  @Input() mainColors: {
    main: string;
    text: string;
    border: string;
    cursor: string;
  };
  @Input() menuColors: {
    backgroundMenu: string;
    icons: string;
    border: string;
    activeItem: string;
    activeItemColor: string;
  };
  caretPositon = 0;
  currectquery = "";
  suggestList: {
    icon: string;
    name: string;
  }[] = [];
  options: any = { maxLines: 1000, printMargin: false };
  codeData = "";
  cursorPosition: {
    top: number;
    left: number;
  } = {
    top: 0,
    left: 0
  };
  suggestCodes: string[] = ["Backspace", "Space"];
  moveCodes: string[] = ["ArrowUp", "ArrowDown"];
  suggestOptionIndex = -1;
  pasteEvent = false;
  constructor() {}
  onChangeInput(code, queryTextArea: HTMLTextAreaElement) {
    this.codeData = code;
    if (this.pasteEvent) {
      this.pasteEvent = false;
      this.codeData = this.codeData.trim();
      queryTextArea.value = this.codeData;
    }
    this.changeCursorPos(queryTextArea);
  }
  onPaste(event) {
    this.pasteEvent = true;
  }
  changeCursorPos(oField) {
    if (oField.selectionStart >= 0) {
      this.caretPositon = oField.selectionStart;
    }
  }
  updateOnMoveCursor(value: string) {
    let curPos = this.caretPositon;
    if (curPos === 0) {
      this.currectquery = "";
      this.resetSuggest();
    }
    if (value[curPos - 1] !== "" && value[curPos - 1] !== undefined) {
      this.currectquery = "";
      while (
        value[curPos - 1] &&
        value[curPos - 1].trim() !== "" &&
        curPos - 1 >= 0
      ) {
        this.currectquery = value[curPos - 1] + this.currectquery;
        curPos -= 1;
      }
      if (this.currectquery !== "" && this.suggests) {
        this.suggestOptionIndex = 0; // make menu index to 0
        this.suggestList = this.suggests.filter(
          x =>
            x.name.indexOf(this.currectquery.toUpperCase()) === 0 ||
            x.name.indexOf(this.currectquery) === 0
        );
      } else {
        this.resetSuggest();
      }
    }
  }
  onClickCursor(queryTextArea: HTMLTextAreaElement) {
    this.changeCursorPos(queryTextArea);
  }
  checkWord(event: KeyboardEvent, queryTextArea: HTMLTextAreaElement) {
    if (event.keyCode !== 13 && this.suggests) {
      this.changeCursorPos(queryTextArea);
      if (
        ((event.keyCode > 47 && event.keyCode < 58) || // number keys
        event.keyCode === 32 ||
        event.keyCode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
        (event.keyCode > 64 && event.keyCode < 91) || // letter keys
        (event.keyCode > 95 && event.keyCode < 112) || // numpad keys
        (event.keyCode > 185 && event.keyCode < 193) || // ;=,-./` (in order)
          (event.keyCode > 218 && event.keyCode < 223) ||
          event.keyCode === 16) &&
        event.keyCode !== 32 &&
        event.keyCode !== 86 // ctrl+paste
      ) {
        // scroll suggest list to start before show list
        if (this.suggestList && this.suggestList.length === 0) {
          scrollToPosition(this.suggestListRef.nativeElement, 0, 100);
        }
        this.currectquery += event.keyCode === 16 ? "" : event.key;
        this.suggestMenuPosition(
          queryTextArea.selectionStart,
          queryTextArea.value
            .substr(0, queryTextArea.selectionStart)
            .split("\n").length,
          queryTextArea
        );
        this.suggestOptionIndex = 0; // make menu index to 0
        this.suggestList = this.suggests.filter(
          x =>
            x.name.indexOf(this.currectquery.toUpperCase()) === 0 ||
            x.name.indexOf(this.currectquery) === 0
        );
        // scroll suggest list to start before show list
        if (this.suggestList && this.suggestList.length === 0) {
          scrollToPosition(this.suggestListRef.nativeElement, 0, 100);
        }
        this.updateOnMoveCursor(queryTextArea.value);
      } else if (
        this.moveCodes.includes(event.code) &&
        this.suggestList.length > 0
      ) {
        if (
          this.suggestList &&
          this.suggestOptionIndex < this.suggestList.length - 1 &&
          event.code === "ArrowDown"
        ) {
          this.suggestOptionIndex += 1;
        } else if (this.suggestOptionIndex > 0 && event.code === "ArrowUp") {
          this.suggestOptionIndex -= 1;
        }
      } else if (event.keyCode === 27) {
        this.resetSuggest();
      } else {
        this.currectquery = "";
        this.updateOnMoveCursor(queryTextArea.value);
      }
    }
    this.textChange.emit(queryTextArea.value);
  }
  getPosition(textString, subString, index) {
    return textString.split(subString, index).join(subString).length;
  }
  suggestMenuPosition(cursorIndex: number, cursorLine: number, queryTextArea) {
    const caret: {
      top: number;
      left: number;
      height: number;
    } = getCaretCoordinates(queryTextArea, queryTextArea.selectionEnd);
    const coordinate = queryTextArea.getBoundingClientRect();
    let startLineIndex = 0;
    if (cursorLine - 1 > 0) {
      startLineIndex = this.getPosition(
        queryTextArea.value,
        "\n",
        cursorLine - 1
      );
    }
    this.cursorPosition = {
      top: caret.top + caret.height + coordinate.top,
      left:
        caret.left +
        coordinate.left -
        ((cursorIndex - startLineIndex) / 10) * 10
    };
  }
  onKeydown(event: KeyboardEvent, queryTextArea: HTMLTextAreaElement) {
    if (this.suggestList && this.suggestList.length > 0) {
      event.preventDefault();
      if (event.keyCode === 13) {
        this.replaceSuggest(
          this.suggestList[this.suggestOptionIndex].name,
          this.currectquery,
          this.caretPositon,
          queryTextArea
        );
        this.resetSuggest();
      }
    } else {
      this.currectquery = "";
      this.changeCursorPos(queryTextArea);
    }
    if (this.suggestListRef.nativeElement) {
      scrollToPosition(
        this.suggestListRef.nativeElement,
        event.code === "ArrowDown"
          ? this.suggestOptionIndex * 30
          : this.suggestOptionIndex * 30 - 30,
        100
      );
    }
  }
  resetSuggest() {
    this.suggestList = [];
    this.suggestOptionIndex = 0;
  }
  replaceSuggest(
    suggest: string,
    searchText: string,
    endIndex: number,
    queryTextArea: HTMLTextAreaElement
  ) {
    let textValue = queryTextArea.value;
    const startIndex = endIndex - searchText.length;
    const beforeText = textValue.substring(0, startIndex);
    const afterText = textValue.substring(endIndex, textValue.length);
    textValue = beforeText + suggest + afterText;
    queryTextArea.value = textValue;
    this.codeData = textValue;
    if (textValue[startIndex + suggest.length] === "\n") {
      this.updateTextAreaCursor(startIndex + suggest.length, queryTextArea);
    } else {
      this.updateTextAreaCursor(startIndex + suggest.length + 1, queryTextArea);
    }
  }
  updateTextAreaCursor(pos: number, queryTextArea: HTMLTextAreaElement) {
    queryTextArea.selectionEnd = pos;
  }
  compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const bandA = a.name.toUpperCase();
    const bandB = b.name.toUpperCase();
    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
      comparison = -1;
    }
    return comparison;
  }
  ngOnInit() {
    if (this.suggests && this.sortList) {
      this.suggests = this.suggests.sort(this.compare);
    }
  }
}

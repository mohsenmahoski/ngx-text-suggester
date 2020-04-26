# Bootstrap

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.0.3.

## DEMO

[stackblitz](https://stackblitz.com/edit/ngx-text-suggester).

## Installation instructions

1.  `npm install --save ngx-highlight-js`

2.  Load the highlight.js and theme css in your page. (index.html)

```
<script  src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.11.0/highlight.min.js"></script>
<link  rel="stylesheet"  href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.11.0/styles/atom-one-dark.min.css">
```

3. add selector tag to your html

```
<ngx-text-suggester
	[suggests]="List"
	(textChange)="getUserInput($event)" //emite textarea value on keypress
	[mainColors]="mainColors"
	[menuColors]="menuColors"
	[lang]="sql" // highlight-js language
	[sortList]="true"
></ngx-text-suggester>
```

## inputs

```
suggests: {
		icon: string|null; // html input that shows in menu,if you don't need icon put it null
		name: string;
}[];
```

```
mainColors:mainColors: {
	main: string;
	text: string;
	border: string;
	cursor: string;
}
```

```
menuColors: {
	backgroundMenu: string;
	icons: string;
	border: string;
	activeItem: string; // active item background color
	activeItemColor: string;
}
```

```
sortList:boolean // if true list will be sort by name property
```

lang
highlight-js language : [ngx-highlight-js](<[[https://github.com/highlightjs/highlight.js/tree/master/src/languages](https://github.com/highlightjs/highlight.js/tree/master/src/languages)]([https://github.com/highlightjs/highlight.js/tree/master/src/languages](https://github.com/highlightjs/highlight.js/tree/master/src/languages))>)

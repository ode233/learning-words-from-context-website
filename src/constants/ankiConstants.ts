export const ANKI_DECK_NAME = 'Learning words from context';
export const ANKI_MODEL_NAME = 'Learning words from context';

export const ANKI_CARD_FRONT_HTML = `
<section>{{cloze:SentenceCloze}}<section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section>
{{Img}}
<div class="source">
{{PageIcon}}
<a href="{{PageUrl}}">{{PageTitle}}</a>
</div>
<section>

<section>
<div>{{TextTranslate}} {{TextVoice}} {{TextPhonetic}}</div>
<div>{{SentenceTranslate}} {{SentenceVoice}}</div>
<div>{{type:cloze:SentenceCloze}}</div>
</section>
`;

export const ANKI_CARD_BACK_HTML = `
<section>{{cloze:SentenceCloze}}<section>

<section>{{type:cloze:SentenceCloze}}</section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section>
{{Img}}
<div class="source">
{{PageIcon}}
<a href="{{PageUrl}}">{{PageTitle}}</a>
</div>
<section>

<section>
<div>{{TextTranslate}} {{TextVoice}} {{TextPhonetic}}</div>
<div>{{SentenceTranslate}} {{SentenceVoice}}</div>
</section>
`;

// eslint-disable-next-line spellcheck/spell-checker
export const ANKI_CARD_CSS = `
.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: #333;
  background-color: white;
}

input {
  border: 1px solid #eee;
}

section {
  margin: 1em 0;
}

.cloze {
  font-weight: bold;
  color: #f9690e;
}

.source {
  margin: 0.5em 0;
  position: relative;
  font-size: .8em;
}

.source img {
  width: inherit;
  height: .8em;
}

.source a {
  color: #5caf9e;
  text-decoration: none;
  word-wrap: break-word;
}

.typeGood {
  color: #fff;
  background: #1EBC61;
}

.typeBad {
  color: #fff;
  background: #F75C4C;
}

.typeMissed {
  color: #fff;
  background: #7C8A99;
}
`;

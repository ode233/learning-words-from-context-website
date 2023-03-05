export const ANKI_DECK_NAME = 'Learning words from context';
export const ANKI_MODEL_NAME = 'Learning words from context';

export const ANKI_CARD_FRONT_HTML = `
<section>{{cloze:SentenceCloze}}<section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section class="srcImg">
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

<section class="srcImg">
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
  
  a {
    color: #5caf9e;
  }
  
  input {
    border: 1px solid #eee;
  }
  
  section {
    margin: 1em 0;
  }
  
  .trans {
    border: 1px solid #eee;
    padding: 0.5em;
  }
  
  .trans_title {
    display: block;
    font-size: 0.9em;
    font-weight: bold;
  }
  
  .trans_content {
    margin-bottom: 0.5em;
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
    height: .7em;
  }
  
  .source a {
    text-decoration: none;
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

  .source img {
    width: inherit;
  }
`;

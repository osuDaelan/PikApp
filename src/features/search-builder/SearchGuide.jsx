import React, { useId, useState } from "react";
import useWindowWidth from "../../shared/hooks/useWindowWidth.js";
import { KEYWORD_GROUPS, SEARCH_REFERENCE } from "./gameSearch.js";

const TEXT_FIELDS = [
  ["Pikmin name", "The nickname you gave it.", '"Johnny"'],
  ["Location name", "The place after “Near” in its details.", '"Boston Common"'],
  ["Town name", "The place shown below it in the Pikmin grid.", '"Boston"'],
  ["Decor category", "The category name in the Decor collection.", '"Station"'],
  ["Decor costume", "The costume name inside its category.", '"Chef Hat"'],
  ["Flower type", "The named flower on its head, such as a Lily.", '"Lily"'],
];

const KEYWORD_MEANINGS = {
  leaf: "Has a leaf on its head.",
  bud: "Has a bud. Feeding it nectar gives two petals.",
  flower: "Has a flower whose petal has already been picked.",
  bloom: "Has a petal ready to pick.",
  wilted: "Has a bare head.",
  favorite: "Has a favorite star.",
  squad: "Is in your squad and isn't carrying a small fruit.",
  busy: "Is carrying a small fruit or postcard, or is away on an expedition or fighting a mushroom.",
  standby: "Is on standby and isn't away on an expedition or fighting a mushroom.",
  decor: "Is wearing decor.",
  lifelog: "Is linked to a Lifelog entry.",
};

function GuideTopic({ title, compact, children }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section className="search-builder__guide-topic">
      <h3>{compact ? (
        <button type="button" className="search-builder__guide-toggle" aria-expanded={expanded}
          aria-controls={contentId} onClick={() => setExpanded(open => !open)}>
          {title}<span aria-hidden="true" />
        </button>
      ) : title}</h3>
      <div id={contentId} className="search-builder__guide-content" hidden={compact && !expanded}>
        {children}
      </div>
    </section>
  );
}

export default function SearchGuide({ skipToBuilder }) {
  const compact = useWindowWidth() < 840;

  return (
    <section className="search-builder__surface search-builder__guide" aria-labelledby="search-builder-guide">
      <div className="search-builder__guide-header">
        <h2 id="search-builder-guide">How to search in Pikmin Bloom</h2>
        <button type="button" className="search-builder__primary" onClick={skipToBuilder}>Skip to builder</button>
      </div>
      <p>Try <code>red|yellow</code> to find Red or Yellow Pikmin. Build your own search below, then copy it into the
        magnifying glass search in the game’s Pikmin list.</p>

      <div className="search-builder__guide-topics">
        <GuideTopic title="String searches" compact={compact}>
          <p>The game looks for your text in all six fields below. Capitalization doesn’t matter, and a partial word
            can match. Use straight quotes to search for a phrase or for text that contains a search symbol.</p>
          <dl>
            {TEXT_FIELDS.map(([field, description, example]) => (
              <div key={field}>
                <dt>{field}</dt>
                <dd>{description} <code>{example}</code></dd>
              </div>
            ))}
          </dl>
        </GuideTopic>

        <GuideTopic title="Keyword filters" compact={compact}>
          <p>Use the whole keyword, in any capitalization. The same word can also match text on a Pikmin’s details.
            For example, <code>=bud</code> can find a Pikmin with a bud or one nicknamed Bud.</p>
          {KEYWORD_GROUPS.map(({ name, keywords }) => (
            <React.Fragment key={name}>
              <h4>{name}</h4>
              {name === "Pikmin type" ? (
                <p>{keywords.map((keyword, index) => (
                  <React.Fragment key={keyword}>{index > 0 && ", "}<code>{keyword}</code></React.Fragment>
                ))}. Each matches its Pikmin type.</p>
              ) : (
                <dl>{keywords.map(keyword => (
                  <div key={keyword}><dt><code>{keyword}</code></dt><dd>{KEYWORD_MEANINGS[keyword]}</dd></div>
                ))}</dl>
              )}
            </React.Fragment>
          ))}
        </GuideTopic>

        <GuideTopic title="Range searches" compact={compact}>
          <p>Friendship searches count completed hearts from 0 to 8. A completed red or gold heart counts as one.
            Partial hearts don’t count.</p>
          <dl>
            <div><dt><code>4-6</code></dt><dd>Four through six completed hearts.</dd></div>
            <div><dt><code>4</code></dt><dd>Exactly four completed hearts.</dd></div>
            <div><dt><code>4-</code></dt><dd>Four or more. An omitted maximum means eight.</dd></div>
            <div><dt><code>-3</code></dt><dd>Three or fewer. An omitted minimum means zero.</dd></div>
            <div><dt><code>-</code></dt><dd>Any number of completed hearts, from zero to eight.</dd></div>
          </dl>
        </GuideTopic>

        <GuideTopic title="Logical operators" compact={compact}>
          <dl>
            <div><dt>AND</dt><dd><code>red&amp;decor</code> asks for both. A comma or a half-width or full-width space also works.</dd></div>
            <div><dt>OR</dt><dd><code>red|yellow</code> asks for either or both. A semicolon also works.</dd></div>
            <div><dt>NOT</dt><dd><code>!busy</code> leaves out matches for Busy.</dd></div>
            <div><dt>Parentheses</dt><dd><code>(red|yellow)&amp;decor</code> groups the colors before applying Decor.</dd></div>
            <div><dt>Straight quotes</dt><dd><code>"Library &amp; Bookstore"</code> treats the ampersand as part of the phrase. Use straight double quotes.</dd></div>
            <div><dt>Exact match</dt><dd><code>=flower</code> asks for an exact match and avoids partial text matches such as “Flower Box.”</dd></div>
          </dl>
          <p>The game reads parentheses first, then NOT, then AND, then OR.</p>
        </GuideTopic>
      </div>
      <p className="search-builder__muted"><a href={SEARCH_REFERENCE} target="_blank" rel="noreferrer">Full search reference on Pikipedia ↗</a></p>
    </section>
  );
}

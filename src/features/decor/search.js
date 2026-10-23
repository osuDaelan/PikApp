import { DECOR_LOCATIONS, DECOR_SPECIAL_CATEGORIES, PIKMIN_COLORS } from "./catalog.js";
import { decorId, isRareCostume } from "./collection.js";

export const MAX_DECOR_SEARCH_LENGTH = 512;
const speciesNames = new Set(PIKMIN_COLORS.map(color => color.toLowerCase()));

function normalize(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/gu, " ").trim();
}

// Index immutable catalog fields once; collection status is always read live.
function indexGroups(groups, section) {
  return groups.map(group => ({ group, costumes: group.costumes.map(costume => ({
    costume,
    entries: (costume.designs || costume.colors).map(variant => {
      const species = costume.designs ? costume.color : variant;
      return {
        id: decorId(group.location, costume.name, variant), variant, section,
        species: normalize(species), rare: isRareCostume(costume),
        fields: [group.location, costume.name, species, `${species} Pikmin`,
          ...(costume.designs ? [`design ${variant}`] : [])].map(normalize),
      };
    }),
  })) }));
}
const regularIndex = indexGroups(DECOR_LOCATIONS, "regular");
const specialIndex = indexGroups(DECOR_SPECIAL_CATEGORIES, "event");

function tokenize(query) {
  const tokens = [];
  for (let position = 0; position < query.length;) {
    const char = query[position];
    if (/\s/u.test(char)) { position++; continue; }
    if ('&|,;!()='.includes(char)) {
      tokens.push({ type: char });
      position++;
    } else if (char === '"') {
      let value = "";
      position++;
      while (position < query.length && query[position] !== '"') {
        if (query[position] === "\\" && ['"', "\\"].includes(query[position + 1])) position++;
        value += query[position++];
      }
      if (query[position] !== '"') throw new Error('Close the quotation with a straight double quote (").');
      position++;
      if (!normalize(value)) throw new Error("Enter some text between the quotation marks.");
      tokens.push({ type: "term", value: normalize(value), literal: true });
    } else {
      const start = position;
      while (position < query.length && !/[\s&|,;!()="]/u.test(query[position])) position++;
      tokens.push({ type: "term", value: normalize(query.slice(start, position)), literal: false });
    }
    if (tokens.length > 256) throw new Error("This search has too many terms. Try a shorter expression.");
  }
  return tokens;
}

// A bounded parser, never eval or a user-supplied regular expression.
export function compileDecorSearch(query) {
  const active = !!query.trim();
  if (!active) return { active: false, expression: null, error: null };
  try {
    if (query.length > MAX_DECOR_SEARCH_LENGTH) throw new Error(`Keep searches under ${MAX_DECOR_SEARCH_LENGTH + 1} characters.`);
    const tokens = tokenize(query);
    let position = 0;
    const at = (...types) => types.includes(tokens[position]?.type);
    function unary(depth) {
      if (depth > 32) throw new Error("This search is nested too deeply. Remove some parentheses or ! operators.");
      if (at("!")) { position++; return { type: "not", child: unary(depth + 1) }; }
      if (at("(")) {
        position++;
        const expression = or(depth + 1);
        if (!at(")")) throw new Error("Add a closing parenthesis ).");
        position++;
        return expression;
      }
      let exact = false;
      if (at("=")) { position++; exact = true; }
      if (!at("term")) throw new Error("Enter a search term after each operator or opening parenthesis.");
      return { ...tokens[position++], exact };
    }
    function and(depth) {
      let expression = unary(depth);
      while (at("&", ",", "term", "!", "(", "=")) {
        if (at("&", ",")) position++;
        expression = { type: "and", left: expression, right: unary(depth) };
      }
      return expression;
    }
    function or(depth) {
      let expression = and(depth);
      while (at("|", ";")) {
        position++;
        expression = { type: "or", left: expression, right: and(depth) };
      }
      return expression;
    }
    const expression = or(0);
    if (position !== tokens.length) throw new Error("Remove the extra closing parenthesis ).");
    return { active: true, expression, error: null };
  } catch (error) {
    return { active: true, expression: null, error: error.message };
  }
}

function matches(expression, entry, collected) {
  switch (expression.type) {
    case "and": return matches(expression.left, entry, collected) && matches(expression.right, entry, collected);
    case "or": return matches(expression.left, entry, collected) || matches(expression.right, entry, collected);
    case "not": return !matches(expression.child, entry, collected);
    default: {
      const { value, literal, exact } = expression;
      if (!literal) {
        if (speciesNames.has(value)) return entry.species === value;
        if (value === "collected") return !!collected[entry.id];
        if (value === "missing") return !collected[entry.id];
        if (value === "rare") return entry.rare;
        if (value === "regular") return entry.section === "regular";
        if (value === "event" || value === "special") return entry.section === "event";
      }
      return entry.fields.some(field => exact ? field === value : field.includes(value));
    }
  }
}

function filterGroups(index, expression, collected) {
  return index.flatMap(({ group, costumes }) => {
    const visibleCostumes = costumes.flatMap(({ costume, entries }) => {
      const variants = entries.filter(entry => matches(expression, entry, collected)).map(entry => entry.variant);
      if (!variants.length) return [];
      return [{ ...costume, [costume.designs ? "designs" : "colors"]: variants }];
    });
    return visibleCostumes.length ? [{ ...group, costumes: visibleCostumes }] : [];
  });
}

export function searchDecorCatalog(search, collected) {
  if (search.error) return { regular: [], special: [] };
  if (!search.active) return { regular: DECOR_LOCATIONS, special: DECOR_SPECIAL_CATEGORIES };
  return {
    regular: filterGroups(regularIndex, search.expression, collected),
    special: filterGroups(specialIndex, search.expression, collected),
  };
}
